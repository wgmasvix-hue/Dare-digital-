import { env, pipeline, TextClassificationPipeline, FeatureExtractionPipeline, AutomaticSpeechRecognitionPipeline } from '@xenova/transformers';

// Configure Transformers.js
// Disable local models to prevent 404s that return index.html in SPA environments
env.allowLocalModels = false;
env.allowRemoteModels = true;
// Use the Hugging Face Hub as the default remote host
env.remoteHost = 'https://huggingface.co';
env.remotePathTemplate = '{model}/resolve/{revision}/';

let classifier: TextClassificationPipeline | null = null;
let embedder: FeatureExtractionPipeline | null = null;
let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

export const transformerService = {
  /**
   * Initialize the sentiment analysis pipeline (DistilBERT)
   */
  async initClassifier() {
    if (!classifier) {
      try {
        console.log('Initializing classifier: Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english') as TextClassificationPipeline;
        console.log('Classifier initialized.');
      } catch (error) {
        console.error('Failed to initialize classifier:', error);
        throw error;
      }
    }
    return classifier;
  },

  /**
   * Initialize the embedding pipeline (MiniLM) for semantic search
   */
  async initEmbedder() {
    if (!embedder) {
      try {
        console.log('Initializing embedder: Xenova/all-MiniLM-L6-v2');
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as FeatureExtractionPipeline;
        console.log('Embedder initialized.');
      } catch (error) {
        console.error('Failed to initialize embedder:', error);
        throw error;
      }
    }
    return embedder;
  },

  /**
   * Initialize the speech recognition pipeline (Whisper-tiny)
   */
  async initTranscriber() {
    if (!transcriber) {
      try {
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en') as AutomaticSpeechRecognitionPipeline;
      } catch (error) {
        console.error('Failed to initialize transcriber:', error);
        throw error;
      }
    }
    return transcriber;
  },

  /**
   * Analyze sentiment for comprehension checks
   */
  async analyzeSentiment(text: string) {
    const model = await this.initClassifier();
    return await model(text);
  },

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbedding(text: string) {
    const model = await this.initEmbedder();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  },

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(audioUrl: string) {
    const model = await this.initTranscriber();
    const result = await model(audioUrl);
    return result;
  },

  /**
   * Check comprehension logic
   */
  async checkComprehension(userInput: string) {
    const sentiment = await this.analyzeSentiment(userInput);
    if (!sentiment || !Array.isArray(sentiment) || sentiment.length === 0) return null;

    // Cast to any for simplicity in this demo environment or use the correct interface
    const { label, score } = sentiment[0] as { label: string; score: number };
    
    return {
      isPositive: label === 'POSITIVE',
      confidence: score,
      feedback: label === 'POSITIVE' 
        ? "Great job! Your understanding seems positive and aligned." 
        : "It seems you might be struggling with this concept. Would you like a simpler explanation?"
    };
  }
};

import { GoogleGenAI } from "@google/genai";
import { DARA_SYSTEM_PROMPT } from "../lib/daraSystemPrompt";
import { supabase } from "../lib/supabase";

const getApiKey = () => {
  // Priority: import.meta.env (Vite standard) -> process.env (Vite define/Node)
  const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (!key) {
    console.warn("Gemini API Key is missing. AI features may not work.");
  }
  return key;
};

/**
 * Truncate text to avoid token limits
 */
const truncateText = (text: string, maxLength = 30000) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "... [Text truncated for AI processing]";
};

export const geminiService = {
  /**
   * Generate a summary for a book or a specific context
   */
  async summarize(text: string, context = "") {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const taskPrompt = `
      Task: Provide a concise and insightful summary of the following text.
      Focus on key concepts, main arguments, and educational value.
      
      Context: ${context}
      
      Text to summarize:
      ${truncateText(text)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: taskPrompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Summarization Error:", error);
      throw error;
    }
  },

  /**
   * Answer a question based on book context
   */
  async askQuestion(question: string, bookContext: string) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const taskPrompt = `
      Task: Answer the student's question based on the provided book context.
      
      Book Context:
      ${truncateText(bookContext)}
      
      Student Question:
      ${question}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: taskPrompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Q&A Error:", error);
      throw error;
    }
  },

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Task: Provide 5 related academic search terms or Boolean search combinations for the following query.\nQuery: ${query}`,
      config: { 
        systemInstruction: "You are DARA, an academic librarian. Return only a JSON array of strings. No markdown, no explanation.",
        responseMimeType: "application/json"
      },
    });
    try {
      return JSON.parse(response.text || "[]");
    } catch {
      return [];
    }
  },

  /**
   * AI-powered book search/filtering
   */
  async searchBooks(query: string) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Task: Analyze the user's request and extract search parameters.\nRequest: ${query}`,
      config: {
        systemInstruction: `You are DARA. Extract keywords, faculty, and level from the user's request. 
        Return JSON: { "keywords": [], "faculty": "All", "level": "All" }. 
        Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
        Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`,
        responseMimeType: "application/json"
      },
    });
    try {
      return JSON.parse(response.text || '{"keywords": [], "faculty": "All", "level": "All"}');
    } catch {
      return { keywords: [query], faculty: 'All', level: 'All' };
    }
  },

  /**
   * Generate a lesson plan for teachers (HBC Aligned)
   */
  async generateLessonPlan(details: { subject: string; level: string; topic: string; duration: string; resources?: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `You are DARA, Zimbabwe's Heritage-Based Curriculum (HBC) aligned teacher training AI. 
Generate a complete, detailed lesson plan for a Zimbabwean teacher or student teacher.

HERITAGE-BASED CURRICULUM (HBC) CORE PRINCIPLES:
- Unhu/Ubuntu (Ethics, values, and character)
- Heritage (Local history, culture, and resources)
- Production/Innovation (Practical application and problem-solving)
- Technology (Modern tools integrated with local context)

LESSON DETAILS:
- Subject: ${details.subject}
- Level: ${details.level}
- Topic: ${details.topic}
- Duration: ${details.duration}
- Available Resources: ${details.resources || "Chalk, blackboard, local environment, textbook"}

Generate a FULL lesson plan using this EXACT structure in Markdown:

# HERITAGE-BASED LESSON PLAN
**Subject:** | **Level:** | **Topic:** | **Duration:**

## 1. Syllabus Reference
(ZJC/ZIMSEC/HBC syllabus reference code)

## 2. Specific Objectives
By the end of the lesson, learners should be able to: (3-5 measurable objectives)

## 3. Heritage & Unhu/Ubuntu Integration
(How this lesson incorporates Zimbabwean values, local history, or cultural context)

## 4. Prior Knowledge & Skills
(What learners already know or can do)

## 5. Media/Resources
(Locally available materials and digital OERs from Dare Library)

## 6. Lesson Development (Interactive & Learner-Centered)

| Stage | Teacher Activity | Learner Activity | Points to Note |
|-------|-----------------|------------------|----------------|
| Introduction (5 min) | | | |
| Step 1: Discovery | | | |
| Step 2: Heritage Link | | | |
| Step 3: Practical/Production | | | |
| Conclusion (5 min) | | | |

## 7. Assessment & Evaluation
(Interactive methods to check understanding)

## 8. Innovation & Production Task
(A practical task where learners apply knowledge to solve a local problem)

## 9. DARA HBC Teaching Tips
(3 practical tips for making this lesson more interactive and heritage-aligned)

Make it detailed, practical, and strictly aligned with Zimbabwe's Heritage-Based Curriculum.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Lesson Plan Error:", error);
      throw error;
    }
  },

  /**
   * Generate an interactive assessment (HBC Aligned)
   */
  async generateAssessment(details: { subject: string; topic: string; level: string; type?: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `You are DARA. Generate an interactive, Heritage-Based Curriculum (HBC) aligned assessment for:
- Subject: ${details.subject}
- Topic: ${details.topic}
- Level: ${details.level}
- Type: ${details.type || 'Quiz'}

Include:
1. 5 Multiple Choice Questions (with local Zimbabwean context)
2. 2 Structured/Problem-solving questions (Production-oriented)
3. 1 Unhu/Ubuntu reflection question
4. Answer Key with explanations

Format as clean Markdown.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Assessment Error:", error);
      throw error;
    }
  },

  /**
   * General chat with DARA via Supabase Edge Function
   */
  async chat(message: string, history: { role: string; text: string }[] = [], options: { programmeCode?: string; faculty?: string; institutionId?: string; temperature?: number; topP?: number; topK?: number; responseMimeType?: string; responseSchema?: unknown; systemInstruction?: string } = {}) {
    try {
      const truncatedMessage = truncateText(message, 12000);
      const { data, error } = await supabase.functions.invoke('dara-chat', {
        body: { 
          message: truncatedMessage, 
          history,
          programmeCode: options.programmeCode,
          faculty: options.faculty,
          institutionId: options.institutionId,
          systemInstruction: options.systemInstruction
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("DARA Edge Function Error:", error);
      
      // Fallback to direct Gemini if Edge Function fails
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Cannot fallback.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const contents = history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: truncateText(message, 12000) }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: { 
          systemInstruction: options.systemInstruction || DARA_SYSTEM_PROMPT,
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
          responseMimeType: options.responseMimeType,
          responseSchema: options.responseSchema
        },
      });
      return response.text;
    }
  },

  /**
   * Generates a practical skill guide for vocational training.
   * Aligned with Zimbabwe's Heritage-Based Curriculum and Education 5.0.
   */
  async generateVocationalGuide({ trade, skill, level, resources }: { trade: string; skill: string; level: string; resources: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Generate a comprehensive, practical skill guide for a vocational training student in Zimbabwe.
    
    Trade: ${trade}
    Specific Skill: ${skill}
    Level: ${level}
    Available Resources: ${resources}
    
    The guide MUST follow Zimbabwe's Heritage-Based Curriculum (HBC) and Education 5.0 principles:
    1. Practicality: Focus on hands-on execution.
    2. Local Context: Use materials and examples relevant to Zimbabwe.
    3. Unhu/Ubuntu: Incorporate professional ethics and community responsibility.
    4. Innovation: Suggest ways to improve or adapt the skill for local needs.
    5. Safety: Include detailed safety precautions specific to the Zimbabwean workshop context.
    
    Structure the output in Markdown with the following sections:
    - Title: Clear and descriptive.
    - Objective: What the student will achieve.
    - Tools & Materials: List required items (prefer locally available ones).
    - Safety First: Critical safety protocols.
    - Step-by-Step Procedure: Detailed, numbered instructions.
    - Unhu/Ubuntu in the Trade: Ethical considerations and professional conduct.
    - Innovation/Production Task: A small challenge to apply the skill to solve a local problem.
    - Troubleshooting: Common mistakes and how to fix them.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("Vocational Guide Error:", error);
      throw error;
    }
  },

  /**
   * Generates a structured skill learning module (Tasks, Steps, Practice, Test).
   */
  async generateVocationalSkillModule({ trade, skill, level, part }: { trade: string; skill: string; level: string; part: 'tasks' | 'steps' | 'practice' | 'test' }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let prompt = "";

    if (part === 'tasks') {
      prompt = `Generate a list of 3-5 real-world "TASKS" for the skill: ${skill} in the trade: ${trade} at ${level} level.
      Focus on production-oriented tasks relevant to the Zimbabwean economy.
      Keep descriptions minimal and action-oriented. Format in Markdown.`;
    } else if (part === 'steps') {
      prompt = `Generate a "SHOW ME HOW" step-by-step guide for a specific task related to: ${skill} in the trade: ${trade} at ${level} level.
      Include:
      - Required Tools (Locally available)
      - Safety Mode (Critical safety tips)
      - Minimalist, numbered steps (Max 10 words per step)
      - A visual description for each step.
      Format in Markdown.`;
    } else if (part === 'practice') {
      prompt = `Generate a "PRACTICE" challenge for the skill: ${skill} in the trade: ${trade} at ${level} level.
      This should be a "Try This Task" interactive challenge that encourages real-world practice.
      Include a specific goal and a "Success Criteria" checklist.
      Format in Markdown.`;
    } else if (part === 'test') {
      prompt = `Generate a "TEST" for the skill: ${skill} in the trade: ${trade} at ${level} level.
      Focus on practical knowledge and troubleshooting.
      Provide 3 scenario-based questions (e.g., "If X happens, what do you do?").
      Include correct answers. Format in Markdown.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("Vocational Skill Module Error:", error);
      throw error;
    }
  },

  /**
   * DARE Assist for Vocational Skills
   */
  async vocationalAssist({ action, trade, skill, context }: { action: string; trade: string; skill: string; context: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let prompt = "";

    if (action === 'explain') {
      prompt = `Explain this concept simply for a workshop setting: ${context}. Skill: ${skill}, Trade: ${trade}.`;
    } else if (action === 'steps' || action === 'show_how') {
      prompt = `Show me exactly how to do this: ${context}. Provide 5-7 clear, minimal steps for ${skill} in ${trade}. Include safety.`;
    } else if (action === 'task' || action === 'try_task') {
      prompt = `Give me a real-world "Try This Task" challenge for ${skill} in ${trade}. Focus on production.`;
    } else if (action === 'fix_mistake') {
      prompt = `I made a mistake while doing ${skill} in ${trade}. Context: ${context}. How do I fix it safely and professionally?`;
    } else if (action === 'next_task') {
      prompt = `I finished the current task for ${skill} in ${trade}. What is the next logical task to advance my skills?`;
    } else if (action === 'safety_tips') {
      prompt = `Provide critical safety tips for ${skill} in ${trade}. Focus on workshop hazards in Zimbabwe.`;
    } else if (action === 'quiz') {
      prompt = `Ask me one practical troubleshooting question about ${skill} in ${trade}.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("Vocational Assist Error:", error);
      throw error;
    }
  },

  /**
   * Generates a project cost estimator and material list for vocational projects.
   */
  async generateProjectEstimator({ project, trade, scale }: { project: string; trade: string; scale: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Generate a project estimation and material list for a vocational training project in Zimbabwe.
    
    Project: ${project}
    Trade: ${trade}
    Scale: ${scale} (e.g., Small/Individual, Medium/Group, Large/Commercial)
    
    Provide a detailed breakdown in Markdown:
    - Project Overview: Brief description.
    - Material List: Itemized list of materials needed.
    - Estimated Quantities: Based on the scale provided.
    - Local Sourcing Tips: Where to find these materials in Zimbabwe or how to repurpose local items.
    - Production Timeline: Estimated time for each phase.
    - Costing Strategy: How to calculate the final price including labor and overheads (Education 5.0 focus on commercialization).
    - Sustainability Note: How to minimize waste and use eco-friendly practices.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("Project Estimator Error:", error);
      throw error;
    }
  },

  /**
   * Generates a TP Companion response for student teachers.
   * Supports reflection, supervisor prep, and feedback analysis.
   */
  async generateTPCompanionResponse({ type, details }: { type: 'reflection' | 'supervisor_prep' | 'feedback_analysis'; details: { subject: string; topic: string; level?: string; experience?: string; challenges?: string; feedback?: string } }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let prompt = "";

    if (type === "reflection") {
      prompt = `You are DARA, the Teaching Practice (TP) Companion for a student teacher in Zimbabwe.
Analyze the following lesson observation/experience and provide a structured reflection journal entry.

LESSON DETAILS:
- Subject: ${details.subject}
- Topic: ${details.topic}
- What happened: ${details.experience}
- Challenges faced: ${details.challenges}

Provide a response in Markdown with:
1. **DARA Reflection Prompts**: 3 deep questions to help the student reflect on their teaching strategy.
2. **Pedagogical Analysis**: Link what happened to teaching theories (e.g., Vygotsky, Piaget) in a Zimbabwean context.
3. **Unhu/Ubuntu Check**: How was character and values integrated or managed?
4. **Action Plan**: 3 specific steps for the next lesson to improve.
5. **MoPSE Compliance Note**: How this aligns with the Heritage-Based Curriculum.`;
    } else if (type === "supervisor_prep") {
      prompt = `You are DARA, preparing a student teacher for a supervisor's visit in Zimbabwe.
The student is teaching:
- Subject: ${details.subject}
- Topic: ${details.topic}
- Level: ${details.level}

Provide a "Mock Observation" prep guide in Markdown:
1. **Likely Supervisor Questions**: 5 tough questions a supervisor might ask about the lesson plan or execution.
2. **Model Answers**: How to answer those questions professionally using HBC terminology.
3. **Classroom Management Tips**: 3 tips for handling a large Zimbabwean class under observation.
4. **Documentation Checklist**: What files (Scheme of work, Lesson plans, Records) must be on the desk.
5. **DARA's Encouragement**: A short, motivating message for the student teacher.`;
    } else if (type === "feedback_analysis") {
      prompt = `You are DARA, analyzing supervisor feedback for a student teacher in Zimbabwe.
SUPERVISOR FEEDBACK:
${details.feedback}

Provide a structured Improvement Plan in Markdown:
1. **Key Strengths**: Identify what the supervisor praised.
2. **Areas for Growth**: Translate the supervisor's criticisms into actionable growth areas.
3. **DARA's Strategy**: Specific teaching strategies (e.g., "Think-Pair-Share", "Discovery Method") to address the weaknesses.
4. **Resource Suggestions**: Which Dare Library resources could help with these specific areas.
5. **Next Observation Goal**: A clear, measurable goal for the next visit.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("TP Companion Error:", error);
      throw error;
    }
  },

  /**
   * Generates a ZTC Portfolio structure or accreditation report.
   */
  async generatePortfolioStructure({ collegeName, department, focusArea }: { collegeName: string; department: string; focusArea: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `You are DARA, an expert in Zimbabwean Teacher Education (ZIMCHE standards).
Generate a comprehensive "ZTC Portfolio Structure" for:
- College: ${collegeName}
- Department: ${department}
- Focus Area: ${focusArea}

The response should be in Markdown and include:
1. **Portfolio Components**: 5-7 required sections for a professional teacher's portfolio in Zimbabwe.
2. **Evidence Checklist**: Specific documents needed for each section (e.g., Scheme of work, Peer observation records).
3. **ZIMCHE Compliance Guide**: How this portfolio meets the Resource Adequacy and Quality Assurance standards.
4. **Heritage-Based Curriculum Integration**: How to demonstrate HBC principles in the portfolio.
5. **DARA's Professional Advice**: 3 tips for maintaining an award-winning portfolio.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("Portfolio Generation Error:", error);
      throw error;
    }
  },

  /**
   * Generates curriculum guidance for a specific topic and level.
   */
  async generateCurriculumGuidance({ level, topic }: { level: string; topic: string }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `You are DARA, the Zimbabwe Curriculum Intelligence Engine.
Provide a deep-dive analysis of the following curriculum topic:
- Level: ${level}
- Topic: ${topic}

The response should be in Markdown and include:
1. **Syllabus Objective Breakdown**: Explain what the MoPSE/ZIMSEC objective actually means for a teacher.
2. **Teaching Sequence**: A suggested 3-lesson sequence to cover this topic effectively.
3. **Common Misconceptions**: What do Zimbabwean students usually struggle with in this topic?
4. **HBC Integration**: How to link this topic to Zimbabwe's heritage and values (Unhu/Ubuntu).
5. **Exam Pattern Analysis**: How this topic is typically tested in ZIMSEC exams (if applicable).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction: DARA_SYSTEM_PROMPT },
      });
      return response.text;
    } catch (error) {
      console.error("Curriculum Engine Error:", error);
      throw error;
    }
  },

  /**
   * Semantic search using embeddings via Supabase Edge Function
   */
  async semanticSearch(query: string, matchThreshold = 0.4, matchCount = 20) {
    try {
      const { data, error } = await supabase.functions.invoke('search-books', {
        body: { query, match_threshold: matchThreshold, match_count: matchCount }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Semantic Search Error:", error);
      // Fallback to keyword search if semantic search fails
      return null;
    }
  },

  /**
   * Generate an archival report or summary for a resource
   */
  async generateArchivalReport(resourceData: { title: string; author: string; subject: string; abstract: string; institution: string; year: string | number }) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
      As a professional archivist, generate a comprehensive archival report for the following local resource:
      
      Title: ${resourceData.title}
      Author: ${resourceData.author}
      Subject: ${resourceData.subject}
      Abstract: ${resourceData.abstract}
      Institution: ${resourceData.institution}
      Year: ${resourceData.year}
      
      The report should include:
      1. Historical Context: Why this resource is significant to Zimbabwean heritage.
      2. Key Findings/Themes: A summary of the main points.
      3. Archival Value: How this contributes to the local knowledge repository.
      4. Recommendations for Researchers: How this resource can be used for future studies.
      
      Format the output in professional Markdown.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating archival report:", error);
      throw error;
    }
  },

  /**
   * Extract academic metadata from raw text using Gemini
   */
  async extractMetadata(rawText: string) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
      Extract academic metadata from the following text and return ONLY a JSON object.
      Required fields: title, authors (list of strings), date (YYYY-MM-DD format if possible), abstract.
      
      Text: ${truncateText(rawText, 10000)}
    `;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are an academic metadata extractor. Return only pure JSON. No markdown, no explanation.",
          responseMimeType: "application/json"
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Metadata Extraction Error:", error);
      throw error;
    }
  },

  /**
   * Process institutional content (Summarize, Explain, Quiz)
   */
  async processInstitutionalContent(text: string, type: string) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let prompt = "";

    if (type === "summary") {
      prompt = `Summarize this for a Zimbabwean student:\n${text}`;
    } else if (type === "explain") {
      prompt = `Explain this simply for a Form 4 student:\n${text}`;
    } else if (type === "quiz") {
      prompt = `Generate 5 quiz questions from this:\n${text}`;
    } else {
      prompt = `Analyze this content:\n${text}`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Institutional Content Error:", error);
      throw error;
    }
  },

  /**
   * Transforms textbook content into structured HBC learning material.
   */
  async transformToHBC(content: string) {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `You are a Zimbabwean curriculum expert specializing in the Heritage-Based Curriculum (HBC).

Using the provided textbook content, transform it into structured HBC learning material.

INPUT CONTENT:
${truncateText(content, 15000)}

OUTPUT:

1. Topic:
2. Subtopics:
3. Simplified Explanation (student-friendly):
4. Key Notes (bullet points):
5. Real-life Zimbabwean example:
6. 5 Exam-style Questions:
7. Answers and explanations:

Ensure:
* Alignment with ZIMSEC/HBC
* Clear, simple language
* Practical relevance
do not make any other changes.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: DARA_SYSTEM_PROMPT,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini HBC Transformation Error:", error);
      throw error;
    }
  }
};


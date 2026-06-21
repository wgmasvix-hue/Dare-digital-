import { DARA_SYSTEM_PROMPT } from '../lib/daraSystemPrompt';
import { callDeepSeek, toDS } from '../lib/deepseek';
import { supabase } from '../lib/supabase';

const truncateText = (text: string, maxLength = 30000) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '... [Text truncated for AI processing]';
};

async function callAI(
  contents: unknown,
  config: Record<string, unknown> = {}
): Promise<{ text: string }> {
  const systemPrompt = (config.systemInstruction as string) || DARA_SYSTEM_PROMPT;
  const jsonMode = config.responseMimeType === 'application/json';
  const messages = toDS(contents);
  const text = await callDeepSeek(messages, { systemPrompt, jsonMode });
  return { text };
}

export const geminiService = {
  async summarize(text: string, context = '') {
    const prompt = `Task: Provide a concise and insightful summary of the following text.
Focus on key concepts, main arguments, and educational value.

Context: ${context}

Text to summarize:
${truncateText(text)}`;
    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('BAKO Summarization Error:', error);
      throw error;
    }
  },

  async askQuestion(question: string, bookContext: string) {
    const prompt = `Task: Answer the student's question based on the provided book context.

Book Context:
${truncateText(bookContext)}

Student Question:
${question}`;
    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('BAKO Q&A Error:', error);
      throw error;
    }
  },

  async getSearchSuggestions(query: string) {
    try {
      const data = await callAI(
        `Task: Provide 5 related academic search terms or Boolean search combinations for the following query.\nQuery: ${query}\n\nReturn ONLY a JSON array of strings. No markdown, no explanation.`,
        {
          systemInstruction: 'You are BAKO, an academic librarian. Return only a JSON array of strings. No markdown, no explanation.',
          responseMimeType: 'application/json',
        }
      );
      return JSON.parse(data.text || '[]');
    } catch {
      return [];
    }
  },

  async searchBooks(query: string) {
    try {
      const data = await callAI(
        `Task: Analyze the user's request and extract search parameters.\nRequest: ${query}\n\nReturn ONLY valid JSON: { "keywords": [], "faculty": "All", "level": "All" }`,
        {
          systemInstruction: `You are BAKO. Extract keywords, faculty, and level from the user's request.
Return ONLY valid JSON: { "keywords": [], "faculty": "All", "level": "All" }.
Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`,
          responseMimeType: 'application/json',
        }
      );
      return JSON.parse(data.text || '{"keywords": [], "faculty": "All", "level": "All"}');
    } catch {
      return { keywords: [query], faculty: 'All', level: 'All' };
    }
  },

  async generateLessonPlan(details: {
    subject: string;
    level: string;
    topic: string;
    duration: string;
    resources?: string;
  }) {
    const prompt = `You are BAKO, Zimbabwe's Heritage-Based Curriculum (HBC) aligned teacher training AI.
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
- Available Resources: ${details.resources || 'Chalk, blackboard, local environment, textbook'}

Generate a FULL lesson plan using this EXACT structure in Markdown:

# HERITAGE-BASED LESSON PLAN
**Subject:** | **Level:** | **Topic:** | **Duration:**

## 1. Syllabus Reference
## 2. Specific Objectives
## 3. Heritage & Unhu/Ubuntu Integration
## 4. Prior Knowledge & Skills
## 5. Media/Resources
## 6. Lesson Development

| Stage | Teacher Activity | Learner Activity | Points to Note |
|-------|-----------------|------------------|----------------|

## 7. Assessment & Evaluation
## 8. Innovation & Production Task
## 9. BAKO HBC Teaching Tips`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('BAKO Lesson Plan Error:', error);
      throw error;
    }
  },

  async generateAssessment(details: {
    subject: string;
    topic: string;
    level: string;
    type?: string;
  }) {
    const prompt = `You are BAKO. Generate an interactive, Heritage-Based Curriculum (HBC) aligned assessment for:
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
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('BAKO Assessment Error:', error);
      throw error;
    }
  },

  async chat(
    message: string,
    history: { role: string; text: string }[] = [],
    options: {
      programmeCode?: string;
      faculty?: string;
      institutionId?: string;
      temperature?: number;
      systemInstruction?: string;
    } = {}
  ) {
    try {
      const { callDeepSeek: callDS } = await import('../lib/deepseek');
      const messages = [
        ...history.map((m) => ({
          role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: truncateText(m.text, 4000),
        })),
        { role: 'user' as const, content: truncateText(message, 12000) },
      ];
      return await callDS(messages, {
        systemPrompt: options.systemInstruction || DARA_SYSTEM_PROMPT,
        temperature: options.temperature ?? 0.7,
      });
    } catch (error) {
      console.error('BAKO Chat Error:', error);
      throw error;
    }
  },

  async generateVocationalGuide({
    trade,
    skill,
    level,
    resources,
  }: {
    trade: string;
    skill: string;
    level: string;
    resources: string;
  }) {
    const prompt = `Generate a comprehensive, practical skill guide for a vocational training student in Zimbabwe.

Trade: ${trade}
Specific Skill: ${skill}
Level: ${level}
Available Resources: ${resources}

Follow Zimbabwe's Heritage-Based Curriculum (HBC) and Education 5.0 principles.
Structure in Markdown: Title, Objective, Tools & Materials, Safety First, Step-by-Step Procedure,
Unhu/Ubuntu in the Trade, Innovation/Production Task, Troubleshooting.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Vocational Guide Error:', error);
      throw error;
    }
  },

  async generateVocationalSkillModule({
    trade,
    skill,
    level,
    part,
  }: {
    trade: string;
    skill: string;
    level: string;
    part: 'tasks' | 'steps' | 'practice' | 'test';
  }) {
    const prompts = {
      tasks: `Generate a list of 3-5 real-world "TASKS" for the skill: ${skill} in the trade: ${trade} at ${level} level. Focus on production-oriented tasks relevant to the Zimbabwean economy. Format in Markdown.`,
      steps: `Generate a "SHOW ME HOW" step-by-step guide for: ${skill} in ${trade} at ${level} level. Include required tools, safety tips, and max 10 numbered steps. Format in Markdown.`,
      practice: `Generate a "PRACTICE" challenge for: ${skill} in ${trade} at ${level} level. Include a specific goal and success criteria checklist. Format in Markdown.`,
      test: `Generate a "TEST" for: ${skill} in ${trade} at ${level} level. Provide 3 scenario-based questions with correct answers. Format in Markdown.`,
    };
    try {
      const data = await callAI(prompts[part]);
      return data.text;
    } catch (error) {
      console.error('Vocational Skill Module Error:', error);
      throw error;
    }
  },

  async vocationalAssist({
    action,
    trade,
    skill,
    context,
  }: {
    action: string;
    trade: string;
    skill: string;
    context: string;
  }) {
    const prompts: Record<string, string> = {
      explain: `Explain this concept simply for a workshop setting: ${context}. Skill: ${skill}, Trade: ${trade}.`,
      steps: `Show me exactly how to do this: ${context}. Provide 5-7 clear steps for ${skill} in ${trade}. Include safety.`,
      show_how: `Show me exactly how to do this: ${context}. Provide 5-7 clear steps for ${skill} in ${trade}. Include safety.`,
      task: `Give me a real-world "Try This Task" challenge for ${skill} in ${trade}. Focus on production.`,
      try_task: `Give me a real-world "Try This Task" challenge for ${skill} in ${trade}. Focus on production.`,
      fix_mistake: `I made a mistake doing ${skill} in ${trade}. Context: ${context}. How do I fix it safely?`,
      next_task: `I finished the current task for ${skill} in ${trade}. What is the next logical task to advance my skills?`,
      safety_tips: `Critical safety tips for ${skill} in ${trade}. Focus on workshop hazards in Zimbabwe.`,
      quiz: `Ask me one practical troubleshooting question about ${skill} in ${trade}.`,
    };
    try {
      const data = await callAI(prompts[action] || context);
      return data.text;
    } catch (error) {
      console.error('Vocational Assist Error:', error);
      throw error;
    }
  },

  async generateProjectEstimator({
    project,
    trade,
    scale,
  }: {
    project: string;
    trade: string;
    scale: string;
  }) {
    const prompt = `Generate a project estimation and material list for a vocational training project in Zimbabwe.

Project: ${project} | Trade: ${trade} | Scale: ${scale}

Provide in Markdown: Project Overview, Material List, Estimated Quantities, Local Sourcing Tips,
Production Timeline, Costing Strategy, Sustainability Note.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Project Estimator Error:', error);
      throw error;
    }
  },

  async generateTPCompanionResponse({
    type,
    details,
  }: {
    type: 'reflection' | 'supervisor_prep' | 'feedback_analysis';
    details: {
      subject: string;
      topic: string;
      level?: string;
      experience?: string;
      challenges?: string;
      feedback?: string;
    };
  }) {
    const prompts: Record<string, string> = {
      reflection: `You are BAKO, the Teaching Practice (TP) Companion for a student teacher in Zimbabwe.
Subject: ${details.subject} | Topic: ${details.topic}
Experience: ${details.experience} | Challenges: ${details.challenges}

Provide in Markdown: BAKO Reflection Prompts, Pedagogical Analysis, Unhu/Ubuntu Check, Action Plan, MoPSE Compliance Note.`,
      supervisor_prep: `You are BAKO, preparing a student teacher for a supervisor visit.
Subject: ${details.subject} | Topic: ${details.topic} | Level: ${details.level}

Provide in Markdown: Likely Supervisor Questions, Model Answers, Classroom Management Tips, Documentation Checklist, BAKO's Encouragement.`,
      feedback_analysis: `You are BAKO, analyzing supervisor feedback for a student teacher in Zimbabwe.
Feedback: ${details.feedback}

Provide in Markdown: Key Strengths, Areas for Growth, BAKO's Strategy, Resource Suggestions, Next Observation Goal.`,
    };
    try {
      const data = await callAI(prompts[type]);
      return data.text;
    } catch (error) {
      console.error('TP Companion Error:', error);
      throw error;
    }
  },

  async generatePortfolioStructure({
    collegeName,
    department,
    focusArea,
  }: {
    collegeName: string;
    department: string;
    focusArea: string;
  }) {
    const prompt = `You are BAKO, an expert in Zimbabwean Teacher Education (ZIMCHE standards).
Generate a ZTC Portfolio Structure for:
- College: ${collegeName} | Department: ${department} | Focus Area: ${focusArea}

In Markdown: Portfolio Components, Evidence Checklist, ZIMCHE Compliance Guide, HBC Integration, BAKO's Professional Advice.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Portfolio Generation Error:', error);
      throw error;
    }
  },

  async generateCurriculumGuidance({ level, topic }: { level: string; topic: string }) {
    const prompt = `You are BAKO, the Zimbabwe Curriculum Intelligence Engine.
Level: ${level} | Topic: ${topic}

In Markdown: Syllabus Objective Breakdown, Teaching Sequence (3 lessons), Common Misconceptions, HBC Integration, Exam Pattern Analysis.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Curriculum Engine Error:', error);
      throw error;
    }
  },

  async semanticSearch(query: string, matchThreshold = 0.4, matchCount = 20) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.functions.invoke('search-books', {
        body: { query, match_threshold: matchThreshold, match_count: matchCount },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Semantic Search Error:', error);
      return null;
    }
  },

  async generateArchivalReport(resourceData: {
    title: string;
    author: string;
    subject: string;
    abstract: string;
    institution: string;
    year: string | number;
  }) {
    const prompt = `As a professional archivist, generate a comprehensive archival report for this Zimbabwean resource:

Title: ${resourceData.title} | Author: ${resourceData.author} | Subject: ${resourceData.subject}
Abstract: ${resourceData.abstract} | Institution: ${resourceData.institution} | Year: ${resourceData.year}

In Markdown: Historical Context, Key Findings/Themes, Archival Value, Recommendations for Researchers.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Error generating archival report:', error);
      throw error;
    }
  },

  async extractMetadata(rawText: string) {
    const prompt = `Extract academic metadata from the following text. Return ONLY a JSON object with fields: title, authors (array), date (YYYY-MM-DD), abstract.

Text: ${truncateText(rawText, 10000)}`;
    try {
      const data = await callAI(prompt, {
        systemInstruction:
          'You are an academic metadata extractor. Return only pure JSON. No markdown, no explanation.',
        responseMimeType: 'application/json',
      });
      return JSON.parse(data.text || '{}');
    } catch (error) {
      console.error('Metadata Extraction Error:', error);
      throw error;
    }
  },

  async processInstitutionalContent(text: string, type: string) {
    const prompts: Record<string, string> = {
      summary: `Summarize this for a Zimbabwean student:\n${text}`,
      summarize: `Summarize this for a Zimbabwean student:\n${text}`,
      explain: `Explain this simply for a Form 4 student:\n${text}`,
      'key-points': `Extract the most important key points. Format as a bulleted list:\n${text}`,
      quiz: `Generate 5 quiz questions from this:\n${text}`,
    };
    try {
      const data = await callAI(prompts[type] || `Analyze this content:\n${text}`);
      return data.text;
    } catch (error) {
      console.error('Institutional Content Error:', error);
      throw error;
    }
  },

  async transformToHBC(content: string) {
    const prompt = `You are a Zimbabwean curriculum expert specializing in the Heritage-Based Curriculum (HBC).
Transform this textbook content into structured HBC learning material.

INPUT:
${truncateText(content, 15000)}

OUTPUT FORMAT:
1. Topic:
2. Subtopics:
3. Simplified Explanation (student-friendly):
4. Key Notes (bullet points):
5. Real-life Zimbabwean example:
6. 5 Exam-style Questions:
7. Answers and explanations:

Align with ZIMSEC/HBC. Use clear, simple language.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('HBC Transformation Error:', error);
      throw error;
    }
  },

  async analyzeExamAnswer(question: Record<string, unknown>, answer: string) {
    const prompt = `You are an expert Zimbabwean examiner for the Heritage-Based Curriculum.
Analyze this student answer.

Question: ${question.question}
Subject: ${question.subject} | Topic: ${question.topic} | Total Marks: ${question.marks}
Model Answer: ${question.answer}
Examiner Notes: ${question.notes}

Student Answer: "${answer}"

Return ONLY valid JSON:
{
  "score": <0-100>,
  "comments": "<overall feedback>",
  "strengths": ["<strength 1>"],
  "improvements": ["<improvement 1>"]
}`;

    try {
      const data = await callAI(prompt, { responseMimeType: 'application/json' });
      return JSON.parse(data.text || '{}');
    } catch (error) {
      console.error('Exam Analysis Error:', error);
      throw error;
    }
  },

  async generateBookAction(bookContext: string, task: string) {
    const prompt = `${bookContext}\n\nTask: ${task}\n\nFormat your response using Markdown.`;
    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Book Action Error:', error);
      throw error;
    }
  },

  async chatWithBook(context: string, question: string) {
    const prompt = `Context: ${context}\n\nFollow-up Question: ${question}\n\nFormat your response using Markdown.`;
    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Book Chat Error:', error);
      throw error;
    }
  },

  async generateSummary(
    resource: Record<string, unknown>,
    domainInfo: Record<string, unknown>
  ) {
    const prompt = `You are an expert academic librarian. Provide a concise summary (max 100 words) for this resource.
Focus on key takeaways for students in ${domainInfo?.name || 'Education'}.

Title: ${resource.title}
Authors: ${Array.isArray(resource.authors) ? resource.authors.join(', ') : resource.authors}
Abstract: ${resource.abstract}

Format as a single paragraph.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Library Summary Error:', error);
      throw error;
    }
  },

  async librarianSearch(query: string, domains: Record<string, unknown>[]) {
    const prompt = `You are BAKO, the AI Librarian for a Zimbabwean educational library.
A user is asking: "${query}"

Provide a helpful, concise answer (under 150 words). Our library covers: ${domains
      .map((d) => d.name)
      .join(', ')}.`;

    try {
      const data = await callAI(prompt);
      return data.text;
    } catch (error) {
      console.error('Librarian Search Error:', error);
      throw error;
    }
  },
};

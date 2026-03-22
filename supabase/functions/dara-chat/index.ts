// ============================================================
// DARE ASSIST — DARA CHAT EDGE FUNCTION v2
// With persistent user memory — learns across sessions
// supabase/functions/dara-chat/index.ts
// ChengetAI Labs
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// TYPES
// ============================================================
interface DaraChatRequest {
  message: string
  session_id?: string
  user_id: string
  institution_id?: string
  programme_code?: string
  faculty?: string
  language_preference?: 'en' | 'sn' | 'nd' | 'auto'
}

interface UserMemory {
  programme_code?: string
  faculty?: string
  study_level?: string
  institution_name?: string
  dissertation_topic?: string
  research_paradigm?: string
  preferred_language?: string
  struggle_topics?: string[]
  research_interests?: string[]
  writing_gaps?: string[]
  books_recommended?: string[]
  dara_notes?: string
  total_sessions?: number
}

interface BookContext {
  id: string
  title: string
  author_names: string
  faculty: string
  subject: string
  dara_summary: string
  file_url: string
  access_model: string
  difficulty_level: string
  resource_type: string
}

interface ExtractedMemory {
  memory_type: string
  fact: string
  fact_data: Record<string, string>
  confidence: number
}

// ============================================================
// CORS
// ============================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ============================================================
// LOAD USER MEMORY
// Retrieves the student's accumulated memory profile
// ============================================================
async function loadUserMemory(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<UserMemory | null> {
  try {
    const { data } = await supabase
      .from('dara_user_memory')
      .select('*')
      .eq('user_id', userId)
      .single()
    return data
  } catch {
    return null
  }
}

// ============================================================
// FORMAT MEMORY FOR SYSTEM PROMPT
// Converts the memory profile into a readable context block
// ============================================================
function formatMemoryForPrompt(memory: UserMemory | null): string {
  if (!memory) {
    return 'NEW STUDENT — No prior conversation history. Build their profile naturally through conversation. Do not interrogate them with intake questions — extract context organically from what they share.'
  }

  const lines: string[] = ['RETURNING STUDENT — What you already know about them:']

  if (memory.programme_code) lines.push(`• Programme: ${memory.programme_code}`)
  if (memory.faculty) lines.push(`• Faculty: ${memory.faculty}`)
  if (memory.study_level) lines.push(`• Study Level: ${memory.study_level}`)
  if (memory.institution_name) lines.push(`• Institution: ${memory.institution_name}`)
  if (memory.preferred_language && memory.preferred_language !== 'en') {
    lines.push(`• Preferred Language: ${memory.preferred_language} — speak to them in this language`)
  }
  if (memory.dissertation_topic) {
    lines.push(`• Dissertation/Research Topic: "${memory.dissertation_topic}"`)
  }
  if (memory.research_paradigm) {
    lines.push(`• Research Paradigm: ${memory.research_paradigm}`)
  }
  if (memory.struggle_topics?.length) {
    lines.push(`• Topics they struggle with: ${memory.struggle_topics.join(', ')} — be extra patient and thorough on these`)
  }
  if (memory.writing_gaps?.length) {
    lines.push(`• Academic writing gaps: ${memory.writing_gaps.join(', ')} — proactively watch for and correct these`)
  }
  if (memory.research_interests?.length) {
    lines.push(`• Research interests: ${memory.research_interests.join(', ')} — connect relevant content to these where natural`)
  }
  if (memory.books_recommended?.length) {
    lines.push(`• Books already recommended to them: ${memory.books_recommended.join(', ')} — don't repeat these unless directly asked or highly relevant; diversify recommendations`)
  }
  if (memory.total_sessions && memory.total_sessions > 1) {
    lines.push(`• This is session #${memory.total_sessions + 1} — greet them as a familiar student, not a new user`)
  }
  if (memory.dara_notes) {
    lines.push(`• DARA's notes: ${memory.dara_notes}`)
  }

  lines.push('\nUSE THIS CONTEXT SILENTLY. Do not recite their profile back to them. Apply it naturally — tailor examples to their field, anticipate their likely struggles, reference their dissertation topic if relevant.')

  return lines.join('\n')
}

// ============================================================
// FETCH RELEVANT BOOKS
// ============================================================
async function fetchRelevantBooks(
  supabase: ReturnType<typeof createClient>,
  message: string,
  programmeCode?: string,
  faculty?: string,
  alreadyRecommended?: string[]
): Promise<BookContext[]> {
  try {
    const exclude = alreadyRecommended || []

    if (programmeCode) {
      const { data } = await supabase
        .from('books')
        .select('id, title, author_names, faculty, subject, dara_summary, file_url, access_model, difficulty_level, resource_type')
        .contains('zimche_programme_codes', [programmeCode])
        .eq('status', 'published')
        .not('id', 'in', `(${exclude.map(id => `'${id}'`).join(',') || "''"})`)
        .order('featured_priority', { ascending: true })
        .limit(6)
      if (data?.length) return data
    }

    if (faculty) {
      const { data } = await supabase
        .from('books')
        .select('id, title, author_names, faculty, subject, dara_summary, file_url, access_model, difficulty_level, resource_type')
        .eq('faculty', faculty)
        .eq('status', 'published')
        .not('id', 'in', `(${exclude.map(id => `'${id}'`).join(',') || "''"})`)
        .order('featured_priority', { ascending: true })
        .limit(6)
      if (data?.length) return data
    }

    const keywords = message.split(' ').filter(w => w.length > 3).slice(0, 5).join(' & ')
    const { data } = await supabase
      .from('books')
      .select('id, title, author_names, faculty, subject, dara_summary, file_url, access_model, difficulty_level, resource_type')
      .textSearch('search_vector', keywords, { type: 'websearch', config: 'english' })
      .eq('status', 'published')
      .limit(5)
    return data || []
  } catch {
    return []
  }
}

// ============================================================
// FORMAT BOOKS FOR PROMPT
// ============================================================
function formatBooksForPrompt(books: BookContext[]): string {
  if (!books.length) return 'No catalog match for this query. Suggest student browse by faculty.'
  return books.map((b, i) =>
    `[${i + 1}] "${b.title}" by ${b.author_names}
    Faculty: ${b.faculty} | Subject: ${b.subject} | Level: ${b.difficulty_level || 'undergraduate'}
    Access: ${b.access_model === 'open' ? 'FREE — Open Access' : b.access_model}
    URL: ${b.file_url}
    DARA Intelligence: ${b.dara_summary?.substring(0, 250) || 'No summary.'}`
  ).join('\n\n')
}

// ============================================================
// EXTRACT MEMORY FROM CONVERSATION TURN
// Lightweight Gemini call to extract structured facts
// Runs async — does not block the student's response
// ============================================================
async function extractMemoryFromTurn(
  geminiApiKey: string,
  userMessage: string,
  daraResponse: string
): Promise<ExtractedMemory[]> {
  try {
    const extractionPrompt = `You are a memory extraction system for an AI academic assistant called DARA in Zimbabwe.

Analyse this conversation exchange and extract any factual, persistent information about the student that would be useful to remember in future sessions.

USER MESSAGE: "${userMessage}"
DARA RESPONSE: "${daraResponse}"

Extract ONLY concrete, verifiable facts — not inferences or assumptions.

Return a JSON array. Each item must have:
- memory_type: one of [academic_identity, dissertation_context, struggle_identified, mastery_demonstrated, book_preference, language_preference, assignment_context, research_interest, writing_gap, personal_context, goal_stated]
- fact: plain English description of the fact (max 150 chars)
- fact_data: object with structured key-value pairs relevant to the memory_type
- confidence: 0.0-1.0

Examples of good extractions:
{"memory_type": "academic_identity", "fact": "Student is in final year studying BSc Food Science", "fact_data": {"study_level": "final_year", "programme_code": "BSc-FoodSci"}, "confidence": 0.95}
{"memory_type": "struggle_identified", "fact": "Student confused about difference between reliability and validity in research", "fact_data": {"topic": "research_methodology"}, "confidence": 0.85}
{"memory_type": "dissertation_context", "fact": "Student writing dissertation on urban food security in Harare", "fact_data": {"topic": "urban food security Harare"}, "confidence": 0.95}
{"memory_type": "language_preference", "fact": "Student wrote in Shona", "fact_data": {"language": "sn"}, "confidence": 1.0}
{"memory_type": "writing_gap", "fact": "Student incorrectly formatted APA in-text citations", "fact_data": {"gap": "apa_citation"}, "confidence": 0.80}

If nothing meaningful to extract, return an empty array: []

Return ONLY the JSON array. No explanation, no markdown.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
          generationConfig: {
            temperature: 0.1,       // Low temperature — we want precision not creativity
            maxOutputTokens: 500,
          }
        })
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

    // Clean and parse
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const extracted: ExtractedMemory[] = JSON.parse(cleaned)

    // Filter low-confidence entries
    return extracted.filter(e => e.confidence >= 0.70)
  } catch {
    return []
  }
}

// ============================================================
// SAVE MEMORY ENTRIES
// Persists extracted memory to dara_memory_entries
// ============================================================
async function saveMemoryEntries(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  sessionId: string,
  messageId: string,
  entries: ExtractedMemory[]
): Promise<void> {
  if (!entries.length) return

  try {
    await supabase.from('dara_memory_entries').insert(
      entries.map(e => ({
        user_id: userId,
        session_id: sessionId,
        memory_type: e.memory_type,
        fact: e.fact,
        fact_data: e.fact_data,
        confidence: e.confidence,
      }))
    )
  } catch (err) {
    console.error('Memory save error:', err)
  }
}

// ============================================================
// UPDATE USER MEMORY STATS
// Increments session/message counters and last_active_at
// ============================================================
async function updateMemoryStats(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  isNewSession: boolean,
  programme_code?: string,
  faculty?: string,
  preferred_language?: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('dara_user_memory')
      .select('id, total_sessions, total_messages')
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase
        .from('dara_user_memory')
        .update({
          total_sessions: isNewSession
            ? (existing.total_sessions || 0) + 1
            : existing.total_sessions,
          total_messages: (existing.total_messages || 0) + 1,
          last_active_at: new Date().toISOString(),
          ...(programme_code && { programme_code }),
          ...(faculty && { faculty }),
          ...(preferred_language && { preferred_language }),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      // First ever interaction — create the memory record
      await supabase.from('dara_user_memory').insert({
        user_id: userId,
        total_sessions: 1,
        total_messages: 1,
        last_active_at: new Date().toISOString(),
        programme_code: programme_code || null,
        faculty: faculty || null,
        preferred_language: preferred_language || 'en',
      })
    }
  } catch (err) {
    console.error('Memory stats update error:', err)
  }
}

// ============================================================
// BUILD SYSTEM PROMPT WITH MEMORY CONTEXT
// ============================================================
function buildSystemPrompt(
  bookContext: string,
  memoryContext: string,
  programmeCode?: string,
  faculty?: string,
  institutionId?: string
): string {
  return `You are DARA — the AI study companion embedded inside Dare Digital Library, Zimbabwe's premier open educational resource platform built by ChengetAI Labs.

## ═══════════════════════════════════════════════════════════
## SECTION 0 — PRIME DIRECTIVE
## ═══════════════════════════════════════════════════════════
Your singular mission is to be the best study companion in the land: academically rigorous, culturally intelligent, pedagogically sound, and deeply rooted in Zimbabwe's educational landscape.
Never do the thinking FOR the student. Always do the thinking WITH the student.

## ═══════════════════════════════════════════════════════════
## STUDENT MEMORY — WHO YOU ARE TALKING TO
## ═══════════════════════════════════════════════════════════
${memoryContext}

${programmeCode ? `Current session declared programme: ${programmeCode}` : ''}
${faculty ? `Current session declared faculty: ${faculty}` : ''}
${institutionId ? `Student is authenticated via Institutional Authenticator (ID: ${institutionId}). This means they have full access to licensed resources.` : ''}

## ═══════════════════════════════════════════════════════════
## DARE DIGITAL LIBRARY — RELEVANT BOOKS & PORTALS
## ═══════════════════════════════════════════════════════════
${bookContext}

PLATFORM FEATURES:
- **Polytechnic & Vocational Portal**: A dedicated section for technical education, separated into "Polytechnics" and "Vocational Schools" tabs.
- **Institutional Authenticator**: Allows students from partner universities/colleges to sign in with their institutional email or access code for full resource access.
- **IDR (Institutional Digital Repository)**: Access to local research and dissertations.

## ═══════════════════════════════════════════════════════════
## SECTION 1 — IDENTITY & PERSONA
## ═══════════════════════════════════════════════════════════
- **Name:** DARA (Dare Assist Research Assistant)
- **Voice:** Warm, direct, encouraging, intellectually rigorous.
- **Personality:** Patient but firm. Curious. Uncompromising on academic integrity.
- **Cultural Register:** You understand Zimbabwean realities (load-shedding, data costs, Education 5.0).
- **Language:** English (primary). You understand Shona and Ndebele and can acknowledge them, but respond substantively in English.

## ═══════════════════════════════════════════════════════════
## SECTION 2 — PEDAGOGICAL MODE SYSTEM
## ═══════════════════════════════════════════════════════════
Classify student input into one of these modes and respond accordingly:
1. **EXPLAINER**: Define precisely, explain simply, use a Zimbabwe-specific analogy.
2. **SOCRATIC**: Ask diagnostic questions to build from what they know.
3. **SCAFFOLDER**: Walk through steps without giving the answer.
4. **EVALUATOR**: Provide structured feedback (Accuracy | Completeness | Exam-readiness).
5. **SYNTHESIZER**: Produce structured summaries with hierarchy.
6. **DRILL SERGEANT**: Rapid-fire Q&A for exam prep.
7. **STUDY PLANNER**: Build day-by-day plans considering local realities.
8. **FEYNMAN**: Ask them to teach it back to you.
9. **INTEGRITY GUARDIAN**: Decline assignment writing; pivot to structural guidance.

## ═══════════════════════════════════════════════════════════
## SECTION 3 — RESPONSE FORMATTING STANDARDS
## ═══════════════════════════════════════════════════════════
- Use Markdown (Headers, Bold, Bullets, Tables).
- Mobile-first: Break text into short paragraphs (3-4 sentences max).
- **MANDATORY FOOTER**: Every substantive response MUST end with a "💡 Quick Check" question.

## ═══════════════════════════════════════════════════════════
## SECTION 4 — ZIMBABWE INTELLIGENCE BASE
## ═══════════════════════════════════════════════════════════
Ground every concept in Zimbabwean context:
- **Institutions**: RBZ, ZIMRA, GMB, ZESA, ZIMCHE, SAZ.
- **Economy**: ZiG currency, dual-currency system, mining (lithium, gold, platinum), agriculture.
- **Geography**: Agro-ecological zones (I-V), major cities (Harare, Bulawayo, Mutare, etc.).
- **Education 5.0**: Teaching, Research, Community Service, Innovation, Industrialisation.

## ═══════════════════════════════════════════════════════════
## SECTION 6 — ACADEMIC INTEGRITY
## ═══════════════════════════════════════════════════════════
- NEVER write assignments or essays for students.
- Provide structures, suggest sources, and explain concepts.
- Help with Harvard (UZ standard) or APA 7th citations.

## ═══════════════════════════════════════════════════════════
## SECTION 7 — RESEARCH NAVIGATION
## ═══════════════════════════════════════════════════════════
When a student needs to find academic sources, guide them through this structured search strategy:
1. **STEP 1 — DATAD first for African/Zimbabwean topics**: Search the Database of African Theses and Dissertations (datad.aau.org) for Zimbabwean and African graduate research. This surfaces local context that international databases miss entirely.
2. **STEP 2 — Dare Library OER content**: Check the Dare Digital Library catalog for open textbooks and FAO/WHO/OpenStax resources that cover your topic's theoretical framework.
3. **STEP 3 — ProQuest/JSTOR for international peer-reviewed literature**: Use your institutional ProQuest access (via campus network or Research4Life VPN) for international journal articles. Search by subject heading, not just keywords.
4. **STEP 4 — Google Scholar for grey literature and recent preprints**: Use Google Scholar to catch recent working papers, conference proceedings, and anything missed above. Filter by date range for recent work.

**KEY PRINCIPLE**: Always tell students — "African research on African problems exists. Find it in DATAD before assuming only Western literature covers your topic."

## ═══════════════════════════════════════════════════════════
## SECTION 8 — SPECIAL PROTOCOLS
## ═══════════════════════════════════════════════════════════
- **Struggling Student**: Acknowledge frustration, simplify radically.
- **Load-Shedding**: Prioritize concise, high-yield points for offline study.
- **Exam Emergency**: Triage high-yield topics and enter Drill Sergeant mode.

USE THIS CONTEXT SILENTLY. Do not recite their profile back to them. Apply it naturally.`
}


// ============================================================
// MAIN HANDLER
// ============================================================
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')

    const body: DaraChatRequest = await req.json()
    const { message, session_id, user_id, institution_id, programme_code, faculty } = body

    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'message and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isNewSession = !session_id

    // --------------------------------------------------------
    // STEP 1: Load user memory
    // --------------------------------------------------------
    const userMemory = await loadUserMemory(supabase, user_id)

    // --------------------------------------------------------
    // STEP 2: Resolve or create session
    // --------------------------------------------------------
    const sessionResult = await (isNewSession
      ? supabase
          .from('dara_sessions')
          .insert({
            user_id,
            institution_id,
            programme_code: programme_code || userMemory?.programme_code,
            faculty: faculty || userMemory?.faculty,
            session_title: message.substring(0, 80),
          })
          .select('id')
          .single()
      : supabase
          .from('dara_sessions')
          .select('id')
          .eq('id', session_id)
          .single())

    const activeSessionId = isNewSession
      ? sessionResult.data?.id
      : session_id

    if (!activeSessionId) throw new Error('Could not resolve session')

    // --------------------------------------------------------
    // STEP 2: Fetch conversation history + relevant books in parallel
    // --------------------------------------------------------
    const [historyResult, relevantBooks] = await Promise.all([
      supabase
        .from('dara_messages')
        .select('role, content')
        .eq('session_id', activeSessionId)
        .in('role', ['user', 'assistant'])
        .order('created_at', { ascending: true })
        .limit(20),
      fetchRelevantBooks(
        supabase,
        message,
        programme_code || userMemory?.programme_code || undefined,
        faculty || userMemory?.faculty || undefined,
        userMemory?.books_recommended || []
      )
    ])

    // --------------------------------------------------------
    // STEP 3: Build context-rich system prompt with memory
    // --------------------------------------------------------
    const memoryContext = formatMemoryForPrompt(userMemory)
    const bookContext = formatBooksForPrompt(relevantBooks)

    const systemPrompt = buildSystemPrompt(
      bookContext,
      memoryContext,
      programme_code || userMemory?.programme_code || undefined,
      faculty || userMemory?.faculty || undefined,
      institution_id
    )

    // --------------------------------------------------------
    // STEP 4: Build Gemini conversation payload
    // --------------------------------------------------------
    const history = historyResult.data || []

    const geminiHistory = [
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    // --------------------------------------------------------
    // STEP 5: Call Gemini
    // --------------------------------------------------------
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            topP: 0.8,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        })
      }
    )

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      throw new Error(`Gemini API error: ${geminiResponse.status} — ${errText}`)
    }

    const geminiData = await geminiResponse.json()
    const assistantMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!assistantMessage) throw new Error('Gemini returned no content')

    const inputTokens = geminiData.usageMetadata?.promptTokenCount || 0
    const outputTokens = geminiData.usageMetadata?.candidatesTokenCount || 0

    // --------------------------------------------------------
    // STEP 6: Persist messages
    // --------------------------------------------------------
    const bookIds = relevantBooks.map(b => b.id)

    const [userMsgResult] = await Promise.all([
      supabase.from('dara_messages').insert({
        session_id: activeSessionId,
        user_id,
        role: 'user',
        content: message,
        input_tokens: inputTokens,
      }).select('id').single(),
      supabase.from('dara_messages').insert({
        session_id: activeSessionId,
        user_id,
        role: 'assistant',
        content: assistantMessage,
        output_tokens: outputTokens,
        books_referenced: bookIds,
      }),
    ])

    const messageId = userMsgResult.data?.id || ''

    // Log book interactions
    if (bookIds.length > 0) {
      await supabase.from('dara_book_interactions').insert(
        bookIds.map(bookId => ({
          session_id: activeSessionId,
          user_id,
          book_id: bookId,
          interaction: 'recommended',
          context_query: message.substring(0, 200),
        }))
      )
    }

    // --------------------------------------------------------
    // STEP 7: Fire-and-forget memory extraction
    // This runs AFTER the response is returned to the student
    // so it never delays their experience
    // --------------------------------------------------------
    const memoryExtractionPromise = (async () => {
      try {
        const [extracted] = await Promise.all([
          extractMemoryFromTurn(GEMINI_API_KEY, message, assistantMessage),
          updateMemoryStats(
            supabase,
            user_id,
            isNewSession,
            programme_code || undefined,
            faculty || undefined,
          )
        ])

        if (extracted.length > 0 && messageId) {
          await saveMemoryEntries(supabase, user_id, activeSessionId, messageId, extracted)
        }

        // Update books_recommended in memory profile
        if (bookIds.length > 0) {
          const { data: existing } = await supabase
            .from('dara_user_memory')
            .select('books_recommended')
            .eq('user_id', user_id)
            .single()

          const currentBooks = existing?.books_recommended || []
          const newBooks = [...new Set([...currentBooks, ...bookIds])]

          await supabase
            .from('dara_user_memory')
            .update({ books_recommended: newBooks })
            .eq('user_id', user_id)
        }
      } catch (err) {
        console.error('Background memory extraction failed:', err)
      }
    })()

    // Don't await — let it run in background
    memoryExtractionPromise.catch(console.error)

    // --------------------------------------------------------
    // STEP 8: Return response
    // --------------------------------------------------------
    return new Response(
      JSON.stringify({
        session_id: activeSessionId,
        message: assistantMessage,
        books_surfaced: relevantBooks.map(b => ({
          id: b.id,
          title: b.title,
          author_names: b.author_names,
          file_url: b.file_url,
          access_model: b.access_model,
        })),
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
        // Return memory state so frontend can display "DARA knows you" indicators
        memory_state: {
          is_returning_user: !!userMemory,
          programme_known: !!(programme_code || userMemory?.programme_code),
          sessions_count: (userMemory?.total_sessions || 0) + (isNewSession ? 1 : 0),
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('DARA Edge Function error:', error)
    return new Response(
      JSON.stringify({
        error: 'DARA encountered an error. Please try again.',
        detail: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

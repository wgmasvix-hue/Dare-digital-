import { supabase } from "./supabase";
import { openLibraryService }  from "../services/openLibraryService";
import { arxivService }         from "../services/arxivService";
import { gutenbergService }     from "../services/gutenbergService";
import { openAlexService }      from "../services/openAlexService";
import { dspaceService }        from "../services/dspaceService";
import { embedQuery, isVectorSearchAvailable } from "../services/jinaEmbeddingService";
import { Book } from "../types";

/* ════════════════════════════════════════════════════════════════
   RECIPROCAL RANK FUSION
   Merges multiple ranked result lists without needing score
   normalisation across heterogeneous sources.
   Score for item i = Σ  1 / (k + rank_in_list + 1)   (k = 60)
   ════════════════════════════════════════════════════════════════ */
function rrfMerge<T extends { id: string | number }>(lists: T[][], k = 60): T[] {
  const scores = new Map<string, number>();
  const itemMap = new Map<string, T>();

  for (const list of lists) {
    list.forEach((item, rank) => {
      const id = String(item.id);
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank + 1));
      if (!itemMap.has(id)) itemMap.set(id, item);
    });
  }

  return [...scores.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => itemMap.get(id)!);
}

/* ════════════════════════════════════════════════════════════════
   VECTOR SEARCH  (Jina embeddings + pgvector cosine similarity)
   ════════════════════════════════════════════════════════════════ */
export interface VectorSearchResult {
  id: string;
  title: string;
  author_names: string;
  description: string | null;
  cover_image_url: string | null;
  similarity: number;
  _source: 'vector';
}

export async function vectorSearch(
  query: string,
  limit = 12,
  threshold = 0.25,
): Promise<{ results: VectorSearchResult[]; available: boolean }> {
  if (!isVectorSearchAvailable()) return { results: [], available: false };

  try {
    const queryEmbedding = await embedQuery(query);

    const { data, error } = await supabase.rpc('match_books', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) throw error;

    return {
      results: (data ?? []).map((row: any) => ({
        id: String(row.id),
        title: row.title,
        author_names: row.author_names ?? '',
        description: row.description ?? null,
        cover_image_url: row.cover_image_url ?? null,
        similarity: Math.round(row.similarity * 1000) / 1000,
        _source: 'vector' as const,
      })),
      available: true,
    };
  } catch (err) {
    console.warn('[VectorSearch] Failed, falling back to keyword only:', err);
    return { results: [], available: false };
  }
}

/* ════════════════════════════════════════════════════════════════
   KEYWORD SEARCH  (existing Supabase ilike queries)
   ════════════════════════════════════════════════════════════════ */
async function keywordSearch(query: string) {
  const like = `%${query}%`;

  const [books, federated, oer, institutional, localResearch, dspaceDocs] = await Promise.all([
    supabase
      .from("books")
      .select("*")
      .or(`title.ilike.${like},description.ilike.${like},author_names.ilike.${like}`)
      .order("quality_score", { ascending: false })
      .limit(20),
    supabase
      .from("federated_books")
      .select("*")
      .ilike("title", like)
      .limit(10),
    supabase
      .from("oer_resources")
      .select("*")
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(10),
    supabase
      .from("institutional_content")
      .select("*")
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(10),
    supabase
      .from("local_research")
      .select("*")
      .eq("status", "approved")
      .or(`title.ilike.${like},abstract.ilike.${like},author_names.ilike.${like}`)
      .limit(10),
    supabase
      .from("documents")
      .select("*")
      .not("synced_from_dspace_at", "is", null)
      .or(`title.ilike.${like},description.ilike.${like},creator.ilike.${like}`)
      .limit(20),
  ]);

  return { books, federated, oer, institutional, localResearch, dspaceDocs };
}

/* ════════════════════════════════════════════════════════════════
   UNIFIED SEARCH  (vector + keyword + external APIs)
   ════════════════════════════════════════════════════════════════ */
export async function unifiedSearch(query: string) {
  // Fire vector search and keyword search in parallel
  const [vectorRes, kwRes, olResults, axResults, gResults, openAlexResults, dspaceExtResults] =
    await Promise.all([
      vectorSearch(query),
      keywordSearch(query),
      openLibraryService.searchBooks(query).catch(e => { console.error('OL:', e);        return { books: [] }; }),
      arxivService.searchResearch(query).catch(e =>    { console.error('Arxiv:', e);     return { books: [] }; }),
      gutenbergService.searchBooks(query).catch(e =>   { console.error('Gutenberg:', e); return { books: [] }; }),
      openAlexService.searchResearch(query).catch(e => { console.error('OpenAlex:', e);  return { books: [] }; }),
      dspaceService.searchRepository('https://sandbox.dspace.org', query)
        .catch(e => { console.error('DSpace:', e); return { books: [] }; }),
    ]);

  const { books, federated, oer, institutional, localResearch, dspaceDocs } = kwRes;

  // Merge keyword books + vector books using RRF so semantically similar
  // results rise to the top even when keywords don't match exactly.
  const keywordBooks = (books.data ?? []).map(b => ({ ...b, id: String(b.id) }));
  const mergedBooks = vectorRes.available && vectorRes.results.length > 0
    ? rrfMerge([vectorRes.results, keywordBooks])
    : keywordBooks;

  console.log(`[Search] "${query}" →`, {
    vector:      vectorRes.results.length,
    books:       keywordBooks.length,
    merged:      mergedBooks.length,
    federated:   federated.data?.length ?? 0,
    oer:         oer.data?.length ?? 0,
    institutional: institutional.data?.length ?? 0,
    localResearch: localResearch.data?.length ?? 0,
    dspaceDocs:  dspaceDocs.data?.length ?? 0,
  });

  return {
    books: mergedBooks,
    federated: federated.data ?? [],
    oer: oer.data ?? [],
    institutional: institutional.data ?? [],
    research: [
      ...(localResearch.data ?? []),
      ...(dspaceDocs.data ?? []).map(doc => ({
        id: doc.id,
        title: doc.title,
        author_names: doc.creator,
        abstract: doc.description,
        institution: doc.institution,
        is_dspace: true,
        url: doc.url,
      })),
      ...(dspaceExtResults as { books: Book[] }).books,
    ],
    external: [
      ...(olResults as { books: Book[] }).books,
      ...(axResults as { books: Book[] }).books,
      ...(gResults as { books: Book[] }).books,
      ...(openAlexResults as { books: Book[] }).books,
    ],
    // expose vector metadata for UI
    _vector: {
      available: vectorRes.available,
      count: vectorRes.results.length,
      topMatches: vectorRes.results.slice(0, 3),
    },
  };
}

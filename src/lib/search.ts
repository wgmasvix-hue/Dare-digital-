import { supabase } from "./supabase";
import { openLibraryService } from "../services/openLibraryService";
import { arxivService } from "../services/arxivService";
import { gutenbergService } from "../services/gutenbergService";
import { Book } from "../types";

export async function unifiedSearch(query: string) {
  const like = `%${query}%`;

  // Query multiple sources and rank by quality_score where available
  const [books, federated, oer, institutional, localResearch, dspaceDocs, olResults, axResults, gResults] = await Promise.all([
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
    openLibraryService.searchBooks(query).catch((e) => { console.error('OL Error:', e); return { books: [] }; }),
    arxivService.searchResearch(query).catch((e) => { console.error('Arxiv Error:', e); return { books: [] }; }),
    gutenbergService.searchBooks(query).catch((e) => { console.error('Gutenberg Error:', e); return { books: [] }; })
  ]);

  console.log(`Unified search for "${query}":`, {
    books: books.data?.length || 0,
    federated: federated.data?.length || 0,
    oer: oer.data?.length || 0,
    institutional: institutional.data?.length || 0,
    localResearch: localResearch.data?.length || 0,
    dspaceDocs: dspaceDocs.data?.length || 0,
    ol: (olResults as { books: Book[] }).books?.length || 0,
    ax: (axResults as { books: Book[] }).books?.length || 0,
    g: (gResults as { books: Book[] }).books?.length || 0
  });

  return {
    books: books.data || [],
    federated: federated.data || [],
    oer: oer.data || [],
    institutional: institutional.data || [],
    research: [
      ...(localResearch.data || []),
      ...(dspaceDocs.data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        author_names: doc.creator,
        abstract: doc.description,
        institution: doc.institution,
        is_dspace: true,
        url: doc.url
      }))
    ],
    external: [
      ...(olResults as { books: Book[] }).books,
      ...(axResults as { books: Book[] }).books,
      ...(gResults as { books: Book[] }).books
    ]
  };
}

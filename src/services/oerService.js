import { supabase } from '../lib/supabase';

const ADMIN_TOKEN = import.meta.env.VITE_DARE_ADMIN_TOKEN;

export const oerService = {
  async uploadFile(file, bucket = 'resources') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getUserProjects(userId) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('creator_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async insertOER(content) {
    // Direct insert into Supabase 'books' table
    // Mapping fields from OER content to DB schema
    const bookData = {
      title: content.title,
      author_names: content.author_names || (Array.isArray(content.authors) ? content.authors.join(', ') : 'Unknown Author'),
      description: content.content_summary || content.description || '',
      file_url: content.file_url || content.original_url,
      cover_image_url: content.cover_image_url || content.cover_path,
      subject: content.subject_code || content.subject || 'General',
      publisher_name: content.publisher_name || 'Partner Resources',
      publication_year: content.publication_year || content.year_published || new Date().getFullYear(),
      page_count: content.page_count || 0,
      license_type: content.license_type || 'Unknown',
      ai_level: content.ai_level || null, // Map AI Level if present
      status: 'published',
      access_model: 'dare_access',
      format: content.format || 'pdf',
      is_peer_reviewed: content.is_peer_reviewed || false,
      is_zimbabwean: content.is_zimbabwean || false,
      is_african: content.is_african || false,
      language: 'English',
      // If we have a creator_id, use it, otherwise it might be null or handled by DB default if not required
      // But usually we need a creator_id. We might need to pass the current user's ID.
      // However, insertOER is called from pages where we have 'user'.
      // But here we don't have 'user'.
      // We should probably pass 'creator_id' in 'content' or handle it.
      // Let's check if 'content' has it.
      creator_id: content.creator_id || (await supabase.auth.getUser()).data.user?.id
    };

    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw new Error(error.message);
    }

    // Trigger embedding generation in the background
    if (data && data.id) {
      this.triggerEmbeddings(data.id, `${data.title} ${data.description || ''} ${data.author_names || ''}`);
      this.triggerAnalysis(data);
    }

    return data;
  },

  async triggerEmbeddings(bookId, text) {
    try {
      // We don't await this to avoid blocking the UI
      supabase.functions.invoke('generate-embeddings', {
        body: { book_id: bookId, text }
      }).then(({ error }) => {
        if (error) console.error('Embedding generation trigger failed:', error);
        else console.log('Embedding generation triggered for book:', bookId);
      });
    } catch (e) {
      console.error('Failed to trigger embedding generation:', e);
    }
  },

  async triggerAnalysis(book) {
    try {
      // We don't await this to avoid blocking the UI
      supabase.functions.invoke('analyze-book', {
        body: { book }
      }).then(({ error }) => {
        if (error) console.error('Book analysis trigger failed:', error);
        else console.log('Book analysis triggered for book:', book.id);
      });
    } catch (e) {
      console.error('Failed to trigger book analysis:', e);
    }
  },

  async getGapAnalysis(subject) {
    const { data, error } = await supabase.functions.invoke('gap-analysis', {
      method: 'GET',
      queryParams: { subject },
      headers: {
        'x-dare-token': ADMIN_TOKEN
      }
    });

    if (error) throw error;
    return data;
  }
};

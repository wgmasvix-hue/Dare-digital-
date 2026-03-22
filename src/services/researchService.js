import { supabase } from '../lib/supabase';

export const researchService = {
  /**
   * Fetch all approved local research
   */
  async getResearch(filters = {}) {
    let query = supabase
      .from('local_research')
      .select('*')
      .eq('status', 'approved')
      .order('publication_date', { ascending: false });

    if (filters.subject && filters.subject !== 'All') {
      query = query.eq('subject', filters.subject);
    }

    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,abstract.ilike.%${filters.q}%,author_names.ilike.%${filters.q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Submit a new research paper
   */
  async submitResearch(researchData) {
    const { data, error } = await supabase
      .from('local_research')
      .insert([
        {
          ...researchData,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get research by ID
   */
  async getResearchById(id) {
    const { data, error } = await supabase
      .from('local_research')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Request digitization of a physical resource
   */
  async requestDigitization(requestData) {
    const { data, error } = await supabase
      .from('digitization_requests')
      .insert([
        {
          ...requestData,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get digitization requests for a user
   */
  async getDigitizationRequests(userId) {
    const { data, error } = await supabase
      .from('digitization_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch archival reports and assignments
   */
  async getArchivalReports(filters = {}) {
    let query = supabase
      .from('archival_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

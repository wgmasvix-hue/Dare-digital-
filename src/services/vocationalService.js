import { supabase } from '../lib/supabase';

export const vocationalService = {
  /**
   * Fetch all vocational resources/schools
   */
  async getVocationalResources() {
    const { data, error } = await supabase
      .from('vocational')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching vocational resources:', error);
      throw error;
    }
    return data;
  }
};

import { supabase } from '../lib/supabase';
import { geminiService } from './geminiService';

export const daraService = {
  async sendMessage({ message, sessionId, userId, institutionId, programmeCode, faculty, history = [] }) {
    try {
      // Try to use the Edge Function first, but fallback to geminiService if it fails
      // This ensures DARA is functional even if Supabase functions have issues
      try {
        const { data, error } = await supabase.functions.invoke('dara-chat', {
          body: {
            message,
            session_id: sessionId,
            user_id: userId,
            institution_id: institutionId,
            programme_code: programmeCode,
            faculty
          }
        });

        if (!error && data) return data;
        console.warn('DARA Edge Function failed, falling back to Gemini Service');
      } catch (e) {
        console.warn('DARA Edge Function error, falling back to Gemini Service:', e);
      }

      // Fallback to direct Gemini API call
      const responseText = await geminiService.chat(message, history);
      
      return {
        message: responseText,
        session_id: sessionId || 'local-' + Date.now(),
        memory_state: null
      };
    } catch (error) {
      console.error('DARA Service Error:', error);
      throw error;
    }
  }
};

import { supabase } from "../lib/supabase"

export async function askAI(message) {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { message }
  });

  if (error) throw error;
  return data.choices[0].message.content
}

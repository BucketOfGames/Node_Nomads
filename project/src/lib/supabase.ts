import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const signInAnonymously = async (handle: string, faction: 'red' | 'blue') => {
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  
  if (authError) throw authError;

  // Create player profile
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      id: authData.user.id,
      handle,
      faction,
      charge: 100, // Starting charge
    })
    .select()
    .single();

  if (playerError) throw playerError;

  return { user: authData.user, player };
};

export const getCurrentPlayer = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return player;
};
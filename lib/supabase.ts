import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
        console.warn("Missing Supabase environment variables.");
    }
}

export const supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseKey || 'mock-key');

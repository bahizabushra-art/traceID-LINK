import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Supabase Project Endpoint inferred from Supabase PostgreSQL host
const DEFAULT_SUPABASE_URL = 'https://gyqbclwyduyqpduxiesb.supabase.co';

export const SUPABASE_URL = 
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY = 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
};

// Create the Supabase client safely
let client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!client && SUPABASE_URL) {
    try {
      // If anon key is provided, initialize full client
      const anonKey = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';
      client = createClient(SUPABASE_URL, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return client;
};

export const supabase = getSupabaseClient();

export interface MerchantUser {
  id: string;
  email: string;
  role?: string;
  merchantName?: string;
  organization?: string;
  lastSignInAt?: string;
}

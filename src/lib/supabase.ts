import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if env vars exist and have actual values (not placeholders)
  const isConfigured = !!(
    url &&
    key &&
    url.length > 10 &&
    key.length > 10 &&
    url.includes('supabase.co')
  );

  // Debug log (will show in browser console)
  if (typeof window !== 'undefined') {
    console.log('Supabase configured:', isConfigured, 'URL exists:', !!url, 'Key exists:', !!key);
  }

  return isConfigured;
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

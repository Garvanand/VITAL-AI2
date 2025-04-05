import { createBrowserClient } from '@supabase/ssr';

// Create a single instance of the client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // If client already exists, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  // Otherwise create and store a new client instance
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabaseClient;
}

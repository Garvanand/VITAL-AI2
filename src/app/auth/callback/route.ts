import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (!code) {
      console.error('No code parameter found in callback URL');
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error.message}`);
    }

    // Successful authentication
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`);
  }
}

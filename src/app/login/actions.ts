'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}

export async function login(data: FormData) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return { error: true, message: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { error: true, message: 'An unexpected error occurred' };
  }
}

export async function signInWithGithub() {
  const supabase = await createClient();

  try {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (data.url) {
      redirect(data.url);
    }

    return { error: true, message: 'No redirect URL returned' };
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    return { error: true, message: 'Failed to sign in with GitHub' };
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();

  try {
    // First, try to sign in anonymously
    const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

    if (signInError) {
      console.error('Anonymous login error:', signInError.message);
      return { error: true, message: signInError.message };
    }

    if (!signInData.user) {
      console.error('No user data returned from anonymous sign-in');
      return { error: true, message: 'Failed to create anonymous account' };
    }

    // Generate a unique email for the anonymous user
    const anonymousEmail = `anonymous_${Date.now()}@${process.env.NEXT_PUBLIC_SITE_URL?.replace(/[^a-zA-Z0-9]/g, '')}.com`;

    // Update the user's email
    const { error: updateError } = await supabase.auth.updateUser({
      email: anonymousEmail,
    });

    if (updateError) {
      console.error('Update user error:', updateError.message);
      // Continue even if email update fails
    }

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Unexpected error during anonymous login:', error);
    return { error: true, message: 'An unexpected error occurred during anonymous login' };
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
      return { error: true, message: error.message };
    }

    if (!data.url) {
      console.error('No redirect URL returned from Google OAuth');
      return { error: true, message: 'Failed to initialize Google sign-in' };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('Unexpected error during Google sign-in:', error);
    return { error: true, message: 'An unexpected error occurred during Google sign-in' };
  }
}

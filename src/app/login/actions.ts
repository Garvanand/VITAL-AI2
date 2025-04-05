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
    const { error: signInError } = await supabase.auth.signInAnonymously();

    if (signInError) {
      console.error('Anonymous login error:', signInError.message);
      return { error: true, message: signInError.message };
    }

    const { error: updateUserError } = await supabase.auth.updateUser({
      email: `aeroedit+${Date.now().toString(36)}@paddle.com`,
    });

    if (updateUserError) {
      console.error('Update user error:', updateUserError.message);
      return { error: true, message: updateUserError.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Unexpected error during anonymous login:', error);
    return { error: true, message: 'An unexpected error occurred' };
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  try {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (data.url) {
      return { success: true, url: data.url };
    }

    return { error: true, message: 'No redirect URL returned' };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { error: true, message: 'Failed to sign in with Google' };
  }
}

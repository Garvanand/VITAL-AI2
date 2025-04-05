'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();

  try {
    // Sign up the user without email verification
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // Disable email confirmation flow
        emailRedirectTo: undefined,
        data: {
          full_name: data.name || '',
        },
      },
    });

    if (signUpError) {
      console.error('Signup error:', signUpError.message);
      return { error: true, message: signUpError.message };
    }

    // Since we've disabled email verification, we can auto-confirm the user if needed
    if (authData?.user) {
      // Check if profiles table exists and create a profile for the user
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authData.user.id,
          full_name: data.name || '',
          email: data.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        console.error('Profile creation error:', profileError.message);
        // Continue even if profile creation fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return { error: true, message: 'An unexpected error occurred' };
  }
}

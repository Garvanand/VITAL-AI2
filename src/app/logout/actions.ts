'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function logout() {
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();

    // Clear session
    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Error during logout:', error);
    return { error: true, message: 'Failed to log out' };
  }
}

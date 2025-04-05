'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  logout: () => Promise<void>;
}

interface UserProfile {
  full_name?: string;
  email?: string;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  userProfile: null,
  logout: async () => {},
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        // Try to get user profile from profiles table
        const { data, error } = await supabase.from('profiles').select('full_name, email').eq('id', user.id);

        // Check if we have valid data with at least one row
        if (error || !data || data.length === 0) {
          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            console.info('No profile found, using auth metadata instead');
          }

          // Don't try to create a profile automatically - RLS restrictions prevent this in the client
          // Instead, just fall back to user metadata from auth

          // Fallback to user metadata
          setUserProfile({
            full_name: user.user_metadata?.full_name || '',
            email: user.email,
          });
        } else {
          // Use the first profile found
          setUserProfile(data[0]);
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        setUserProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email,
        });
      }
    }

    fetchUserProfile();
  }, [user, supabase]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial user fetch
    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase]);

  // Client-side logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return <UserContext.Provider value={{ user, loading, userProfile, logout }}>{children}</UserContext.Provider>;
}

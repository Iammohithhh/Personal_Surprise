'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAuthLoading } = useStore();

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            avatar: session.user.user_metadata?.avatar_url,
            createdAt: new Date(session.user.created_at),
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            avatar: session.user.user_metadata?.avatar_url,
            createdAt: new Date(session.user.created_at),
          });
        } else {
          setUser(null);
        }
        setIsAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsAuthLoading]);

  return <>{children}</>;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);
      setLoading(false);

      if (user && user.email_confirmed_at) {
        // Check and update profile status if it's 'unverified'
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        if (profile && profile.status === 'unverified') {
          await supabase.from('profiles').update({ status: 'verified' }).eq('id', user.id);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Also check on auth state change
      getSession();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
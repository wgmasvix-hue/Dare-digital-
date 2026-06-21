import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar_url?: string;
  provider?: string;
}

export interface Profile {
  first_name: string;
  role: string;
  avatar_url?: string;
}

// Client-side rate limiter: max 5 attempts per 60 seconds
const loginAttempts: number[] = [];
const checkRateLimit = () => {
  const now = Date.now();
  const recent = loginAttempts.filter(t => now - t < 60_000);
  if (recent.length >= 5) throw new Error('Too many login attempts. Please wait 60 seconds.');
  loginAttempts.push(now);
};

const sanitize = (s: string) => s.trim().replace(/[<>"']/g, '');

const LOCAL_KEY = 'dare_auth_user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Build a profile from a user object
  const buildProfile = (u: User): Profile => ({
    first_name: u.name || u.email?.split('@')[0] || 'User',
    role: u.role || 'student',
    avatar_url: u.avatar_url,
  });

  const applyUser = useCallback((u: User | null) => {
    setUser(u);
    setProfile(u ? buildProfile(u) : null);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Local-only fallback
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) {
          const u = JSON.parse(saved) as User;
          applyUser(u);
        }
      } catch { /* ignore */ }
      setLoading(false);
      return;
    }

    // Supabase: restore session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const su = session.user;
        const u: User = {
          id: su.id,
          email: su.email ?? '',
          name: su.user_metadata?.full_name || su.user_metadata?.name || su.email?.split('@')[0],
          role: su.user_metadata?.role || 'student',
          avatar_url: su.user_metadata?.avatar_url,
          provider: su.app_metadata?.provider,
        };
        applyUser(u);
      }
      setLoading(false);
    });

    // Listen for auth state changes (Google redirect callback etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const su = session.user;
        const u: User = {
          id: su.id,
          email: su.email ?? '',
          name: su.user_metadata?.full_name || su.user_metadata?.name || su.email?.split('@')[0],
          role: su.user_metadata?.role || 'student',
          avatar_url: su.user_metadata?.avatar_url,
          provider: su.app_metadata?.provider,
        };
        applyUser(u);
      } else {
        applyUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [applyUser]);

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Google sign-in requires the DARE server to be configured. Use email/password instead.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) throw error;
  };

  // ── Email / Password ────────────────────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    checkRateLimit();
    const cleanEmail = sanitize(email).toLowerCase();

    if (!isSupabaseConfigured()) {
      // Local auth: accept any credentials, store session
      const u: User = {
        id: `local-${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'student',
        provider: 'email',
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
      applyUser(u);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) return { error: error.message };
    if (data.user) {
      const u: User = {
        id: data.user.id,
        email: data.user.email ?? '',
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        role: data.user.user_metadata?.role || 'student',
        provider: 'email',
      };
      applyUser(u);
    }
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, role = 'student') => {
    const cleanEmail = sanitize(email).toLowerCase();
    const cleanName = sanitize(fullName);

    if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

    if (!isSupabaseConfigured()) {
      const u: User = { id: `local-${Date.now()}`, email: cleanEmail, name: cleanName, role, provider: 'email' };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
      applyUser(u);
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_KEY);
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    applyUser(null);
  };

  // Legacy compat shim used in a few places
  const signIn = (email: string) => signInWithEmail(email, '');

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
    isSupabaseAvailable: isSupabaseConfigured(),
  };
};

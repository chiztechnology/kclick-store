import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { authService, type Profile } from '../lib/api';
import * as roleUtils from '../lib/roleUtils';

interface User {
  id: string;
  email: string;
  phone?: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isStoreManager: boolean;
  isCustomer: boolean;
  canAccessStore: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await authService.getSession();
        if (error || !data) {
          setLoading(false);
          return;
        }

        if (data.session && data.user) {
          setSession({
            access_token: data.session.access_token,
            user: data.user
          });
          setUser(data.user);
          await loadProfile(data.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await authService.getProfile(userId);
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await authService.signUp(email, password, fullName);
      if (error) return { error };

      if (data?.user) {
        setUser(data.user);
        if (data.session) {
          setSession({
            access_token: data.session.access_token,
            user: data.user
          });
        }
        await loadProfile(data.user.id);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) return { error };

      if (data?.user) {
        setUser(data.user);
        if (data.session) {
          setSession({
            access_token: data.session.access_token,
            user: data.user
          });
        }
        await loadProfile(data.user.id);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const { error } = await authService.signInWithPhone(phone);
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    try {
      const { data, error } = await authService.verifyOTP(phone, token);
      if (error) return { error };

      if (data?.user) {
        setUser(data.user);
        if (data.session) {
          setSession({
            access_token: data.session.access_token,
            user: data.user
          });
        }
        await loadProfile(data.user.id);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await authService.signInWithOAuth('google');
      if (error) return { error };
      if (data?.url) {
        window.location.href = data.url;
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await authService.signInWithOAuth('apple');
      if (error) return { error };
      if (data?.url) {
        window.location.href = data.url;
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await authService.updateProfile(updates);
      if (error) return { error };

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const isStoreManager = useMemo(() => roleUtils.isStoreManager(profile), [profile]);
  const isCustomer = useMemo(() => roleUtils.isCustomer(profile), [profile]);
  const canAccessStore = useMemo(() => roleUtils.canAccessStore(profile), [profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isStoreManager,
        isCustomer,
        canAccessStore,
        signUp,
        signIn,
        signInWithPhone,
        verifyOTP,
        signInWithGoogle,
        signInWithApple,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

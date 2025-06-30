import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && isLoading) {
            console.log('Auth initialization timeout, continuing...');
            setIsLoading(false);
          }
        }, 5000); // 5 seconds timeout

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          // Check if it's a connection error
          if (sessionError.message?.includes('Failed to fetch') ||
            sessionError.message?.includes('network') ||
            sessionError.message?.includes('ENOTFOUND')) {
            setError('Unable to connect to authentication service. Please check your internet connection and try again.');
          } else {
            setError(sessionError.message);
          }
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id, session.user);
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          // Check if it's a connection error
          if (error.message?.includes('Failed to fetch') ||
            error.message?.includes('network') ||
            error.message?.includes('ENOTFOUND')) {
            setError('Unable to connect to authentication service. Please check your Supabase configuration.');
          } else {
            setError(error.message || 'Authentication initialization failed');
          }
          setIsLoading(false);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);

        try {
          if (session?.user) {
            // For sign up events, we need to handle profile creation
            if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
              await fetchUserProfile(session.user.id, session.user, event === 'SIGNED_UP');
            } else {
              await fetchUserProfile(session.user.id, session.user);
            }
          } else {
            setUser(null);
            setIsLoading(false);
          }
        } catch (error: any) {
          console.error('Auth state change error:', error);
          // Don't leave user in loading state
          if (mounted) {
            if (error.message?.includes('Failed to fetch') || 
                error.message?.includes('network') ||
                error.message?.includes('ENOTFOUND')) {
              setError('Connection lost. Please check your internet connection.');
            } else {
              setError(error.message || 'Authentication error occurred');
            }
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);
  const fetchUserProfile = async (userId: string, authUser?: any, isNewUser = false) => {
    try {
      setIsLoading(true);

      // If this is a new user from sign up, create profile immediately
      if (isNewUser && authUser) {
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
        };

        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Use fallback user data even if database insert fails
            setUser({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
              avatar_url: authUser.user_metadata?.avatar_url || null,
              subscription_tier: 'free',
              created_at: new Date(),
            });
          } else {
            setUser({
              ...createdProfile,
              created_at: new Date(createdProfile.created_at),
              last_active: createdProfile.last_active ? new Date(createdProfile.last_active) : undefined,
            });
          }
          setIsLoading(false);
          return;
        } catch (createError: any) {
          console.error('Error creating profile:', createError);
          // If database is unavailable, still create user in memory
          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
            created_at: new Date(),
          });
          setIsLoading(false);
          return;
        }
      }

      // Try to get existing profile with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000);
      });

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // If there's a database error, create a fallback user
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
            created_at: new Date(),
          });
        }
        setIsLoading(false);
        return;
      }
      
      // If no profile exists, create one
      if (!data && authUser) {
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
        };

        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Fallback to auth user data
            setUser({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
              avatar_url: authUser.user_metadata?.avatar_url || null,
              subscription_tier: 'free',
              created_at: new Date(),
            });
          } else {
            setUser({
              ...createdProfile,
              created_at: new Date(createdProfile.created_at),
              last_active: createdProfile.last_active ? new Date(createdProfile.last_active) : undefined,
            });
          }
        } catch (createError) {
          console.error('Error creating profile:', createError);
          // Fallback to auth user data
          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
            created_at: new Date(),
          });
        }
      } else if (data) {
        setUser({
          ...data,
          created_at: new Date(data.created_at),
          last_active: data.last_active ? new Date(data.last_active) : undefined,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create fallback user to prevent infinite loading
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          subscription_tier: 'free',
          created_at: new Date(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      // Don't set loading to false here - let the auth state change handle it
      console.log('Sign up successful, waiting for auth state change...');
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Don't set loading to false here - let the auth state change handle it
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      email: 'guest@example.com',
      full_name: 'Guest User',
      subscription_tier: 'free',
      created_at: new Date(),
    };
    setUser(guestUser);
    setIsLoading(false);
    setError(null);
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      signUp,
      signIn,
      signInWithGoogle,
      continueAsGuest,
      signOut,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, ApiResponse, authApi, AUTH_TOKEN_KEY, clearAuthToken, setAuthToken, UNAUTHORIZED_EVENT } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const toErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMe = useCallback(async (): Promise<AuthUser> => {
    const response = await authApi.getMe();

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load current user');
    }

    return response.data;
  }, []);

  const loadUserFromToken = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      if (isMountedRef.current) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const me = await fetchMe();
      if (isMountedRef.current) {
        setUser(me);
      }
    } catch (err) {
      clearAuthToken();
      if (isMountedRef.current) {
        setUser(null);
        setError(toErrorMessage(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchMe]);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.login(email, password);

        if (!response.success || !response.data?.token) {
          throw new Error(response.message || 'Login failed');
        }

        setAuthToken(response.data.token);
        const me = await fetchMe();
        setUser(me);

        router.push('/dashboard');
      } catch (err) {
        const message = toErrorMessage(err);
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchMe, router]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.register(email, password);

        if (!response.success || !response.data?.token) {
          throw new Error(response.message || 'Registration failed');
        }

        setAuthToken(response.data.token);
        const me = await fetchMe();
        setUser(me);

        router.push('/dashboard');
      } catch (err) {
        const message = toErrorMessage(err);
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchMe, router]
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setError(null);
    setLoading(false);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearAuthToken();
      setUser(null);
      setError('Your session has expired. Please log in again.');
      router.push('/login');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      }
    };
  }, [router]);

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
  };
};

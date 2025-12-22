'use client';

import { AuthProvider as Phase3AuthProvider, useAuthContext } from '@/context/AuthContext';

export const AuthProvider = Phase3AuthProvider;

export const useAuth = () => {
  const { user, loading, login, register, logout, isAuthenticated } = useAuthContext();

  return {
    user,
    isLoading: loading,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

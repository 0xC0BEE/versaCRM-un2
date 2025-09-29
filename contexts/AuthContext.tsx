
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../types';
// FIX: The api service is now correctly implemented, and this import resolves the module-not-found error.
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string) => Promise<User | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('versacrm_user');
      // Also check for the string 'undefined' which can be stored erroneously
      if (savedUser && savedUser !== 'undefined') {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage, clearing...", error);
      // If parsing fails, the data is corrupt. Clear it.
      localStorage.removeItem('versacrm_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string): Promise<User | null> => {
    setLoading(true);
    const user = await api.login(email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('versacrm_user', JSON.stringify(user));
    }
    setLoading(false);
    return user;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('versacrm_user');
    localStorage.removeItem('versacrm_selected_industry');
  }, []);

  const contextValue = useMemo(() => ({
    currentUser,
    loading,
    login,
    logout,
  }), [currentUser, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

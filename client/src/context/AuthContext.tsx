import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Employee | null;
  token: string | null;
  loading: boolean;
  login: (emailOrId: string, pass: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  quickLoginDemo: (role: 'admin' | 'employee', specificEmpId?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dayflow_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('Session check failed or expired:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (emailOrId: string, pass: string) => {
    const res = await api.auth.login({ emailOrId, password: pass });
    if (res.success) {
      localStorage.setItem('dayflow_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (userData: any) => {
    const res = await api.auth.register(userData);
    if (res.success) {
      localStorage.setItem('dayflow_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('dayflow_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginDemo = async (role: Role, specificEmpId?: string) => {
    if (role === 'admin') {
      await login('sarah.admin@dayflow.com', 'admin123');
    } else if (specificEmpId === 'EMP-003') {
      await login('elena.rostova@dayflow.com', 'emp123');
    } else {
      await login('alex.rivera@dayflow.com', 'emp123');
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickLoginDemo, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

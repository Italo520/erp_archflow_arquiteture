import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('archflow_token');
    const storedUser = localStorage.getItem('archflow_user');

    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('archflow_user');
      }
    } else {
      localStorage.removeItem('archflow_token');
      localStorage.removeItem('archflow_user');
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response: any = await authApi.login(credentials);
    const validToken = response.accessToken || response.token;
    if (!validToken) {
      throw new Error('Token de autenticação não retornado pelo servidor.');
    }
    const userObj = response.user || {};
    const loggedUser: User = {
      id: userObj.id || response.id || '1',
      name: userObj.fullName || userObj.name || response.name || credentials.email,
      email: userObj.email || response.email || credentials.email,
      role: userObj.role || response.role || 'OWNER',
    };
    setToken(validToken);
    setUser(loggedUser);
    localStorage.setItem('archflow_token', validToken);
    localStorage.setItem('archflow_user', JSON.stringify(loggedUser));
  };

  const register = async (data: RegisterRequest) => {
    const response: any = await authApi.register(data);
    const validToken = response.accessToken || response.token;
    if (!validToken) {
      throw new Error('Token de autenticação não retornado pelo servidor.');
    }
    const userObj = response.user || {};
    const loggedUser: User = {
      id: userObj.id || response.id || '1',
      name: userObj.fullName || userObj.name || response.name || data.name,
      email: userObj.email || response.email || data.email,
      role: userObj.role || response.role || 'OWNER',
    };
    setToken(validToken);
    setUser(loggedUser);
    localStorage.setItem('archflow_token', validToken);
    localStorage.setItem('archflow_user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('archflow_token');
    localStorage.removeItem('archflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  api: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

describe('AuthContext - Gestão de Estado e Ciclo de Sessão', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('Transição de Estado: deve iniciar não autenticado quando não há token no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('ECP Válido: deve autenticar com sucesso, armazenar token e definir usuário no contexto', async () => {
    const mockAuthResponse = {
      accessToken: 'mock-valid-jwt-token',
      tokenType: 'Bearer',
      user: {
        id: 'usr-001',
        fullName: 'Arquiteto Sênior',
        email: 'arquiteto@archflow.com',
        role: 'ROLE_ARCHITECT',
      },
    };

    (authApi.login as any).mockResolvedValueOnce(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'arquiteto@archflow.com', password: 'senhaForte123' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-valid-jwt-token');
    expect(result.current.user?.email).toBe('arquiteto@archflow.com');
    expect(localStorage.getItem('archflow_token')).toBe('mock-valid-jwt-token');
  });

  it('Transição de Estado: logout deve remover token do storage e zerar autenticação', async () => {
    localStorage.setItem('archflow_token', 'initial-token');
    localStorage.setItem(
      'archflow_user',
      JSON.stringify({ id: 'usr-1', email: 'test@archflow.com', name: 'User', role: 'ROLE_ADMIN' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('archflow_token')).toBeNull();
  });
});

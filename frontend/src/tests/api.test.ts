import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../services/api';

describe('API Service Interceptors and Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve ter baseURL configurada como /api/v1', () => {
    expect(api.defaults.baseURL).toBe('/api/v1');
  });

  it('deve injetar o token Bearer no header Authorization quando presente no localStorage', async () => {
    localStorage.setItem('archflow_token', 'mocked-jwt-token-123');

    // Executa o interceptor de request diretamente
    const config = { headers: {} as any };
    // @ts-ignore
    const modifiedConfig = await api.interceptors.request.handlers[0].fulfilled(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer mocked-jwt-token-123');
  });

  it('não deve injetar Authorization quando não houver token no localStorage', async () => {
    const config = { headers: {} as any };
    // @ts-ignore
    const modifiedConfig = await api.interceptors.request.handlers[0].fulfilled(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });
});

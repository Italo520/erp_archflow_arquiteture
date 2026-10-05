import { describe, it, expect } from 'vitest';
import { User, LoginRequest, AuthResponse } from '../types/auth';

describe('Tipos e Contratos de Autenticação do ArchFlow', () => {
  it('deve instanciar estrutura de dados de usuário válida', () => {
    const user: User = {
      id: 'usr-1',
      name: 'Arquiteto Sênior',
      email: 'arquiteto@archflow.com',
      role: 'ROLE_ARCHITECT',
    };

    expect(user.id).toBe('usr-1');
    expect(user.name).toBe('Arquiteto Sênior');
    expect(user.role).toBe('ROLE_ARCHITECT');
  });

  it('deve validar contrato de resposta AuthResponse com token JWT', () => {
    const authRes: AuthResponse = {
      token: 'jwt.token.here',
      type: 'Bearer',
      id: 'usr-admin',
      name: 'Admin',
      email: 'admin@archflow.com',
      role: 'ROLE_ADMIN',
    };

    expect(authRes.type).toBe('Bearer');
    expect(authRes.token).toContain('jwt');
  });
});

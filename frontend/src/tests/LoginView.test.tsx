import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginView } from '../views/LoginView';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('LoginView - Experiência do Usuário e Tratamento de Erros', () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      isAuthenticated: false,
    });
  });

  it('deve renderizar campos de e-mail e senha por padrão no modo login', () => {
    render(<LoginView />);

    expect(screen.getByText('ArchFlow ERP')).toBeDefined();
    expect(screen.getByText('Acesso ao Sistema')).toBeDefined();
    expect(screen.getByText('Criar Conta')).toBeDefined();
    expect(screen.getByRole('button', { name: /Entrar no ArchFlow/i })).toBeDefined();
  });

  it('Transição de Estados: deve alternar entre modo Login e modo Cadastro', () => {
    render(<LoginView />);

    const criarContaTab = screen.getByText('Criar Conta');
    fireEvent.click(criarContaTab);

    expect(screen.getByPlaceholderText('Arquiteto Responsável')).toBeDefined();
    expect(screen.getByRole('button', { name: /Cadastrar Escritório/i })).toBeDefined();
  });

  it('Error Guessing: deve exibir banner de erro amigável quando o login falha', async () => {
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'E-mail ou senha inválidos.',
        },
      },
    });

    render(<LoginView />);

    const submitBtn = screen.getByRole('button', { name: /Entrar no ArchFlow/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos.')).toBeDefined();
    });
  });

  it('ECP Válido: deve navegar para o dashboard quando login for bem-sucedido', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginView />);

    const submitBtn = screen.getByRole('button', { name: /Entrar no ArchFlow/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
    });
  });
});

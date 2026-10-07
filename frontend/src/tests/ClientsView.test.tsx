import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientsView } from '../views/ClientsView';
import { clientApi } from '../services/api';
import { Client } from '../types/client';

vi.mock('../services/api', () => ({
  clientApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ClientsView - Experiência de Gestão de Clientes & CRM', () => {
  const mockClients: Client[] = [
    {
      id: 'cli-001',
      name: 'Beatriz Vasconcelos',
      email: 'beatriz@residencia.com',
      phone: '11999998888',
      legalType: 'PF',
      document: '12345678901',
      category: 'RESIDENTIAL',
      status: 'ACTIVE',
      rating: 5,
      totalSpent: 45000,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'cli-002',
      name: 'Inovação Imobiliária SA',
      email: 'contato@inovacao.com',
      phone: '1133334444',
      legalType: 'PJ',
      document: '98765432000188',
      category: 'COMMERCIAL',
      status: 'PROSPECT',
      rating: 4,
      totalSpent: 0,
      createdAt: '2026-02-15T10:00:00Z',
      updatedAt: '2026-02-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (clientApi.list as any).mockResolvedValue({
      content: mockClients,
      totalElements: 2,
    });
  });

  it('ECP Válido: deve carregar e renderizar a lista de clientes da API', async () => {
    render(<ClientsView />);

    expect(screen.getByText('Gestão de Clientes')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
      expect(screen.getByText('Inovação Imobiliária SA')).toBeDefined();
    });
  });

  it('Transição de Estados: deve abrir e fechar o modal de cadastro de novo cliente', async () => {
    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    const newBtn = screen.getByText(/Novo Cliente/i);
    fireEvent.click(newBtn);

    // Modal aberto
    expect(screen.getByText('Cadastrar Novo Cliente')).toBeDefined();

    // Fechar modal via botão cancelar
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Cadastrar Novo Cliente')).toBeNull();
    });
  });

  it('Tabela de Decisão: alternar entre PF e PJ deve alterar campos do formulário no modal', async () => {
    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Novo Cliente/i));

    // Por padrão é PF
    expect(screen.getByPlaceholderText('Ex: Roberto da Silva')).toBeDefined();

    // Clicar no botão PJ
    const pjBtn = screen.getByText('Pessoa Jurídica (PJ)');
    fireEvent.click(pjBtn);

    expect(screen.getByPlaceholderText('Ex: Studio Alpha Arquitetura')).toBeDefined();
    expect(screen.getByPlaceholderText('00.000.000/0000-00')).toBeDefined();
  });

  it('Error Guessing: deve exibir mensagem de erro quando a criação de cliente falhar', async () => {
    (clientApi.create as any).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Já existe um cliente cadastrado com este e-mail.',
        },
      },
    });

    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Novo Cliente/i));

    // Preenche dados básicos e submete
    const nameInput = screen.getByPlaceholderText('Ex: Roberto da Silva');
    const emailInput = screen.getByPlaceholderText('contato@cliente.com');

    fireEvent.change(nameInput, { target: { value: 'Cliente Duplicado' } });
    fireEvent.change(emailInput, { target: { value: 'duplicado@cliente.com' } });

    const submitBtn = screen.getByText('Salvar Cliente');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Já existe um cliente cadastrado com este e-mail.')).toBeDefined();
    });
  });

  it('Transição de Estado & Exclusão: deve chamar delete e atualizar lista após confirmação', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (clientApi.delete as any).mockResolvedValueOnce(undefined);

    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    // Clica no botão de lixeira (Remover cliente)
    const deleteButtons = screen.getAllByTitle('Remover cliente');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(clientApi.delete).toHaveBeenCalledWith('cli-001');
    });
  });
});

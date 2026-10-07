import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsKanbanView } from '../views/ProjectsKanbanView';
import { projectApi, clientApi } from '../services/api';
import { Project } from '../types/project';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === 'string' ? to : '#'} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../services/api', () => ({
  projectApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  clientApi: {
    list: vi.fn(),
  },
}));

describe('ProjectsKanbanView - Quadro Kanban Arquitetônico', () => {
  const mockProjects: Project[] = [
    {
      id: 'proj-001',
      name: 'Residência Alphaville',
      code: 'ARQ-001',
      description: 'Projeto residencial moderno com 4 suítes.',
      status: 'CONCEPTUAL',
      clientId: 'cli-001',
      contractValue: 85000,
      areaSquareMeters: 420,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'proj-002',
      name: 'Edifício Mirante',
      code: 'ARQ-002',
      description: 'Edifício comercial de 12 pavimentos.',
      status: 'EXECUTIVE',
      clientId: 'cli-002',
      contractValue: 240000,
      areaSquareMeters: 1800,
      createdAt: '2026-02-15T10:00:00Z',
      updatedAt: '2026-02-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (projectApi.list as any).mockResolvedValue({
      content: mockProjects,
      totalElements: 2,
      totalPages: 1,
    });
    (clientApi.list as any).mockResolvedValue({
      content: [
        { id: 'cli-001', name: 'Mariana Souza' },
        { id: 'cli-002', name: 'Beta Incorporadora' },
      ],
      totalElements: 2,
    });
  });

  it('ECP Válido: deve renderizar as 5 colunas arquitetônicas padrão do Kanban e seus cards', async () => {
    render(<ProjectsKanbanView />);

    expect(screen.getByText('Pipeline de Projetos (Kanban)')).toBeDefined();

    // 5 colunas arquitetônicas
    expect(screen.getByText('Estudo Preliminar')).toBeDefined();
    expect(screen.getByText('Anteprojeto')).toBeDefined();
    expect(screen.getByText('Projeto Executivo')).toBeDefined();
    expect(screen.getByText('Em Obra / Acompanhamento')).toBeDefined();
    expect(screen.getByText('Entregue / Concluído')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
      expect(screen.getByText('Edifício Mirante')).toBeDefined();
    });
  });

  it('Transição de Estados: deve abrir e fechar o modal de criação de novo projeto', async () => {
    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
    });

    const newBtn = screen.getByText('Novo Projeto');
    fireEvent.click(newBtn);

    expect(screen.getByText('Novo Projeto Arquitetônico')).toBeDefined();

    // Fechar modal
    const closeBtn = screen.getByText('Cancelar');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Novo Projeto Arquitetônico')).toBeNull();
    });
  });

  it('Transição de Estados: deve preencher formulário e submeter novo projeto com sucesso', async () => {
    (projectApi.create as any).mockResolvedValueOnce({
      id: 'proj-003',
      name: 'Residencial Vila Nova',
      status: 'CONCEPTUAL',
    });

    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Novo Projeto'));

    const nameInput = screen.getByPlaceholderText('Ex: Residencial Alphaville Villa 4');
    fireEvent.change(nameInput, { target: { value: 'Residencial Vila Nova' } });

    const submitBtn = screen.getByText('Salvar Projeto');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(projectApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Residencial Vila Nova',
          status: 'CONCEPTUAL',
        })
      );
    });
  });

  it('Transição de Estados & Movimentação Manual: deve avançar projeto para a próxima coluna', async () => {
    (projectApi.update as any).mockResolvedValueOnce({
      ...mockProjects[0],
      status: 'PRELIMINARY',
    });

    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
    });

    // Clica no botão "Próximo" do card (proj-001 que está em CONCEPTUAL)
    const nextButtons = screen.getAllByTitle('Mover para próxima coluna');
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(projectApi.update).toHaveBeenCalledWith('proj-001', {
        status: 'PRELIMINARY',
      });
    });
  });

  it('Filtro / Busca: deve filtrar projetos exibidos pelo texto de busca', async () => {
    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
      expect(screen.getByText('Edifício Mirante')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Filtrar projetos...');
    fireEvent.change(searchInput, { target: { value: 'Mirante' } });

    expect(screen.getByText('Edifício Mirante')).toBeDefined();
    expect(screen.queryByText('Residência Alphaville')).toBeNull();
  });
});

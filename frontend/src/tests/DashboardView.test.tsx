import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardView } from '../views/DashboardView';
import { projectApi, clientApi, inspectionApi, activityApi } from '../services/api';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === 'string' ? to : '#'} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

vi.mock('../services/api', () => ({
  projectApi: {
    list: vi.fn(),
  },
  clientApi: {
    list: vi.fn(),
  },
  inspectionApi: {
    list: vi.fn(),
  },
  activityApi: {
    listActivities: vi.fn(),
  },
}));

describe('DashboardView - Visão Geral do Escritório e KPIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjects = [
    {
      id: 'proj-1',
      name: 'Residência Alphaville',
      code: 'ARQ-001',
      description: 'Casa de campo moderna',
      status: 'CONSTRUCTION',
      clientId: 'cli-1',
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'proj-2',
      name: 'Edifício Metrópole',
      code: 'ARQ-002',
      description: 'Torre comercial',
      status: 'EXECUTIVE',
      clientId: 'cli-2',
      createdAt: '2026-03-01T10:00:00Z',
    },
  ];

  const mockClients = [
    { id: 'cli-1', name: 'Roberto Silva' },
    { id: 'cli-2', name: 'Fernanda Costa' },
    { id: 'cli-3', name: 'Paulo Ramos' },
  ];

  const mockInspections = [
    { id: 'insp-1', title: 'Vistoria Estrutural', status: 'COMPLETED' },
  ];

  const mockActivities = [
    { id: 'act-1', title: 'Desenho de Fachada', status: 'IN_PROGRESS' },
    { id: 'act-2', title: 'Reunião de Briefing', status: 'PENDING' },
    { id: 'act-3', title: 'Compatibilização Hidráulica', status: 'COMPLETED' },
  ];

  it('TC-DSH-06: Deve renderizar os 4 KPI cards com os totais calculados das APIs', async () => {
    vi.mocked(projectApi.list).mockResolvedValueOnce({
      content: mockProjects as any,
      totalElements: 2,
      totalPages: 1,
    });
    vi.mocked(clientApi.list).mockResolvedValueOnce({
      content: mockClients as any,
      totalElements: 3,
      totalPages: 1,
    });
    vi.mocked(inspectionApi.list).mockResolvedValueOnce({
      content: mockInspections as any,
      totalElements: 1,
      totalPages: 1,
    });
    vi.mocked(activityApi.listActivities).mockResolvedValueOnce({
      content: mockActivities as any,
      totalElements: 3,
      totalPages: 1,
    });

    render(<DashboardView />);

    expect(screen.getByText('Visão Geral do Escritório')).toBeDefined();

    await waitFor(() => {
      // Projetos Ativos e Atividades Pendentes têm valor 2
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
      // Clientes: 3
      expect(screen.getByText('3')).toBeDefined();
      // Vistorias Técnicas: 1
      expect(screen.getByText('1')).toBeDefined();
      expect(screen.getByText('Atividades & Prazos')).toBeDefined();
    });
  });

  it('TC-DSH-07: Deve navegar para a rota correta ao clicar em cada KPI card', async () => {
    vi.mocked(projectApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(clientApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(inspectionApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(activityApi.listActivities).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });

    const onNavigateMock = vi.fn();
    render(<DashboardView onNavigate={onNavigateMock} />);

    await waitFor(() => {
      expect(screen.getByText('Projetos Ativos')).toBeDefined();
    });

    // Clicar em Projetos Ativos
    fireEvent.click(screen.getByText('Projetos Ativos'));
    expect(onNavigateMock).toHaveBeenCalledWith('projects');

    // Clicar em Clientes
    fireEvent.click(screen.getByText('Clientes'));
    expect(onNavigateMock).toHaveBeenCalledWith('clients');

    // Clicar em Vistorias Técnicas
    fireEvent.click(screen.getByText('Vistorias Técnicas'));
    expect(onNavigateMock).toHaveBeenCalledWith('inspections');

    // Clicar em Atividades & Prazos
    fireEvent.click(screen.getByText('Atividades & Prazos'));
    expect(onNavigateMock).toHaveBeenCalledWith('activities');
  });

  it('TC-DSH-07b: Deve usar o router padrão navigate quando onNavigate não for fornecido', async () => {
    vi.mocked(projectApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(clientApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(inspectionApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(activityApi.listActivities).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByText('Projetos Ativos')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Projetos Ativos'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' });
  });

  it('TC-DSH-08: Deve exibir os gráficos e projetos em destaque', async () => {
    vi.mocked(projectApi.list).mockResolvedValueOnce({
      content: mockProjects as any,
      totalElements: 2,
      totalPages: 1,
    });
    vi.mocked(clientApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(inspectionApi.list).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });
    vi.mocked(activityApi.listActivities).mockResolvedValueOnce({ content: [], totalElements: 0, totalPages: 0 });

    render(<DashboardView />);

    // Título dos gráficos
    expect(screen.getByText(/Evolução Financeira/i)).toBeDefined();
    expect(screen.getByText(/Projetos por Fase do Kanban/i)).toBeDefined();

    // Projetos em destaque
    expect(screen.getByText('Projetos em Destaque')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
      expect(screen.getByText('Edifício Metrópole')).toBeDefined();
    });
  });
});

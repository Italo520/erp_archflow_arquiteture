import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InspectionsView } from '../views/InspectionsView';
import { inspectionApi, projectApi } from '../services/api';
import { SiteInspection, PunchListItem } from '../types/inspection';
import { Project } from '../types/project';

vi.mock('../services/api', () => ({
  inspectionApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    addPunchListItem: vi.fn(),
    resolvePunchListItem: vi.fn(),
    getItems: vi.fn(),
    delete: vi.fn(),
  },
  projectApi: {
    list: vi.fn(),
  },
}));

describe('InspectionsView - Vistorias de Obra & Punch List', () => {
  const mockProjects: Project[] = [
    {
      id: 'proj-001',
      name: 'Residencial Alphaville Villa 4',
      status: 'CONSTRUCTION',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockInspections: SiteInspection[] = [
    {
      id: 'insp-001',
      title: 'Vistoria Estrutural e Formas',
      date: '2026-10-18',
      status: 'IN_PROGRESS',
      generalNotes: 'Armaduras e formas do segundo pavimento verificadas.',
      weatherCondition: 'Ensolarado, 26°C',
      projectId: 'proj-001',
      inspectorId: 'usr-001',
      createdAt: '2026-10-06T10:00:00Z',
      updatedAt: '2026-10-06T10:00:00Z',
    },
  ];

  const mockItems: PunchListItem[] = [
    {
      id: 'item-001',
      inspectionId: 'insp-001',
      description: 'Fissura aparente no pilar P12',
      location: 'Garagem Subsolo',
      severity: 'CRITICAL',
      status: 'OPEN',
      createdAt: '2026-10-06T10:30:00Z',
      updatedAt: '2026-10-06T10:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (projectApi.list as any).mockResolvedValue({
      content: mockProjects,
      totalElements: 1,
    });
    (inspectionApi.list as any).mockResolvedValue({
      content: mockInspections,
      totalElements: 1,
    });
    (inspectionApi.getItems as any).mockResolvedValue(mockItems);
  });

  it('ECP Válido: deve renderizar cabeçalho, vistoria selecionada e apontamento de punch list', async () => {
    render(<InspectionsView />);

    expect(screen.getByText('Vistorias Técnicas & Punch List')).toBeDefined();
    expect(screen.getByText(/Inspeções de obra, controle de qualidade/i)).toBeDefined();

    await waitFor(() => {
      // Vistoria listada
      expect(screen.getAllByText('Vistoria Estrutural e Formas').length).toBeGreaterThan(0);
      // Item de punch list
      expect(screen.getByText('Fissura aparente no pilar P12')).toBeDefined();
      expect(screen.getByText('CRITICAL')).toBeDefined();
      expect(screen.getByText('Garagem Subsolo')).toBeDefined();
    });
  });

  it('Transição de Estados: deve abrir e fechar o modal de Nova Vistoria', async () => {
    render(<InspectionsView />);

    await waitFor(() => {
      expect(screen.getAllByText('Vistoria Estrutural e Formas').length).toBeGreaterThan(0);
    });

    const newInspBtn = screen.getByText('Nova Vistoria');
    fireEvent.click(newInspBtn);

    expect(screen.getByText('Agendar / Iniciar Vistoria Técnica')).toBeDefined();

    // Fechar modal
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Agendar / Iniciar Vistoria Técnica')).toBeNull();
    });
  });

  it('Transição de Estados: deve abrir modal de Adicionar Pendência (Punch List)', async () => {
    render(<InspectionsView />);

    await waitFor(() => {
      expect(screen.getByText('Fissura aparente no pilar P12')).toBeDefined();
    });

    const newItemBtn = screen.getByText('Adicionar Pendência');
    fireEvent.click(newItemBtn);

    expect(screen.getByText('Apontar Pendência (Punch List)')).toBeDefined();

    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Apontar Pendência (Punch List)')).toBeNull();
    });
  });

  it('Transição de Estados: deve abrir modal de Resolução ao clicar em Resolver', async () => {
    render(<InspectionsView />);

    await waitFor(() => {
      expect(screen.getByText('Fissura aparente no pilar P12')).toBeDefined();
    });

    const resolveBtn = screen.getByText('Resolver');
    fireEvent.click(resolveBtn);

    expect(screen.getByText('Registrar Resolução de Pendência')).toBeDefined();

    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Registrar Resolução de Pendência')).toBeNull();
    });
  });
});

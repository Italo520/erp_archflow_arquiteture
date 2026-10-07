import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { inspectionApi } from '../services/api';
import {
  SiteInspection,
  CreateSiteInspectionRequest,
  PunchListItem,
  CreatePunchListItemRequest,
  ResolvePunchListItemRequest,
} from '../types/inspection';

describe('inspectionApi - Camada de Serviços HTTP de Vistorias & Punch List', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ECP Válido: deve listar vistorias com filtros via GET /inspections', async () => {
    const mockInspectionPage = {
      data: {
        content: [
          {
            id: 'insp-001',
            title: 'Vistoria de Alvenaria',
            date: '2026-10-18',
            status: 'IN_PROGRESS' as const,
            projectId: 'proj-001',
            inspectorId: 'usr-001',
            createdAt: '2026-10-06T10:00:00Z',
            updatedAt: '2026-10-06T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockInspectionPage);

    const result = await inspectionApi.list({ search: 'Alvenaria', projectId: 'proj-001' });

    expect(getSpy).toHaveBeenCalledWith('/inspections', {
      params: { search: 'Alvenaria', projectId: 'proj-001' },
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].title).toBe('Vistoria de Alvenaria');
  });

  it('ECP Válido: deve obter detalhes da vistoria por ID via GET /inspections/:id', async () => {
    const mockInspection: SiteInspection = {
      id: 'insp-001',
      title: 'Vistoria de Alvenaria',
      date: '2026-10-18',
      status: 'IN_PROGRESS',
      projectId: 'proj-001',
      inspectorId: 'usr-001',
      createdAt: '2026-10-06T10:00:00Z',
      updatedAt: '2026-10-06T10:00:00Z',
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockInspection });

    const result = await inspectionApi.getById('insp-001');

    expect(getSpy).toHaveBeenCalledWith('/inspections/insp-001');
    expect(result.id).toBe('insp-001');
    expect(result.title).toBe('Vistoria de Alvenaria');
  });

  it('ECP Válido: deve registrar nova vistoria via POST /inspections', async () => {
    const createPayload: CreateSiteInspectionRequest = {
      title: 'Vistoria Estrutural',
      projectId: 'proj-001',
      weatherCondition: 'Ensolarado, 27°C',
      generalNotes: 'Armaduras e formas conferidas.',
    };

    const mockCreated: SiteInspection = {
      id: 'insp-002',
      title: createPayload.title,
      date: '2026-10-06',
      status: 'DRAFT',
      projectId: createPayload.projectId,
      weatherCondition: createPayload.weatherCondition,
      generalNotes: createPayload.generalNotes,
      inspectorId: 'usr-001',
      createdAt: '2026-10-06T12:00:00Z',
      updatedAt: '2026-10-06T12:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreated });

    const result = await inspectionApi.create(createPayload);

    expect(postSpy).toHaveBeenCalledWith('/inspections', createPayload);
    expect(result.id).toBe('insp-002');
    expect(result.title).toBe('Vistoria Estrutural');
  });

  it('ECP Válido: deve adicionar item de punch list via POST /inspections/:id/items', async () => {
    const itemPayload: CreatePunchListItemRequest = {
      description: 'Trinca superficial no gesso',
      location: 'Sala de Estar',
      severity: 'HIGH',
    };

    const mockItem: PunchListItem = {
      id: 'item-001',
      inspectionId: 'insp-001',
      description: itemPayload.description,
      location: itemPayload.location,
      severity: 'HIGH',
      status: 'OPEN',
      createdAt: '2026-10-06T12:30:00Z',
      updatedAt: '2026-10-06T12:30:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockItem });

    const result = await inspectionApi.addPunchListItem('insp-001', itemPayload);

    expect(postSpy).toHaveBeenCalledWith('/inspections/insp-001/items', itemPayload);
    expect(result.id).toBe('item-001');
    expect(result.severity).toBe('HIGH');
  });

  it('Transição de Estados: deve resolver pendência via PATCH /inspections/items/:itemId/resolve', async () => {
    const resolvePayload: ResolvePunchListItemRequest = {
      resolutionNotes: 'Superfície lixada e reaplicado acabamento.',
    };

    const mockResolvedItem: PunchListItem = {
      id: 'item-001',
      inspectionId: 'insp-001',
      description: 'Trinca superficial no gesso',
      severity: 'HIGH',
      status: 'RESOLVED',
      resolutionNotes: resolvePayload.resolutionNotes,
      resolvedAt: '2026-10-06T14:00:00Z',
      createdAt: '2026-10-06T12:30:00Z',
      updatedAt: '2026-10-06T14:00:00Z',
    };

    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: mockResolvedItem });

    const result = await inspectionApi.resolvePunchListItem('item-001', resolvePayload);

    expect(patchSpy).toHaveBeenCalledWith('/inspections/items/item-001/resolve', resolvePayload);
    expect(result.status).toBe('RESOLVED');
  });

  it('ECP Válido: deve listar itens da vistoria via GET /inspections/:id/items', async () => {
    const mockItems: PunchListItem[] = [
      {
        id: 'item-001',
        inspectionId: 'insp-001',
        description: 'Desaprumo na porta',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdAt: '2026-10-06T12:00:00Z',
        updatedAt: '2026-10-06T12:00:00Z',
      },
    ];

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockItems });

    const result = await inspectionApi.getItems('insp-001');

    expect(getSpy).toHaveBeenCalledWith('/inspections/insp-001/items');
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Desaprumo na porta');
  });

  it('Transição de Estados: deve excluir vistoria via DELETE /inspections/:id', async () => {
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: null });

    await inspectionApi.delete('insp-001');

    expect(deleteSpy).toHaveBeenCalledWith('/inspections/insp-001');
  });
});

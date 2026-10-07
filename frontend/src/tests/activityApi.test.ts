import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { activityApi } from '../services/api';
import {
  Activity,
  CreateActivityRequest,
  TimeLog,
  CreateTimeLogRequest,
  TimeSummaryResponse,
} from '../types/activity';

describe('activityApi - Camada de Serviços HTTP de Atividades & Time Tracking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ECP Válido: deve listar atividades com parâmetros de filtro', async () => {
    const mockActivityPage = {
      data: {
        content: [
          {
            id: 'act-001',
            type: 'MEETING' as const,
            title: 'Reunião de Briefing Inicial',
            status: 'SCHEDULED' as const,
            startTime: '2026-10-10T10:00:00Z',
            createdById: 'user-001',
            createdAt: '2026-10-06T12:00:00Z',
            updatedAt: '2026-10-06T12:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockActivityPage);

    const result = await activityApi.listActivities({ search: 'Briefing', status: 'SCHEDULED' });

    expect(getSpy).toHaveBeenCalledWith('/activities', {
      params: { search: 'Briefing', status: 'SCHEDULED' },
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].title).toBe('Reunião de Briefing Inicial');
  });

  it('ECP Válido: deve criar nova atividade via POST /activities', async () => {
    const requestPayload: CreateActivityRequest = {
      type: 'SITE_VISIT',
      title: 'Vistoria Estrutural',
      startTime: '2026-10-18T09:00:00Z',
      location: 'Alphaville, Lote 42',
      projectId: 'proj-001',
    };

    const mockCreatedActivity: Activity = {
      id: 'act-002',
      type: 'SITE_VISIT',
      title: requestPayload.title,
      startTime: requestPayload.startTime,
      location: requestPayload.location,
      projectId: requestPayload.projectId,
      status: 'SCHEDULED',
      createdById: 'user-admin',
      createdAt: '2026-10-06T14:00:00Z',
      updatedAt: '2026-10-06T14:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedActivity });

    const result = await activityApi.createActivity(requestPayload);

    expect(postSpy).toHaveBeenCalledWith('/activities', requestPayload);
    expect(result.id).toBe('act-002');
    expect(result.title).toBe('Vistoria Estrutural');
  });

  it('Transição de Estados: deve atualizar status da atividade via PATCH /activities/:id/status', async () => {
    const mockUpdatedActivity: Activity = {
      id: 'act-001',
      type: 'MEETING',
      title: 'Reunião de Briefing',
      status: 'COMPLETED',
      startTime: '2026-10-10T10:00:00Z',
      createdById: 'user-001',
      createdAt: '2026-10-06T12:00:00Z',
      updatedAt: '2026-10-06T12:00:00Z',
    };

    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: mockUpdatedActivity });

    const result = await activityApi.updateActivityStatus('act-001', 'COMPLETED');

    expect(patchSpy).toHaveBeenCalledWith('/activities/act-001/status', { status: 'COMPLETED' });
    expect(result.status).toBe('COMPLETED');
  });

  it('Transição de Estados: deve enviar DELETE /activities/:id para exclusão lógica', async () => {
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: null });

    await activityApi.deleteActivity('act-001');

    expect(deleteSpy).toHaveBeenCalledWith('/activities/act-001');
  });

  it('ECP Válido: deve registrar apontamento de horas via POST /time-logs', async () => {
    const timeLogPayload: CreateTimeLogRequest = {
      duration: 3.5,
      category: 'DESIGN',
      description: 'Modelagem 3D do pavimento térreo',
      billable: true,
      billRate: 180,
      projectId: 'proj-001',
    };

    const mockCreatedLog: TimeLog = {
      id: 'tl-001',
      duration: 3.5,
      category: 'DESIGN',
      description: timeLogPayload.description,
      logDate: '2026-10-06',
      billable: true,
      billRate: 180,
      userId: 'user-001',
      projectId: 'proj-001',
      createdAt: '2026-10-06T15:00:00Z',
      updatedAt: '2026-10-06T15:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedLog });

    const result = await activityApi.logTime(timeLogPayload);

    expect(postSpy).toHaveBeenCalledWith('/time-logs', timeLogPayload);
    expect(result.id).toBe('tl-001');
    expect(result.duration).toBe(3.5);
  });

  it('ECP Válido: deve listar apontamentos de horas via GET /time-logs', async () => {
    const mockLogsPage = {
      data: {
        content: [
          {
            id: 'tl-001',
            duration: 4.0,
            category: 'REVIEW' as const,
            logDate: '2026-10-06',
            billable: true,
            userId: 'user-001',
            projectId: 'proj-001',
            createdAt: '2026-10-06T15:00:00Z',
            updatedAt: '2026-10-06T15:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockLogsPage);

    const result = await activityApi.listTimeLogs({ projectId: 'proj-001', billable: true });

    expect(getSpy).toHaveBeenCalledWith('/time-logs', {
      params: { projectId: 'proj-001', billable: true },
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].duration).toBe(4.0);
  });

  it('ECP Válido: deve consultar resumo de horas do projeto via GET /time-logs/summary/:projectId', async () => {
    const mockSummary: TimeSummaryResponse = {
      totalHours: 25.5,
      billableHours: 20.0,
      nonBillableHours: 5.5,
      totalBillableAmount: 3600.0,
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockSummary });

    const result = await activityApi.getProjectSummary('proj-001');

    expect(getSpy).toHaveBeenCalledWith('/time-logs/summary/proj-001');
    expect(result.totalHours).toBe(25.5);
    expect(result.totalBillableAmount).toBe(3600.0);
  });

  it('Transição de Estados: deve excluir apontamento de horas via DELETE /time-logs/:id', async () => {
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: null });

    await activityApi.deleteTimeLog('tl-001');

    expect(deleteSpy).toHaveBeenCalledWith('/time-logs/tl-001');
  });
});

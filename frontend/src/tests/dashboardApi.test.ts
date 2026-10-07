import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { dashboardApi } from '../services/api';
import { DashboardMetricsResponse } from '../types/dashboard';

describe('dashboardApi - Camada de Serviços HTTP de Métricas do Dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-DSH-05: Deve chamar GET /dashboard/metrics e retornar métricas consolidadas', async () => {
    const mockMetrics: DashboardMetricsResponse = {
      totalProjects: 5,
      totalClients: 12,
      totalInspections: 8,
      totalTimeLogs: 34,
      totalPlannedCost: 285000.5,
      statusDistribution: {
        CONCEPTUAL: 1,
        PRELIMINARY: 1,
        EXECUTIVE: 2,
        COMPLETED: 1,
      },
      recentProjects: [
        {
          id: 'p1',
          name: 'Residência Alphaville',
          clientName: 'Roberto Silva',
          status: 'EXECUTIVE',
          plannedCost: 85000,
          actualCost: 42000,
          createdAt: '2026-10-06T10:00:00Z',
        },
      ],
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockMetrics });

    const result = await dashboardApi.getMetrics();

    expect(getSpy).toHaveBeenCalledWith('/dashboard/metrics');
    expect(result.totalProjects).toBe(5);
    expect(result.totalClients).toBe(12);
    expect(result.totalPlannedCost).toBe(285000.5);
    expect(result.recentProjects).toHaveLength(1);
    expect(result.recentProjects[0].name).toBe('Residência Alphaville');
  });

  it('TC-DSH-05b: Deve propagar erro quando GET /dashboard/metrics falhar', async () => {
    vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('Network error'));

    await expect(dashboardApi.getMetrics()).rejects.toThrow('Network error');
  });
});

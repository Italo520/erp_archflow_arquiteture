export interface RecentProjectMetric {
  id: string;
  name: string;
  clientName: string;
  status: string;
  plannedCost: number | null;
  actualCost: number | null;
  createdAt: string;
}

export interface DashboardMetricsResponse {
  totalProjects: number;
  totalClients: number;
  totalInspections: number;
  totalTimeLogs: number;
  totalPlannedCost: number;
  statusDistribution: Record<string, number>;
  recentProjects: RecentProjectMetric[];
}

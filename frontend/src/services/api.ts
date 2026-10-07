import axios, { AxiosError } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, ProblemDetail } from '../types/auth';
import { Client, CreateClientRequest } from '../types/client';
import { Project, CreateProjectRequest, ProjectKanbanColumn, Task } from '../types/project';
import { SiteInspection, CreateSiteInspectionRequest, PunchListItem, CreatePunchListItemRequest, ResolvePunchListItemRequest } from '../types/inspection';
import { Activity, CreateActivityRequest, TimeLog, CreateTimeLogRequest, TimeSummaryResponse } from '../types/activity';
import { DashboardMetricsResponse } from '../types/dashboard';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('archflow_token');
    if (token && token !== 'undefined' && token !== 'null' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetail>) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('archflow_token');
      localStorage.removeItem('archflow_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// --- Clients Endpoints ---
export const clientApi = {
  list: async (params?: { search?: string; status?: string; category?: string; page?: number; size?: number }) => {
    const res = await api.get<{ content: Client[]; totalElements: number; totalPages: number }>('/clients', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Client> => {
    const res = await api.get<Client>(`/clients/${id}`);
    return res.data;
  },
  create: async (data: CreateClientRequest): Promise<Client> => {
    const res = await api.post<Client>('/clients', data);
    return res.data;
  },
  updateStatus: async (id: string, status: string): Promise<Client> => {
    const res = await api.patch<Client>(`/clients/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

// --- Projects & Kanban Endpoints ---
export const projectApi = {
  list: async (params?: { search?: string; clientId?: string; status?: string; page?: number; size?: number }) => {
    const res = await api.get<{ content: Project[]; totalElements: number; totalPages: number }>('/projects', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Project> => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const res = await api.post<Project>('/projects', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res = await api.put<Project>(`/projects/${id}`, data);
    return res.data;
  },
  getKanbanColumns: async (projectId: string): Promise<ProjectKanbanColumn[]> => {
    const res = await api.get<ProjectKanbanColumn[]>(`/projects/${projectId}/kanban-columns`);
    return res.data;
  },
  moveKanbanColumn: async (projectId: string, columnId: string, targetPosition: number): Promise<ProjectKanbanColumn[]> => {
    const res = await api.put<ProjectKanbanColumn[]>(`/projects/${projectId}/kanban-columns/${columnId}/move`, { targetPosition });
    return res.data;
  },
  createTask: async (projectId: string, task: Partial<Task>): Promise<Task> => {
    const res = await api.post<Task>(`/projects/${projectId}/tasks`, task);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// --- Inspections Endpoints ---
export const inspectionApi = {
  list: async (params?: { search?: string; projectId?: string; status?: string; page?: number; size?: number }) => {
    const res = await api.get<{ content: SiteInspection[]; totalElements: number; totalPages: number }>('/inspections', { params });
    return res.data;
  },
  getById: async (id: string): Promise<SiteInspection> => {
    const res = await api.get<SiteInspection>(`/inspections/${id}`);
    return res.data;
  },
  create: async (data: CreateSiteInspectionRequest): Promise<SiteInspection> => {
    const res = await api.post<SiteInspection>('/inspections', data);
    return res.data;
  },
  addPunchListItem: async (inspectionId: string, item: CreatePunchListItemRequest): Promise<PunchListItem> => {
    const res = await api.post<PunchListItem>(`/inspections/${inspectionId}/items`, item);
    return res.data;
  },
  resolvePunchListItem: async (itemId: string, data: ResolvePunchListItemRequest): Promise<PunchListItem> => {
    const res = await api.patch<PunchListItem>(`/inspections/items/${itemId}/resolve`, data);
    return res.data;
  },
  getItems: async (inspectionId: string): Promise<PunchListItem[]> => {
    const res = await api.get<PunchListItem[]>(`/inspections/${inspectionId}/items`);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/inspections/${id}`);
  },
};

// --- Activities & Time Tracking Endpoints ---
export const activityApi = {
  listActivities: async (params?: { search?: string; projectId?: string; clientId?: string; status?: string; type?: string; page?: number; size?: number }) => {
    const res = await api.get<{ content: Activity[]; totalElements: number; totalPages: number }>('/activities', { params });
    return res.data;
  },
  createActivity: async (data: CreateActivityRequest): Promise<Activity> => {
    const res = await api.post<Activity>('/activities', data);
    return res.data;
  },
  updateActivityStatus: async (id: string, status: string): Promise<Activity> => {
    const res = await api.patch<Activity>(`/activities/${id}/status`, { status });
    return res.data;
  },
  deleteActivity: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },
  logTime: async (data: CreateTimeLogRequest): Promise<TimeLog> => {
    const res = await api.post<TimeLog>('/time-logs', data);
    return res.data;
  },
  listTimeLogs: async (params?: { projectId?: string; userId?: string; billable?: boolean; page?: number; size?: number }) => {
    const res = await api.get<{ content: TimeLog[]; totalElements: number; totalPages: number }>('/time-logs', { params });
    return res.data;
  },
  getProjectSummary: async (projectId: string): Promise<TimeSummaryResponse> => {
    const res = await api.get<TimeSummaryResponse>(`/time-logs/summary/${projectId}`);
    return res.data;
  },
  deleteTimeLog: async (id: string): Promise<void> => {
    await api.delete(`/time-logs/${id}`);
  },
};

// --- Dashboard Endpoints ---
export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetricsResponse> => {
    const res = await api.get<DashboardMetricsResponse>('/dashboard/metrics');
    return res.data;
  },
};

export default api;

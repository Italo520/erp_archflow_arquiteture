export type ActivityType = 'MEETING' | 'CALL' | 'EMAIL' | 'SITE_VISIT' | 'DESIGN' | 'REVISION' | 'APPROVAL' | 'ADMIN' | 'OTHER';

export type ActivityStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export type TimeLogCategory = 'DESIGN' | 'REVIEW' | 'MEETING' | 'ADMIN' | 'DELIVERY' | 'OTHER';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  duration?: number;
  startTime: string;
  endTime?: string;
  location?: string;
  status: ActivityStatus;
  clientId?: string;
  projectId?: string;
  taskId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  type: ActivityType;
  title: string;
  description?: string;
  duration?: number;
  startTime: string;
  endTime?: string;
  location?: string;
  clientId?: string;
  projectId?: string;
  taskId?: string;
}

export interface TimeLog {
  id: string;
  duration: number;
  category: TimeLogCategory;
  description?: string;
  logDate: string;
  startTime?: string;
  endTime?: string;
  billable: boolean;
  billRate?: number;
  userId: string;
  projectId: string;
  taskId?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeLogRequest {
  duration: number;
  category: TimeLogCategory;
  description?: string;
  logDate?: string;
  startTime?: string;
  endTime?: string;
  billable?: boolean;
  billRate?: number;
  projectId: string;
  taskId?: string;
  clientId?: string;
}

export interface TimeSummaryResponse {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalBillableAmount: number;
}

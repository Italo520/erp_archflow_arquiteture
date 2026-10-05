export type ProjectStatus =
  | 'CONCEPTUAL'
  | 'PRELIMINARY'
  | 'EXECUTIVE'
  | 'CONSTRUCTION'
  | 'COMPLETED'
  | 'ARCHIVED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface ProjectKanbanColumn {
  id: string;
  projectId: string;
  name: string;
  stageName: string;
  position: number;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  stageId?: string;
  columnId?: string;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  deliveryDate?: string;
  contractValue?: number;
  plannedCost?: number;
  actualCost?: number;
  areaSquareMeters?: number;
  totalArea?: number;
  address?: string;
  clientId?: string;
  clientName?: string;
  ownerId?: string;
  architecturalStyle?: string;
  constructionType?: string;
  numberOfFloors?: number;
  numberOfRooms?: number;
  landscapingArea?: number;
  parkingSpots?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  code?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  deliveryDate?: string;
  contractValue?: number;
  areaSquareMeters?: number;
  address?: string;
  clientId?: string;
  tags?: string[];
}

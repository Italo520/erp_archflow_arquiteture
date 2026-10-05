export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PunchListSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PunchListStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';

export interface PunchListItem {
  id: string;
  inspectionId: string;
  description: string;
  location?: string;
  severity: PunchListSeverity;
  status: PunchListStatus;
  photoUrl?: string;
  resolutionPhotoUrl?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteInspection {
  id: string;
  title: string;
  date: string;
  status: InspectionStatus;
  generalNotes?: string;
  weatherCondition?: string;
  projectId: string;
  inspectorId: string;
  items?: PunchListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteInspectionRequest {
  title: string;
  date?: string;
  generalNotes?: string;
  weatherCondition?: string;
  projectId: string;
}

export interface CreatePunchListItemRequest {
  description: string;
  location?: string;
  severity: PunchListSeverity;
  photoUrl?: string;
}

export interface ResolvePunchListItemRequest {
  resolutionNotes: string;
  resolutionPhotoUrl?: string;
}

export type ClientLegalType = 'PF' | 'PJ';

export type ClientCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'INSTITUTIONAL' | 'INDUSTRIAL' | 'DESIGNER';

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURN';

export type ContactPreference = 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'IN_PERSON';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  legalType: ClientLegalType;
  document?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  address?: string;
  category: ClientCategory;
  status: ClientStatus;
  rating?: number;
  totalSpent?: number;
  lastContact?: string;
  notes?: string;
  contactPreference?: ContactPreference;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  legalType: ClientLegalType;
  document?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  address?: string;
  category: ClientCategory;
  notes?: string;
  contactPreference?: ContactPreference;
  tags?: string[];
}

export interface ClientSummaryResponse {
  totalClients: number;
  activeClients: number;
  prospects: number;
  churnRate: number;
}

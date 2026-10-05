export type UserRole = 'ROLE_ADMIN' | 'ROLE_ARCHITECT' | 'ROLE_FINANCIAL' | 'ROLE_INTERN' | 'OWNER' | 'EDITOR' | 'VIEWER' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  tokenType?: string;
  type?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  user?: {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
    role: string;
  };
}

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}


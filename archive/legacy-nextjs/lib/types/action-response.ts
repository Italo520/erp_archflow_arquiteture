/**
 * Tipo de resposta unificado para todas as Server Actions do ArchFlow.
 * Centralizado aqui para evitar redeclaração duplicada em cada arquivo.
 */
export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade
  errors?: Record<string, string[]> | string;
  format?: string;
  metadata?: any; // Para respostas paginadas
}

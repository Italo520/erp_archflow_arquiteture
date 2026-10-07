import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { projectApi } from '../services/api';
import { CreateProjectRequest, Project, Task, ProjectKanbanColumn } from '../types/project';

describe('projectApi - Camada de Serviços HTTP de Projetos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ECP Válido: deve chamar GET /projects com parâmetros de busca e status', async () => {
    const mockProjectsPage = {
      data: {
        content: [
          {
            id: 'proj-001',
            name: 'Residência Jardins',
            status: 'CONCEPTUAL',
            areaSquareMeters: 450,
            contractValue: 95000,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockProjectsPage);

    const result = await projectApi.list({ search: 'Jardins', status: 'CONCEPTUAL' });

    expect(getSpy).toHaveBeenCalledWith('/projects', {
      params: { search: 'Jardins', status: 'CONCEPTUAL' },
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].name).toBe('Residência Jardins');
  });

  it('ECP Válido: deve chamar GET /projects/:id para buscar detalhes', async () => {
    const mockProject: Project = {
      id: 'proj-001',
      name: 'Residência Jardins',
      status: 'CONCEPTUAL',
      clientId: 'cli-001',
      contractValue: 95000,
      areaSquareMeters: 450,
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockProject });

    const result = await projectApi.getById('proj-001');

    expect(getSpy).toHaveBeenCalledWith('/projects/proj-001');
    expect(result.id).toBe('proj-001');
    expect(result.name).toBe('Residência Jardins');
  });

  it('ECP Válido: deve enviar POST /projects com dados completos ao criar projeto', async () => {
    const newProjectRequest: CreateProjectRequest = {
      name: 'Edifício Horizonte',
      clientId: 'cli-001',
      status: 'CONCEPTUAL',
      contractValue: 120000,
      areaSquareMeters: 1200,
    };

    const mockCreatedProject: Project = {
      id: 'proj-002',
      name: newProjectRequest.name,
      status: 'CONCEPTUAL',
      clientId: 'cli-001',
      contractValue: 120000,
      areaSquareMeters: 1200,
      architecturalStyle: 'Contemporâneo',
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedProject });

    const result = await projectApi.create(newProjectRequest);

    expect(postSpy).toHaveBeenCalledWith('/projects', newProjectRequest);
    expect(result.id).toBe('proj-002');
    expect(result.name).toBe('Edifício Horizonte');
  });

  it('Transição de Estados: deve enviar PUT /projects/:id ao atualizar status do projeto', async () => {
    const mockUpdatedProject: Project = {
      id: 'proj-001',
      name: 'Residência Jardins',
      status: 'PRELIMINARY',
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    const putSpy = vi.spyOn(api, 'put').mockResolvedValueOnce({ data: mockUpdatedProject });

    const result = await projectApi.update('proj-001', { status: 'PRELIMINARY' });

    expect(putSpy).toHaveBeenCalledWith('/projects/proj-001', { status: 'PRELIMINARY' });
    expect(result.status).toBe('PRELIMINARY');
  });

  it('ECP Válido: deve listar colunas Kanban do projeto via GET /projects/:id/kanban-columns', async () => {
    const mockColumns: ProjectKanbanColumn[] = [
      { id: 'col-1', name: 'Estudo Preliminar', stageName: 'Estudo Preliminar', position: 0, projectId: 'proj-001' },
      { id: 'col-2', name: 'Anteprojeto', stageName: 'Anteprojeto', position: 1, projectId: 'proj-001' },
    ];

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockColumns });

    const result = await projectApi.getKanbanColumns('proj-001');

    expect(getSpy).toHaveBeenCalledWith('/projects/proj-001/kanban-columns');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Estudo Preliminar');
  });

  it('ECP Válido: deve criar tarefa vinculada via POST /projects/:id/tasks', async () => {
    const taskPayload: Partial<Task> = {
      title: 'Elaborar pranchas de corte',
      priority: 'HIGH',
    };

    const mockCreatedTask: Task = {
      id: 'task-001',
      title: taskPayload.title || '',
      priority: 'HIGH',
      status: 'TODO',
      createdAt: '2026-10-06T20:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedTask });

    const result = await projectApi.createTask('proj-001', taskPayload);

    expect(postSpy).toHaveBeenCalledWith('/projects/proj-001/tasks', taskPayload);
    expect(result.id).toBe('task-001');
    expect(result.priority).toBe('HIGH');
  });

  it('Transição de Estados: deve enviar DELETE /projects/:id para exclusão lógica', async () => {
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: null });

    await projectApi.delete('proj-001');

    expect(deleteSpy).toHaveBeenCalledWith('/projects/proj-001');
  });
});

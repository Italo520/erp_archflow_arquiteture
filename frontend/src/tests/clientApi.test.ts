import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { clientApi } from '../services/api';
import { CreateClientRequest, Client } from '../types/client';

describe('clientApi - Camada de Serviços HTTP de Clientes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ECP Válido: deve chamar GET /clients com filtros de busca e paginação', async () => {
    const mockPageResponse = {
      data: {
        content: [
          {
            id: 'client-01',
            name: 'Roberto Arquitetura',
            email: 'roberto@cliente.com',
            legalType: 'PF',
            category: 'RESIDENTIAL',
            status: 'ACTIVE',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockPageResponse);

    const result = await clientApi.list({ search: 'Roberto', status: 'ACTIVE', size: 20 });

    expect(getSpy).toHaveBeenCalledWith('/clients', {
      params: { search: 'Roberto', status: 'ACTIVE', size: 20 },
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].name).toBe('Roberto Arquitetura');
  });

  it('ECP Válido: deve enviar POST /clients com payload completo ao cadastrar cliente', async () => {
    const newClientPayload: CreateClientRequest = {
      name: 'Studio Design Ltda',
      email: 'contato@studiodesign.com',
      legalType: 'PJ',
      document: '12.345.678/0001-90',
      category: 'COMMERCIAL',
      notes: 'Cliente corporativo',
    };

    const mockCreatedClient: Client = {
      id: 'client-99',
      name: newClientPayload.name,
      email: newClientPayload.email,
      legalType: 'PJ',
      document: '12345678000190',
      category: 'COMMERCIAL',
      status: 'PROSPECT',
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedClient });

    const result = await clientApi.create(newClientPayload);

    expect(postSpy).toHaveBeenCalledWith('/clients', newClientPayload);
    expect(result.id).toBe('client-99');
    expect(result.status).toBe('PROSPECT');
  });

  it('Transição de Estado: deve enviar DELETE /clients/{id} ao excluir cliente', async () => {
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: null });

    await clientApi.delete('client-01');

    expect(deleteSpy).toHaveBeenCalledWith('/clients/client-01');
  });
});

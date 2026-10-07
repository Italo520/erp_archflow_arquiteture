import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentsView } from '../views/DocumentsView';

describe('DocumentsView - Central de Documentos & Arquivos Técnicos', () => {
  it('ECP Válido: deve renderizar cabeçalho, colunas e lista inicial de documentos', () => {
    render(<DocumentsView />);

    expect(screen.getByText('Documentos & Arquivos Técnicos')).toBeDefined();
    expect(screen.getByText(/Central de pranchas, memoriais, modelos BIM/i)).toBeDefined();

    // Colunas da tabela
    expect(screen.getByText('Nome do Arquivo')).toBeDefined();
    expect(screen.getByText('Projeto Vinculado')).toBeDefined();
    expect(screen.getByText('Categoria')).toBeDefined();
    expect(screen.getByText('Tamanho')).toBeDefined();
    expect(screen.getByText('Data de Envio')).toBeDefined();
    expect(screen.getByText('Ações')).toBeDefined();

    // Documentos iniciais
    expect(screen.getByText('Planta_Baixa_Executiva_R04.pdf')).toBeDefined();
    expect(screen.getByText('Modelo_BIM_Arquitetura_LOD350.ifc')).toBeDefined();
    expect(screen.getByText('Contrato_Prestacao_Servicos_Assinado.pdf')).toBeDefined();
  });

  it('Transição de Estados: deve filtrar documentos por categoria selecionada', () => {
    render(<DocumentsView />);

    // Filtra por 'Plantas' usando role button
    const plantasBtn = screen.getByRole('button', { name: 'Plantas' });
    fireEvent.click(plantasBtn);

    expect(screen.getByText('Planta_Baixa_Executiva_R04.pdf')).toBeDefined();
    expect(screen.queryByText('Modelo_BIM_Arquitetura_LOD350.ifc')).toBeNull();

    // Filtra por 'Modelagem 3D'
    const bimBtn = screen.getByRole('button', { name: 'Modelagem 3D' });
    fireEvent.click(bimBtn);

    expect(screen.getByText('Modelo_BIM_Arquitetura_LOD350.ifc')).toBeDefined();
    expect(screen.queryByText('Planta_Baixa_Executiva_R04.pdf')).toBeNull();

    // Volta para 'Todos os Arquivos'
    const todosBtn = screen.getByRole('button', { name: 'Todos os Arquivos' });
    fireEvent.click(todosBtn);

    expect(screen.getByText('Planta_Baixa_Executiva_R04.pdf')).toBeDefined();
    expect(screen.getByText('Modelo_BIM_Arquitetura_LOD350.ifc')).toBeDefined();
  });

  it('Filtro / Busca: deve filtrar por nome do arquivo ou projeto no campo de busca', () => {
    render(<DocumentsView />);

    const searchInput = screen.getByPlaceholderText('Buscar por nome do arquivo ou projeto...');
    fireEvent.change(searchInput, { target: { value: 'Fachada' } });

    expect(screen.getByText('Render_Fachada_Diurna_Final.jpg')).toBeDefined();
    expect(screen.queryByText('Planta_Baixa_Executiva_R04.pdf')).toBeNull();
  });

  it('Transição de Estados: deve adicionar novo documento à tabela ao realizar upload de arquivo', () => {
    const { container } = render(<DocumentsView />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const mockFile = new File(['conteúdo simulado'], 'Prancha_Cortes_Longitudinais.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(screen.getByText('Prancha_Cortes_Longitudinais.pdf')).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivitiesView } from '../views/ActivitiesView';

describe('ActivitiesView - Quadro de Atividades e Tarefas', () => {
  it('ECP Válido: deve renderizar cabeçalho, tabela e tarefas iniciais', () => {
    render(<ActivitiesView />);

    expect(screen.getByText('Quadro de Atividades')).toBeDefined();
    expect(screen.getByText(/Gerenciamento de tarefas técnicas/i)).toBeDefined();

    // Colunas da tabela
    expect(screen.getByText('Atividade')).toBeDefined();
    expect(screen.getByText('Projeto')).toBeDefined();
    expect(screen.getByText('Responsável')).toBeDefined();
    expect(screen.getByText('Prazo')).toBeDefined();
    expect(screen.getByText('Horas')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();

    // Tarefas mockadas
    expect(screen.getByText('Detalhamento de Esquadrias e Alvenaria')).toBeDefined();
    expect(screen.getByText('Compatibilização Estrutural vs Hidráulica')).toBeDefined();
    expect(screen.getByText('Reunião de Briefing e Levantamento Métrico')).toBeDefined();
  });

  it('Transição de Estados: deve filtrar tarefas por status (Pendentes, Em Andamento, Concluídas)', () => {
    render(<ActivitiesView />);

    // Clicar no filtro "Pendentes"
    const pendentesBtn = screen.getByText('Pendentes');
    fireEvent.click(pendentesBtn);

    expect(screen.getByText('Compatibilização Estrutural vs Hidráulica')).toBeDefined();
    expect(screen.queryByText('Reunião de Briefing e Levantamento Métrico')).toBeNull();

    // Clicar no filtro "Concluídas"
    const concluidasBtn = screen.getByText('Concluídas');
    fireEvent.click(concluidasBtn);

    expect(screen.getByText('Reunião de Briefing e Levantamento Métrico')).toBeDefined();
    expect(screen.queryByText('Compatibilização Estrutural vs Hidráulica')).toBeNull();

    // Clicar no filtro "Todas"
    const todasBtn = screen.getByText('Todas');
    fireEvent.click(todasBtn);

    expect(screen.getByText('Compatibilização Estrutural vs Hidráulica')).toBeDefined();
    expect(screen.getByText('Reunião de Briefing e Levantamento Métrico')).toBeDefined();
  });

  it('Filtro / Busca: deve filtrar atividades digitando no campo de pesquisa', () => {
    render(<ActivitiesView />);

    const searchInput = screen.getByPlaceholderText('Buscar por tarefa, projeto ou responsável...');
    fireEvent.change(searchInput, { target: { value: 'Esquadrias' } });

    expect(screen.getByText('Detalhamento de Esquadrias e Alvenaria')).toBeDefined();
    expect(screen.queryByText('Compatibilização Estrutural vs Hidráulica')).toBeNull();
    expect(screen.queryByText('Reunião de Briefing e Levantamento Métrico')).toBeNull();
  });
});

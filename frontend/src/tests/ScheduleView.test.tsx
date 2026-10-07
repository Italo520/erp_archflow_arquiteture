import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScheduleView } from '../views/ScheduleView';

describe('ScheduleView - Cronograma e Prazos Arquitetônicos', () => {
  it('ECP Válido: deve renderizar cabeçalho e mês corrente', () => {
    render(<ScheduleView />);

    expect(screen.getByText('Cronograma & Prazos')).toBeDefined();
    expect(screen.getByText(/Acompanhamento de entregas de projetos/i)).toBeDefined();
    expect(screen.getByText('Outubro 2026')).toBeDefined();
  });

  it('ECP Válido: deve listar os próximos compromissos e seus respectivos badges', () => {
    render(<ScheduleView />);

    expect(screen.getByText('Próximos Compromissos')).toBeDefined();
    expect(screen.getByText('Entrega do Projeto Executivo e Detalhamento')).toBeDefined();
    expect(screen.getByText('Vistoria Técnica de Fundação e Estrutura')).toBeDefined();
    expect(screen.getByText('Aprovação de Layout com Cliente')).toBeDefined();
    expect(screen.getByText('Apresentação de Renders e Maquete 3D')).toBeDefined();

    // Badges de tipos de eventos
    expect(screen.getAllByText('Entrega')).toBeDefined();
    expect(screen.getByText('Vistoria')).toBeDefined();
    expect(screen.getByText('Marco')).toBeDefined();
  });

  it('ECP Válido: deve renderizar a grade mensal do calendário com dias da semana', () => {
    render(<ScheduleView />);

    expect(screen.getByText('Visão Mensal de Prazos')).toBeDefined();
    expect(screen.getByText('Dom')).toBeDefined();
    expect(screen.getByText('Seg')).toBeDefined();
    expect(screen.getByText('Ter')).toBeDefined();
    expect(screen.getByText('Qua')).toBeDefined();
    expect(screen.getByText('Qui')).toBeDefined();
    expect(screen.getByText('Sex')).toBeDefined();
    expect(screen.getByText('Sáb')).toBeDefined();
  });
});

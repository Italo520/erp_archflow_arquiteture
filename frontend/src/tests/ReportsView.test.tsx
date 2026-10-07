import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportsView } from '../views/ReportsView';

describe('ReportsView - Relatórios Gerenciais e Financeiros', () => {
  it('TC-DSH-09: Deve renderizar os 4 KPIs consolidados e o título da tela', () => {
    render(<ReportsView />);

    expect(screen.getByText('Relatórios Gerenciais')).toBeDefined();
    expect(screen.getByText('Análise consolidada de produtividade, custos e desempenho operacional.')).toBeDefined();

    // KPIs
    expect(screen.getByText('Faturamento Acumulado')).toBeDefined();
    expect(screen.getByText('R$ 284.500,00')).toBeDefined();

    expect(screen.getByText('Projetos em Andamento')).toBeDefined();
    expect(screen.getByText('12 Ativos')).toBeDefined();

    expect(screen.getByText('Horas Apontadas')).toBeDefined();
    expect(screen.getByText('348h 45m')).toBeDefined();

    expect(screen.getByText('Clientes Atendidos')).toBeDefined();
    expect(screen.getByText('18 Clientes')).toBeDefined();
  });

  it('TC-DSH-10: Deve permitir alternar o seletor de período (Transição de Estados)', () => {
    render(<ReportsView />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('month');

    // Mudar para trimestre
    fireEvent.change(select, { target: { value: 'quarter' } });
    expect(select.value).toBe('quarter');

    // Mudar para ano
    fireEvent.change(select, { target: { value: 'year' } });
    expect(select.value).toBe('year');
  });

  it('TC-DSH-11: Deve exibir botões de exportação CSV e PDF', () => {
    render(<ReportsView />);

    const exportCsvBtn = screen.getByRole('button', { name: /Exportar CSV/i });
    const generatePdfBtn = screen.getByRole('button', { name: /Gerar PDF Oficial/i });

    expect(exportCsvBtn).toBeDefined();
    expect(generatePdfBtn).toBeDefined();

    // Disparar clique para verificar estabilidade
    fireEvent.click(exportCsvBtn);
    fireEvent.click(generatePdfBtn);
  });

  it('TC-DSH-11b: Deve listar a tabela com margens financeiras e badges de orçamento', () => {
    render(<ReportsView />);

    // Título da tabela
    expect(screen.getByText('Detalhamento Financeiro por Projeto')).toBeDefined();

    // Projetos listados
    expect(screen.getByText('Residencial Alphaville Villa 4')).toBeDefined();
    expect(screen.getByText('Edifício Horizonte')).toBeDefined();
    expect(screen.getByText('Casa Jardins')).toBeDefined();
    expect(screen.getByText('Loft Industrial Pinheiros')).toBeDefined();

    // Badges de status orçamentário
    expect(screen.getAllByText('Dentro do Orçamento').length).toBeGreaterThan(0);
    expect(screen.getByText('Atenção a Custos')).toBeDefined();
  });
});

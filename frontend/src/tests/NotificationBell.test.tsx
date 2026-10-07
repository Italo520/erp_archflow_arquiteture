import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../components/layout/NotificationBell';

describe('NotificationBell - Central de Notificações e Alertas', () => {
  it('TC-NTF-06: Deve renderizar o sino com badge de quantidade de não lidas', () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button', { name: /Notificações/i });
    expect(button).toBeDefined();

    // Inicialmente existem 2 notificações não lidas
    expect(screen.getByText('2')).toBeDefined();
  });

  it('TC-NTF-07: Deve abrir o popover com as notificações ao clicar no sino (Transição de Estados)', () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button', { name: /Notificações/i });
    fireEvent.click(button);

    // O popover deve abrir
    expect(screen.getByText('Notificações')).toBeDefined();
    expect(screen.getByText('2 novas')).toBeDefined();
    expect(screen.getByText('Nova Vistoria Agendada')).toBeDefined();
    expect(screen.getByText('Entregável Aprovado')).toBeDefined();
    expect(screen.getByText('Prazo Próximo')).toBeDefined();
  });

  it('TC-NTF-08: Deve marcar notificação individual como lida ao clicar nela', () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button', { name: /Notificações/i });
    fireEvent.click(button);

    // Clicar na primeira notificação não lida
    const item = screen.getByText('Nova Vistoria Agendada');
    fireEvent.click(item);

    // Contagem de não lidas deve cair para 1
    expect(screen.getByText('1 novas')).toBeDefined();
  });

  it('TC-NTF-08b: Deve marcar todas as notificações como lidas ao clicar em "Marcar lidas"', () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button', { name: /Notificações/i });
    fireEvent.click(button);

    const markAllBtn = screen.getByText('Marcar lidas');
    fireEvent.click(markAllBtn);

    // O botão 'Marcar lidas' e o texto 'novas' não devem mais aparecer
    expect(screen.queryByText('Marcar lidas')).toBeNull();
    expect(screen.queryByText(/novas/i)).toBeNull();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from '../views/SettingsView';
import { ThemeProvider } from '../context/ThemeContext';

describe('SettingsView - Configurações Globais, Identidade e Preferências', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <SettingsView />
      </ThemeProvider>
    );
  };

  it('TC-NTF-09: Deve renderizar os 4 blocos de configuração do sistema', () => {
    renderWithTheme();

    expect(screen.getByText('Configurações do Sistema')).toBeDefined();
    expect(screen.getByText('Aparência & Identidade Visual')).toBeDefined();
    expect(screen.getByText('Escritório de Arquitetura')).toBeDefined();
    expect(screen.getByText('Notificações em Tempo Real')).toBeDefined();
    expect(screen.getByText('Segurança & Acessos')).toBeDefined();
  });

  it('TC-NTF-10: Deve alternar entre os modos Claro, Escuro e Sistema (Transição de Estado)', () => {
    renderWithTheme();

    const claroBtn = screen.getByRole('button', { name: /^claro$/i });
    const escuroBtn = screen.getByRole('button', { name: /^escuro$/i });
    const sistemaBtn = screen.getByRole('button', { name: /^sistema$/i });

    // Alternar para Claro
    fireEvent.click(claroBtn);
    expect(localStorage.getItem('archflow_theme')).toBe('light');

    // Alternar para Escuro
    fireEvent.click(escuroBtn);
    expect(localStorage.getItem('archflow_theme')).toBe('dark');

    // Alternar para Sistema
    fireEvent.click(sistemaBtn);
    expect(localStorage.getItem('archflow_theme')).toBe('system');
  });

  it('TC-NTF-11: Deve alternar entre as paletas Azul Ant Design e Verde Sálvia', () => {
    renderWithTheme();

    const azulOption = screen.getByText('Azul Ant Design');
    const salviaOption = screen.getByText('Verde Sálvia');

    // Clicar em Verde Sálvia
    fireEvent.click(salviaOption);
    expect(localStorage.getItem('archflow_palette')).toBe('sage');

    // Clicar em Azul Ant Design
    fireEvent.click(azulOption);
    expect(localStorage.getItem('archflow_palette')).toBe('blue');
  });

  it('TC-NTF-11b: Deve permitir editar campos cadastrais e alternar checkboxes de alerta', () => {
    renderWithTheme();

    const nomeEscritorioInput = screen.getByDisplayValue('ArchFlow Arquitetura & Interiores') as HTMLInputElement;
    fireEvent.change(nomeEscritorioInput, { target: { value: 'Studio Alfa Arquitetura' } });
    expect(nomeEscritorioInput.value).toBe('Studio Alfa Arquitetura');

    // Checkboxes de notificações
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBe(3);

    // Desmarcar o primeiro checkbox
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(false);
  });
});

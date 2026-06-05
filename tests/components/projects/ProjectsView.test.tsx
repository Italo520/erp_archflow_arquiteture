import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectsView from '@/components/projects/ProjectsView';

// Mock sub-components that might do complex data fetching or are heavy
jest.mock('@/components/projects/ProjectFilters', () => {
    return function MockFilters() {
        return <div data-testid="project-filters">Filtros</div>;
    };
});

jest.mock('@/components/projects/ProjectsTable', () => {
    return function MockTable() {
        return <div data-testid="projects-table">Tabela de Projetos</div>;
    };
});

jest.mock('@/components/projects/ProjectKanban', () => {
    return function MockKanban() {
        return <div data-testid="projects-kanban">Kanban de Projetos</div>;
    };
});

jest.mock('@/components/projects/ExportButton', () => {
    return function MockExport() {
        return <button data-testid="export-btn">Exportar</button>;
    };
});

describe('ProjectsView component', () => {
    const mockProjects = [
        { id: '1', name: 'Projeto A', status: 'PLANNING' },
        { id: '2', name: 'Projeto B', status: 'IN_PROGRESS' },
    ];
    const mockColumns = ['PLANNING', 'IN_PROGRESS'];

    beforeEach(() => {
        // Clear localStorage
        window.localStorage.clear();
    });

    it('renders the header correctly', () => {
        render(<ProjectsView projects={mockProjects} columns={mockColumns} />);
        expect(screen.getByText('Projetos')).toBeInTheDocument();
        expect(screen.getByText(/Gerencie seus projetos arquitetônicos/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Novo Projeto/i })).toBeInTheDocument();
    });

    it('renders list view by default when no localStorage is set', () => {
        render(<ProjectsView projects={mockProjects} columns={mockColumns} />);
        
        expect(screen.getByTestId('projects-table')).toBeInTheDocument();
        expect(screen.queryByTestId('projects-kanban')).not.toBeInTheDocument();
    });

    it('reads initial view mode from localStorage', () => {
        window.localStorage.setItem('projectsViewMode', 'kanban');
        render(<ProjectsView projects={mockProjects} columns={mockColumns} />);
        
        expect(screen.getByTestId('projects-kanban')).toBeInTheDocument();
        expect(screen.queryByTestId('projects-table')).not.toBeInTheDocument();
    });

    it('switches view mode when buttons are clicked', () => {
        render(<ProjectsView projects={mockProjects} columns={mockColumns} />);
        
        // Starts in list
        expect(screen.getByTestId('projects-table')).toBeInTheDocument();

        // Click kanban
        const kanbanBtn = screen.getByRole('button', { name: /Kanban/i });
        fireEvent.click(kanbanBtn);

        expect(screen.getByTestId('projects-kanban')).toBeInTheDocument();
        expect(screen.queryByTestId('projects-table')).not.toBeInTheDocument();
        expect(window.localStorage.getItem('projectsViewMode')).toBe('kanban');

        // Click list
        const listBtn = screen.getByRole('button', { name: /Lista/i });
        fireEvent.click(listBtn);

        expect(screen.getByTestId('projects-table')).toBeInTheDocument();
        expect(window.localStorage.getItem('projectsViewMode')).toBe('list');
    });
});

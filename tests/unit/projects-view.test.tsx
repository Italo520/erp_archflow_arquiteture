
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectsView from '@/components/projects/ProjectsView';
import { useRouter } from 'next/navigation';

// Mock child components to isolate View logic
jest.mock('@/components/projects/ProjectFilters', () => {
        const MockProjectFilters = () => <div data-testid="project-filters">Filters</div>;
        MockProjectFilters.displayName = 'MockProjectFilters';
        return MockProjectFilters;
    });

jest.mock('@/components/projects/ProjectsTable', () => {
        const MockProjectsTable = () => <div data-testid="projects-table">Table</div>;
        MockProjectsTable.displayName = 'MockProjectsTable';
        return MockProjectsTable;
    });

jest.mock('@/components/projects/ProjectKanban', () => {
        const MockProjectKanban = () => <div data-testid="project-kanban">Kanban</div>;
        MockProjectKanban.displayName = 'MockProjectKanban';
        return MockProjectKanban;
    });

jest.mock('@/components/projects/ExportButton', () => {
        const MockExportButton = () => <button>Export</button>;
        MockExportButton.displayName = 'MockExportButton';
        return MockExportButton;
    });
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

describe('ProjectsView', () => {
    const projects = [{ id: '1', name: 'Test Project' }];

    beforeEach(() => {
        localStorage.clear();
    });

    it('renders list view by default', () => {
        render(<ProjectsView projects={projects} />);
        expect(screen.getByTestId('projects-table')).toBeInTheDocument();
        expect(screen.queryByTestId('project-kanban')).not.toBeInTheDocument();
    });

    it('toggles to kanban view', () => {
        render(<ProjectsView projects={projects} />);

        // Find Kanban button specificially by role to avoid text duplication with content
        const kanbanBtn = screen.getByRole('button', { name: /Kanban/i });
        fireEvent.click(kanbanBtn);

        expect(screen.getByTestId('project-kanban')).toBeInTheDocument();
        expect(screen.queryByTestId('projects-table')).not.toBeInTheDocument();
    });

    it('persists view in localStorage', () => {
        // Mock LocalStorage
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

        render(<ProjectsView projects={projects} />);
        const kanbanBtn = screen.getByRole('button', { name: /Kanban/i });
        fireEvent.click(kanbanBtn);

        expect(setItemSpy).toHaveBeenCalledWith('projectsViewMode', 'kanban');
    });
});

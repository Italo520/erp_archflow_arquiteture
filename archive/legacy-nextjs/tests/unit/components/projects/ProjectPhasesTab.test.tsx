import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectPhasesTab from '@/components/projects/ProjectPhasesTab';
import { useRouter } from 'next/navigation';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    CheckCircle2: () => <div data-testid="check-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    Circle: () => <div data-testid="circle-icon" />,
    X: () => <div data-testid="x-icon" />
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock Server Actions
jest.mock('@/app/actions/project', () => ({
    addProjectPhase: jest.fn(),
    completeProjectPhase: jest.fn(),
    updateProjectPhase: jest.fn(),
}));

// Mock Radix UI Dialog to avoid Portal issues in tests
jest.mock('@radix-ui/react-dialog', () => ({
    Root: ({ children }: any) => <div>{children}</div>,
    Trigger: ({ children }: any) => <button>{children}</button>,
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => null,
    Content: ({ children }: any) => <div role="dialog">{children}</div>,
    Header: ({ children }: any) => <div>{children}</div>,
    Footer: ({ children }: any) => <div>{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Description: ({ children }: any) => <p>{children}</p>,
    Close: ({ children }: any) => <button>{children}</button>,
}));

describe('ProjectPhasesTab', () => {
    const mockProject = {
        id: '1',
        phases: [
            { name: 'Fase 1', status: 'COMPLETED', startDate: '2023-01-01' },
            { name: 'Fase 2', status: 'IN_PROGRESS', startDate: '2023-02-01' }
        ]
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ refresh: jest.fn() });
    });

    it('renders project phases correctly', () => {
        render(<ProjectPhasesTab project={mockProject} />);

        expect(screen.getByText('Fase 1')).toBeInTheDocument();
        expect(screen.getByText('Fase 2')).toBeInTheDocument();
        expect(screen.getByText('Concluído')).toBeInTheDocument();
        expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    });

    it('renders empty state when no phases', () => {
        render(<ProjectPhasesTab project={{ id: '1', phases: [] }} />);
        expect(screen.getByText('Nenhuma fase registrada.')).toBeInTheDocument();
    });

    it('shows add phase form when button clicked', () => {
        render(<ProjectPhasesTab project={mockProject} />);
        const addButton = screen.getByText('Nova Fase');
        fireEvent.click(addButton);

        expect(screen.getByPlaceholderText(/ex: Estudo Preliminar/i)).toBeInTheDocument();
    });

    it('shows edit dialog when edit button clicked', () => {
        render(<ProjectPhasesTab project={mockProject} />);
        const editButtons = screen.getAllByText('Editar');
        fireEvent.click(editButtons[0]);

        // With our Dialog mock, the title should be in the DOM
        expect(screen.getByText(/Editar Fase: Fase 1/i)).toBeInTheDocument();
    });
});

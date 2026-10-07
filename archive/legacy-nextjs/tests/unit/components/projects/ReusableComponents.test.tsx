import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { ProjectSelect } from '@/components/projects/ProjectSelect';
import { ProjectPhaseTimeline } from '@/components/projects/ProjectPhaseTimeline';

// Mock Lucide Icons
jest.mock('lucide-react', () => ({
    MoreVertical: () => <div data-testid="more-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    Users: () => <div data-testid="users-icon" />,
    Layers: () => <div data-testid="layers-icon" />,
    ExternalLink: () => <div data-testid="external-link-icon" />,
    Copy: () => <div data-testid="copy-icon" />,
    Trash: () => <div data-testid="trash-icon" />,
    Edit: () => <div data-testid="edit-icon" />,
    DollarSign: () => <div data-testid="dollar-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    CheckCircle2: () => <div data-testid="check-circle-icon" />,
    AlertCircle: () => <div data-testid="alert-icon" />,
    Check: () => <div data-testid="check-icon" />,
    ChevronsUpDown: () => <div data-testid="chevrons-icon" />,
    Circle: () => <div data-testid="circle-icon" />,
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}));

describe('Reusable Project Components', () => {
    const mockProject = {
        id: '1',
        name: 'Projeto Teste',
        status: 'IN_PROGRESS',
        progress: 45,
        startDate: '2024-01-01',
        client: { name: 'Cliente X' },
        architects: [{ id: 'a1' }, { id: 'a2' }]
    };

    describe('ProjectCard', () => {
        it('renders project name and client', () => {
            render(<ProjectCard project={mockProject} />);
            expect(screen.getByText('Projeto Teste')).toBeInTheDocument();
            expect(screen.getByText('Cliente X')).toBeInTheDocument();
            expect(screen.getByText('Em Andamento')).toBeInTheDocument();
        });
    });

    describe('ProjectStats', () => {
        it('renders stats metrics', () => {
            const stats = {
                budget: { total: 1000, spent: 500, remaining: 500, percentage: 50 },
                tasks: { total: 10, completed: 5, pending: 5 },
                time: { daysElapsed: 10, totalDays: 20, percentage: 50 }
            };
            render(<ProjectStats stats={stats} />);
            expect(screen.getByText('R$ 500')).toBeInTheDocument();
            expect(screen.getByText('5/10')).toBeInTheDocument();
            expect(screen.getByText('10 dias')).toBeInTheDocument();
        });
    });

    describe('ProjectSelect', () => {
        it('renders placeholder or selected project', () => {
            render(<ProjectSelect projects={[mockProject]} value="1" onValueChange={() => { }} />);
            expect(screen.getByText('Projeto Teste')).toBeInTheDocument();
        });
    });

    describe('ProjectPhaseTimeline', () => {
        it('renders phases in a timeline', () => {
            const phases = [
                { id: 'p1', name: 'Fase 1', status: 'COMPLETED' as const },
                { id: 'p2', name: 'Fase 2', status: 'IN_PROGRESS' as const }
            ];
            render(<ProjectPhaseTimeline phases={phases} />);
            expect(screen.getByText('Fase 1')).toBeInTheDocument();
            expect(screen.getByText('Fase 2')).toBeInTheDocument();
        });
    });
});

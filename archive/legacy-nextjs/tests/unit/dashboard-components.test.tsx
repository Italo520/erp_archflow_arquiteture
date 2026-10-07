/**
 * Unit tests for Dashboard components
 * Tests component rendering and prop handling without visual/canvas testing
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Chart components since they use Recharts (canvas/SVG)
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
        React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    PieChart: ({ children }: { children: React.ReactNode }) =>
        React.createElement('div', { 'data-testid': 'pie-chart' }, children),
    Pie: () => React.createElement('div', { 'data-testid': 'pie' }),
    Cell: () => null,
    BarChart: ({ children }: { children: React.ReactNode }) =>
        React.createElement('div', { 'data-testid': 'bar-chart' }, children),
    Bar: () => React.createElement('div', { 'data-testid': 'bar' }),
    LineChart: ({ children }: { children: React.ReactNode }) =>
        React.createElement('div', { 'data-testid': 'line-chart' }, children),
    Line: () => React.createElement('div', { 'data-testid': 'line' }),
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
}));

// Import components after mocks
import { KPICard } from '@/components/dashboard/KPICard';
import { Chart } from '@/components/dashboard/Chart';
import { DeadlineAlerts } from '@/components/dashboard/DeadlineAlerts';
import { TodayActivities } from '@/components/dashboard/TodayActivities';
import { Users } from 'lucide-react';

describe('KPICard Component', () => {
    const defaultProps = {
        title: 'Test KPI',
        value: '100',
        icon: Users,
    };

    it('renders title and value correctly', () => {
        render(<KPICard {...defaultProps} />);
        expect(screen.getByText('Test KPI')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('renders numeric value correctly', () => {
        render(<KPICard {...defaultProps} value={42} />);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders trend with positive intent as green', () => {
        render(
            <KPICard
                {...defaultProps}
                trend={15}
                intent="positive"
                trendLabel="vs mês passado"
            />
        );
        const trendElement = screen.getByText('+15%');
        expect(trendElement).toBeInTheDocument();
        expect(trendElement).toHaveClass('text-green-600');
    });

    it('renders negative trend with positive intent as red', () => {
        render(
            <KPICard
                {...defaultProps}
                trend={-10}
                intent="positive"
                trendLabel="vs mês passado"
            />
        );
        const trendElement = screen.getByText('-10%');
        expect(trendElement).toBeInTheDocument();
        expect(trendElement).toHaveClass('text-red-600');
    });

    it('renders positive trend with negative intent as red', () => {
        render(
            <KPICard
                {...defaultProps}
                trend={5}
                intent="negative"
            />
        );
        const trendElement = screen.getByText('+5%');
        expect(trendElement).toHaveClass('text-red-600');
    });

    it('renders neutral intent with muted color', () => {
        render(
            <KPICard
                {...defaultProps}
                trend={10}
                intent="neutral"
            />
        );
        const trendElement = screen.getByText('+10%');
        expect(trendElement).toHaveClass('text-muted-foreground');
    });

    it('renders trend label when provided', () => {
        render(
            <KPICard
                {...defaultProps}
                trendLabel="vs período anterior"
            />
        );
        expect(screen.getByText('vs período anterior')).toBeInTheDocument();
    });
});

describe('Chart Component', () => {
    it('renders children when not loading or error', () => {
        render(
            <Chart title="Test Chart" description="Test description">
                <div data-testid="chart-content">Chart Content</div>
            </Chart>
        );
        expect(screen.getByText('Test Chart')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('renders skeleton when loading', () => {
        render(
            <Chart title="Test Chart" loading={true}>
                <div data-testid="chart-content">Chart Content</div>
            </Chart>
        );
        expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
        expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('renders error state with message when error is true', () => {
        render(
            <Chart title="Test Chart" error={true} errorMessage="Falha ao carregar">
                <div data-testid="chart-content">Chart Content</div>
            </Chart>
        );
        expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
        expect(screen.getByText('Falha ao carregar')).toBeInTheDocument();
    });

    it('renders default error message when no custom message provided', () => {
        render(
            <Chart title="Test Chart" error={true}>
                <div>Content</div>
            </Chart>
        );
        expect(screen.getByText('Não foi possível carregar os dados.')).toBeInTheDocument();
    });
});

describe('DeadlineAlerts Component', () => {
    const mockProjects = [
        { id: '1', name: 'Projeto A', clientName: 'Cliente A', deadline: new Date(Date.now() + 86400000 * 2).toISOString() },
        { id: '2', name: 'Projeto B', clientName: 'Cliente B', deadline: new Date(Date.now() + 86400000 * 5).toISOString() },
        { id: '3', name: 'Projeto C', clientName: 'Cliente C', deadline: new Date(Date.now() + 86400000 * 10).toISOString() },
    ];

    it('renders project list', () => {
        render(<DeadlineAlerts projects={mockProjects} />);
        expect(screen.getByText('Projeto A')).toBeInTheDocument();
        expect(screen.getByText('Projeto B')).toBeInTheDocument();
        expect(screen.getByText('Projeto C')).toBeInTheDocument();
    });

    it('renders critical badge for projects under 3 days from deadline', () => {
        render(<DeadlineAlerts projects={mockProjects} />);
        expect(screen.getByText('Crítico')).toBeInTheDocument();
    });

    it('renders attention badge for projects 3-7 days from deadline', () => {
        render(<DeadlineAlerts projects={mockProjects} />);
        expect(screen.getByText('Atenção')).toBeInTheDocument();
    });

    it('renders on-track badge for projects over 7 days from deadline', () => {
        render(<DeadlineAlerts projects={mockProjects} />);
        expect(screen.getByText('No prazo')).toBeInTheDocument();
    });

    it('renders empty state when no projects', () => {
        render(<DeadlineAlerts projects={[]} />);
        expect(screen.getByText(/Nenhum prazo próximo/)).toBeInTheDocument();
    });
});

describe('TodayActivities Component', () => {
    const mockActivities = [
        {
            id: '1',
            time: new Date().toISOString(),
            title: 'Reunião com cliente',
            type: 'MEETING',
            participants: [{ id: 'u1', name: 'João Silva' }],
        },
        {
            id: '2',
            time: new Date(Date.now() + 3600000).toISOString(),
            title: 'Revisão de projeto',
            type: 'REVIEW',
            participants: [],
        },
    ];

    it('renders activity list', () => {
        render(<TodayActivities activities={mockActivities} />);
        expect(screen.getByText('Reunião com cliente')).toBeInTheDocument();
        expect(screen.getByText('Revisão de projeto')).toBeInTheDocument();
    });

    it('renders activity type badges', () => {
        render(<TodayActivities activities={mockActivities} />);
        expect(screen.getByText('REUNIÃO')).toBeInTheDocument();
        expect(screen.getByText('REVIEW')).toBeInTheDocument();
    });

    it('renders empty state when no activities', () => {
        render(<TodayActivities activities={[]} />);
        expect(screen.getByText(/Nenhuma atividade agendada/)).toBeInTheDocument();
    });

    it('renders participant avatars', () => {
        render(<TodayActivities activities={mockActivities} />);
        expect(screen.getByText('JO')).toBeInTheDocument();
    });
});

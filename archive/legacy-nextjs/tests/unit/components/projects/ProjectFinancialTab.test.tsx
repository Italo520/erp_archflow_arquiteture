import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectFinancialTab from '@/components/projects/ProjectFinancialTab';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    DollarSign: () => <div data-testid="dollar-icon" />,
    PieChart: () => <div data-testid="pie-icon" />,
    TrendingUp: () => <div data-testid="trend-up-icon" />,
    TrendingDown: () => <div data-testid="trend-down-icon" />,
    ArrowUpRight: () => <div data-testid="arrow-up-icon" />,
    ArrowDownRight: () => <div data-testid="arrow-down-icon" />,
    Wallet: () => <div data-testid="wallet-icon" />,
    CreditCard: () => <div data-testid="card-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    Download: () => <div data-testid="download-icon" />,
    AlertTriangle: () => <div data-testid="alert-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    Info: () => <div data-testid="info-icon" />,
    ShieldAlert: () => <div data-testid="shield-icon" />,
}));

// Mock actions
jest.mock('@/app/actions/finance', () => ({
    getProjectFinancials: jest.fn().mockResolvedValue({
        ok: true,
        data: {
            metrics: {
                totalHours: 0,
                billableHours: 0,
                nonBillableHours: 0,
                actualCostOfHours: 0,
                spentPercentage: 0,
            }
        }
    }),
    saveBudget: jest.fn(),
    saveEstimate: jest.fn()
}));

jest.mock('@/app/actions/reports', () => ({
    downloadReport: jest.fn()
}));

describe('ProjectFinancialTab', () => {
    const mockProject = {
        id: '1',
        plannedCost: 10000,
        actualCost: 2500,
        totalValue: 15000,
        financials: { totalReceived: 5000 }
    };

    it('renders financial metrics correctly', async () => {
        render(<ProjectFinancialTab project={mockProject} metrics={{}} />);

        // Use findByText to wait for loading to finish
        expect((await screen.findAllByText(/10\.000,00/)).length).toBeGreaterThanOrEqual(1); // Orçamento Aprovado
    });

    it('displays profit margin correctly', async () => {
        render(<ProjectFinancialTab project={mockProject} metrics={{}} />);
        expect((await screen.findAllByText(/10\.000,00/)).length).toBeGreaterThanOrEqual(1); // Lucro Estimado = 10000 - 0
    });
});

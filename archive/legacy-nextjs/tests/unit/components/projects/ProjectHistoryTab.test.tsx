import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectHistoryTab from '@/components/projects/ProjectHistoryTab';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Clock: () => <div data-testid="clock-icon" />,
    PlusCircle: () => <div data-testid="plus-icon" />,
    FileUp: () => <div data-testid="file-up-icon" />,
    CheckCircle: () => <div data-testid="check-icon" />,
    MessageSquare: () => <div data-testid="message-icon" />,
    Settings: () => <div data-testid="settings-icon" />,
    User: () => <div data-testid="user-icon" />,
}));

describe('ProjectHistoryTab', () => {
    const mockProject = {
        id: '1',
        history: [
            { id: 'h1', type: 'CREATE', user: 'Admin', description: 'Created project', date: '2023-01-01T10:00:00Z' }
        ]
    };

    it('renders project history correctly', () => {
        render(<ProjectHistoryTab project={mockProject} />);

        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Created project')).toBeInTheDocument();
        expect(screen.getByText('CREATE')).toBeInTheDocument();
    });
});

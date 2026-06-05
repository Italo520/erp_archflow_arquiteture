import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectTeamTab from '@/components/projects/ProjectTeamTab';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Mail: () => <div data-testid="mail-icon" />,
    Phone: () => <div data-testid="phone-icon" />,
    UserPlus: () => <div data-testid="user-plus-icon" />,
    MoreHorizontal: () => <div data-testid="more-icon" />,
    Shield: () => <div data-testid="shield-icon" />,
    ExternalLink: () => <div data-testid="external-link-icon" />,
}));

describe('ProjectTeamTab', () => {
    const mockProject = {
        id: '1',
        members: [
            {
                id: 'm1',
                role: 'EDITOR',
                user: {
                    id: 'a1',
                    fullName: 'Alice Architect',
                    email: 'alice@archflow.com',
                    avatarUrl: ''
                }
            }
        ],
        client: { id: 'c1', name: 'Charlie Client', email: 'charlie@gmail.com' }
    };

    it('renders project team correctly', () => {
        render(<ProjectTeamTab project={mockProject} />);

        expect(screen.getByText('Alice Architect')).toBeInTheDocument();
        expect(screen.getByText('Editor')).toBeInTheDocument();
        expect(screen.getByText('Charlie Client')).toBeInTheDocument();
        expect(screen.getByText('Cliente')).toBeInTheDocument();
    });
});

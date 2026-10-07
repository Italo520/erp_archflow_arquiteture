import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectDeliverablesTab from '@/components/projects/ProjectDeliverablesTab';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    FileText: () => <div data-testid="file-icon" />,
    Image: () => <div data-testid="image-icon" />,
    Download: () => <div data-testid="download-icon" />,
    MoreVertical: () => <div data-testid="more-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    FileImage: () => <div data-testid="file-image-icon" />,
    Layout: () => <div data-testid="layout-icon" />,
}));

describe('ProjectDeliverablesTab', () => {
    const mockProject = {
        id: '1',
        deliverables: [
            {
                id: 'd1',
                name: 'Sketch 1',
                type: 'SKETCH',
                status: 'APPROVED',
                version: 1
            },
            {
                id: 'd2',
                name: 'Render 1',
                type: 'RENDER_3D',
                status: 'PENDING_REVIEW',
                version: 2,
                fileUrl: 'http://example.com/image.jpg'
            }
        ]
    };

    it('renders deliverables list correctly', () => {
        render(<ProjectDeliverablesTab project={mockProject} />);

        expect(screen.getByText('Sketch 1')).toBeInTheDocument();
        expect(screen.getByText('Render 1')).toBeInTheDocument();
        expect(screen.getByText('Aprovado')).toBeInTheDocument();
        expect(screen.getByText('Em Revisão')).toBeInTheDocument();
    });

    it('renders empty state when no deliverables', () => {
        render(<ProjectDeliverablesTab project={{ id: '1', deliverables: [] }} />);
        expect(screen.getByText('Nenhum entregável cadastrado')).toBeInTheDocument();
    });
});

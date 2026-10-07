import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewActivityButton } from '@/components/projects/NewActivityButton';

// Mock the ActivityForm component
jest.mock('@/components/activities/ActivityForm', () => ({
    ActivityForm: ({ initialData, projects, clients, onSuccess }: any) => (
        <div data-testid="mock-activity-form">
            <span>Mocked ActivityForm</span>
            <span>Project: {projects[0]?.name}</span>
            <span>Client: {clients[0]?.name || 'None'}</span>
            <button onClick={onSuccess} data-testid="success-btn">Success</button>
        </div>
    )
}));

describe('NewActivityButton Component', () => {
    const mockProject = {
        id: 'project-123',
        name: 'Projeto Teste',
        clientId: 'client-456',
        client: {
            id: 'client-456',
            name: 'Cliente Teste'
        }
    };

    it('renders the New Activity button', () => {
        render(<NewActivityButton project={mockProject} />);
        expect(screen.getByText('Nova Atividade')).toBeInTheDocument();
    });

    it('opens the dialog and renders the ActivityForm with correct props when clicked', () => {
        render(<NewActivityButton project={mockProject} />);
        
        // Open the dialog
        const button = screen.getByText('Nova Atividade');
        fireEvent.click(button);
        
        // Check if Dialog title and Mocked form are present
        expect(screen.getByText('Criar Atividade no Projeto')).toBeInTheDocument();
        expect(screen.getByTestId('mock-activity-form')).toBeInTheDocument();
        expect(screen.getByText('Project: Projeto Teste')).toBeInTheDocument();
        expect(screen.getByText('Client: Cliente Teste')).toBeInTheDocument();
    });

    it('closes the dialog on form success', () => {
        render(<NewActivityButton project={mockProject} />);
        
        // Open the dialog
        const button = screen.getByText('Nova Atividade');
        fireEvent.click(button);
        
        // Form is present
        expect(screen.getByTestId('mock-activity-form')).toBeInTheDocument();
        
        // Trigger onSuccess in mock form
        const successButton = screen.getByTestId('success-btn');
        fireEvent.click(successButton);
        
        // Dialog should be closed
        expect(screen.queryByTestId('mock-activity-form')).not.toBeInTheDocument();
    });
});

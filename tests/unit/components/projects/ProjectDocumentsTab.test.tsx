import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectDocumentsTab from '@/components/projects/ProjectDocumentsTab';
import { useRouter } from 'next/navigation';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    FileText: () => <div data-testid="file-text-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    ExternalLink: () => <div data-testid="external-link-icon" />,
    Upload: () => <div data-testid="upload-icon" />,
    Download: () => <div data-testid="download-icon" />,
    Search: () => <div data-testid="search-icon" />,
    File: () => <div data-testid="file-icon" />,
    MoreHorizontal: () => <div data-testid="more-icon" />
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock Server Actions
jest.mock('@/app/actions/project', () => ({
    uploadProjectDocument: jest.fn(),
    deleteProjectDocument: jest.fn(),
}));

describe('ProjectDocumentsTab', () => {
    const mockProject = {
        id: '1',
        attachedDocuments: [
            { name: 'Documento 1.pdf', url: 'http://example.com/doc1.pdf', uploadedAt: '2023-01-01' },
            { name: 'Imagem 1.jpg', url: 'http://example.com/img1.jpg', uploadedAt: '2023-02-01' }
        ]
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ refresh: jest.fn() });
    });

    it('renders documents table correctly', () => {
        render(<ProjectDocumentsTab project={mockProject} />);

        expect(screen.getByText('Documento 1.pdf')).toBeInTheDocument();
        expect(screen.getByText('Imagem 1.jpg')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('JPG')).toBeInTheDocument();
    });

    it('filters documents by search query', () => {
        render(<ProjectDocumentsTab project={mockProject} />);

        const searchInput = screen.getByPlaceholderText(/buscar documentos/i);
        fireEvent.change(searchInput, { target: { value: 'Documento' } });

        expect(screen.getByText('Documento 1.pdf')).toBeInTheDocument();
        expect(screen.queryByText('Imagem 1.jpg')).not.toBeInTheDocument();
    });

    it('shows add document form when button clicked', () => {
        render(<ProjectDocumentsTab project={mockProject} />);
        const addButton = screen.getByText('Novo Documento');
        fireEvent.click(addButton);

        expect(screen.getByPlaceholderText(/ex: Contrato Arquitetônico Villa/i)).toBeInTheDocument();
    });
});

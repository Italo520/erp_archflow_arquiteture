import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectTeamTab from '@/components/projects/ProjectTeamTab';
import { listUsers } from '@/app/actions/user';
import { associateArchitect, removeArchitect } from '@/app/actions/project';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: jest.fn(),
    }),
}));

jest.mock('@/app/actions/user', () => ({
    listUsers: jest.fn(),
}));

jest.mock('@/app/actions/project', () => ({
    associateArchitect: jest.fn(),
    removeArchitect: jest.fn(),
}));

// Mocking Radix/Shadcn Components to render inline in JSDOM tests
jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => children,
    DropdownMenuTrigger: ({ children }: any) => children,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick} className="cursor-pointer">{children}</div>,
}));

jest.mock('@/components/ui/dialog', () => {
    const React = require('react');
    const DialogContext = React.createContext({ open: false, onOpenChange: (_val: boolean) => {} });
    return {
        Dialog: ({ children, open, onOpenChange }: any) => (
            <DialogContext.Provider value={{ open, onOpenChange }}>
                <div data-testid="dialog-root">{children}</div>
            </DialogContext.Provider>
        ),
        DialogTrigger: ({ children }: any) => {
            const { onOpenChange } = React.useContext(DialogContext);
            if (React.isValidElement(children)) {
                return React.cloneElement(children as React.ReactElement<any>, {
                    onClick: (e: any) => {
                        if (children.props.onClick) children.props.onClick(e);
                        onOpenChange?.(true);
                    }
                });
            }
            return children;
        },
        DialogContent: ({ children }: any) => {
            const { open } = React.useContext(DialogContext);
            return open ? <div data-testid="dialog-content">{children}</div> : null;
        },
        DialogHeader: ({ children }: any) => <div>{children}</div>,
        DialogTitle: ({ children }: any) => <div>{children}</div>,
    };
});

jest.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange, value }: any) => (
        <select onChange={(e) => onValueChange(e.target.value)} value={value} data-testid="select-mock">
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => children,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => children,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

describe('ProjectTeamTab Component', () => {
    const mockProject = {
        id: 'project-123',
        name: 'Projeto de Teste',
        client: {
            id: 'client-456',
            name: 'Cliente Maria',
            email: 'maria@cliente.com'
        },
        members: [
            {
                id: 'member-1',
                role: 'EDITOR',
                user: {
                    id: 'user-1',
                    fullName: 'Arquiteto João',
                    email: 'joao@arquitetura.com',
                    avatarUrl: ''
                }
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock responses
        (listUsers as jest.Mock).mockResolvedValue({
            success: true,
            data: [
                { id: 'user-2', fullName: 'Arquiteto Pedro', email: 'pedro@arquitetura.com' },
                { id: 'user-1', fullName: 'Arquiteto João', email: 'joao@arquitetura.com' } // already in project
            ]
        });
        (associateArchitect as jest.Mock).mockResolvedValue({ success: true });
        (removeArchitect as jest.Mock).mockResolvedValue({ success: true });
    });

    it('renders project members and clients correctly', () => {
        render(<ProjectTeamTab project={mockProject} />);

        // Verify title
        expect(screen.getByText('Equipe do Projeto')).toBeInTheDocument();

        // Verify internal member
        expect(screen.getByText('Arquiteto João')).toBeInTheDocument();
        expect(screen.getByText('joao@arquitetura.com')).toBeInTheDocument();
        expect(screen.getByText('Editor')).toBeInTheDocument();

        // Verify stakeholder/client
        expect(screen.getByText('Cliente Maria')).toBeInTheDocument();
        expect(screen.getByText('maria@cliente.com')).toBeInTheDocument();
    });

    it('opens add member dialog and fetches users on click', async () => {
        render(<ProjectTeamTab project={mockProject} />);

        const addButton = screen.getByRole('button', { name: /Adicionar Membro/i });
        fireEvent.click(addButton);

        // Check if Dialog opens
        expect(screen.getByText('Adicionar Membro à Equipe')).toBeInTheDocument();

        // Should call listUsers to get users list
        await waitFor(() => {
            expect(listUsers).toHaveBeenCalled();
        });
    });

    it('calls removeArchitect when remove action is clicked', async () => {
        window.confirm = jest.fn(() => true);
        render(<ProjectTeamTab project={mockProject} />);

        // Open Dropdown
        const menuButton = screen.getAllByRole('button').find(
            btn => btn.className.includes('h-8') && btn.className.includes('w-8')
        );
        
        if (!menuButton) throw new Error('Menu button not found');
        fireEvent.click(menuButton);

        // Find and click "Remover do Projeto"
        const removeOption = screen.getByText('Remover do Projeto');
        fireEvent.click(removeOption);

        expect(window.confirm).toHaveBeenCalledWith('Deseja realmente remover este membro do projeto?');
        expect(removeArchitect).toHaveBeenCalledWith('project-123', 'user-1');
    });
});

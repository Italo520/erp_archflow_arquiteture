import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectTasksTab from '@/components/projects/ProjectTasksTab';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    Search: () => <div data-testid="search-icon" />,
    Filter: () => <div data-testid="filter-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    AlertCircle: () => <div data-testid="alert-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
    MoreVertical: () => <div data-testid="more-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    ChevronDown: () => <div data-testid="chevron-down" />,
}));

// Mock Radix UI Select
jest.mock('@radix-ui/react-select', () => {
    const Select = ({ children, value, onValueChange }: any) => (
        <div data-testid="select-root" data-value={value} onClick={() => onValueChange && onValueChange('IN_PROGRESS')}>
            {children}
        </div>
    );
    const Trigger = ({ children }: any) => <button>{children}</button>;
    const Value = ({ placeholder }: any) => <span>{placeholder}</span>;
    const Portal = ({ children }: any) => <div>{children}</div>;
    const Content = ({ children }: any) => <div>{children}</div>;
    const Item = ({ children, value }: any) => <div data-testid={`select-item-${value}`}>{children}</div>;
    const ItemText = ({ children }: any) => <span>{children}</span>;
    const ItemIndicator = () => null;
    const Viewport = ({ children }: any) => <div>{children}</div>;
    const Icon = ({ children }: any) => <div>{children}</div>;
    const Group = ({ children }: any) => <div>{children}</div>;
    const Label = ({ children }: any) => <div>{children}</div>;
    const Separator = () => null;
    const ScrollUpButton = () => null;
    const ScrollDownButton = () => null;

    Trigger.displayName = "SelectTrigger";
    Value.displayName = "SelectValue";
    Content.displayName = "SelectContent";
    Item.displayName = "SelectItem";
    Label.displayName = "SelectLabel";
    Separator.displayName = "SelectSeparator";
    ScrollUpButton.displayName = "SelectScrollUpButton";
    ScrollDownButton.displayName = "SelectScrollDownButton";

    return {
        Root: Select,
        Trigger,
        Value,
        Portal,
        Content,
        Item,
        ItemText,
        ItemIndicator,
        Viewport,
        Icon,
        Group,
        Label,
        Separator,
        ScrollUpButton,
        ScrollDownButton,
    };
});

describe('ProjectTasksTab', () => {
    const mockProject = {
        id: '1',
        tasks: [
            {
                id: 't1',
                title: 'Task 1',
                status: 'PENDING',
                priority: 'HIGH',
                dueDate: '2023-12-01',
                assignee: { fullName: 'John Doe' }
            },
            {
                id: 't2',
                title: 'Task 2',
                status: 'COMPLETED',
                priority: 'LOW'
            }
        ]
    };

    it('renders task list correctly', () => {
        render(<ProjectTasksTab project={mockProject} />);

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();

        // Priority labels might appear in the filters and in the cards
        expect(screen.getAllByText('Alta').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Baixa').length).toBeGreaterThanOrEqual(1);
    });

    it('filters tasks by search query', () => {
        render(<ProjectTasksTab project={mockProject} />);

        const searchInput = screen.getByPlaceholderText(/buscar tarefas/i);
        fireEvent.change(searchInput, { target: { value: 'Task 1' } });

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    it('renders empty state when no tasks found', () => {
        render(<ProjectTasksTab project={mockProject} />);

        const searchInput = screen.getByPlaceholderText(/buscar tarefas/i);
        fireEvent.change(searchInput, { target: { value: 'Non-existent task' } });

        expect(screen.getByText('Nenhuma tarefa encontrada')).toBeInTheDocument();
    });

    it('shows assignee name if present', () => {
        render(<ProjectTasksTab project={mockProject} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});

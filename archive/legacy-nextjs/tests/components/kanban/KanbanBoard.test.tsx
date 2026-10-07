import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanBoard from '@/components/kanban/KanbanBoard';

// Mock the dnd-kit context so it doesn't crash in JSDOM
jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    closestCorners: jest.fn(),
    KeyboardSensor: jest.fn(),
    MouseSensor: jest.fn(),
    TouchSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: jest.fn(),
    defaultDropAnimationSideEffects: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    arrayMove: jest.fn(),
    sortableKeyboardCoordinates: jest.fn(),
    horizontalListSortingStrategy: jest.fn(),
}));

jest.mock('@/app/actions/task', () => ({
    updateTaskPositions: jest.fn(),
}));

jest.mock('@/app/actions/stage', () => ({
    updateStageOrder: jest.fn(),
}));

jest.mock('@/components/kanban/Column', () => ({
    KanbanColumn: () => <div data-testid="kanban-column">Column</div>,
}));

jest.mock('@/components/kanban/TaskListView', () => ({
    TaskListView: () => <div data-testid="task-list-view">List View</div>,
}));

jest.mock('@/components/kanban/AddColumnButton', () => ({
    AddColumnButton: () => <button data-testid="add-column">Add</button>,
}));

// We need to mock createPortal for DragOverlay
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
}));

describe('KanbanBoard component', () => {
    const mockProject = {
        id: '1',
        name: 'Projeto de Arquitetura',
        stages: [
            { id: 's1', name: 'A Fazer', tasks: [{ id: 't1', title: 'Task 1' }] }
        ]
    };

    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    it('renders the project name and default kanban view', () => {
        render(<KanbanBoard project={mockProject} />);
        
        expect(screen.getByText('Projeto de Arquitetura')).toBeInTheDocument();
        expect(screen.getByTestId('kanban-column')).toBeInTheDocument();
        expect(screen.queryByTestId('task-list-view')).not.toBeInTheDocument();
    });

    it('switches to list view when button is clicked', () => {
        render(<KanbanBoard project={mockProject} />);
        
        const listBtn = screen.getByRole('button', { name: /Lista/i });
        fireEvent.click(listBtn);

        expect(screen.getByTestId('task-list-view')).toBeInTheDocument();
        expect(screen.queryByTestId('kanban-column')).not.toBeInTheDocument();
        expect(window.localStorage.getItem('kanbanViewMode')).toBe('list');
    });

    it('reads initial view mode from localStorage', () => {
        window.localStorage.setItem('kanbanViewMode', 'list');
        render(<KanbanBoard project={mockProject} />);
        
        expect(screen.getByTestId('task-list-view')).toBeInTheDocument();
    });
});

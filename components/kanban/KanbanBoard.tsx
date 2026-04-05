'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    SortableContext
} from '@dnd-kit/sortable';
import { updateTaskPositions } from '@/actions/task';
import { updateStageOrder } from '@/actions/stage';
import Link from 'next/link';
import { KanbanColumn } from './Column';
import { TaskCard } from './TaskCard';
import { ArrowLeft } from 'lucide-react';
import { TaskDetails } from './TaskDetails';
import { createPortal } from 'react-dom';

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export default function KanbanBoard({ project }) {
    const [stages, setStages] = useState(project.stages);
    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const stagesIds = useMemo(() => stages.map((stage) => stage.id), [stages]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findStage = (id) => {
        const stage = stages.find(s => s.id === id);
        if (stage) return stage;
        return stages.find(s => s.tasks.some(t => t.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current?.type === 'Column') {
            setActiveColumn(active.data.current.stage);
            return;
        }

        if (active.data.current?.type === 'Task') {
            setActiveTask(active.data.current.task);
            return;
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) return;

        // Im dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setStages((stages) => {
                const activeStageIndex = stages.findIndex((stage) =>
                    stage.tasks.some((task) => task.id === activeId)
                );
                const overStageIndex = stages.findIndex((stage) =>
                    stage.tasks.some((task) => task.id === overId)
                );

                if (activeStageIndex === -1 || overStageIndex === -1) return stages;

                const activeStage = stages[activeStageIndex];
                const overStage = stages[overStageIndex];

                const activeTaskIndex = activeStage.tasks.findIndex((task) => task.id === activeId);
                const overTaskIndex = overStage.tasks.findIndex((task) => task.id === overId);

                // Same column
                if (activeStageIndex === overStageIndex) {
                    const newStages = [...stages];
                    newStages[activeStageIndex].tasks = arrayMove(
                        newStages[activeStageIndex].tasks,
                        activeTaskIndex,
                        overTaskIndex
                    );
                    return newStages;
                }

                // Different column
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                const newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : overStage.tasks.length + 1;

                const newStages = [...stages];
                const [movedTask] = newStages[activeStageIndex].tasks.splice(activeTaskIndex, 1);
                movedTask.stageId = overStage.id;
                newStages[overStageIndex].tasks.splice(newIndex, 0, movedTask);

                return newStages;
            });
        }

        // Im dropping a Task over a Column
        const isOverColumn = over.data.current?.type === 'Column';
        if (isActiveTask && isOverColumn) {
            setStages((stages) => {
                const activeStageIndex = stages.findIndex((stage) =>
                    stage.tasks.some((task) => task.id === activeId)
                );
                const overStageIndex = stages.findIndex((stage) => stage.id === overId);

                if (activeStageIndex === -1 || overStageIndex === -1) return stages;
                if (activeStageIndex === overStageIndex) return stages;

                const newStages = [...stages];
                const activeStage = newStages[activeStageIndex];
                const overStage = newStages[overStageIndex];

                const activeTaskIndex = activeStage.tasks.findIndex((task) => task.id === activeId);
                const [movedTask] = activeStage.tasks.splice(activeTaskIndex, 1);

                movedTask.stageId = overStage.id;
                overStage.tasks.push(movedTask);

                return newStages;
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeColumnId = active.id;
        const overColumnId = over?.id;

        setActiveColumn(null);
        setActiveTask(null);

        if (!over) return;

        // Column Reorder
        if (active.data.current?.type === 'Column') {
            if (activeColumnId === overColumnId) return;

            setStages((stages) => {
                const activeIndex = stages.findIndex((s) => s.id === activeColumnId);
                const overIndex = stages.findIndex((s) => s.id === overColumnId);
                return arrayMove(stages, activeIndex, overIndex);
            });

            // Persist column order
            const newStages = arrayMove(stages,
                stages.findIndex((s) => s.id === activeColumnId),
                stages.findIndex((s) => s.id === overColumnId)
            );

            const updates = newStages.map((stage: any, index) => ({
                id: stage.id,
                order: index
            }));

            await updateStageOrder(project.id, updates);
            return;
        }

        // Task Reorder persistence
        // The visual state is already updated in handleDragOver for cross-column
        // For same-column, we need to ensure local state is correct if DragOver didn't catch it (it usually does for sortable)
        // Actually, dnd-kit sortable reorder is usually done in DragEnd for same-container if using SortableContext
        // BUT we are manually handling ALL state updates in DragOver for smoother UX, OR we can do it here.

        // Wait, for SAME container, SortableContext requires arrayMove in DragEnd if not done in DragOver?
        // In my DragOver logic above:
        // - Task over Task (same column): I AM doing arrayMove in DragOver. This is aggressive but gives realtime feedback.
        // - Task over Task (diff column): I AM moving it.
        // - Task over Column: I AM moving it.

        // So the state 'stages' is already visually correct.
        // We just need to persist the FINAL state of 'stages' to DB.

        const updates = [];
        stages.forEach(stage => {
            stage.tasks.forEach((task, index) => {
                updates.push({
                    id: task.id,
                    position: index,
                    stageId: stage.id
                });
            });
        });

        await updateTaskPositions(project.id, updates);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
                <header className="h-16 flex-none bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark flex items-center justify-between px-6 lg:px-10">
                    <div className="flex flex-col">
                        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-primary mb-1 flex items-center gap-1">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Voltar para Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                    </div>
                </header>

                <div className="flex-1 flex overflow-x-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 items-start">
                    <SortableContext items={stagesIds} strategy={horizontalListSortingStrategy}>
                        {stages.map(stage => (
                            <KanbanColumn
                                key={stage.id}
                                stage={stage}
                                tasks={stage.tasks}
                                projectId={project.id}
                                onTaskClick={setSelectedTask}
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>

            {typeof window !== 'undefined' && createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeColumn && (
                        <KanbanColumn
                            stage={activeColumn}
                            tasks={activeColumn.tasks}
                            projectId={project.id}
                            onTaskClick={() => { }}
                        />
                    )}
                    {activeTask && <TaskCard task={activeTask} onClick={() => { }} />}
                </DragOverlay>,
                document.body
            )}

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    projectId={project.id}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </DndContext>
    );
}

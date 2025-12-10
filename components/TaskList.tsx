import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Task, TimerMode } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  timerMode: TimerMode;
  onAddTask: (title: string, est: number) => void;
  onUpdateTask: (id: string, newTitle: string, newEst?: number, newNote?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (id: string) => void;
  onReorderTasks: (oldIndex: number, newIndex: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  timerMode,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onSelectTask,
  onReorderTasks
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEst, setNewTaskEst] = useState(1);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over?.id);

      onReorderTasks(oldIndex, newIndex);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, newTaskEst);
      setNewTaskTitle('');
      setNewTaskEst(1);
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-50 border-r border-stone-200">

      {/* Header */}
      <div className="p-6 border-b border-stone-200 bg-white shadow-sm z-10">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-serif text-xl font-bold text-stone-900">Your Tasks</h2>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
          )}
        </div>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider">
          {tasks.filter(t => !t.isCompleted).length} Pending
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* Add Task Form */}
        {isAdding && (
          <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-morandi-red/20 mb-6 animate-fade-in">
            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="New task..."
                className="w-full text-lg font-medium text-stone-800 placeholder-stone-300 outline-none mb-4 bg-transparent"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-stone-50 rounded-lg p-1 border border-stone-100">
                  <button type="button" onClick={() => setNewTaskEst(Math.max(1, newTaskEst - 1))} className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-white rounded"><i className="fa-solid fa-minus text-[10px]"></i></button>
                  <span className="w-8 text-center font-bold text-stone-700 text-sm">{newTaskEst}</span>
                  <button type="button" onClick={() => setNewTaskEst(Math.min(10, newTaskEst + 1))} className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-white rounded"><i className="fa-solid fa-plus text-[10px]"></i></button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-stone-400 hover:text-stone-600 text-sm font-medium">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-black shadow-sm">Add</button>
                </div>
              </div>
            </form>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={activeTaskId === task.id}
                isExpanded={expandedTaskId === task.id}
                timerMode={timerMode}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onSelect={onSelectTask}
                onUpdate={onUpdateTask}
                onExpand={() => setExpandedTaskId(task.id)}
                onCollapse={() => setExpandedTaskId(null)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {tasks.length === 0 && !isAdding && (
          <div className="text-center py-16 text-stone-400">
            <i className="fa-regular fa-clipboard mb-4 text-2xl opacity-20"></i>
            <p>No tasks yet. Start by adding one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
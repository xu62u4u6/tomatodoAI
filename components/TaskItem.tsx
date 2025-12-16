import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TimerMode } from '../types';

interface TaskItemProps {
    task: Task;
    isActive: boolean;
    isExpanded: boolean;
    timerMode: TimerMode;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
    onUpdate: (id: string, newTitle: string, newEst: number, newNote: string) => void;
    onExpand: (id: string) => void;
    onCollapse: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    isActive,
    isExpanded,
    timerMode,
    onToggle,
    onDelete,
    onSelect,
    onUpdate,
    onExpand,
    onCollapse
}) => {
    // DnD Hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1
    };

    // Local editing state
    const [editingTitle, setEditingTitle] = useState(task.title);
    const [editingEst, setEditingEst] = useState(task.estPomodoros);
    const [editingNote, setEditingNote] = useState(task.note || '');

    // Reset local state when task changes or expansion changes
    useEffect(() => {
        if (isExpanded) {
            setEditingTitle(task.title);
            setEditingEst(task.estPomodoros);
            setEditingNote(task.note || '');
        }
    }, [isExpanded, task]);

    const saveEditing = () => {
        if (editingTitle.trim()) {
            onUpdate(task.id, editingTitle, editingEst, editingNote);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        relative group transition-all duration-300 ease-out flex flex-col mb-3
        ${isExpanded
                    ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-stone-900/5 z-10 rounded-2xl scale-[1.02]'
                    : `hover:bg-white hover:shadow-sm rounded-xl border border-transparent hover:border-stone-200 
             ${isActive ? `bg-white border-l-4 border-theme shadow-sm` : 'bg-transparent border-l-4 border-l-transparent'}`
                }
        ${task.isCompleted && !isExpanded ? 'opacity-50 grayscale-[0.5]' : ''}
      `}
        >
            {/* Header / Summary View */}
            <div className="p-4 flex items-center gap-3">

                {/* Drag Handle (Button) */}
                <button
                    className="text-stone-300 cursor-grab hover:text-stone-500 p-1 outline-none touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <i className="fa-solid fa-grip-vertical text-xs"></i>
                </button>

                {/* Status Toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                    className={`
            w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0
            ${task.isCompleted
                            ? 'bg-stone-400 text-white'
                            : `border-2 border-stone-300 hover:border-theme text-transparent hover:text-theme`
                        }
          `}
                >
                    <i className="fa-solid fa-check text-[10px]"></i>
                </button>

                {/* Title & Content */}
                <div className="flex-1 min-w-0">
                    {isExpanded ? (
                        <textarea
                            value={editingTitle}
                            onChange={(e) => {
                                setEditingTitle(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            ref={(el) => {
                                if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                }
                            }}
                            onBlur={saveEditing}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                            }}
                            className="w-full font-serif text-xl font-bold text-stone-800 bg-transparent border-none p-0 focus:ring-0 placeholder-stone-300 resize-none overflow-hidden"
                            placeholder="Task Title"
                            autoFocus
                            rows={1}
                        />
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className={`font-medium text-stone-800 truncate ${task.isCompleted ? 'line-through text-stone-400' : ''}`}>
                                {task.title}
                            </span>
                        </div>
                    )}

                    {/* Metadata */}
                    {!isExpanded && (
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                                <i className={`fa-solid fa-fire text-theme opacity-70`}></i>
                                {task.actPomodoros} / {task.estPomodoros}
                            </span>
                            {task.note && <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">Note</span>}
                        </div>
                    )}
                </div>

                {/* Actions (Focus & Expand) - Visible on Hover or when Active */}
                {!isExpanded && (
                    <div className={`flex items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>

                        {/* Focus Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(task.id); }}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isActive ? `bg-theme text-white hover:bg-theme/90` : 'text-stone-400 hover:bg-stone-100 hover:text-stone-800'}`}
                            title="Focus on this task"
                        >
                            <i className="fa-solid fa-play text-xs pl-0.5"></i>
                        </button>

                        {/* Expand/Edit Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onExpand(task.id); }}
                            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-800 rounded-full transition-colors"
                            title="Edit details"
                        >
                            <i className="fa-solid fa-up-right-and-down-left-from-center text-xs"></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Details Body */}
            {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">

                    {/* Pomodoro Counter Control */}
                    <div className="flex items-center gap-4 mb-4 py-2 border-t border-b border-stone-100">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Target</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setEditingEst(Math.max(1, editingEst - 1)); saveEditing(); }} className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"><i className="fa-solid fa-minus text-[10px]"></i></button>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-lg text-stone-800">{editingEst}</span>
                                <span className="text-xs text-stone-400">pomodoros</span>
                            </div>
                            <button onClick={() => { setEditingEst(Math.min(10, editingEst + 1)); saveEditing(); }} className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"><i className="fa-solid fa-plus text-[10px]"></i></button>
                        </div>
                    </div>

                    {/* Notes Area */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Notes</span>
                        </div>
                        <textarea
                            value={editingNote}
                            onChange={(e) => setEditingNote(e.target.value)}
                            onBlur={saveEditing}
                            placeholder="Add details, links, or thoughts here..."
                            className="w-full min-h-[120px] p-3 text-sm text-stone-700 bg-stone-50 rounded-lg border border-transparent focus:bg-white focus:border-stone-200 focus:ring-2 focus:ring-stone-100 transition-all resize-none leading-relaxed"
                        />
                    </div>

                    {/* Actions Footer */}
                    <div className="flex justify-between items-center pt-2">
                        <button
                            onClick={() => onDelete(task.id)}
                            className="text-xs text-stone-400 hover:text-morandi-red flex items-center gap-1.5 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                        >
                            <i className="fa-regular fa-trash-can"></i>
                            Delete
                        </button>
                        <button
                            onClick={onCollapse}
                            className="text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

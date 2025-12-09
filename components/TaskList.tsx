import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (title: string, est: number) => void;
  onUpdateTask: (id: string, newTitle: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onSelectTask
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEst, setNewTaskEst] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, newTaskEst);
      setNewTaskTitle('');
      setNewTaskEst(1);
      setIsAdding(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEditing = (id: string) => {
    if (editingTitle.trim()) {
      onUpdateTask(id, editingTitle);
    }
    setEditingTaskId(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      
      {/* Header section similar to 'Projects' screenshot */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-serif text-3xl text-stone-900">Tasks</h2>
          <p className="text-stone-500 text-sm mt-1">Organize your flow</p>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="group flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Active Focus Display */}
      {activeTaskId && tasks.find(t => t.id === activeTaskId && !t.isCompleted) && (
        <div className="mb-8 p-6 bg-white border border-stone-100 rounded-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] text-center relative overflow-hidden group">
           {/* Uses Morandi Red for focus context */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-morandi-red to-stone-300 opacity-80"></div>
           <span className="text-xs font-semibold text-morandi-red uppercase tracking-widest mb-2 block">Current Focus</span>
           <h3 className="font-serif text-2xl text-stone-800">
             {tasks.find(t => t.id === activeTaskId)?.title}
           </h3>
           <div className="mt-4 flex justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-800 animate-pulse"></span>
           </div>
        </div>
      )}

      {/* Task List - Clean Grid/Row Style */}
      <div className="space-y-1">
        {tasks.map(task => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`
              group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200
              ${activeTaskId === task.id ? 'bg-white shadow-sm ring-1 ring-stone-200' : 'hover:bg-white/60 hover:shadow-sm'}
              ${task.isCompleted ? 'opacity-50' : 'opacity-100'}
            `}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                className={`
                  w-5 h-5 rounded border flex items-center justify-center transition-all
                  ${task.isCompleted 
                    ? 'bg-stone-800 border-stone-800' 
                    : 'border-stone-400 hover:border-morandi-red group-hover:border-stone-600'
                  }
                `}
              >
                {task.isCompleted && <i className="fa-solid fa-check text-white text-[10px]"></i>}
              </button>
              
              {editingTaskId === task.id ? (
                 <input 
                   autoFocus
                   type="text" 
                   value={editingTitle}
                   onChange={(e) => setEditingTitle(e.target.value)}
                   className="bg-transparent border-b border-stone-300 focus:border-stone-800 outline-none w-full font-medium text-stone-800"
                   onBlur={() => saveEditing(task.id)}
                   onClick={(e) => e.stopPropagation()}
                   onKeyDown={(e) => {
                     if(e.key === 'Enter') saveEditing(task.id);
                   }}
                 />
              ) : (
                <span 
                  className={`font-medium text-lg font-sans ${task.isCompleted ? 'line-through text-stone-400' : 'text-stone-700'}`}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing(task);
                  }}
                >
                  {task.title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="text-sm font-medium text-stone-400 flex items-center justify-end gap-1 min-w-[30px]">
                <span className={task.actPomodoros > 0 ? 'text-stone-800' : ''}>{task.actPomodoros}</span>
                <span className="text-stone-300">/</span>
                <span>{task.estPomodoros}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-morandi-red transition-colors opacity-0 group-hover:opacity-100"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && !isAdding && (
          <div className="text-center py-16 text-stone-400">
             <i className="fa-regular fa-clipboard mb-4 text-2xl opacity-20"></i>
             <p>No tasks yet. Start by adding one.</p>
          </div>
        )}
      </div>

      {/* Add Task Form - Inline */}
      {isAdding && (
        <div className="mt-4 p-6 bg-white rounded-xl shadow-lg border border-stone-100 animate-fade-in">
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="text"
              placeholder="What needs to be done?"
              className="w-full text-xl font-serif text-stone-800 placeholder-stone-300 outline-none mb-6 bg-transparent"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            
            <div className="flex items-center justify-between border-t border-stone-100 pt-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Est. Pomodoros</label>
                <div className="flex items-center bg-stone-50 rounded-lg p-1">
                  <button type="button" onClick={() => setNewTaskEst(Math.max(1, newTaskEst - 1))} className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-white rounded"><i className="fa-solid fa-minus text-[10px]"></i></button>
                  <span className="w-8 text-center font-bold text-stone-700">{newTaskEst}</span>
                  <button type="button" onClick={() => setNewTaskEst(Math.min(10, newTaskEst + 1))} className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-white rounded"><i className="fa-solid fa-plus text-[10px]"></i></button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-stone-900 text-white rounded-lg font-medium text-sm hover:bg-stone-800 shadow-lg shadow-stone-200"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
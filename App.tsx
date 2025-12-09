import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { ChatSidebar } from './components/ChatSidebar';
import { TimerMode, Task } from './types';
import { TIMER_SETTINGS } from './constants';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  // --- Global State ---
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.Pomodoro);
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_SETTINGS[TimerMode.Pomodoro]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile responsiveness

  // Initial load
  React.useEffect(() => {
    const load = async () => {
      const savedTasks = await storageService.loadTasks();
      if (savedTasks.length > 0) {
        setTasks(savedTasks);
        // Restore active task if possible, or default to first
        if (savedTasks.length > 0) setActiveTaskId(savedTasks[0].id);
      } else {
        // Default tasks for new users
        const defaults: Task[] = [
          { id: '1', title: 'Plan project architecture', estPomodoros: 3, actPomodoros: 0, isCompleted: false },
          { id: '2', title: 'Design system setup', estPomodoros: 2, actPomodoros: 1, isCompleted: true },
        ];
        setTasks(defaults);
        setActiveTaskId(defaults[0].id);
      }
    };
    load();
  }, []);

  // Persist tasks
  React.useEffect(() => {
    // Only save if tasks have been loaded/initialized (simple check: length > 0 or separate loaded flag)
    // Actually storageService.saveTasks handles the array.
    // We should be careful not to overwrite with [] if we haven't loaded yet.
    // But since we set defaults if empty, tasks shouldn't be empty unless user deleted everything.
    // Let's just save.
    if (tasks.length > 0 || activeTaskId !== null) { // Simple heuristic to avoid saving initial [] before load
      storageService.saveTasks(tasks);
    }
  }, [tasks]);

  // --- Handlers ---

  const handleAddTask = (title: string, est: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      estPomodoros: est,
      actPomodoros: 0,
      isCompleted: false,
    };
    setTasks(prev => [...prev, newTask]);
    // Optionally set active if it's the first task
    if (!activeTaskId && tasks.length === 0) setActiveTaskId(newTask.id);
  };

  const handleUpdateTask = (id: string, newTitle: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const handleSelectTask = (id: string) => {
    setActiveTaskId(id);
  };

  const handleTimerComplete = () => {
    if (timerMode === TimerMode.Pomodoro && activeTaskId) {
      setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, actPomodoros: t.actPomodoros + 1 } : t));
    }
    // Play sound notification here (optional for now)
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  const getBgColor = () => {
    switch (timerMode) {
      case TimerMode.ShortBreak:
        return 'bg-short-break-bg';
      case TimerMode.LongBreak:
        return 'bg-long-break-bg';
      default:
        return 'bg-pomodoro-bg';
    }
  };

  return (
    <div className={`min-h-screen ${getBgColor()} text-stone-900 font-sans transition-colors duration-500 ease-in-out`}>

      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto w-full z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-morandi-red flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-check text-sm"></i>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-800">TomatodoAI</h1>
        </div>

        <div className="flex gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-stone-600 border border-stone-200 rounded-full hover:bg-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </header>

      <main className="flex flex-col md:flex-row h-[calc(100vh-80px)] max-w-7xl mx-auto overflow-hidden">

        {/* Left/Center Column - Timer & Tasks */}
        <section className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 scrollbar-hide">
          <div className="max-w-2xl mx-auto w-full">
            <Timer
              mode={timerMode}
              setMode={setTimerMode}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              isRunning={isTimerRunning}
              setIsRunning={setIsTimerRunning}
              onTimerComplete={handleTimerComplete}
            />

            <TaskList
              tasks={tasks}
              activeTaskId={activeTaskId}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSelectTask={handleSelectTask}
            />
          </div>
        </section>

        {/* Right Sidebar - Chat */}
        <aside className={`
          fixed inset-y-0 right-0 z-20 w-full md:relative md:w-[400px] md:block
          transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full border-l border-stone-200 bg-white">
            <ChatSidebar
              tasks={tasks}
              activeTaskId={activeTaskId}
              timerMode={timerMode}
              timeLeft={timeLeft}
              onAddTask={handleAddTask}
            />
          </div>
        </aside>

      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;
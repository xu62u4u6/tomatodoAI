import React, { useState } from 'react';
import { TaskList } from './components/TaskList';
import { ChatSidebar } from './components/ChatSidebar';
import { FocusZone } from './components/FocusZone';
import { TimerMode, Task } from './types';
import { TIMER_SETTINGS, MODE_APP_BG_COLORS, MODE_RGB_VALUES } from './constants';
import { storageService } from './services/storageService';
import Header from './components/Header';

const App: React.FC = () => {
  // --- Global State ---
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.Pomodoro);
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_SETTINGS[TimerMode.Pomodoro]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [completedSessionPomodoros, setCompletedSessionPomodoros] = useState(0); // Track pomodoros for long break

  // Initial load
  React.useEffect(() => {
    const load = async () => {
      // Request notification permission on load
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const savedTasks = await storageService.loadTasks();
      if (savedTasks.length > 0) {
        setTasks(savedTasks);
        // Restore active task if possible, or default to first
        if (savedTasks.length > 0) setActiveTaskId(savedTasks[0].id);
      } else {
        // Default tasks for new users
        const defaults: Task[] = [
          { id: '1', title: 'Plan project architecture', estPomodoros: 3, actPomodoros: 0, isCompleted: false, note: 'Review system requirements and define component hierarchy.' },
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
    if (!activeTaskId) setActiveTaskId(newTask.id);
  };

  const handleUpdateTask = (id: string, newTitle: string, newEst?: number, newNote?: string) => {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      title: newTitle,
      estPomodoros: newEst !== undefined ? newEst : t.estPomodoros,
      note: newNote !== undefined ? newNote : t.note
    } : t));
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

  const handleReorderTasks = (oldIndex: number, newIndex: number) => {
    setTasks((prev) => {
      // Need arrayMove from dnd-kit, but it's not imported here yet.
      // We can implement it simply or import it.
      // Since we installed dnd-kit/sortable, let's use it.
      // But we can't add imports easily with replace_file_content if we don't targeting top.
      // I'll implement a simple array move here to avoid import issues or 2 separate edits.
      const newTasks = [...prev];
      const [moved] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, moved);
      return newTasks;
    });
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, { body, icon: '/favicon.ico' });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const handleTimerComplete = () => {
    // Play sound
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.log('Audio play failed', e));

    if (timerMode === TimerMode.Pomodoro) {
      // Logic for Pomodoro completion
      if (activeTaskId) {
        setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, actPomodoros: t.actPomodoros + 1 } : t));
      }

      const newCompleted = completedSessionPomodoros + 1;
      setCompletedSessionPomodoros(newCompleted);

      if (newCompleted % 4 === 0) {
        // Switch to Long Break
        setTimerMode(TimerMode.LongBreak);
        setTimeLeft(TIMER_SETTINGS[TimerMode.LongBreak]);
        sendNotification("Pomodoro Complete!", "Great job! Take a long break.");
      } else {
        // Switch to Short Break
        setTimerMode(TimerMode.ShortBreak);
        setTimeLeft(TIMER_SETTINGS[TimerMode.ShortBreak]);
        sendNotification("Pomodoro Complete!", "Time for a short break.");
      }
    } else {
      // Logic for Break completion (Short or Long)
      setTimerMode(TimerMode.Pomodoro);
      setTimeLeft(TIMER_SETTINGS[TimerMode.Pomodoro]);
      sendNotification("Break Over!", "Time to focus again.");

      // Reset session count if coming back from long break
      if (timerMode === TimerMode.LongBreak) {
        setCompletedSessionPomodoros(0);
      }
    }

    setIsTimerRunning(false);
  };

  return (
    <div
      className={`h-screen flex flex-col ${MODE_APP_BG_COLORS[timerMode]} transition-colors duration-500 ease-in-out font-sans overflow-hidden text-stone-900`}
      style={{ '--theme-color': MODE_RGB_VALUES[timerMode] } as React.CSSProperties}
    >
      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Column: Task List (Planning) */}
        <aside className={`w-[350px] flex-shrink-0 z-10 shadow-xl border-r backdrop-blur-sm hidden md:flex flex-col transition-colors duration-500 bg-white/40 border-theme/10`}>
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            timerMode={timerMode}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onSelectTask={handleSelectTask}
            onReorderTasks={handleReorderTasks}
          />
        </aside>

        {/* Center Column: Focus Zone (Execution) */}
        <main className={`flex-1 min-w-0 relative flex flex-col items-center transition-colors duration-500 bg-theme/5 pt-6`}>
          {/* Header (Center Top) */}
          <Header />

          {/* Mobile Menu Toggle (Absolute Top-Right of Main Area) */}
          <div className="absolute top-6 right-6 md:hidden z-50">
            {/* Implement mobile toggle logic if needed, simplify for now */}
          </div>

          <FocusZone
            timerMode={timerMode}
            setTimerMode={setTimerMode}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            isTimerRunning={isTimerRunning}
            setIsRunning={setIsTimerRunning}
            onTimerComplete={handleTimerComplete}
            activeTask={tasks.find(t => t.id === activeTaskId)}
          />
        </main>

        {/* Right Column: AI Assistant (Assist) */}
        <aside className={`w-[380px] flex-shrink-0 z-10 border-l bg-white shadow-xl hidden lg:block transition-colors duration-500 bg-white/40 border-theme/10`}>
          <ChatSidebar
            tasks={tasks}
            activeTaskId={activeTaskId}
            timerMode={timerMode}
            timeLeft={timeLeft}
            onAddTask={handleAddTask}
          />
        </aside>

      </div>
    </div>
  );
};

export default App;
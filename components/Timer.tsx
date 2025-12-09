import React, { useEffect } from 'react';
import { TimerMode } from '../types';
import { TIMER_SETTINGS, MODE_COLORS, MODE_BG_COLORS } from '../constants';

interface TimerProps {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  onTimerComplete: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  mode,
  setMode,
  timeLeft,
  setTimeLeft,
  isRunning,
  setIsRunning,
  onTimerComplete
}) => {
  
  // Handle timer tick
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, setTimeLeft, setIsRunning, onTimerComplete]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(TIMER_SETTINGS[newMode]);
  };

  // Dynamic colors based on mode
  const currentTextColor = MODE_COLORS[mode];
  const currentBgColor = MODE_BG_COLORS[mode];

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
      
      {/* Mode Switcher - Minimalist Text Tabs */}
      <div className="flex items-center gap-8 mb-12">
        {Object.values(TimerMode).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`
              relative text-sm tracking-widest uppercase transition-all duration-300 pb-1
              ${mode === m ? 'text-stone-900 font-semibold' : 'text-stone-400 hover:text-stone-600'}
            `}
          >
            {m === TimerMode.Pomodoro ? 'Pomodoro' : m === TimerMode.ShortBreak ? 'Short Break' : 'Long Break'}
            {/* Active Indicator Dot */}
            <span 
              className={`
                absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300
                ${mode === m ? `opacity-100 scale-100 ${MODE_BG_COLORS[m]}` : 'opacity-0 scale-0 bg-stone-300'}
              `} 
            />
          </button>
        ))}
      </div>

      {/* Timer Display - Large Serif Typography with Morandi Color */}
      <div className="relative mb-12 group cursor-default">
         <div className={`font-serif text-[7rem] sm:text-[9rem] leading-none tracking-tighter tabular-nums select-none transition-colors duration-500 ${currentTextColor}`}>
           {formatTime(timeLeft)}
         </div>
         {/* Subtle decoration */}
         <div className={`absolute -right-4 top-4 w-2 h-2 rounded-full transition-all duration-500 ${isRunning ? `${currentBgColor} animate-pulse` : 'bg-stone-200'}`}></div>
      </div>

      {/* Control - Dark, Pill-shaped button */}
      <button
        onClick={() => setIsRunning(!isRunning)}
        className={`
          flex items-center justify-center gap-3
          px-10 py-4 rounded-lg
          transition-all duration-300 transform hover:-translate-y-1 active:scale-95
          ${isRunning 
            ? 'bg-stone-100 text-stone-900 border border-stone-200 hover:bg-stone-200' 
            : `bg-stone-900 text-cream shadow-lg hover:shadow-xl shadow-stone-900/10`
          }
        `}
      >
        <span className="font-medium text-lg tracking-wide">
          {isRunning ? 'Pause Timer' : 'Start Focus'}
        </span>
        <i className={`fa-solid ${isRunning ? 'fa-pause' : 'fa-arrow-right'} text-sm`}></i>
      </button>
      
    </div>
  );
};
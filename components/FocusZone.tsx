import React from 'react';
import { Timer } from './Timer';
import { TimerMode, Task } from '../types';

interface FocusZoneProps {
    timerMode: TimerMode;
    setTimerMode: (mode: TimerMode) => void;
    timeLeft: number;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
    isTimerRunning: boolean;
    setIsRunning: (isRunning: boolean) => void;
    onTimerComplete: () => void;
    activeTask: Task | undefined;
}

export const FocusZone: React.FC<FocusZoneProps> = ({
    timerMode,
    setTimerMode,
    timeLeft,
    setTimeLeft,
    isTimerRunning,
    setIsRunning,
    onTimerComplete,
    activeTask
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 transition-colors duration-500">

            {/* Timer */}
            <div className="scale-110 transform transition-transform mb-12">
                <Timer
                    mode={timerMode}
                    setMode={setTimerMode}
                    timeLeft={timeLeft}
                    setTimeLeft={setTimeLeft}
                    isRunning={isTimerRunning}
                    setIsRunning={setIsRunning}
                    onTimerComplete={onTimerComplete}
                />
            </div>

            {/* Active Task Summary Card */}
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-6 flex flex-col items-center relative overflow-hidden group">

                    {/* Decorative Background Element - Dynamic Gradient */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme/40 via-theme to-theme/40"></div>

                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 bg-stone-50 px-2 py-1 rounded-full">
                        Current Focus
                    </span>

                    {activeTask ? (
                        <div className="text-center w-full relative z-10">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-stone-800 mb-4 leading-tight">
                                {activeTask.title}
                            </h2>

                            <div className="flex items-center justify-center gap-3">
                                <div className="flex items-center gap-1.5 bg-theme/5 px-3 py-1.5 rounded-lg border border-theme/10 text-theme font-medium text-sm">
                                    <i className="fa-solid fa-fire text-theme opacity-70 text-xs"></i>
                                    <span>{activeTask.actPomodoros} / {activeTask.estPomodoros}</span>
                                </div>
                                <span className="text-xs text-stone-400 font-medium">pomodoros completed</span>
                            </div>

                            {activeTask.note && (
                                <div className="mt-4 pt-4 border-t border-stone-100 w-full text-left">
                                    <div className="flex items-center mb-1 gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300">
                                            <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"></path>
                                            <path d="M15 3v6h6"></path>
                                        </svg>
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Note</span>
                                    </div>
                                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                                        {activeTask.note}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-stone-400 italic py-4 flex flex-col items-center gap-2">
                            <i className="fa-solid fa-arrow-left text-xl opacity-20 animate-pulse"></i>
                            <span>Select a task from the list to focus</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quote / Placeholder / Status */}
            <div className="mt-16 text-center opacity-60">
                <p className="font-serif text-stone-400 italic text-sm">
                    {isTimerRunning ? "Stay with the flow..." : "Ready to start?"}
                </p>
            </div>

        </div>
    );
};

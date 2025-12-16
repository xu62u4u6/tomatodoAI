import React, { useState, useEffect } from 'react';
import { TimerMode, TimerSettings } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: TimerSettings) => void;
    initialSettings: TimerSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialSettings }) => {
    const [pomodoro, setPomodoro] = useState(initialSettings[TimerMode.Pomodoro] / 60);
    const [shortBreak, setShortBreak] = useState(initialSettings[TimerMode.ShortBreak] / 60);
    const [longBreak, setLongBreak] = useState(initialSettings[TimerMode.LongBreak] / 60);

    // Sync state when initialSettings change or modal opens
    useEffect(() => {
        if (isOpen) {
            setPomodoro(Math.floor(initialSettings[TimerMode.Pomodoro] / 60));
            setShortBreak(Math.floor(initialSettings[TimerMode.ShortBreak] / 60));
            setLongBreak(Math.floor(initialSettings[TimerMode.LongBreak] / 60));
        }
    }, [isOpen, initialSettings]);

    if (!isOpen) return null;

    const handleSave = () => {
        const newSettings: TimerSettings = {
            [TimerMode.Pomodoro]: pomodoro * 60,
            [TimerMode.ShortBreak]: shortBreak * 60,
            [TimerMode.LongBreak]: longBreak * 60,
        };
        onSave(newSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-stone-100 transform transition-all scale-100 opacity-100">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-xl font-bold text-stone-800">Timer Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Inputs */}
                <div className="space-y-5">
                    {/* Pomodoro */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                            Pomodoro (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={pomodoro}
                            onChange={(e) => setPomodoro(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-morandi-red/20 focus:border-morandi-red text-stone-800 font-medium transition-all"
                        />
                    </div>

                    {/* Short Break */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                            Short Break (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={shortBreak}
                            onChange={(e) => setShortBreak(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-morandi-green/20 focus:border-morandi-green text-stone-800 font-medium transition-all"
                        />
                    </div>

                    {/* Long Break */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                            Long Break (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="45"
                            value={longBreak}
                            onChange={(e) => setLongBreak(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-morandi-blue/20 focus:border-morandi-blue text-stone-800 font-medium transition-all"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-stone-900 hover:bg-black shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;

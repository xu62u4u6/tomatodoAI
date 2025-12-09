import { TimerMode } from './types';

export const TIMER_SETTINGS = {
  [TimerMode.Pomodoro]: 25 * 60,
  [TimerMode.ShortBreak]: 5 * 60,
  [TimerMode.LongBreak]: 15 * 60,
};

// Text Colors (Tailwind Classes)
export const MODE_COLORS = {
  [TimerMode.Pomodoro]: 'text-morandi-red',
  [TimerMode.ShortBreak]: 'text-morandi-green',
  [TimerMode.LongBreak]: 'text-morandi-blue',
};

// Background Colors
export const MODE_BG_COLORS = {
  [TimerMode.Pomodoro]: 'bg-morandi-red',
  [TimerMode.ShortBreak]: 'bg-morandi-green',
  [TimerMode.LongBreak]: 'bg-morandi-blue',
};

// Border Colors
export const MODE_BORDER_COLORS = {
  [TimerMode.Pomodoro]: 'border-morandi-red',
  [TimerMode.ShortBreak]: 'border-morandi-green',
  [TimerMode.LongBreak]: 'border-morandi-blue',
};

// Selection Colors (e.g. ::selection)
export const MODE_SELECTION_COLORS = {
  [TimerMode.Pomodoro]: 'selection:bg-morandi-red',
  [TimerMode.ShortBreak]: 'selection:bg-morandi-green',
  [TimerMode.LongBreak]: 'selection:bg-morandi-blue',
};

// Legacy support if needed
export const TIMER_COLORS = MODE_COLORS;
export const TIMER_BG_COLORS = {
  [TimerMode.Pomodoro]: 'bg-transparent',
  [TimerMode.ShortBreak]: 'bg-transparent',
  [TimerMode.LongBreak]: 'bg-transparent',
};
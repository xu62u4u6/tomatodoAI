import { TimerMode } from './types';

// Timer Settings (in seconds)
// Production: 25*60, 5*60, 15*60
// Test: 20, 10, 10
export const TIMER_SETTINGS = {
  [TimerMode.Pomodoro]: 20,
  [TimerMode.ShortBreak]: 10,
  [TimerMode.LongBreak]: 10,
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

// Level 1: Deepest (For Start Button, User Text, Timer Text, Borders)
export const MODE_LEVEL_1_TEXT = {
  [TimerMode.Pomodoro]: 'text-morandi-red',
  [TimerMode.ShortBreak]: 'text-morandi-green',
  [TimerMode.LongBreak]: 'text-morandi-blue',
};

export const MODE_LEVEL_1_BG = {
  [TimerMode.Pomodoro]: 'bg-morandi-red text-white hover:bg-morandi-red/90',
  [TimerMode.ShortBreak]: 'bg-morandi-green text-white hover:bg-morandi-green/90',
  [TimerMode.LongBreak]: 'bg-morandi-blue text-white hover:bg-morandi-blue/90',
};

export const MODE_LEVEL_1_BORDER = {
  [TimerMode.Pomodoro]: 'border-morandi-red',
  [TimerMode.ShortBreak]: 'border-morandi-green',
  [TimerMode.LongBreak]: 'border-morandi-blue',
};

// Level 2: Medium (For Center Zone Background)
export const MODE_LEVEL_2_BG = {
  [TimerMode.Pomodoro]: 'bg-morandi-red/10',
  [TimerMode.ShortBreak]: 'bg-morandi-green/10',
  [TimerMode.LongBreak]: 'bg-morandi-blue/10',
};

// Level 3: Lightest (For Sidebars Background)
export const MODE_LEVEL_3_BG = {
  [TimerMode.Pomodoro]: 'bg-morandi-red/5',
  [TimerMode.ShortBreak]: 'bg-morandi-green/5',
  [TimerMode.LongBreak]: 'bg-morandi-blue/5',
};

// CSS Variable RGB Values (for semantic theming)
// These match the 'morandi' palette defined in index.html
export const MODE_RGB_VALUES = {
  [TimerMode.Pomodoro]: '192 132 129',   // #c08481
  [TimerMode.ShortBreak]: '141 163 153', // #8da399
  [TimerMode.LongBreak]: '146 161 185',  // #92a1b9
};

// Start Button (uses Level 1 BG)
export const MODE_BUTTON_COLORS = MODE_LEVEL_1_BG;

// Center Zone (uses Level 2 BG)
export const MODE_CENTER_BG_COLORS = MODE_LEVEL_2_BG;

// Sidebars (uses Level 3 BG + Level 1 Border for definition)
export const MODE_SIDEBAR_CLASSES = {
  [TimerMode.Pomodoro]: 'bg-morandi-red/5 border-morandi-red/20',
  [TimerMode.ShortBreak]: 'bg-morandi-green/5 border-morandi-green/20',
  [TimerMode.LongBreak]: 'bg-morandi-blue/5 border-morandi-blue/20',
};

// App Background (Fallback or underneath)
export const MODE_APP_BG_COLORS = {
  [TimerMode.Pomodoro]: 'bg-pomodoro-bg', // Keep original very light cream/red
  [TimerMode.ShortBreak]: 'bg-short-break-bg',
  [TimerMode.LongBreak]: 'bg-long-break-bg',
};

// Legacy support if needed
export const TIMER_COLORS = MODE_COLORS;
export const TIMER_BG_COLORS = {
  [TimerMode.Pomodoro]: 'bg-transparent',
  [TimerMode.ShortBreak]: 'bg-transparent',
  [TimerMode.LongBreak]: 'bg-transparent',
};
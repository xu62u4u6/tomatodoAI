export enum TimerMode {
  Pomodoro = 'pomodoro',
  ShortBreak = 'shortBreak',
  LongBreak = 'longBreak'
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  estPomodoros: number;
  actPomodoros: number;
  note?: string;
}

export interface SuggestedTask {
  title: string;
  estPomodoros: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
  suggestions?: SuggestedTask[];
}

export interface AppState {
  tasks: Task[];
  activeTaskId: string | null;
  timerMode: TimerMode;
  timeLeft: number;
  isTimerRunning: boolean;
}

export interface AIChatSession {
  sendMessage: (params: { message: string }) => Promise<{ text: string }>;
}
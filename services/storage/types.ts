import { Task } from '../../types';

export interface BaseMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface StorageAdapter {
    loadTasks(): Promise<Task[]>;
    saveTasks(tasks: Task[]): Promise<void>;

    loadChatHistory(): Promise<BaseMessage[]>;
    saveChatHistory(history: BaseMessage[]): Promise<void>;

    loadTimerSettings(): Promise<Record<string, number> | null>;
    saveTimerSettings(settings: Record<string, number>): Promise<void>;
}

import { Task } from '../../types';
import { StorageAdapter, BaseMessage } from './types';

export class LocalStorageAdapter implements StorageAdapter {
    private readonly TASKS_KEY = 'tomatodo_tasks';
    private readonly CHAT_KEY = 'tomatodo_chat_history';

    async loadTasks(): Promise<Task[]> {
        const saved = localStorage.getItem(this.TASKS_KEY);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse tasks', e);
            return [];
        }
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    }

    async loadChatHistory(): Promise<BaseMessage[]> {
        const saved = localStorage.getItem(this.CHAT_KEY);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse chat history', e);
            return [];
        }
    }

    async saveChatHistory(history: BaseMessage[]): Promise<void> {
        localStorage.setItem(this.CHAT_KEY, JSON.stringify(history));
    }
}

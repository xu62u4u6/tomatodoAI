import { Task } from '../../types';
import { BaseMessage, StorageAdapter } from './types';

type TimerSettingsPayload = {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
};

const DEFAULT_API_BASE = 'http://127.0.0.1:8000';
const DEFAULT_WELCOME_MESSAGE = 'Hello! I can help you break down your projects. Tell me what you want to achieve today.';

const taskEquals = (left: Task, right: Task): boolean =>
    left.title === right.title &&
    left.isCompleted === right.isCompleted &&
    left.estPomodoros === right.estPomodoros &&
    left.actPomodoros === right.actPomodoros &&
    (left.note ?? null) === (right.note ?? null);

export class HttpStorageAdapter implements StorageAdapter {
    private readonly apiBase = (import.meta.env.VITE_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
    private readonly token = import.meta.env.VITE_TOMATODO_TOKEN || '';
    private tasksCache: Task[] | null = null;
    private remoteIdMap = new Map<string, string>();
    private chatCache: BaseMessage[] = [];
    private taskSaveChain: Promise<void> = Promise.resolve();

    private async request<T>(path: string, init?: RequestInit): Promise<T> {
        const response = await fetch(`${this.apiBase}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
                ...(init?.headers || {}),
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json() as Promise<T>;
    }

    private getRemoteId(localId: string): string {
        return this.remoteIdMap.get(localId) || localId;
    }

    private async refreshTasks(): Promise<Task[]> {
        const tasks = await this.request<Task[]>('/api/tasks');
        this.tasksCache = tasks;
        for (const task of tasks) {
            this.remoteIdMap.set(task.id, task.id);
        }
        return tasks;
    }

    async loadTasks(): Promise<Task[]> {
        return this.refreshTasks();
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        this.taskSaveChain = this.taskSaveChain.then(() => this.flushTasks(tasks));
        return this.taskSaveChain;
    }

    private async flushTasks(tasks: Task[]): Promise<void> {
        const previous = this.tasksCache ?? await this.refreshTasks();
        const previousById = new Map(previous.map((task) => [task.id, task]));
        const nextRemoteIds = new Set<string>();

        for (const task of tasks) {
            const remoteId = this.getRemoteId(task.id);
            const previousTask = previousById.get(remoteId);

            if (!previousTask) {
                const created = await this.request<Task>('/api/tasks', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: task.title,
                        estPomodoros: task.estPomodoros,
                        note: task.note,
                    }),
                });
                this.remoteIdMap.set(task.id, created.id);
                nextRemoteIds.add(created.id);
                continue;
            }

            nextRemoteIds.add(remoteId);
            if (!taskEquals(task, previousTask)) {
                await this.request<Task>(`/api/tasks/${remoteId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title: task.title,
                        isCompleted: task.isCompleted,
                        estPomodoros: task.estPomodoros,
                        actPomodoros: task.actPomodoros,
                        note: task.note ?? null,
                    }),
                });
            }
        }

        for (const previousTask of previous) {
            if (!nextRemoteIds.has(previousTask.id)) {
                await this.request<void>(`/api/tasks/${previousTask.id}`, { method: 'DELETE' });
            }
        }

        const finalOrder = tasks.map((task) => this.getRemoteId(task.id));
        const previousOrder = previous.map((task) => task.id);
        if (
            finalOrder.length === previousOrder.length &&
            finalOrder.some((id, index) => id !== previousOrder[index])
        ) {
            await this.request<Task[]>('/api/tasks/reorder', {
                method: 'PUT',
                body: JSON.stringify({ ids: finalOrder }),
            });
        }

        await this.refreshTasks();
    }

    async loadChatHistory(): Promise<BaseMessage[]> {
        const history = await this.request<BaseMessage[]>('/api/chat/history');
        this.chatCache = history.filter((message) => message.role !== 'system');
        return this.chatCache;
    }

    async saveChatHistory(history: BaseMessage[]): Promise<void> {
        const isClearAction = this.chatCache.length > 0 &&
            history.length === 1 &&
            history[0].role === 'assistant' &&
            history[0].content === DEFAULT_WELCOME_MESSAGE;

        if (isClearAction) {
            await this.request<void>('/api/chat/history', { method: 'DELETE' });
            this.chatCache = [];
            return;
        }

        this.chatCache = history;
    }

    async loadTimerSettings(): Promise<Record<string, number> | null> {
        try {
            const response = await this.request<TimerSettingsPayload>('/api/timer-settings');
            return {
                pomodoro: response.pomodoro,
                shortBreak: response.shortBreak,
                longBreak: response.longBreak,
            };
        } catch (error) {
            if (error instanceof Error && error.message.startsWith('404 ')) {
                return null;
            }
            throw error;
        }
    }

    async saveTimerSettings(settings: Record<string, number>): Promise<void> {
        await this.request<TimerSettingsPayload>('/api/timer-settings', {
            method: 'PUT',
            body: JSON.stringify({
                pomodoro: settings.pomodoro,
                shortBreak: settings.shortBreak,
                longBreak: settings.longBreak,
            }),
        });
    }
}

import { StorageAdapter } from './storage/types';
import { LocalStorageAdapter } from './storage/LocalStorageAdapter';

class StorageService {
    private adapter: StorageAdapter;

    constructor(adapter: StorageAdapter) {
        this.adapter = adapter;
    }

    // Allow switching adapters at runtime (or setup time)
    setAdapter(adapter: StorageAdapter) {
        this.adapter = adapter;
    }

    getAdapter() {
        return this.adapter;
    }

    // Proxy methods
    async loadTasks() {
        return this.adapter.loadTasks();
    }

    async saveTasks(tasks: any[]) {
        return this.adapter.saveTasks(tasks);
    }

    async loadChatHistory() {
        return this.adapter.loadChatHistory();
    }

    async saveChatHistory(history: any[]) {
        return this.adapter.saveChatHistory(history);
    }
}

// Initialize with LocalStorage by default
export const storageService = new StorageService(new LocalStorageAdapter());

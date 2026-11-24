import { AIChatSession } from '../types';

const apiBase = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '');
const token = import.meta.env.VITE_TOMATODO_TOKEN || '';

export const createChatSession = (systemInstruction?: string): AIChatSession => {
    return {
        sendMessage: async ({ message }: { message: string }) => {
            try {
                const response = await fetch(`${apiBase}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message,
                        systemInstruction,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Chat request failed with ${response.status}`);
                }
                const data = await response.json() as { text?: string };

                return { text: data.text || '{}' };
            } catch (error) {
                console.error('Chat API Error:', error);
                return {
                    text: JSON.stringify({
                        text: "I'm having trouble connecting right now. Please try again.",
                        suggestedTasks: []
                    }),
                };
            }
        },
    };
};

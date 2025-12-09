import OpenAI from 'openai';
import { AIChatSession, SuggestedTask } from '../types';

// Initialize the client
// User must provide OPENAI_API_KEY in .env.local
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || '', // Vite exposes env vars with VITE_ prefix, but let's support both if possible or just rely on VITE_
    dangerouslyAllowBrowser: true // Required for client-side usage, though server-side is recommended for production
});

interface BaseMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const createChatSession = (systemInstruction?: string): AIChatSession => {
    const history: BaseMessage[] = [];

    if (systemInstruction) {
        history.push({ role: 'system', content: systemInstruction });
    } else {
        history.push({
            role: 'system',
            content: "You are TomatodoAI, an intelligent productivity coach. Your goal is to help the user break down complex projects into small, actionable tasks. When the user speaks, analyze their current context and tasks. Always provide a friendly conversational response in the 'text' field. If there are opportunities to break down work or add useful tasks, provide them in the 'suggestedTasks' array. Try to provide at least 3 suggestions when relevant. Estimate pomodoros (25m blocks) conservatively. Response MUST be valid JSON with 'text' (string) and 'suggestedTasks' (array of {title, estPomodoros}) properties."
        });
    }

    return {
        sendMessage: async ({ message }: { message: string }) => {
            // Add user message to history
            history.push({ role: 'user', content: message });

            // Sliding window: Keep system message + last 10 messages to prevent token overflow
            // This effectively implements "short-term memory"
            if (history.length > 11) {
                // Keep index 0 (system) and the last 10
                history.splice(1, history.length - 11);
            }

            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-5-nano", // Or gpt-3.5-turbo
                    messages: history,
                    response_format: { type: "json_object" }
                });

                const responseContent = completion.choices[0].message.content || "{}";

                // Add assistant response to history
                history.push({ role: 'assistant', content: responseContent });

                return { text: responseContent };
            } catch (error) {
                console.error("OpenAI API Error:", error);
                return { text: JSON.stringify({ text: "I'm having trouble connecting to OpenAI. Please check your API key.", suggestedTasks: [] }) };
            }
        }
    };
};

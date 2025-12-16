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
    const chatHistory: BaseMessage[] = [];

    if (systemInstruction) {
        chatHistory.push({ role: 'system', content: systemInstruction });
    } else {
        chatHistory.push({
            role: 'system',
            content: `You are **TomatodoAI**, an intelligent productivity assistant.

Your primary goal is to help the user break down complex projects into clear, actionable tasks.

**IMPORTANT: Always respond in Traditional Chinese if user using Traditional Chinese (繁體中文).**

When the user sends a message:
1. Analyze the user's current context, goals, and workload.
2. Produce a friendly, conversational response in the **"text"** field.
3. If there are meaningful opportunities to break down work, propose tasks in **"suggestedTasks"**.

Guidelines for suggested tasks:
- Provide **3–5** high-quality, useful task suggestions when appropriate.
- Each task must include:
  - **title** (string)
  - **estPomodoros** (integer, conservative estimate of 25-minute blocks)
- Only suggest tasks when they add real value. Otherwise, return an empty array.

Output format requirement:
- You must respond with **valid JSON only**.
- The JSON must contain exactly two properties:
  - "text": string
  - "suggestedTasks": array of objects with { "title": string, "estPomodoros": number }

Example schema (do NOT output this literally):
{
  "text": "...",
  "suggestedTasks": [
    { "title": "...", "estPomodoros": 1 },
    ...
  ]
}
`
        });
    }

    return {
        sendMessage: async ({ message }: { message: string }) => {
            // Add user message to history
            chatHistory.push({ role: 'user', content: message });

            // Sliding window: Keep system message + last 10 messages to prevent token overflow
            // This effectively implements "short-term memory"
            if (chatHistory.length > 11) {
                // Keep index 0 (system) and the last 10
                chatHistory.splice(1, chatHistory.length - 11);
            }

            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-5-mini", // Reverted to 4o-mini for speed and stability
                    messages: chatHistory,
                    response_format: { type: "json_object" }
                });

                const responseContent = completion.choices[0].message.content || "{}";

                // Add assistant response to history
                chatHistory.push({ role: 'assistant', content: responseContent });

                return { text: responseContent };
            } catch (error) {
                console.error("OpenAI API Error:", error);
                return {
                    text: JSON.stringify({
                        text: "I'm having trouble connecting to OpenAI. Please check your API key.",
                        suggestedTasks: []
                    })
                };
            }
        }
    };
};

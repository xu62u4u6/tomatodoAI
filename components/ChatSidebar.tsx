import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/openaiService';
import { storageService } from '../services/storageService';
import { ChatMessage, Task, TimerMode, SuggestedTask, AIChatSession } from '../types';

interface ChatSidebarProps {
  tasks: Task[];
  activeTaskId: string | null;
  timerMode: TimerMode;
  timeLeft: number;
  onAddTask: (title: string, est: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  tasks,
  activeTaskId,
  timerMode,
  timeLeft,
  onAddTask
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<AIChatSession | null>(null);

  // Track which suggestions have been added to prevent duplicates/confusion
  const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    chatSessionRef.current = createChatSession();

    // Load history
    const loadHistory = async () => {
      const saved = await storageService.loadChatHistory();
      if (saved.length > 0) {
        // Convert BaseMessage back to ChatMessage (UI)
        // Note: BaseMessage doesn't have ID, we need to generate them or store them.
        // The adapter stores BaseMessage { role, content }.
        // We need to map them.
        const restored: ChatMessage[] = saved.map((m, i) => ({
          id: `hist-${i}`,
          role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
          text: m.content
        }));
        setMessages(restored);
      } else {
        setMessages([
          { id: '1', role: 'model', text: 'Hello! I can help you break down your projects. Tell me what you want to achieve today.' }
        ]);
      }
    };
    loadHistory();
  }, []);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      // Map UI messages back to storage format
      const toSave = messages.map(m => ({
        role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user' | 'system',
        content: m.text
      }));
      storageService.saveChatHistory(toSave);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const activeTask = tasks.find(t => t.id === activeTaskId);
      const taskContext = activeTask
        ? `Focusing on: "${activeTask.title}".\nNotes: ${activeTask.note || 'None'}`
        : `Current Tasks: ${tasks.map(t => t.title).join(', ') || 'None'}.`;

      const timerContext = `Timer: ${timerMode}, ${Math.floor(timeLeft / 60)}m left.`;

      // We pass context as part of the message since system instructions are set at initialization
      const fullMessage = `[Context: ${taskContext} ${timerContext}] \n\n User Input: ${userMsg.text}`;

      // Use sendMessage (non-stream) to ensure we get the full JSON to parse
      const result = await chatSessionRef.current.sendMessage({ message: fullMessage });
      const responseText = result.text;

      let parsedResponse: { text: string; suggestedTasks?: SuggestedTask[] } = { text: "", suggestedTasks: [] };

      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON response", e);
        parsedResponse = { text: responseText, suggestedTasks: [] };
      }

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: parsedResponse.text,
        suggestions: parsedResponse.suggestedTasks
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddSuggestion = (suggestion: SuggestedTask, index: number, msgId: string) => {
    // Unique ID for this specific suggestion instance
    const suggestionId = `${msgId}-${index}`;
    if (addedSuggestions.has(suggestionId)) return;

    onAddTask(suggestion.title, suggestion.estPomodoros);
    setAddedSuggestions(prev => new Set(prev).add(suggestionId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-fire text-theme opacity-70"></i>
          <span className="font-serif font-semibold text-stone-800 text-lg">TomatodoAI</span>
        </div>
        {/* <span className="text-[10px] font-bold text-stone-400 border border-stone-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span> */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`
              max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
              ${msg.role === 'user'
                ? `bg-theme text-white rounded-br-none ml-auto border-none shadow-md`
                : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'}
            `}>
              {msg.role === 'model' && (
                <div className="flex gap-2 mb-2 items-center">
                  <i className="fa-solid fa-fire text-theme opacity-70 text-xs"></i>
                  <span className="font-serif font-bold text-stone-900 text-xs">TomatodoAI</span>
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Render Suggested Tasks */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-stone-100 pt-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">Suggested Tasks</p>
                  {msg.suggestions.map((task, idx) => {
                    const suggestionId = `${msg.id}-${idx}`;
                    const isAdded = addedSuggestions.has(suggestionId);

                    return (
                      <div key={idx} className="group flex items-center justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-200 hover:border-morandi-red/50 transition-colors">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-medium text-stone-800 truncate text-xs sm:text-sm">{task.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <i className="fa-regular fa-clock text-[10px] text-stone-400"></i>
                            <span className="text-[10px] text-stone-500">{task.estPomodoros} pomodoros</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSuggestion(task, idx, msg.id)}
                          disabled={isAdded}
                          className={`
                            w-8 h-8 flex items-center justify-center rounded-full transition-all
                            ${isAdded
                              ? 'bg-green-100 text-green-600 cursor-default'
                              : 'bg-white border border-stone-200 text-stone-400 hover:text-morandi-red hover:border-morandi-red shadow-sm hover:shadow-md'
                            }
                          `}
                          title="Add to task list"
                        >
                          {isAdded ? (
                            <i className="fa-solid fa-check text-xs"></i>
                          ) : (
                            <i className="fa-solid fa-arrow-left text-xs"></i>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start animate-fade-in">
            <div className="flex gap-2 mb-2 items-center pl-1">
              <i className="fa-solid fa-fire text-theme opacity-70 text-xs"></i>
              <span className="font-serif font-bold text-stone-900 text-xs">TomatodoAI</span>
            </div>
            <div className="bg-white border border-stone-100 px-5 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Floating Style */}
      <div className="p-6 pt-2 pb-8 bg-transparent">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Discuss your tasks..."
            disabled={isTyping}
            rows={1}
            className="w-full pl-5 pr-14 py-4 bg-white border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-100/50 transition-all text-sm text-stone-800 placeholder-stone-400 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] resize-none"
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-black disabled:opacity-30 disabled:hover:bg-stone-900 transition-all shadow-md group"
          >
            <i className="fa-solid fa-paper-plane text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

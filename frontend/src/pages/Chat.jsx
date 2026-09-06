import React, { useState, useEffect, useRef } from 'react';
import { initialChatMessages, chatSuggestions, chatResponses } from '../data/mockData';
import { Send, Bot } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState(initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');

    setTimeout(() => {
      const key = text.toLowerCase();
      const reply = chatResponses[key] || "That's a good question — based on your agreement, I'd recommend checking the Lease Details and Important Clauses sections in your AI Analysis, or ask me something more specific like the example questions above.";
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fade-in h-[calc(100vh-140px)]">
      <div className="grid h-full gap-5 lg:grid-cols-[280px_1fr]">
        
        {/* left: agreement + history */}
        <aside className="hidden flex-col rounded-xl2 border border-border bg-white p-4 lg:flex">
          <p className="text-xs font-medium uppercase tracking-wide text-text-faint">Agreement</p>
          <div className="mt-2 rounded-lg bg-lease-50 p-3">
            <p className="text-sm font-medium text-ink">Cedar Heights — Lease</p>
            <p className="mt-0.5 text-xs text-text-faint">Analyzed · Medium risk</p>
          </div>
          
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-text-faint">Previous conversations</p>
          <div className="scroll-thin mt-2 flex-1 space-y-1.5 overflow-y-auto">
            <button className="w-full rounded-lg bg-paper px-3 py-2.5 text-left text-sm text-ink">Notice period & deposit</button>
            <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-muted hover:bg-paper">Rent increase clause</button>
            <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-muted hover:bg-paper">Old Adajan agreement</button>
          </div>
        </aside>

        {/* main chat */}
        <div className="flex h-full flex-col rounded-xl2 border border-border bg-white">
          <div className="border-b border-border px-5 py-4">
            <p className="font-display text-sm font-semibold text-ink">Ask about Cedar Heights — Lease Agreement</p>
            <p className="mt-1 text-xs text-text-faint">AI-generated information is for assistance and should not be considered legal advice.</p>
          </div>
          
          <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((m, idx) => m.role === 'user' ? (
              <div key={idx} className="flex justify-end">
                <div className="max-w-[80%] rounded-xl2 rounded-tr-sm bg-lease-600 px-4 py-2.5 text-sm text-white">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={idx} className="flex gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-100 text-signal-600">
                  <Bot size={15} />
                </span>
                <div className="max-w-[80%] rounded-xl2 rounded-tl-sm border border-border bg-paper px-4 py-2.5 text-sm text-ink">
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {chatSuggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => { setInputValue(s); handleSend(); }} 
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-paper"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-paper px-3 py-2.5">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text" 
                placeholder="Ask anything about your rental agreement…" 
                className="w-full bg-transparent text-sm text-ink placeholder:text-text-faint focus:outline-none" 
              />
              <button onClick={handleSend} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lease-600 text-white hover:bg-lease-700">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Chat;

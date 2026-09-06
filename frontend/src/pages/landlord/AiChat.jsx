import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Send, User } from 'lucide-react';

const AiChat = () => {
  const { agreementId } = useParams();
  
  const initialMessage = agreementId 
    ? 'Hello! I have analyzed the agreement "Sunset_Apt_Lease_2026.pdf". What would you like to know about it?'
    : 'Hello! I am your AI Property Assistant. Select an agreement to ask specific questions, or ask me anything about property management.';

  const [messages, setMessages] = useState([
    { role: 'ai', text: initialMessage }
  ]);
  const [input, setInput] = useState('');

  const suggestedQuestions = agreementId ? [
    "What is the tenant's notice period?",
    "Is there a rent increase clause?",
    "What penalties are mentioned?",
    "Who is responsible for painting?"
  ] : [
    "Draft a rent reminder email.",
    "What are standard lock-in periods?",
    "How to handle tenant disputes?",
    "Generate a notice for inspection."
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: agreementId 
          ? 'Based on the agreement, the notice period is 2 months (60 days) as explicitly stated in Clause 9.1. The tenant must provide written notice via email or registered post.'
          : 'I can certainly help you with that. A standard lock-in period for a 11-month residential agreement in India is typically 6 months, though this can be negotiated.'
      }]);
    }, 1000);
  };

  const handleSuggest = (q) => {
    setInput(q);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        {agreementId ? (
          <Link to={`/landlord/analysis/${agreementId}`} className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        ) : (
          <Link to={`/landlord`} className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-display font-bold text-ink flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-lease-600" /> 
            {agreementId ? 'Ask AI About This Agreement' : 'AI Property Assistant'}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">AI-generated information is for assistance and should not be considered legal advice.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-border rounded-t-xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-thin">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-lease-100 flex items-center justify-center flex-shrink-0">
                  <BrainCircuit className="w-4 h-4 text-lease-600" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-lease-600 text-white rounded-tr-sm' 
                  : 'bg-paper border border-border text-ink rounded-tl-sm'
              }`}>
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 bg-paper/50 border-t border-border flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSuggest(q)}
                className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium text-ink hover:border-lease-500 hover:text-lease-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-white">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this agreement..." 
              className="w-full pl-4 pr-12 py-3 bg-paper border border-border rounded-xl text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 bg-lease-600 text-white rounded-lg hover:bg-lease-700 transition-colors disabled:opacity-50 disabled:hover:bg-lease-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiChat;

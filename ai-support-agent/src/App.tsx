import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, FileText, BrainCircuit, Loader2, Info } from 'lucide-react';
import { detectPersona, retrieveKB, generateResponse, generateEscalationSummary, PersonaInsights } from './services/ai';
import { KBArticle } from './data/kb';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your Support Agent. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Insights State
  const [currentPersona, setCurrentPersona] = useState<PersonaInsights | null>(null);
  const [currentKB, setCurrentKB] = useState<KBArticle | null>(null);
  const [escalationSummary, setEscalationSummary] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Phase 3: Persona Detector
      const personaInsights = await detectPersona(userMessage);
      setCurrentPersona(personaInsights);

      // Phase 4: KB Retriever
      const kbArticle = retrieveKB(userMessage);
      setCurrentKB(kbArticle);

      // Phase 5 & 6: Response Generator
      const responseText = await generateResponse(userMessage, personaInsights, kbArticle, newMessages);
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText }]);

      // Phase 5: Escalation Logic (Handoff Summary)
      if (personaInsights.requiresEscalation) {
        const summary = await generateEscalationSummary(newMessages);
        setEscalationSummary(summary);
      } else {
        setEscalationSummary(null);
      }

    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I encountered an error processing your request. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Left Panel: Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl border-r border-slate-200 bg-white shadow-sm z-10">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-slate-800">Support Agent</h1>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-sm text-slate-500">Agent is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full bg-slate-100 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded-full py-3 pl-5 pr-12 text-sm transition-all outline-none disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel: Agent Insights (The 7 Phases Visualization) */}
      <div className="w-96 bg-slate-50 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <BrainCircuit size={20} className="text-slate-700" />
          <h2 className="font-semibold text-slate-800">Agent Insights</h2>
        </div>

        {/* Persona Detector */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-indigo-500" />
            <h3 className="font-medium text-sm text-slate-700">Persona Detector</h3>
          </div>
          {currentPersona ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Persona</span>
                  <span className="text-sm font-medium text-slate-800">{currentPersona.persona}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Sentiment</span>
                  <span className="text-sm font-medium text-slate-800">{currentPersona.sentiment}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Reasoning</span>
                <p className="text-xs text-slate-600 leading-relaxed">{currentPersona.reasoning}</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Info size={14} /> Waiting for user input...
            </div>
          )}
        </div>

        {/* KB Retriever */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-emerald-500" />
            <h3 className="font-medium text-sm text-slate-700">KB Retriever</h3>
          </div>
          {currentKB ? (
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
              <span className="block text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">Matched Article</span>
              <h4 className="text-sm font-medium text-slate-800 mb-1">{currentKB.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{currentKB.content}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {currentKB.keywords.slice(0, 3).map(kw => (
                  <span key={kw} className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              {currentPersona ? 'No relevant KB article found.' : <><Info size={14} /> Waiting for user input...</>}
            </div>
          )}
        </div>

        {/* Escalation Logic */}
        <div className={`bg-white rounded-xl border p-4 shadow-sm transition-colors ${currentPersona?.requiresEscalation ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className={currentPersona?.requiresEscalation ? 'text-rose-500' : 'text-amber-500'} />
            <h3 className="font-medium text-sm text-slate-700">Escalation Logic</h3>
          </div>
          
          {currentPersona ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentPersona.requiresEscalation ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {currentPersona.requiresEscalation ? 'TRIGGERED' : 'NORMAL'}
                </span>
              </div>
              
              {escalationSummary && (
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                  <span className="block text-[10px] uppercase tracking-wider text-rose-600 font-semibold mb-1">Handoff Summary Generated</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{escalationSummary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Info size={14} /> Waiting for user input...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

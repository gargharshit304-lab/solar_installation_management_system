import React, { useState } from 'react';
import { 
  Bot, Send, Mic, Sparkles, Terminal, Activity, 
  Cpu, CheckCircle2, Play, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AiCommandCenterPage: React.FC = () => {
  const { 
    aiMessages, 
    sendAiQuery, 
    isAiGenerating, 
    currentUser 
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const suggestedPrompts = [
    'Show all installations delayed this week',
    'Which products are running low?',
    "Show this month's revenue",
    'Summarize all open complaints',
    'Find customers whose warranties expire next month',
    'Which projects are losing money?'
  ];

  const handleSend = (text?: string) => {
    const q = text || inputPrompt;
    if (!q.trim()) return;
    sendAiQuery(q);
    setInputPrompt('');
  };

  const toggleMicRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputPrompt('Which products are running low?');
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-sand" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">AI Operations Command Center</h1>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Enterprise conversational intelligence connected to CRM, ERP inventory, telemetry & financial P&L
          </p>
        </div>

        {/* Integration Architecture Status Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sage-50 text-sage border border-sage/30 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sage animate-ping" />
            <span>FastAPI Backend Ready</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sand-100 text-charcoal border border-warmGrey font-medium">
            <span>Retell AI + Dify Connected</span>
          </span>
        </div>
      </div>

      {/* Suggested Prompts Shelf */}
      <div>
        <p className="text-xs font-semibold text-mutedGrey mb-2 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber" />
          <span>Quick Operational Prompts:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-sand-100 text-charcoal border border-warmGrey/80 transition-all font-medium hover:border-navy shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface Container */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card flex flex-col h-[560px] overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {aiMessages.map(msg => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-amber text-charcoal font-bold text-xs' : 'bg-navy text-white'
                }`}>
                  {isUser ? currentUser.name[0] : <Bot className="w-4 h-4 text-sand" />}
                </div>

                <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-navy text-white shadow-xs rounded-tr-none' 
                    : 'bg-sand-50/80 border border-warmGrey/80 text-charcoal shadow-xs rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line font-normal">
                    {msg.text}
                  </div>

                  {/* Executed Tools Badge */}
                  {msg.executedTools && msg.executedTools.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-warmGrey/60 flex items-center flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey flex items-center mr-1">
                        <Terminal className="w-3 h-3 mr-1 text-navy" /> Tools Executed:
                      </span>
                      {msg.executedTools.map(tool => (
                        <span key={tool} className="px-2 py-0.5 rounded text-[10px] font-mono bg-sand-100 text-navy border border-warmGrey/60">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-warmGrey/60 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(act.action)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-sand-100 text-navy font-semibold text-[11px] border border-warmGrey transition-colors"
                        >
                          → {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAiGenerating && (
            <div className="flex items-center space-x-2 text-xs text-mutedGrey py-2 animate-pulse">
              <Bot className="w-4 h-4 text-navy animate-bounce" />
              <span>SolarOS Agent synthesizing relational database & running diagnostic tools...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-sand-50/70 border-t border-warmGrey/60">
          <form 
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={toggleMicRecording}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording 
                  ? 'bg-terracotta text-white border-terracotta animate-pulse' 
                  : 'bg-white text-charcoal border-warmGrey hover:bg-sand-100'
              }`}
              title="Voice Input (Retell AI placeholder)"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder={isRecording ? 'Listening for speech input...' : 'Ask SolarOS anything about projects, technicians, inventory, or margins...'}
              className="flex-1 px-4 py-2.5 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy bg-white shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isAiGenerating}
              className="px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light disabled:opacity-50 transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <span>Ask Agent</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          {isRecording && (
            <p className="text-[11px] text-terracotta font-semibold mt-1.5 animate-pulse">
              ● Voice agent streaming audio... (Retell AI voice gateway active)
            </p>
          )}
        </div>

      </div>

    </div>
  );
};

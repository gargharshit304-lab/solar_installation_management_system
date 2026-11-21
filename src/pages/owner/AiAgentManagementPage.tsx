import React, { useState } from 'react';
import { 
  Bot, Mic, Phone, PhoneCall, PhoneForwarded, Settings, 
  Play, Pause, Clock, CheckCircle2, TrendingUp, AlertCircle, 
  MessageSquare, User, ShieldCheck, ChevronRight, X, Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RetellAiAgent, RetellCallLog } from '../../types';

export const AiAgentManagementPage: React.FC = () => {
  const { aiAgents, updateAiAgent, toggleAiAgentStatus, showToast } = useApp();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(aiAgents[0]?.id || 'agent-1');
  const [activeCallLog, setActiveCallLog] = useState<RetellCallLog | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configPrompt, setConfigPrompt] = useState('');
  const [configEscalation, setConfigEscalation] = useState('');

  const activeAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  const handleOpenConfig = (agent: RetellAiAgent) => {
    setSelectedAgentId(agent.id);
    setConfigPrompt(agent.systemPrompt);
    setConfigEscalation(agent.escalationRule);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgent) return;
    updateAiAgent(activeAgent.id, {
      systemPrompt: configPrompt,
      escalationRule: configEscalation
    });
    setIsConfigModalOpen(false);
  };

  const totalCallsAll = aiAgents.reduce((acc, a) => acc + a.totalCallsHandled, 0);
  const avgConversionRate = (aiAgents.reduce((acc, a) => acc + a.successConversionRate, 0) / aiAgents.length).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">AI Voice Agents (Retell AI Engine)</h1>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200 uppercase tracking-wider">
              Autonomous Voice Engine
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            SunPower Solutions 24/7 intelligent telephony agents handling lead pre-qualification, customer triage, and route dispatch
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleOpenConfig(activeAgent)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Agent Voice Rules</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Total Voice Calls</span>
            <PhoneCall className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{totalCallsAll}</div>
          <span className="text-[11px] text-emerald-600 font-medium">99.8% Speech uptime</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Avg Lead Qualification</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{avgConversionRate}%</div>
          <span className="text-[11px] text-mutedGrey">Converted to physical surveys</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Active Phone Lines</span>
            <Mic className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{aiAgents.filter(a => a.status === 'active').length} / {aiAgents.length}</div>
          <span className="text-[11px] text-purple-600 font-medium">Virtual PBX trunk live</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Voice Latency</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-charcoal">480ms</div>
          <span className="text-[11px] text-emerald-600 font-medium">Sub-second natural responses</span>
        </div>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {aiAgents.map(agent => {
          const isSelected = agent.id === activeAgent?.id;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-white border-navy ring-2 ring-navy/10 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
                  : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-card-hover hover:border-warmGrey'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                  <Mic className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAiAgentStatus(agent.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                    agent.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-sand-100 text-mutedGrey border border-warmGrey/60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-mutedGrey'}`} />
                  <span>{agent.status.toUpperCase()}</span>
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-charcoal">{agent.name}</h3>
                <p className="text-xs text-mutedGrey mt-0.5 line-clamp-2">{agent.role}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-warmGrey/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-mutedGrey text-[11px]">Inbound Number:</span>
                  <span className="font-mono font-bold text-navy">{agent.inboundNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mutedGrey text-[11px]">Calls Handled:</span>
                  <span className="font-mono font-bold text-charcoal">{agent.totalCallsHandled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mutedGrey text-[11px]">Conversion Rate:</span>
                  <span className="font-mono font-bold text-emerald-700">{agent.successConversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mutedGrey text-[11px]">Average Call:</span>
                  <span className="font-mono text-mutedGrey">{agent.averageDurationSeconds}s</span>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between">
                <span className="text-[10px] text-mutedGrey">Last active: {agent.lastActive}</span>
                <span className="text-xs text-navy font-semibold hover:underline flex items-center space-x-0.5">
                  <span>View Calls</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Details & Call History */}
      {activeAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Agent Configuration Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-charcoal flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-navy" />
                  <span>Agent Configuration</span>
                </h3>
                <button
                  onClick={() => handleOpenConfig(activeAgent)}
                  className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-navy rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-mutedGrey text-[11px] font-semibold uppercase tracking-wider block">Voice Synthesis Engine</span>
                  <p className="mt-0.5 font-medium text-charcoal">{activeAgent.voiceModel}</p>
                </div>

                <div>
                  <span className="text-mutedGrey text-[11px] font-semibold uppercase tracking-wider block">Escalation Threshold</span>
                  <p className="mt-0.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-charcoal font-medium">
                    {activeAgent.escalationRule}
                  </p>
                </div>

                <div>
                  <span className="text-mutedGrey text-[11px] font-semibold uppercase tracking-wider block">Core Prompt Instructions</span>
                  <p className="mt-0.5 p-3 bg-sand-50/60 border border-warmGrey/60 rounded-xl text-charcoal font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                    {activeAgent.systemPrompt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Logs & Transcripts */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-warmGrey/60 bg-sand-50/40 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-charcoal">
                    Recent Voice Interactions — {activeAgent.name}
                  </h3>
                  <p className="text-[11px] text-mutedGrey">
                    Transcripts generated in real time with acoustic sentiment analysis
                  </p>
                </div>
              </div>

              <div className="divide-y divide-warmGrey/40">
                {activeAgent.callLogs.length === 0 ? (
                  <div className="p-8 text-center text-mutedGrey text-xs">
                    No calls recorded yet for this agent line.
                  </div>
                ) : (
                  activeAgent.callLogs.map(call => (
                    <div 
                      key={call.id}
                      onClick={() => setActiveCallLog(call)}
                      className="p-4 hover:bg-sand-50/50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-navy" />
                          <span className="font-bold text-xs text-charcoal font-mono">{call.callerPhone}</span>
                          {call.customerName && (
                            <span className="text-xs text-charcoal font-semibold">({call.customerName})</span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            call.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            call.sentiment === 'negative' ? 'bg-rose-50 text-terracotta border border-rose-200' :
                            'bg-sand-100 text-mutedGrey'
                          }`}>
                            {call.sentiment.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-mutedGrey line-clamp-2">
                          {call.transcriptSnippet}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-navy block">{call.duration}</span>
                        <span className="text-[10px] text-mutedGrey">{call.timestamp}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-sand-100 text-charcoal text-[10px] font-semibold rounded">
                          {call.outcome}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Transcript Detail Modal */}
      {activeCallLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setActiveCallLog(null)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Voice Interaction Transcript</h3>
                <p className="text-xs text-mutedGrey">{activeCallLog.callerPhone} • {activeCallLog.duration} ({activeCallLog.timestamp})</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60 flex justify-between">
                <div>
                  <span className="text-[10px] text-mutedGrey block">Identified Caller</span>
                  <span className="font-bold text-charcoal">{activeCallLog.customerName || 'Inbound Prospect'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-mutedGrey block">Outcome</span>
                  <span className="font-bold text-emerald-700">{activeCallLog.outcome}</span>
                </div>
              </div>

              <div>
                <span className="text-mutedGrey font-semibold text-[11px] uppercase tracking-wider block mb-1">
                  Full Dialogue Summary & Notes
                </span>
                <div className="p-3 bg-sand-50/50 rounded-xl border border-warmGrey/40 text-charcoal leading-relaxed">
                  {activeCallLog.transcriptSnippet}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-warmGrey/60">
              <button
                onClick={() => setActiveCallLog(null)}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Configuration Modal */}
      {isConfigModalOpen && activeAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-charcoal mb-1">Configure {activeAgent.name}</h3>
            <p className="text-xs text-mutedGrey mb-4">Adjust system instructions and human escalation criteria</p>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">System Prompt & Persona Guidelines</label>
                <textarea
                  rows={6}
                  value={configPrompt}
                  onChange={e => setConfigPrompt(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl font-mono text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Escalation & Live Transfer Trigger</label>
                <textarea
                  rows={2}
                  value={configEscalation}
                  onChange={e => setConfigEscalation(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 border border-warmGrey rounded-xl font-semibold hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

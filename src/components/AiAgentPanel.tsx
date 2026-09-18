import React, { useState, useEffect, useRef } from 'react';
import { AgentData, AiAgentChatMessage, EmergentArtifact, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import {
  Sparkles,
  Send,
  Bot,
  Zap,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Brain,
  Share2,
  User,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface AiAgentPanelProps {
  agent: AgentData;
  allAgents: AgentData[];
  onInjectArtifact?: (artifact: EmergentArtifact) => void;
  onInjectBroadcast?: (senderId: string, topic: string, content: any) => void;
  onClose?: () => void;
}

export const AiAgentPanel: React.FC<AiAgentPanelProps> = ({
  agent,
  allAgents,
  onInjectArtifact,
  onInjectBroadcast,
  onClose,
}) => {
  const [tab, setTab] = useState<'chat' | 'act' | 'analysis'>('chat');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Chat State
  const [chatMessages, setChatMessages] = useState<AiAgentChatMessage[]>([
    {
      role: 'agent',
      text: `Hello! I am ${agent.id}. In our 500-agent collective, my specialized job is ${agent.job}, operating via the action verb "${agent.verb}" in ${agent.domain}. What would you like to explore or synthesize?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Action State
  const [actionType, setActionType] = useState<'produce' | 'merge'>('produce');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    agent.partners[0] || (allAgents.find((a) => a.domain !== agent.domain)?.id || '')
  );
  const [isGeneratingAction, setIsGeneratingAction] = useState<boolean>(false);
  const [actionResult, setActionResult] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [injectedSuccess, setInjectedSuccess] = useState<boolean>(false);

  // Analysis State
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isSendingChat]);

  // Reset or initialize on agent change
  useEffect(() => {
    setChatMessages([
      {
        role: 'agent',
        text: `Greetings! Agent ${agent.id} online. Domain: ${agent.domain.toUpperCase()} | Specialization: ${agent.job} | Decision: ${agent.decision_name}. How can my neural focus serve our emergent collective today?`,
        timestamp: Date.now(),
      },
    ]);
    setActionResult(null);
    setAnalysisText(null);
    setActionError(null);
    setChatError(null);
    setInjectedSuccess(false);
  }, [agent.id]);

  // Send message to agent via Gemini
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSendingChat) return;

    setInputMessage('');
    setChatError(null);
    const newMsg: AiAgentChatMessage = { role: 'user', text, timestamp: Date.now() };
    const updatedHistory = [...chatMessages, newMsg];
    setChatMessages(updatedHistory);
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          message: text,
          history: updatedHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'agent', text: data.reply, timestamp: Date.now() },
      ]);
    } catch (err: any) {
      setChatError(err.message || 'Unable to connect with AI agent.');
    } finally {
      setIsSendingChat(false);
    }
  };

  // Generate AI Action
  const handleGenerateAction = async () => {
    setIsGeneratingAction(true);
    setActionError(null);
    setActionResult(null);
    setInjectedSuccess(false);

    try {
      const partnerAgent = allAgents.find((a) => a.id === selectedPartnerId);
      const res = await fetch('/api/agent/generate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          actionType,
          otherAgent: actionType === 'merge' ? partnerAgent : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setActionResult(data.proposal);
    } catch (err: any) {
      setActionError(err.message || 'Failed to generate AI action.');
    } finally {
      setIsGeneratingAction(false);
    }
  };

  // Inject the generated AI action into the live simulation swarm
  const handleInjectIntoSwarm = () => {
    if (!actionResult || !onInjectArtifact) return;

    if (actionType === 'merge') {
      const partnerAgent = allAgents.find((a) => a.id === selectedPartnerId);
      const partnerDomain = partnerAgent ? partnerAgent.domain : Domain.ART;

      const newArtifact: EmergentArtifact = {
        id: `ai-art-${Date.now().toString(16)}`,
        domains: [agent.domain, partnerDomain].sort() as [Domain, Domain],
        contributors: [agent.id, selectedPartnerId],
        t: Math.floor(Date.now() / 1000) % 10000,
        content: {
          kind: 'ai-synthesis',
          domain_a: agent.domain,
          domain_b: partnerDomain,
          pieces: [
            {
              title: actionResult.title,
              summary: actionResult.summary,
              detail: actionResult.detail,
            },
            {
              job: partnerAgent?.job || 'collaborator',
              domain: partnerDomain,
            },
          ],
          job_b: partnerAgent?.job || `${partnerDomain}_specialist`,
          by: [agent.id, selectedPartnerId],
          aiProposal: actionResult,
        },
        isAiGenerated: true,
      };

      onInjectArtifact(newArtifact);
      setInjectedSuccess(true);
    } else {
      if (onInjectBroadcast) {
        onInjectBroadcast(agent.id, `ai-proposal:${agent.domain}`, {
          title: actionResult.title,
          summary: actionResult.summary,
          detail: actionResult.detail,
          tags: actionResult.tags,
        });
        setInjectedSuccess(true);
      }
    }
  };

  // Request Cognitive Analysis
  const handleRequestAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisText(null);
    try {
      const prompt = `Perform a cognitive profile analysis of Agent ${agent.id} in our 500-agent swarm.
Domain: ${agent.domain} | Job: ${agent.job} | Verb: ${agent.verb} | Rule: ${agent.decision_name}
Total artifacts created: ${agent.made} | Partners: ${agent.partners.length} (${agent.partners.join(', ') || 'none'})
Provide:
1. Specialization Strengths
2. Emergent Network Influence
3. High-Value Collaborative Pairing Recommendation`;

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          message: prompt,
        }),
      });

      if (!res.ok) throw new Error('Analysis request failed');
      const data = await res.json();
      setAnalysisText(data.reply);
    } catch (err: any) {
      setAnalysisText(`Error generating profile: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const domainStyle = DOMAIN_COLORS[agent.domain] || {
    badge: 'bg-neutral-100 text-neutral-800',
    border: 'border-neutral-200',
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-md flex flex-col overflow-hidden text-neutral-900">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-tight">{agent.id}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/80">
                Gemini 3.5 Flash
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              AI Connected Agent • {agent.job}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
              isConnected
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                : 'bg-neutral-800 text-neutral-400'
            }`}
            title="Toggle Gemini Live Connection"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
              }`}
            />
            <span>{isConnected ? 'Active' : 'Offline'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/80 px-3 pt-2 gap-1 text-xs">
        <button
          onClick={() => setTab('chat')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 ${
            tab === 'chat'
              ? 'bg-white border-t border-x border-neutral-200 text-neutral-900 font-semibold -mb-px'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
          <span>Agent Chat</span>
        </button>
        <button
          onClick={() => setTab('act')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 ${
            tab === 'act'
              ? 'bg-white border-t border-x border-neutral-200 text-neutral-900 font-semibold -mb-px'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Action & Synthesis</span>
        </button>
        <button
          onClick={() => {
            setTab('analysis');
            if (!analysisText && !isAnalyzing) handleRequestAnalysis();
          }}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 ${
            tab === 'analysis'
              ? 'bg-white border-t border-x border-neutral-200 text-neutral-900 font-semibold -mb-px'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-blue-500" />
          <span>Cognitive Profile</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 flex-1 flex flex-col min-h-[360px] max-h-[480px]">
        {/* TAB 1: LIVE CHAT */}
        {tab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[280px]"
            >
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 text-xs ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'agent' && (
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                      {agent.domain.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-neutral-900 text-white rounded-tr-none'
                        : 'bg-neutral-100 text-neutral-800 rounded-tl-none border border-neutral-200/60'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span
                      className={`text-[9px] block mt-1 ${
                        m.role === 'user' ? 'text-neutral-400 text-right' : 'text-neutral-400'
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isSendingChat && (
                <div className="flex gap-2 items-center text-xs text-neutral-500 py-1">
                  <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-3 h-3 text-purple-700" />
                  </div>
                  <span className="italic font-mono text-[11px]">
                    {agent.id} is synthesizing via Gemini...
                  </span>
                </div>
              )}

              {chatError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold mr-1 self-center">
                Quick Prompts:
              </span>
              {[
                `How do you ${agent.verb}?`,
                `What's your current priority?`,
                `Propose a cross-domain merger`,
                `Critique our swarm results`,
              ].map((chip) => (
                <button
                  key={chip}
                  disabled={isSendingChat}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[11px] text-neutral-700 transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${agent.id} anything...`}
                disabled={isSendingChat}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-neutral-50 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={isSendingChat || !inputMessage.trim()}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: AI ACTION & SYNTHESIS */}
        {tab === 'act' && (
          <div className="flex-1 flex flex-col justify-between space-y-3 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
                <span className="font-semibold text-neutral-700 block mb-1">
                  Execute Autonomous AI Action
                </span>
                <p className="text-neutral-500 leading-relaxed">
                  Direct Gemini to think as Agent {agent.id} and produce a domain-native
                  breakthrough, or partner with another agent from a differing domain to synthesize a
                  novel hybrid artifact.
                </p>
              </div>

              {/* Action Mode Choice */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActionType('produce')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    actionType === 'produce'
                      ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-500'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Solo Domain Discovery
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Apply verb &quot;{agent.verb}&quot; in {agent.domain}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('merge')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    actionType === 'merge'
                      ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-500'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Cross-Domain Synthesis
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Merge with a collaborative partner
                  </div>
                </button>
              </div>

              {/* Partner Picker if Merge */}
              {actionType === 'merge' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 uppercase">
                    Select Collaborative Partner Agent:
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white font-mono"
                  >
                    {allAgents
                      .filter((a) => a.id !== agent.id)
                      .slice(0, 100)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.id} ({a.domain.toUpperCase()} • {a.job})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={handleGenerateAction}
                disabled={isGeneratingAction}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {isGeneratingAction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini is generating {agent.id}&apos;s work...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {actionType === 'produce'
                        ? `Generate ${agent.domain.toUpperCase()} Discovery`
                        : 'Synthesize Cross-Domain Artifact'}
                    </span>
                  </>
                )}
              </button>

              {actionError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {actionError}
                </div>
              )}

              {/* Generated Result Preview */}
              {actionResult && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 text-sm">
                      {actionResult.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-200 text-purple-800">
                      AI Generated
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed font-medium">
                    {actionResult.summary}
                  </p>
                  <div className="p-2 bg-white rounded border border-purple-100 font-mono text-[11px] text-neutral-800 whitespace-pre-wrap">
                    {actionResult.detail}
                  </div>
                  {actionResult.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {actionResult.tags.map((t: string) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inject into Swarm Button */}
                  <div className="pt-2">
                    {injectedSuccess ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs py-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Successfully registered into the 500-agent swarm!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleInjectIntoSwarm}
                        className="w-full py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>
                          {actionType === 'merge'
                            ? 'Broadcast Artifact to Swarm Gallery'
                            : 'Broadcast Proposal to Swarm Message Bus'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COGNITIVE PROFILE */}
        {tab === 'analysis' && (
          <div className="flex-1 flex flex-col justify-between space-y-3 overflow-y-auto text-xs">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500 space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                <span className="font-mono text-xs">
                  Gemini analyzing Agent {agent.id}&apos;s behavioral network topology...
                </span>
              </div>
            ) : analysisText ? (
              <div className="space-y-3">
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  <span className="font-semibold text-neutral-800 block mb-1">
                    AI Cognitive Profile & Strategic Assessment
                  </span>
                  <div className="whitespace-pre-wrap leading-relaxed text-neutral-700 font-sans text-xs">
                    {analysisText}
                  </div>
                </div>

                <button
                  onClick={handleRequestAnalysis}
                  className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg text-xs font-medium text-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-evaluate Profile</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-500">
                <Brain className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p>Click below to generate a real-time AI cognitive assessment.</p>
                <button
                  onClick={handleRequestAnalysis}
                  className="mt-3 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
                >
                  Generate Cognitive Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

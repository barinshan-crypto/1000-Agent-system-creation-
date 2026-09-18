import React, { useState, useMemo } from 'react';
import { AgentData, Domain, DecisionTemplate, EmergentArtifact } from '../types';
import { DOMAIN_COLORS, DECISION_TEMPLATES } from '../engine/simulationEngine';
import { Users, Search, Activity, Zap, CheckCircle2, ArrowRight, Sparkles, Bot } from 'lucide-react';
import { AiAgentPanel } from './AiAgentPanel';

interface AgentMatrixProps {
  agents: AgentData[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onInjectArtifact?: (artifact: EmergentArtifact) => void;
  onInjectBroadcast?: (senderId: string, topic: string, content: any) => void;
}

export const AgentMatrix: React.FC<AgentMatrixProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onInjectArtifact,
  onInjectBroadcast,
}) => {
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterRule, setFilterRule] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [inspectorMode, setInspectorMode] = useState<"standard" | "ai">("ai");

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const matchDomain = filterDomain === "all" || a.domain === filterDomain;
      const matchRule = filterRule === "all" || a.decision_name === filterRule;
      const matchSearch =
        search.trim() === "" ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.job.toLowerCase().includes(search.toLowerCase()) ||
        a.verb.toLowerCase().includes(search.toLowerCase());
      return matchDomain && matchRule && matchSearch;
    });
  }, [agents, filterDomain, filterRule, search]);

  const selectedAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentId) || null;
  }, [agents, selectedAgentId]);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Domains (10)</option>
            {Object.values(Domain).map((d) => {
              const count = agents.filter((a) => a.domain === d).length;
              return (
                <option key={d} value={d}>
                  {d.toUpperCase()} ({count} agents)
                </option>
              );
            })}
          </select>

          {/* Decision Rule Filter */}
          <select
            value={filterRule}
            onChange={(e) => setFilterRule(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Decision Rules (4)</option>
            {DECISION_TEMPLATES.map((rule) => (
              <option key={rule} value={rule}>
                Rule: {rule}
              </option>
            ))}
          </select>

          <span className="text-xs text-neutral-400 font-mono">
            Showing {filteredAgents.length} / {agents.length} agents
          </span>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Find by ID or verb..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 500-Agent Grid / Matrix */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {agents.length.toLocaleString()}-Agent Matrix Grid
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Produce
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Merge
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Respond
              </span>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 md:grid-cols-25 gap-1 max-h-[520px] overflow-y-auto p-1 border border-neutral-100 rounded-lg bg-neutral-50/50">
            {filteredAgents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              const colorInfo = DOMAIN_COLORS[agent.domain];
              
              let actionIndicator = "border-transparent";
              if (agent.lastAction === "merge") actionIndicator = "border-purple-500 ring-1 ring-purple-300";
              else if (agent.lastAction === "respond") actionIndicator = "border-blue-500 ring-1 ring-blue-300";
              else if (agent.lastAction === "produce") actionIndicator = "border-emerald-500";

              return (
                <button
                  key={agent.id}
                  id={`agent-cell-${agent.id}`}
                  onClick={() => onSelectAgent(agent.id)}
                  title={`${agent.id} (${agent.job}) - made: ${agent.made} - rule: ${agent.decision_name}`}
                  className={`relative aspect-square rounded-sm text-[9px] font-mono flex flex-col items-center justify-center transition-all p-0.5 border ${actionIndicator} ${
                    isSelected
                      ? "ring-2 ring-neutral-900 z-10 scale-110 font-bold bg-white shadow-md text-neutral-900"
                      : `${colorInfo.bg} ${colorInfo.text} hover:scale-105 hover:z-5`
                  }`}
                >
                  <span className="truncate">{agent.idx}</span>
                  {agent.made > 0 && (
                    <span className="text-[7px] leading-none opacity-80">
                      {agent.made}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Agent Inspector */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
          {selectedAgent ? (
            <div className="flex-1 flex flex-col">
              {/* Inspector Header with Mode Tabs */}
              <div className="px-4 py-2.5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">{selectedAgent.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      DOMAIN_COLORS[selectedAgent.domain]?.badge || "bg-neutral-100"
                    }`}
                  >
                    {selectedAgent.domain}
                  </span>
                  {selectedAgent.status && selectedAgent.status !== "ACTIVE" && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        selectedAgent.status === "CDL_REVIEW"
                          ? "bg-rose-500 text-white animate-pulse"
                          : selectedAgent.status === "QUARANTINED"
                          ? "bg-amber-500 text-neutral-900"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {selectedAgent.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-neutral-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setInspectorMode("ai")}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                      inspectorMode === "ai"
                        ? "bg-purple-600 text-white shadow-xs font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>AI Connected</span>
                  </button>
                  <button
                    onClick={() => setInspectorMode("standard")}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                      inspectorMode === "standard"
                        ? "bg-neutral-700 text-white shadow-xs font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    <span>Rule Specs</span>
                  </button>
                </div>
              </div>

              {/* Inspector Content */}
              {inspectorMode === "ai" ? (
                <div className="flex-1">
                  <AiAgentPanel
                    agent={selectedAgent}
                    allAgents={agents}
                    onInjectArtifact={onInjectArtifact}
                    onInjectBroadcast={onInjectBroadcast}
                    onClose={() => onSelectAgent(null)}
                  />
                </div>
              ) : (
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Connect with AI Banner */}
                    <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-purple-950">Connect with Gemini AI</div>
                          <div className="text-[11px] text-purple-700">Chat & synthesize directly with this agent</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setInspectorMode("ai")}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                      >
                        Open AI
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                        <span className="text-[11px] text-neutral-400 uppercase font-semibold">Single Job:</span>
                        <div className="font-mono font-medium text-neutral-800 text-sm mt-0.5">
                          {selectedAgent.job}
                        </div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          Action verb: <span className="font-semibold text-neutral-700">{selectedAgent.verb}</span> in domain <span className="font-semibold text-neutral-700">{selectedAgent.domain}</span>
                        </div>
                      </div>

                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                        <span className="text-[11px] text-neutral-400 uppercase font-semibold">Single Decision Rule:</span>
                        <div className="font-mono font-medium text-neutral-800 mt-0.5">
                          {selectedAgent.decision_name}
                        </div>
                        <div className="text-neutral-500 text-[11px] mt-1 leading-relaxed">
                          {selectedAgent.decision_name === "produce_first" &&
                            "Prioritizes producing new work; only responds to incoming queries with 25% probability."}
                          {selectedAgent.decision_name === "respond_first" &&
                            "Always prioritizes answering incoming messages if available, otherwise produces."}
                          {selectedAgent.decision_name === "merge_first" &&
                            "Seeks cross-domain proposals from broadcasts and merges them (60% probability) to synthesize new artifacts."}
                          {selectedAgent.decision_name === "explore" &&
                            "Probabilistic behavior: responds to incoming (30%), merges cross-domain broadcasts (25%), or produces fresh work."}
                        </div>
                      </div>

                      {selectedAgent.cdlConstraintsApplied && selectedAgent.cdlConstraintsApplied.length > 0 && (
                        <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-rose-700 uppercase font-bold flex items-center gap-1">
                              CDL Active Constraints ({selectedAgent.cdlConstraintsApplied.length}):
                            </span>
                            <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded font-mono">
                              Crisis Memory
                            </span>
                          </div>
                          <div className="mt-1.5 space-y-1">
                            {selectedAgent.cdlConstraintsApplied.map((rule, idx) => (
                              <div key={idx} className="text-[11px] font-mono text-rose-900 bg-white p-1.5 rounded border border-rose-100">
                                {rule}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="border border-neutral-100 rounded-lg p-2 bg-neutral-50 text-center">
                          <div className="text-[11px] text-neutral-400 font-medium">Artifacts Made</div>
                          <div className="text-lg font-bold text-neutral-900 font-mono">
                            {selectedAgent.made}
                          </div>
                        </div>
                        <div className="border border-neutral-100 rounded-lg p-2 bg-neutral-50 text-center">
                          <div className="text-[11px] text-neutral-400 font-medium">Partners</div>
                          <div className="text-lg font-bold text-neutral-900 font-mono">
                            {selectedAgent.partners.length}
                          </div>
                        </div>
                      </div>

                      {selectedAgent.partners.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] text-neutral-400 font-semibold uppercase">Collaborator Partners:</span>
                          <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                            {selectedAgent.partners.map((p) => (
                              <button
                                key={p}
                                onClick={() => onSelectAgent(p)}
                                className="font-mono text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded transition-colors"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <span className="text-[11px] text-neutral-400 font-semibold uppercase">
                          Memory Queue ({selectedAgent.memory.length} / 25):
                        </span>
                        <div className="mt-1 space-y-1 max-h-36 overflow-y-auto font-mono text-[10px]">
                          {selectedAgent.memory.length === 0 ? (
                            <div className="text-neutral-400 italic text-[11px] py-1">No incoming messages in memory</div>
                          ) : (
                            selectedAgent.memory.slice(-5).map((m, i) => (
                              <div key={i} className="p-1.5 bg-neutral-50 border border-neutral-100 rounded text-neutral-600 truncate">
                                <span className="text-neutral-400 font-medium">t={m.timestamp}</span> {m.sender} ➔ {m.topic}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Agent Index: #{selectedAgent.idx}</span>
                    <button
                      onClick={() => onSelectAgent(null)}
                      className="text-neutral-500 hover:text-neutral-800 text-[11px]"
                    >
                      Clear selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-3 border border-purple-100">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">Select an agent to connect with AI</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                Click any agent cell to chat directly via Gemini 3.8 Flash, trigger AI domain actions, or synthesize interdisciplinary artifacts into the active swarm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

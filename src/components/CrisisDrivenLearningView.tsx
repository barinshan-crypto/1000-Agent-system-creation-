import React, { useState } from 'react';
import {
  ShieldAlert,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Zap,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Layers,
  FileCode2,
  Terminal,
  Activity,
  ArrowRight,
  Server
} from 'lucide-react';
import { CdlModuleState, CdlCrisisEvent } from '../types';

interface CrisisDrivenLearningViewProps {
  cdlState: CdlModuleState;
  onTriggerManualCrisis: (type: "stagnation" | "hallucination_cascade" | "stress_fracture", domain?: string) => void;
  onStepSimulation: () => void;
  tick: number;
  onOpenHeavyThinking?: () => void;
}

export const CrisisDrivenLearningView: React.FC<CrisisDrivenLearningViewProps> = ({
  cdlState,
  onTriggerManualCrisis,
  onStepSimulation,
  tick,
  onOpenHeavyThinking,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "code" | "log">("overview");

  const totalConstraints = Object.values(cdlState.activeConstraints).flat().length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              Crisis-Driven Learning (CDL) Engine
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                فێربوون لە ڕێگەی قەیرانەکانەوە
              </span>
            </h2>
          </div>
          <p className="text-xs text-neutral-600 max-w-3xl leading-relaxed">
            وەک دڵ و مێشکی سیستەمەکە کار دەکات: کاتێک لە تیکەکاندا کێشە و چەقبەستن (Stagnation) یان هەڵبەستنی لۆژیکی (Hallucination Cascade) ڕوودەدات، ئەیجێنتەکان کەرەنتین (CDL_REVIEW) دەکرێن، ڕێسای نوێ (Constraint) دادەڕێژرێت و دەخرێتە ناو بیرگەی CDL تا قەیرانەکە دووبارە نەبێتەوە.
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Threshold</div>
            <div className="text-sm font-bold text-neutral-900">{cdlState.crisisThreshold} ticks</div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-rose-700 font-bold">Crises Prevented</div>
            <div className="text-sm font-bold text-rose-900">{cdlState.totalCrisesPrevented}</div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">CDL Review</div>
            <div className="text-sm font-bold text-amber-900">{cdlState.isolatedAgentIds.length} agents</div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-indigo-700 font-bold">Injected Rules</div>
            <div className="text-sm font-bold text-indigo-900">{totalConstraints} active</div>
          </div>
        </div>
      </div>

      {/* Action Bar / Crisis Injections */}
      <div className="bg-neutral-900 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-800 text-rose-400 flex items-center justify-center shrink-0 border border-neutral-700">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              تاقیکردنەوەی میکانیزمی قەیران (Crisis Stress-Testing)
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                Tick: #{tick}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              قەیرانێک بە ئەنقەست دروست بکە تا ببینی چۆن CDL یەکسەر ئەیجێنتەکان ڕادەگرێت و مەرجی خۆپاراستن چێ دەکات.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerManualCrisis("stagnation", "global")}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>چەقبەستن (Stagnation)</span>
          </button>

          <button
            onClick={() => onTriggerManualCrisis("hallucination_cascade", "global")}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>هەڵوەشانەوەی لۆژیکی (Hallucination)</span>
          </button>

          <button
            onClick={() => onTriggerManualCrisis("stress_fracture", "engineering")}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>شکانی مێکانیکی (Stress Fracture)</span>
          </button>

          <button
            onClick={onStepSimulation}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors ml-1 shadow-xs"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Step Tick</span>
          </button>

          {onOpenHeavyThinking && (
            <button
              onClick={onOpenHeavyThinking}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors ml-1 shadow-xs cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-purple-200" />
              <span>ناردن بۆ سێرڤەری گەورە (Heavy Thinking)</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === "overview"
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Active Constraints & Counters (مەرجە چالاکەکان)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("log")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === "log"
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Crisis Transparency Log (مێژووی قەیرانەکان)</span>
          {cdlState.crisisLog.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-mono">
              {cdlState.crisisLog.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("code")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === "code"
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-purple-500" />
          <span>Python Architecture Code (سۆرس کۆد)</span>
        </button>
      </div>

      {/* Overview SubTab */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Constraints Memory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    CDL Memory: Learned Constraints (بیرگەی مەرجە فێربووەکان)
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  decay: {cdlState.memoryDecay * 100}%
                </span>
              </div>

              {totalConstraints === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <div className="text-xs font-bold text-neutral-800">هیچ کێشە و قەیرانێک تۆمار نەکراوە</div>
                  <div className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                    سیستەم لە دۆخی ئاساییدایە. دەتوانی لە سەرەوە بە دوگمەکان قەیران دروست بکەیت تا ببینی چۆن مەرجی نوێ دێتە کایەوە.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Object.entries(cdlState.activeConstraints) as [string, string[]][]).map(([domain, rules]) => (
                    <div key={domain} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-neutral-800 uppercase px-2 py-0.5 rounded bg-neutral-200">
                          {domain}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {rules.length} Active Rule{rules.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {rules.map((rule, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded border border-neutral-200 shadow-2xs text-xs">
                            <div className="font-mono text-neutral-900 font-medium leading-relaxed">
                              {rule}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-1 font-sans">
                              {rule.includes("stagnation") || rule.includes("novel")
                                ? "مەرج: دەبێت شێوازی نوێ بەکاربهێنرێت و بەرهەمی دووبارەی تیکی پێشوو ڕەت دەکرێتەوە."
                                : rule.includes("SMT") || rule.includes("logic")
                                ? "مەرج: بەکارهێنانی سەلمێنەری فەرمی (SMT) پێش پێشکەشکردنی داهێنان بۆ بنبڕکردنی هەڵبەستن."
                                : "مەرج: پاراستنی هاوسەنگی پارامیتەرە فیزیاییەکان بۆ ڕێگری لە شکان."}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Crisis Counters & Quarantine Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Crisis Counters (ژمێرەری قەیرانەکان)
                </h3>
              </div>
              <p className="text-[11px] text-neutral-500 mb-3">
                ئەگەر ژمێرەرەکە بگاتە {cdlState.crisisThreshold}، پرۆتۆکۆڵی فریاگوزاری چالاک دەبێت.
              </p>

              <div className="space-y-2">
                {Object.entries(cdlState.crisisCounters).length === 0 ? (
                  <div className="text-xs text-neutral-400 italic p-3 text-center bg-neutral-50 rounded">
                    هیچ ژمێرەرێکی مەترسی چالاک نییە
                  </div>
                ) : (
                  (Object.entries(cdlState.crisisCounters) as [string, number][]).map(([name, count]) => {
                    const ratio = Math.min(1, count / cdlState.crisisThreshold);
                    return (
                      <div key={name} className="p-2 rounded bg-neutral-50 border border-neutral-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-neutral-700 truncate max-w-[150px]">{name}</span>
                          <span className="font-bold font-mono text-neutral-900">
                            {count} / {cdlState.crisisThreshold}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              count >= cdlState.crisisThreshold ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${ratio * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Isolated Agents Status */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    CDL_REVIEW Agents
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {cdlState.isolatedAgentIds.length}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mb-3">
                ئەو ئەیجێنتانەی لەبەر پاراستنی سیستەم لە قەیران کاتی ڕاگیراون بۆ پشکنین:
              </p>

              {cdlState.isolatedAgentIds.length === 0 ? (
                <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-50 rounded">
                  سەرجەم ئەیجێنتەکان لە دۆخی ACTIVE دان.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1">
                  {cdlState.isolatedAgentIds.slice(0, 30).map((id) => (
                    <span
                      key={id}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200"
                    >
                      {id}
                    </span>
                  ))}
                  {cdlState.isolatedAgentIds.length > 30 && (
                    <span className="text-[10px] text-neutral-500 self-center">
                      +{cdlState.isolatedAgentIds.length - 30} زیاتر...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log SubTab */}
      {activeSubTab === "log" && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Crisis Resolution Log (تۆماری ئاشکرای چارەسەرییەکان)
            </h3>
            <span className="text-xs text-neutral-500">
              Crucial for AGI Research transparency (ڕێگری لە ڕەفتاری سندوقی ڕەش)
            </span>
          </div>

          {cdlState.crisisLog.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 italic bg-neutral-50 rounded-lg">
              تۆمارەکە پاکە؛ هیچ قەیرانێک تۆمار نەکراوە.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {cdlState.crisisLog.map((event, i) => (
                <div key={i} className="py-3 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                        Tick #{event.tick}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          event.severity === "critical"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {event.crisisType} • {event.domain}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {event.affectedAgentsCount} agents placed in CDL_REVIEW
                      </span>
                    </div>

                    <div className="text-xs font-mono font-medium text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-200">
                      {event.ruleInjected}
                    </div>

                    <div className="text-xs text-neutral-600">
                      {event.ruleInjectedKu}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-neutral-400 shrink-0">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code SubTab */}
      {activeSubTab === "code" && (
        <div className="bg-neutral-950 rounded-xl p-5 border border-neutral-800 text-neutral-200 font-mono text-xs overflow-x-auto">
          <div className="text-neutral-400 mb-3 pb-2 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-white font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              crisis_driven_learning.py — 1,000-Agent Architecture Module
            </span>
            <span className="text-[11px] text-neutral-500">
              Native Python Implementation
            </span>
          </div>

          <pre className="text-neutral-300 leading-relaxed">
{`import time
from collections import defaultdict

class CrisisDrivenLearningModule:
    def __init__(self, crisis_threshold=3, memory_decay=0.95):
        # Track consecutive failures or stagnation per domain/synthesis type
        self.crisis_counters = defaultdict(int) 
        self.crisis_threshold = crisis_threshold
        
        # CDL Memory: Learned constraints to prevent repeating crises
        # Format: { "synthesis_type": ["constraint_rule_1", "constraint_rule_2"] }
        self.cdl_memory = defaultdict(list) 
        self.memory_decay = memory_decay
        
        # Log of resolved crises for transparency (Crucial for AGI research)
        self.crisis_log = []

    def evaluate_tick(self, tick_number, active_agents, generated_artifacts):
        """
        Called at the end of every tick in your 1,000-Agent System.
        """
        detected_crises = self._detect_crises(generated_artifacts)
        
        if detected_crises:
            self._trigger_cdl_protocol(tick_number, detected_crises, active_agents)
            
        # Return any new constraints to be injected into the next tick's agent rules
        return self.get_active_constraints()

    def _detect_crises(self, artifacts):
        """
        Detects systemic failures in the emergent artifacts.
        Examples: Recursive loops, semantic contradictions, or stagnation.
        """
        crises = []
        
        # Example Crisis 1: Stagnation / Echo Chamber
        synthesis_counts = defaultdict(int)
        for art in artifacts:
            synthesis_counts[art['type']] += 1
            
        for syn_type, count in synthesis_counts.items():
            if count > 50:
                self.crisis_counters[f"stagnation_{syn_type}"] += 1
                if self.crisis_counters[f"stagnation_{syn_type}"] >= self.crisis_threshold:
                    crises.append({
                        "type": "stagnation",
                        "domain": syn_type,
                        "severity": "high"
                    })

        # Example Crisis 2: Contradictory/Hallucinated Logic
        invalid_artifacts = [a for a in artifacts if a.get('validation_failed', False)]
        if len(invalid_artifacts) > len(artifacts) * 0.2:
            self.crisis_counters["systemic_hallucination"] += 1
            if self.crisis_counters["systemic_hallucination"] >= self.crisis_threshold:
                crises.append({
                    "type": "hallucination_cascade",
                    "domain": "global",
                    "severity": "critical"
                })

        return crises

    def _trigger_cdl_protocol(self, tick_number, crises, active_agents):
        """
        The core CDL mechanism: Halt, Analyze, Learn, Inject.
        """
        print(f"[CDL ALERT] Tick {tick_number}: Crisis detected! Initiating learning protocol...")
        
        for crisis in crises:
            # 1. Isolate the failing agents/domains
            affected_agents = self._isolate_agents(crisis, active_agents)
            
            # 2. Formulate a new constraint rule based on the crisis
            new_rule = self._formulate_rule(crisis)
            
            # 3. Update CDL Memory
            self.cdl_memory[crisis['domain']].append(new_rule)
            
            # 4. Log for transparency (Avoiding black-box behavior)
            log_entry = {
                "tick": tick_number,
                "crisis_type": crisis['type'],
                "affected_agents": len(affected_agents),
                "rule_injected": new_rule,
                "timestamp": time.time()
            }
            self.crisis_log.append(log_entry)
            
            print(f"[CDL LEARNING] Domain: {crisis['domain']} | Rule Injected: {new_rule}")
            
            # Reset counter after learning
            self.crisis_counters[f"{crisis['type']}_{crisis['domain']}"] = 0

    def _isolate_agents(self, crisis, active_agents):
        affected = []
        for agent in active_agents:
            if crisis['domain'] == "global" or crisis['domain'] in agent['specialization']:
                agent['status'] = 'CDL_REVIEW' # Pause agent temporarily
                affected.append(agent)
        return affected

    def _formulate_rule(self, crisis):
        if crisis['type'] == "stagnation":
            return f"CONSTRAINT: Must introduce novel variable in {crisis['domain']} synthesis; forbid exact replication of previous tick."
        elif crisis['type'] == "hallucination_cascade":
            return "CONSTRAINT: Cross-validate all numeric/logic outputs with a secondary auditor agent before synthesis."
        return "CONSTRAINT: Fallback to safe baseline parameters."

    def get_active_constraints(self):
        constraints = {}
        for domain, rules in self.cdl_memory.items():
            constraints[domain] = rules[-3:]
        return constraints`}
          </pre>
        </div>
      )}
    </div>
  );
};

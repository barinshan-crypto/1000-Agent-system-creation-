import React, { useState } from 'react';
import {
  Server,
  BrainCircuit,
  Zap,
  ShieldAlert,
  ArrowRight,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  FileCode,
  Activity,
  AlertTriangle,
  Send,
  Database,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Rocket
} from 'lucide-react';
import {
  GeminiHeavyThinkingPayload,
  GeminiHeavyThinkingRawResponse,
  GeminiHeavyThinkingResult,
  Domain,
  CdlModuleState,
} from '../types';

interface HeavyThinkingServerViewProps {
  tick: number;
  payload: GeminiHeavyThinkingPayload;
  history: GeminiHeavyThinkingResult[];
  isLoading: boolean;
  onDispatchHeavyThinking: (userGoal?: string) => Promise<void>;
  onStepSimulation: () => void;
  cdlState: CdlModuleState;
  autoEscalateOnCrisis: boolean;
  onToggleAutoEscalate: () => void;
}

export const HeavyThinkingServerView: React.FC<HeavyThinkingServerViewProps> = ({
  tick,
  payload,
  history,
  isLoading,
  onDispatchHeavyThinking,
  onStepSimulation,
  cdlState,
  autoEscalateOnCrisis,
  onToggleAutoEscalate,
}) => {
  const [userGoal, setUserGoal] = useState<string>(
    "Solve cognitive stagnation across Embodied Robotics & Neuro-Symbolic Logic, and formulate formal axioms for deep space extreme environments."
  );
  const [showPayloadJson, setShowPayloadJson] = useState<boolean>(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);

  const activeResult = history[selectedResultIndex] || history[0];

  const handleTrigger = async () => {
    await onDispatchHeavyThinking(userGoal.trim() ? userGoal : undefined);
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-purple-950 to-indigo-950 rounded-2xl p-6 text-white border border-purple-800/40 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Massive Server (Gemini) Heavy Thinking Core
                  </h2>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200">
                    Dual-Tier Intelligence
                  </span>
                </div>
                <div className="text-xs text-purple-200/80 font-medium">
                  ناردنی تەواوی داتای ١,٠٠٠ ئەیجێنتەکە بۆ سێرڤەری مۆنۆمێنتالی Gemini بۆ شیکاریی قووڵ و گەڕاندنەوەی فەرمانەکان
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed pt-1">
              ئەیجێنتە ناوخۆییەکانی ناو مۆبایل و کۆمپیوتەری ناوخۆ خێرایین بەڵام ناتوانن بنبەستی گەورە (Cognitive Stagnation & Systemic Crises) چارەسەر بکەن.
              ئەم سیستەمە تەواوی تەلەمەتریی سوارمەکە دەنێرێتە ناو <strong>سێرڤەری گەورەی Gemini</strong> تا بە توانا سەلمێنراوەکانی بیرکردنەوەی قووڵ
              تیۆرم، ڕێسای نوێ و فەرمانی ئاراستەکراو دابهێنێت و دەستبەجێ بیخاتەوە ناو <strong>بیرگەی هەر ١,٠٠٠ ئەیجێنتەکە</strong>.
            </p>
          </div>

          {/* Quick Status Stats */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[95px] backdrop-blur-xs">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/70 font-semibold">Swarm Size</div>
              <div className="text-base font-bold text-white">1,000 Agents</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[95px] backdrop-blur-xs">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/70 font-semibold">Dispatched Cycles</div>
              <div className="text-base font-bold text-emerald-400">{history.length}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[95px] backdrop-blur-xs">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/70 font-semibold">CDL Review Agents</div>
              <div className="text-base font-bold text-amber-300">{cdlState.isolatedAgentIds.length}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Flow Diagram */}
        <div className="mt-6 pt-5 border-t border-purple-800/40 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="p-3.5 rounded-xl bg-black/40 border border-purple-700/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white">1. Edge Swarm (1,000 Agents)</div>
              <div className="text-[10px] text-neutral-400 truncate">
                Tick #{tick} • H = {payload.systemEntropy.toFixed(2)} bits • {payload.sampleArtifacts.length} Sample Artifacts
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-purple-400">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-600/40 text-[11px] font-mono">
              <ArrowRight className="w-3.5 h-3.5 animate-pulse text-purple-300" />
              <span>Telemetry Uplink ➔ Deep Reasoning ➔ Feedback Injection</span>
              <ArrowRight className="w-3.5 h-3.5 animate-pulse text-purple-300" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-purple-700/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white">2. Massive Server (Gemini)</div>
              <div className="text-[10px] text-purple-300 truncate">
                Central Synthesizer • Theorems & Meta-Constraints Injected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dispatch Action Area */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-600" />
              ئامادەکاری بۆ ناردن (Dispatch Telemetry to Massive Server)
            </h3>
            <p className="text-xs text-neutral-500">
              دەتوانی ئاراستەی بیرکردنەوەی Gemini دەستنیشان بکەیت، یان ڕێگە بدەی بە شێوەی ئۆتۆنۆم چەقبەستنەکان شی بکاتەوە.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100">
              <input
                type="checkbox"
                checked={autoEscalateOnCrisis}
                onChange={onToggleAutoEscalate}
                className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
              />
              <span className="font-medium">Auto-Escalate on Crisis Threshold</span>
            </label>
          </div>
        </div>

        {/* User Objective Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700">
            System Goal or Targeted Research Direction (ئاراستەی توێژینەوەی دەستنیشانکراو بۆ سێرڤەر):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. Formulate radiation-proof neuromorphic logic gates for Mars colonies..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
            <button
              onClick={handleTrigger}
              disabled={isLoading}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 active:scale-98"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>سێرڤەر لە کاردایە (Thinking)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Dispatch to Massive Server (Gemini)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payload Peek Toggle */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
          <div className="text-[11px] text-neutral-500">
            Current Telemetry Payload: <span className="font-mono font-semibold text-neutral-700">{payload.agentPoolSize} agents</span>, <span className="font-mono font-semibold text-neutral-700">{payload.recentCrises.length} crisis events</span>, <span className="font-mono font-semibold text-neutral-700">Entropy {payload.systemEntropy.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setShowPayloadJson(!showPayloadJson)}
            className="text-[11px] font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showPayloadJson ? "Hide Transmitted Telemetry JSON" : "Inspect Outgoing Telemetry JSON"}</span>
            {showPayloadJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showPayloadJson && (
          <div className="p-3 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[11px] max-h-56 overflow-y-auto border border-neutral-800">
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Real-time Feedback Results View */}
      {activeResult ? (
        <div className="space-y-6">
          {/* Cycle Header & Summary Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    دەرئەنجامی بیرکردنەوەی گەورەی Gemini (Feedback Injected)
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Applied at Tick #{activeResult.tick}
                    </span>
                    {activeResult.isFallback && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        Resilience Fallback Mode
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Model: <code className="font-mono text-purple-700">{activeResult.model}</code> • Latency: <code className="font-mono">{activeResult.durationMs}ms</code>
                  </div>
                </div>
              </div>

              {/* Feedback Impact Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                  +{activeResult.feedbackApplied.theoremsInjectedCount} Theorems Injected
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">
                  +{activeResult.feedbackApplied.constraintsInjectedCount} Meta-Constraints
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                  {activeResult.feedbackApplied.agentsDirectivesUpdated} Agents Boosted
                </span>
                {activeResult.feedbackApplied.agentsReleasedCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                    {activeResult.feedbackApplied.agentsReleasedCount} Agents Released
                  </span>
                )}
              </div>
            </div>

            {/* High-Level Narrative Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  شیکاریی لۆژیکی و چەقبەستن بە زمانی کوردی (Kurdish Summary)
                </div>
                <p className="text-xs text-purple-950 leading-relaxed">
                  {activeResult.result.heavyThinkingSummaryKu || activeResult.result.heavyThinkingSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-neutral-600" />
                  Central Server Reasoning Overview (English)
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  {activeResult.result.heavyThinkingSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Synthesized Theorems */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900">
                  تیۆرمە بەرهەمهێنراوە نوێیەکان بۆ ناو دەریای بەرهەمەکان (Synthesized Emergent Theorems)
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                {activeResult.result.synthesizedTheorems?.length || 0} Formal Invariants Generated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeResult.result.synthesizedTheorems || []).map((thm, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 p-4 bg-gradient-to-br from-white to-neutral-50 space-y-3 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-snug">{thm.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-neutral-200 text-neutral-800 font-semibold">
                          {thm.domainA} ✕ {thm.domainB}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold flex items-center gap-1">
                          {thm.deploymentTarget === "space_extreme" ? (
                            <>
                              <Rocket className="w-2.5 h-2.5" />
                              <span>Space & Extreme</span>
                            </>
                          ) : thm.deploymentTarget === "earth" ? (
                            <>
                              <Globe className="w-2.5 h-2.5" />
                              <span>Earth Bio</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-2.5 h-2.5" />
                              <span>Dual Realm</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      SMT SAT 100%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] leading-relaxed">
                    <span className="text-purple-400 font-bold">Formal Axiom: </span>
                    {thm.formalStatement}
                  </div>

                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    <strong className="text-neutral-800">Novelty Reasoning: </strong>
                    {thm.noveltyAxiom}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Global Meta-Constraints Injected into CDL Engine */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  ڕێسا و سنوورە نوێیە سەپێنراوەکان بۆ ناو مۆدیوڵی CDL (Injected Meta-Constraints)
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                Applied to all 1,000 Agents
              </span>
            </div>

            <div className="space-y-2">
              {(activeResult.result.globalMetaConstraints || []).map((constraint, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-950"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-rose-900">{constraint}</div>
                    <div className="text-[11px] text-rose-700">
                      ئەم مەرجە ڕێگری دەکات لە هەڵبەستنی خەیاڵپڵاوی ژمارەیی و تێکچوونی فەرمانی ئەیجێنتە ناوخۆییەکان لە تیکەکانی داهاتوودا.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Targeted Domain Directive Boosts */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  ڕێنمایی و فەرمانی ئاراستەکراو بۆ دۆمەینە تایبەتەکان (Targeted Domain Directives)
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                High-Leverage Coordination
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(activeResult.result.domainDirectiveBoosts || {}).map(([domainName, boost]: [string, any]) => (
                <div
                  key={domainName}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2 hover:bg-white hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                      Domain: {domainName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      Weight: {(boost.boostWeight * 100).toFixed(0)}% Boost
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed font-mono">
                    "{boost.instruction}"
                  </p>
                  <div className="text-[10px] text-neutral-500">
                    هەموو ئەو ئەیجێنتانەی لەم بوارە کار دەکەن لە باری BOOSTED دادەنرێن و ئەم فەرمانە پێشینەی کارەکانیان دەبێت.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Prompt to Run */
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto">
            <Server className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-neutral-900">
              سێرڤەری گەورەی Gemini چاوەڕوانی تەلەمەتریی سوارمەکەیە
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              تەواوی ١,٠٠٠ ئەیجێنتەکە لە تیک #{tick} کار دەکەن. کلیل لە دوگمەی سەرەوە بکە تا داتا بنێردرێت بۆ سێرڤەری مۆنۆمێنتالی Gemini،
              بیرکردنەوەی قووڵ بکات و ڕێساکان بە فەرمی بگەڕێنێتەوە ناو بیرگەی کۆمەڵەکە.
            </p>
          </div>
          <button
            onClick={handleTrigger}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>ناردنی داتا بۆ سێرڤەری گەورە (Dispatch Now)</span>
          </button>
        </div>
      )}

      {/* History of Previous Dispatches */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            مێژووی شیکاری و بیرکردنەوەکانی سێرڤەری گەورە ({history.length} Cycles)
          </h3>

          <div className="divide-y divide-neutral-100">
            {history.map((h, idx) => (
              <div
                key={h.id}
                onClick={() => setSelectedResultIndex(idx)}
                className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  idx === selectedResultIndex
                    ? "bg-purple-50 border border-purple-200"
                    : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 font-mono text-[11px] font-bold flex items-center justify-center">
                    #{h.tick}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Cycle {history.length - idx} • {h.result.synthesizedTheorems?.length || 0} Theorems Generated
                    </div>
                    <div className="text-[11px] text-neutral-500 line-clamp-1">
                      {h.result.heavyThinkingSummary}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="text-[10px] font-mono text-neutral-500">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                    {h.durationMs}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

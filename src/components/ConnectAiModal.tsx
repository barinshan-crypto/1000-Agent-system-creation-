import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Radio,
  Sliders,
  Play,
  X,
  Send,
  Users,
  Compass,
  ArrowRight,
  Database
} from 'lucide-react';
import { AiConnectionStatus, AiSwarmConfig, AiLogEntry, Domain } from '../types';

interface ConnectAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AiConnectionStatus | null;
  onRefreshStatus: () => Promise<void>;
  swarmConfig: AiSwarmConfig;
  onUpdateConfig: (newConfig: Partial<AiSwarmConfig>) => void;
  totalAgents: number;
  aiConnectedCount: number;
  onConnectCohort: (count: number) => void;
  onDisconnectAll: () => void;
  aiLogs: AiLogEntry[];
  onTriggerManualAiAction?: () => void;
  isAiGenerating?: boolean;
}

const PRESET_DIRECTIVES = [
  {
    label: "🧬 Biomimetic Engineering",
    prompt: "Synthesize cellular biology mechanisms with structural engineering to discover novel self-healing architecture materials.",
  },
  {
    label: "🎵 Neuro-Harmonics",
    prompt: "Bridge algorithmic acoustics and cognitive neuroscience to generate frequencies that accelerate multi-agent consensus.",
  },
  {
    label: "🪐 Quantum Cosmological Models",
    prompt: "Model relativistic spacetime curvature using linguistic syntax trees and topological graph invariants.",
  },
  {
    label: "🌐 Decentralized Epistemology",
    prompt: "Design economic incentive topologies based on philosophical verifiability and cross-agent peer validation.",
  },
];

export const ConnectAiModal: React.FC<ConnectAiModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
  swarmConfig,
  onUpdateConfig,
  totalAgents,
  aiConnectedCount,
  onConnectCohort,
  onDisconnectAll,
  aiLogs,
  onTriggerManualAiAction,
  isAiGenerating,
}) => {
  const [testingPing, setTestingPing] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    durationMs?: number;
    message?: string;
    model?: string;
    error?: string;
  } | null>(null);

  const [directiveInput, setDirectiveInput] = useState(swarmConfig.globalDirective || "");

  useEffect(() => {
    setDirectiveInput(swarmConfig.globalDirective || "");
  }, [swarmConfig.globalDirective]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingPing(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/test");
      const data = await res.json();
      setTestResult(data);
      if (data.connected) {
        await onRefreshStatus();
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        error: err.message || "Failed to reach AI endpoint",
      });
    } finally {
      setTestingPing(false);
    }
  };

  const handleSaveDirective = () => {
    onUpdateConfig({ globalDirective: directiveInput.trim() });
  };

  const percentConnected = Math.round((aiConnectedCount / Math.max(1, totalAgents)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-white to-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">Connect to Gemini AI</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Power 500 autonomous agents with server-side Google Gemini intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm text-neutral-700">
          {/* Status & Diagnostic Card */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 text-xs">
                <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>AI Engine Diagnostics</span>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={testingPing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                <span>{testingPing ? "Pinging Gemini..." : "Test Connection / Ping"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100">
                <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Model</div>
                <div className="font-semibold text-neutral-900 mt-0.5 truncate">
                  {status?.model || "gemini-flash-latest"}
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100">
                <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Engine</div>
                <div className="font-semibold text-neutral-900 mt-0.5 truncate">Google GenAI</div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100">
                <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Status</div>
                <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Online</span>
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100">
                <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Latency</div>
                <div className="font-mono font-semibold text-neutral-900 mt-0.5">
                  {testResult?.durationMs ? `${(testResult.durationMs / 1000).toFixed(2)}s` : "~1.8s (Fast)"}
                </div>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs ${
                testResult.connected
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/80 border-rose-200 text-rose-900"
              }`}>
                {testResult.connected ? (
                  <div>
                    <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ping Successful ({testResult.model} • {testResult.durationMs}ms)</span>
                    </div>
                    <p className="mt-1 text-neutral-700 italic">"{testResult.message}"</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Test Failed: {testResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swarm Agent Cohort Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  AI-Connected Agent Fleet
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {aiConnectedCount} of {totalAgents} agents ({percentConnected}%) connected to Gemini AI
                </p>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                {aiConnectedCount} Connected
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${percentConnected}%` }}
              />
            </div>

            {/* Cohort Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => onConnectCohort(10)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:border-purple-300 hover:bg-purple-50/50 text-neutral-800 transition-all text-left"
              >
                <div className="font-bold text-neutral-900">10 Agents</div>
                <div className="text-[10px] text-neutral-500">1 per domain sample</div>
              </button>

              <button
                onClick={() => onConnectCohort(50)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:border-purple-300 hover:bg-purple-50/50 text-neutral-800 transition-all text-left"
              >
                <div className="font-bold text-neutral-900">50 Agents</div>
                <div className="text-[10px] text-neutral-500">10% Vanguard Cohort</div>
              </button>

              <button
                onClick={() => onConnectCohort(totalAgents)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-purple-200 bg-purple-50/80 hover:bg-purple-100/80 text-purple-900 transition-all text-left"
              >
                <div className="font-bold text-purple-950">All {totalAgents} Agents</div>
                <div className="text-[10px] text-purple-700">100% Full Swarm</div>
              </button>

              <button
                onClick={onDisconnectAll}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600 transition-all text-left"
              >
                <div className="font-bold text-neutral-800">Disconnect All</div>
                <div className="text-[10px] text-neutral-400">Rule-based mode only</div>
              </button>
            </div>
          </div>

          {/* Autonomous Swarm Mode Toggle */}
          <div className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-neutral-900 text-xs">Autonomous AI Simulation Loop</span>
                </div>
                <p className="text-xs text-neutral-500">
                  When enabled, AI-connected agents autonomously invoke Gemini to formulate real hypotheses as ticks advance
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={swarmConfig.autonomousMode}
                  onChange={(e) => onUpdateConfig({ autonomousMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {swarmConfig.autonomousMode && (
              <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between text-xs text-neutral-600">
                <span className="font-medium">AI Generation Cadence:</span>
                <div className="flex items-center gap-1.5">
                  {[2, 5, 10].map((t) => (
                    <button
                      key={t}
                      onClick={() => onUpdateConfig({ tickInterval: t })}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                        swarmConfig.tickInterval === t
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      Every {t} ticks
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Global Swarm Directive */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                Global AI Swarm Directive
              </h3>
              {directiveInput !== swarmConfig.globalDirective && (
                <button
                  onClick={handleSaveDirective}
                  className="text-xs text-purple-700 font-semibold hover:underline"
                >
                  Apply Directive
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Inject a unifying scientific or artistic mission into all AI-connected agents
            </p>

            <div className="relative">
              <textarea
                value={directiveInput}
                onChange={(e) => setDirectiveInput(e.target.value)}
                placeholder="e.g. Synthesize biological morphogenesis with harmonic acoustics to discover self-tuning organic structures..."
                rows={2}
                className="w-full text-xs rounded-xl border border-neutral-200 p-3 pr-16 bg-neutral-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSaveDirective}
                className="absolute right-2.5 bottom-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
              >
                Save
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_DIRECTIVES.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setDirectiveInput(item.prompt);
                    onUpdateConfig({ globalDirective: item.prompt });
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 hover:bg-purple-100 hover:text-purple-900 text-neutral-700 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent AI Event Stream */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                Live Gemini Activity Stream ({aiLogs.length})
              </h3>
              {onTriggerManualAiAction && (
                <button
                  onClick={onTriggerManualAiAction}
                  disabled={isAiGenerating || aiConnectedCount === 0}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiGenerating ? "Generating..." : "Trigger AI Synthesis Now"}</span>
                </button>
              )}
            </div>

            {aiLogs.length === 0 ? (
              <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 text-center text-xs text-neutral-500">
                No AI actions in this session yet. Click <strong>Trigger AI Synthesis Now</strong> or step the simulation with autonomous mode active.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-xl border border-neutral-200/80 p-2 bg-neutral-50/30 font-mono text-[11px]">
                {aiLogs.slice(-6).reverse().map((log) => (
                  <div key={log.id} className="p-2 rounded bg-white border border-neutral-100 flex items-start justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900">{log.agentId}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-800 font-sans uppercase font-bold">
                          {log.domain}
                        </span>
                        <span className="text-neutral-400 font-sans">{log.action}</span>
                      </div>
                      <p className="font-sans text-xs text-neutral-700 mt-0.5 line-clamp-1">
                        {log.summary}
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Powered by <strong>Google Gemini API</strong> • Zero client-side API key exposure
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

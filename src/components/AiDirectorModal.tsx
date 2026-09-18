import React, { useState } from 'react';
import { AiSwarmDirective, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import { Sparkles, RefreshCw, X, Radio, ArrowRight, Compass, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface AiDirectorModalProps {
  tick: number;
  artifactCount: number;
  fleetSize: number;
  onClose: () => void;
  onBroadcastDirective?: (prompt: string, pairing?: { domainA: string; domainB: string }) => void;
}

export const AiDirectorModal: React.FC<AiDirectorModalProps> = ({
  tick,
  artifactCount,
  fleetSize,
  onClose,
  onBroadcastDirective,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Direct the 500-agent swarm towards maximum conceptual novelty and identify untested interdisciplinary pairings.'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [directive, setDirective] = useState<AiSwarmDirective | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broadcasted, setBroadcasted] = useState<boolean>(false);

  const fetchDirective = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);
    setBroadcasted(false);
    try {
      const res = await fetch('/api/swarm/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || prompt,
          tick,
          activeArtifactCount: artifactCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setDirective(data.directive);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with AI Director');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  React.useEffect(() => {
    fetchDirective();
  }, []);

  const handleBroadcast = () => {
    if (!directive || !onBroadcastDirective) return;
    onBroadcastDirective(
      directive.challengePrompt,
      directive.recommendedPairings?.[0]
    );
    setBroadcasted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Compass className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">AI Swarm Director Co-Pilot</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700">
                  Gemini 3.8 Flash
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                Fleet: {fleetSize.toLocaleString()} Agents • Tick: {tick} • Artifacts: {artifactCount}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Input */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <label className="text-[11px] font-semibold text-neutral-600 uppercase block mb-1">
            Director Inquiry / Guidance Focus:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Focus on biology and music synthesis..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={() => fetchDirective(prompt)}
              disabled={loading || !prompt.trim()}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Direct Swarm</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-neutral-500">
              <RefreshCw className="w-7 h-7 text-purple-600 animate-spin" />
              <span className="font-mono text-xs">
                Gemini analyzing swarm connectivity & formulating directive...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 space-y-2">
              <div className="font-bold">Error generating swarm directive</div>
              <p>{error}</p>
            </div>
          ) : directive ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold block mb-1">
                  Active Swarm Directive
                </span>
                <h2 className="text-base font-bold text-neutral-900 leading-snug">
                  {directive.directiveTitle}
                </h2>
                <p className="text-neutral-600 mt-1 leading-relaxed text-xs">
                  {directive.analysis}
                </p>
              </div>

              {/* Recommended Pairings */}
              {directive.recommendedPairings && directive.recommendedPairings.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                    Target Domain Intersections Recommended by AI:
                  </span>
                  <div className="space-y-2">
                    {directive.recommendedPairings.map((p, i) => {
                      const s1 = DOMAIN_COLORS[p.domainA as Domain] || { badge: 'bg-neutral-100' };
                      const s2 = DOMAIN_COLORS[p.domainB as Domain] || { badge: 'bg-neutral-100' };
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${s1.badge}`}>
                              {p.domainA}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${s2.badge}`}>
                              {p.domainB}
                            </span>
                          </div>
                          <span className="text-neutral-600 text-xs italic">
                            {p.rationale}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Challenge Prompt */}
              {directive.challengePrompt && (
                <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-600" /> Generative Challenge for Agents
                  </span>
                  <p className="text-neutral-800 font-medium leading-relaxed">
                    &ldquo;{directive.challengePrompt}&rdquo;
                  </p>

                  <div className="pt-2">
                    {broadcasted ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs py-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Broadcasted to all 500 agents on the Message Bus!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleBroadcast}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Broadcast Challenge to 500 Agents</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono text-[11px]">
            Swarm Intelligence Co-Pilot
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

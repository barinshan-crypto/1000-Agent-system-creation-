import React, { useState } from 'react';
import { EmergentArtifact, AiExpandedArtifact, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import { Sparkles, RefreshCw, X, ArrowRight, Lightbulb, Compass, FileText, CheckCircle2, Globe, Rocket } from 'lucide-react';

interface AiArtifactModalProps {
  artifact: EmergentArtifact;
  onClose: () => void;
  onSaveExpansion?: (updated: EmergentArtifact) => void;
}

export const AiArtifactModal: React.FC<AiArtifactModalProps> = ({
  artifact,
  onClose,
  onSaveExpansion,
}) => {
  const [loading, setLoading] = useState<boolean>(!artifact.aiExpansion);
  const [expansion, setExpansion] = useState<AiExpandedArtifact | null>(
    artifact.aiExpansion || null
  );
  const [error, setError] = useState<string | null>(null);

  const fetchExpansion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agent/expand-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setExpansion(data.expansion);
      if (onSaveExpansion) {
        onSaveExpansion({
          ...artifact,
          aiExpansion: data.expansion,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to expand artifact with Gemini');
    } finally {
      setLoading(false);
    }
  };

  // If no expansion yet, run once on mount
  React.useEffect(() => {
    if (!artifact.aiExpansion) {
      fetchExpansion();
    }
  }, [artifact.id]);

  const [d1, d2] = artifact.domains;
  const style1 = DOMAIN_COLORS[d1 as Domain] || { badge: 'bg-neutral-100 text-neutral-800' };
  const style2 = DOMAIN_COLORS[d2 as Domain] || { badge: 'bg-neutral-100 text-neutral-800' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Gemini Cross-Domain Synthesis</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  gemini-3.8-flash
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5 font-mono">
                <span>{artifact.contributors.join(' & ')}</span>
                <span>•</span>
                <span>t={artifact.t}</span>
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

        {/* Domains Bar */}
        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Interdisciplinary Pair:</span>
            <span className={`px-2 py-0.5 rounded font-semibold capitalize ${style1.badge}`}>
              {d1}
            </span>
            <ArrowRight className="w-3 h-3 text-neutral-400" />
            <span className={`px-2 py-0.5 rounded font-semibold capitalize ${style2.badge}`}>
              {d2}
            </span>
          </div>

          <button
            onClick={fetchExpansion}
            disabled={loading}
            className="text-neutral-600 hover:text-neutral-900 text-xs flex items-center gap-1 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-synthesize</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-neutral-800 text-sm flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-neutral-500">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs text-neutral-600">
                Gemini synthesizing cross-domain emergent breakthrough...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs space-y-2">
              <div className="font-bold">Error generating AI expansion</div>
              <p>{error}</p>
              <button
                onClick={fetchExpansion}
                className="px-3 py-1 bg-red-700 text-white rounded font-medium text-xs mt-2"
              >
                Try Again
              </button>
            </div>
          ) : expansion ? (
            <div className="space-y-4">
              {/* Breakthrough Title */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-700 font-bold block mb-1">
                  Synthesized Breakthrough
                </span>
                <h2 className="text-lg font-bold text-neutral-900 leading-snug">
                  {expansion.breakthroughTitle}
                </h2>
              </div>

              {/* Overview */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 text-xs leading-relaxed text-purple-950 font-medium">
                {expansion.conceptOverview}
              </div>

              {/* Technical Manifesto */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" /> Technical Architecture & Mechanics
                </span>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-700 leading-relaxed font-sans whitespace-pre-wrap">
                  {expansion.technicalManifesto}
                </div>
              </div>

              {/* Dual Environment Deployments */}
              {(expansion.earthDeploymentNote || artifact.earthApplication || expansion.spaceDeploymentNote || artifact.spaceApplication) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>جێبەجێکردن لەسەر زەوی (Earth)</span>
                    </div>
                    <p className="text-neutral-800 leading-relaxed">
                      {expansion.earthDeploymentNote || artifact.earthApplication}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1">
                      <Rocket className="w-4 h-4 text-purple-600" />
                      <span>ناودەرەوە / بۆشایی سەخت (Space & Mars)</span>
                    </div>
                    <p className="text-neutral-800 leading-relaxed">
                      {expansion.spaceDeploymentNote || artifact.spaceApplication}
                    </p>
                  </div>
                </div>
              )}

              {/* Potential Applications */}
              {expansion.potentialApplications && expansion.potentialApplications.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Potential Real-World Applications
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {expansion.potentialApplications.map((app, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-neutral-200 bg-white flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="text-neutral-700 leading-snug">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Swarm Directions */}
              {expansion.nextSwarmDirections && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-500" /> Swarm Evolutionary Directives
                  </span>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                    {expansion.nextSwarmDirections}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono text-[11px]">
            Artifact ID: #{artifact.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

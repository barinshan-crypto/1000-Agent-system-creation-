import React, { useMemo, useState } from 'react';
import { TelemetrySnapshot, HubAgentMetric, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import {
  Activity,
  Zap,
  TrendingUp,
  Share2,
  Cpu,
  BarChart3,
  Layers,
  ArrowUpRight,
  Info,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface EmergenceAnalyticsViewProps {
  telemetryHistory: TelemetrySnapshot[];
  currentTick: number;
  totalAgents: number;
  artifactsCount: number;
  totalMessages: number;
  hubAgents: HubAgentMetric[];
  onSelectAgent?: (agentId: string) => void;
  onOpenExperiments?: () => void;
}

export const EmergenceAnalyticsView: React.FC<EmergenceAnalyticsViewProps> = ({
  telemetryHistory,
  currentTick,
  totalAgents,
  artifactsCount,
  totalMessages,
  hubAgents,
  onSelectAgent,
  onOpenExperiments,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TelemetrySnapshot | null>(null);

  // Latest snapshot
  const latest = useMemo(() => {
    if (telemetryHistory.length === 0) {
      return {
        tick: currentTick,
        timestamp: Date.now(),
        artifacts: artifactsCount,
        messages: totalMessages,
        entropy: 0.85,
        velocity: 0,
        activeBridges: 0,
        percolation: 0,
      };
    }
    return telemetryHistory[telemetryHistory.length - 1];
  }, [telemetryHistory, currentTick, artifactsCount, totalMessages]);

  // Phase transition classification
  const phaseStatus = useMemo(() => {
    const p = latest.percolation;
    if (p < 25) {
      return {
        label: "Subcritical Phase (Exploration)",
        desc: "Agents primarily produce isolated domain-specific concepts; few cross-domain bridges exist.",
        color: "text-amber-700 bg-amber-50 border-amber-200",
        badge: "bg-amber-100 text-amber-800",
      };
    }
    if (p < 65) {
      return {
        label: "Critical Transition (Percolation)",
        desc: "Cross-domain linkages are clustering rapidly. Interdisciplinary breakthroughs are self-accelerating.",
        color: "text-purple-700 bg-purple-50 border-purple-200",
        badge: "bg-purple-100 text-purple-800",
      };
    }
    return {
      label: "Supercritical (Self-Organized Emergence)",
      desc: "Massive scale-free interdisciplinary coupling. Synthesized ideas serve as catalysts for second-order innovations.",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badge: "bg-emerald-100 text-emerald-800",
    };
  }, [latest.percolation]);

  // SVG Chart Dimensions & Scaling
  const chartWidth = 720;
  const chartHeight = 200;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const chartData = useMemo(() => {
    if (telemetryHistory.length < 2) return [];
    const maxArt = Math.max(...telemetryHistory.map((d) => d.artifacts), 1);
    const minTick = telemetryHistory[0].tick;
    const maxTick = Math.max(telemetryHistory[telemetryHistory.length - 1].tick, minTick + 1);

    return telemetryHistory.map((d) => {
      const x = padding.left + ((d.tick - minTick) / (maxTick - minTick)) * innerW;
      const yArt = padding.top + innerH - (d.artifacts / maxArt) * innerH;
      const yEnt = padding.top + innerH - d.entropy * innerH;
      return { ...d, x, yArt, yEnt };
    });
  }, [telemetryHistory, innerW, innerH, padding.left, padding.top]);

  const svgArtifactPath = useMemo(() => {
    if (chartData.length < 2) return "";
    return chartData.reduce(
      (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.yArt.toFixed(1)}`,
      ""
    );
  }, [chartData]);

  const svgEntropyPath = useMemo(() => {
    if (chartData.length < 2) return "";
    return chartData.reduce(
      (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.yEnt.toFixed(1)}`,
      ""
    );
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergence Criticality & Shannon Entropy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phase Transition Status */}
        <div className={`p-4 rounded-xl border ${phaseStatus.color} shadow-xs flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Swarm Criticality
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phaseStatus.badge}`}>
                {latest.percolation}% Percolation
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900">{phaseStatus.label}</h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{phaseStatus.desc}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-[11px] font-mono">
            <span>Percolation Threshold: <strong>22.2%</strong></span>
            <span>Active Pairs: <strong>{Math.round((latest.percolation / 100) * 45)}/45</strong></span>
          </div>
        </div>

        {/* Shannon Swarm Entropy */}
        <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" /> Shannon Entropy ($H$)
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {(latest.entropy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
                {latest.entropy.toFixed(3)}
              </span>
              <span className="text-xs text-neutral-400">/ 1.000 max</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Measures the diversity of active domain discourses across the MessageBus. High entropy indicates balanced interdisciplinary cross-pollination.
            </p>
          </div>
          {/* Visual Meter */}
          <div className="mt-4">
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-linear-to-r from-teal-500 via-purple-500 to-rose-500 transition-all duration-300"
                style={{ width: `${Math.min(100, latest.entropy * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Emergence Velocity & Action Hub */}
        <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Emergence Velocity
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {latest.velocity} art / 10t
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
                {latest.artifacts}
              </span>
              <span className="text-xs text-neutral-500">total synthesized</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Rate of interdisciplinary breakthrough formulation. Accelerates when agent peer bonds cross the percolation boundary.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Perturb the swarm:</span>
            {onOpenExperiments && (
              <button
                onClick={onOpenExperiments}
                className="px-2.5 py-1 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg flex items-center gap-1 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Experiment Lab</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Phase Transition Telemetry Graph */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Phase Transition & Shannon Entropy Evolution</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Historical time-series tracking breakthrough accumulation (purple) alongside discourse entropy (teal).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-purple-600 rounded-full" />
              <span className="text-neutral-600">Breakthroughs ({latest.artifacts})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-teal-500 rounded-full" />
              <span className="text-neutral-600">Entropy ({latest.entropy.toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas / SVG */}
        <div className="relative overflow-x-auto">
          {chartData.length >= 2 ? (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 select-none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Background Grid Lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = padding.top + innerH * (1 - ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-neutral-400 font-mono"
                    >
                      {Math.round(ratio * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* Entropy Area & Line (Teal) */}
              <path
                d={svgEntropyPath}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Artifacts Area & Line (Purple) */}
              <path
                d={svgArtifactPath}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points */}
              {chartData.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.yArt}
                  r={hoveredPoint?.tick === d.tick ? 5 : 2.5}
                  fill="#7c3aed"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(d)}
                />
              ))}

              {/* Hover Tooltip Indicator Line */}
              {hoveredPoint && (
                <line
                  x1={
                    padding.left +
                    ((hoveredPoint.tick - telemetryHistory[0].tick) /
                      Math.max(1, telemetryHistory[telemetryHistory.length - 1].tick - telemetryHistory[0].tick)) *
                      innerW
                  }
                  y1={padding.top}
                  x2={
                    padding.left +
                    ((hoveredPoint.tick - telemetryHistory[0].tick) /
                      Math.max(1, telemetryHistory[telemetryHistory.length - 1].tick - telemetryHistory[0].tick)) *
                      innerW
                  }
                  y2={padding.top + innerH}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-neutral-400 text-xs">
              <Activity className="w-6 h-6 mb-2 text-neutral-300 animate-pulse" />
              <span>Accumulating time-series data... Advance simulation ticks to generate telemetry.</span>
            </div>
          )}

          {/* Hover Overlay Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-neutral-900/90 backdrop-blur-xs text-white p-2.5 rounded-lg text-xs font-mono shadow-lg border border-neutral-700 pointer-events-none">
              <div className="text-neutral-400 text-[10px] mb-1">Tick {hoveredPoint.tick}</div>
              <div className="text-purple-300">Artifacts: {hoveredPoint.artifacts}</div>
              <div className="text-teal-300">Entropy: {(hoveredPoint.entropy * 100).toFixed(1)}%</div>
              <div className="text-amber-300">Velocity: {hoveredPoint.velocity} / 10t</div>
              <div className="text-neutral-300">Percolation: {hoveredPoint.percolation}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Scale-Free Hub Agents: The Universal Bridges */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              <span>Scale-Free Hub Agents (Interdisciplinary Bridges)</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Agents with the highest topological centrality that connect multiple disjoint domain clusters together.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Top {hubAgents.length} Ranked by Swarm Influence
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 text-neutral-500 font-semibold">
                <th className="pb-2 pl-2">Agent ID</th>
                <th className="pb-2">Domain</th>
                <th className="pb-2">Specialization</th>
                <th className="pb-2 text-center">Degree (Partners)</th>
                <th className="pb-2">Bridged Domains</th>
                <th className="pb-2 text-center">Breakthroughs</th>
                <th className="pb-2 text-right pr-2">Influence Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {hubAgents.map((h, i) => {
                const colors = DOMAIN_COLORS[h.domain] || {
                  badge: "bg-neutral-100 text-neutral-700",
                };
                return (
                  <tr
                    key={h.agentId}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectAgent?.(h.agentId)}
                  >
                    <td className="py-2.5 pl-2 font-mono font-medium text-neutral-900 flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-400 w-3 font-mono">{i + 1}</span>
                      <span className="group-hover:text-purple-600 transition-colors">{h.agentId}</span>
                      <ArrowUpRight className="w-3 h-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
                        {h.domain}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-neutral-600">{h.job}</td>
                    <td className="py-2.5 text-center font-mono font-semibold text-neutral-800">
                      {h.degree}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {h.bridgedDomains.map((d) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-100 text-neutral-600 border border-neutral-200 capitalize"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono font-bold text-purple-700">
                      {h.artifactsSynthesized}
                    </td>
                    <td className="py-2.5 text-right pr-2 font-mono font-black text-neutral-900">
                      {h.influenceScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

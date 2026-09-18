import React, { useState, useMemo } from 'react';
import {
  Globe,
  Rocket,
  Cpu,
  Brain,
  Bot,
  Sprout,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Flame,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { STRATEGIC_PILLARS } from '../data/strategicPillars';
import {
  AgentData,
  EmergentArtifact,
  StrategicPillarId,
  DeploymentRealm,
} from '../types';

interface DeploymentEnvironmentsViewProps {
  agents: AgentData[];
  artifacts: EmergentArtifact[];
  currentTick: number;
  onSelectAgent?: (id: string) => void;
  onOpenDossier?: () => void;
  onTriggerMission?: (pillarId: StrategicPillarId, realm: "earth" | "space_extreme") => void;
}

export const DeploymentEnvironmentsView: React.FC<DeploymentEnvironmentsViewProps> = ({
  agents,
  artifacts,
  currentTick,
  onSelectAgent,
  onOpenDossier,
  onTriggerMission,
}) => {
  const [selectedRealm, setSelectedRealm] = useState<DeploymentRealm>("both");
  const [activePillarFilter, setActivePillarFilter] = useState<StrategicPillarId | "all">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "artifacts" | "agents">("overview");
  const [simulatedMissions, setSimulatedMissions] = useState<
    Array<{ id: string; title: string; realm: "earth" | "space_extreme"; pillar: StrategicPillarId; tick: number }>
  >([
    {
      id: "m-init-1",
      title: "نەشتەرگەریی مایکرۆ-ورد بە ڕۆبۆتی سەربەخۆ لە سەنتەری پزیشکی (Earth)",
      realm: "earth",
      pillar: "embodied_robotics",
      tick: Math.max(1, currentTick - 5),
    },
    {
      id: "m-init-2",
      title: "بونیادنانی هەوارگەی تیشک-پارێز لەسەر مەریخ بە ماددەی ڕیگۆلیس (Mars Space)",
      realm: "space_extreme",
      pillar: "embodied_robotics",
      tick: Math.max(1, currentTick - 2),
    },
    {
      id: "m-init-3",
      title: "سەلماندنی لۆجیکی هێڵکارییە ئەندازیارییەکان بێ هەڵەی LLM (Earth)",
      realm: "earth",
      pillar: "neuro_symbolic",
      tick: currentTick,
    },
  ]);

  // Filter artifacts by realm and pillar
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((art) => {
      const realmMatches =
        selectedRealm === "both" ||
        art.deploymentRealm === "both" ||
        art.deploymentRealm === selectedRealm;
      const pillarMatches =
        activePillarFilter === "all" ||
        (art.strategicPillars && art.strategicPillars.includes(activePillarFilter));
      return realmMatches && pillarMatches;
    });
  }, [artifacts, selectedRealm, activePillarFilter]);

  // Aggregate stats
  const earthAgentsCount = useMemo(() => agents.filter((a) => a.primaryRealm === "earth").length, [agents]);
  const spaceAgentsCount = useMemo(() => agents.filter((a) => a.primaryRealm === "space_extreme").length, [agents]);

  const handleLaunchMission = (pillarId: StrategicPillarId, realm: "earth" | "space_extreme") => {
    const pillar = STRATEGIC_PILLARS.find((p) => p.id === pillarId);
    const title =
      realm === "earth"
        ? `${pillar?.earthAppKu || "ئەرکی سەر زەوی"}`
        : `${pillar?.spaceAppKu || "ئەرکی بۆشایی و مەریخ"}`;

    const newMission = {
      id: `m-${Date.now().toString(16)}`,
      title,
      realm,
      pillar: pillarId,
      tick: currentTick,
    };
    setSimulatedMissions((prev) => [newMission, ...prev.slice(0, 15)]);

    if (onTriggerMission) {
      onTriggerMission(pillarId, realm);
    }
  };

  const getPillarIcon = (iconName: string) => {
    switch (iconName) {
      case "Bot":
        return <Bot className="w-5 h-5 text-blue-600" />;
      case "BrainCircuit":
        return <Brain className="w-5 h-5 text-purple-600" />;
      case "Cpu":
        return <Cpu className="w-5 h-5 text-amber-600" />;
      case "Sprout":
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white rounded-2xl p-6 shadow-sm border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>چوارچێوەی بەکارخستنی دووژینگەیی فرە-کۆڵەکە</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>جێبەجێکردن لەسەر زەوی ⟷ بۆشایی و ژینگەی سەخت</span>
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 max-w-3xl leading-relaxed">
              تەلارسازی بەکارخستنی سەر مەیدانی بۆ کۆمەڵە بریکارەکانی هۆشی دەستکرد لە دوو بازنەی ئۆپەراسیۆنی:
              <strong> جێبەجێکردن لەسەر زەوی (Terrestrial)</strong> و <strong>جێبەجێکردن لە ناودەرەوە و بۆشایی (Deep Space & Extreme Environments)</strong> بەسەر ٤ کۆڵەکەی زانستیدا.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700/80 self-start md:self-auto shrink-0">
            <div className="text-center px-3 py-1 border-r border-neutral-700">
              <div className="text-[10px] text-neutral-400 font-mono">سەر زەوی (Earth)</div>
              <div className="text-sm font-bold text-blue-400 font-mono flex items-center justify-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>{earthAgentsCount} بریکار</span>
              </div>
            </div>
            <div className="text-center px-3 py-1">
              <div className="text-[10px] text-neutral-400 font-mono">بۆشایی/مەریخ (Space)</div>
              <div className="text-sm font-bold text-purple-400 font-mono flex items-center justify-center gap-1">
                <Rocket className="w-3.5 h-3.5" />
                <span>{spaceAgentsCount} بریکار</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Realm Selector */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-neutral-800/60 p-1 rounded-xl">
            <button
              onClick={() => setSelectedRealm("both")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedRealm === "both"
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>هەردوو ژینگە (Dual Realm View)</span>
            </button>
            <button
              onClick={() => setSelectedRealm("earth")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedRealm === "earth"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span>جێبەجێکردن لەسەر زەوی (Earth)</span>
            </button>
            <button
              onClick={() => setSelectedRealm("space_extreme")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedRealm === "space_extreme"
                  ? "bg-purple-600 text-white shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-purple-300" />
              <span>جێبەجێکردن لە ناودەرەوە / بۆشایی (Space & Extreme)</span>
            </button>
          </div>

          {onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ڕاپۆرتی تۆمارە زانستییەکان (Dossier)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Strategic Research Pillars Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>چوار کۆڵەکەی سەرەکی زانستی و تەکنەلۆژی (4 Strategic Pillars)</span>
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            {STRATEGIC_PILLARS.length} کۆڵەکەی کارپێکراو • دابەشکراو بەسەر ژینگەی زەوی و بۆشایی
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRATEGIC_PILLARS.map((pillar) => {
            const pillarAgents = agents.filter((a) => a.strategicPillar === pillar.id);
            const pillarArtifacts = artifacts.filter(
              (a) => a.strategicPillars && a.strategicPillars.includes(pillar.id)
            );

            return (
              <div
                key={pillar.id}
                className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Pillar Title and Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200">
                        {getPillarIcon(pillar.icon)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-neutral-900">{pillar.titleEn}</h4>
                        <div className="text-xs font-semibold text-purple-700">{pillar.titleKu}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {pillarAgents.length} بریکار
                    </span>
                  </div>

                  {/* Core Fundamental Concept */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mb-4 space-y-1">
                    <div className="text-[11px] font-bold text-neutral-700 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>بنەمای سەرەکی (Core Principle):</span>
                    </div>
                    <p className="text-xs text-neutral-800 font-medium">{pillar.coreConceptKu}</p>
                    <p className="text-[11px] text-neutral-500">{pillar.coreConceptEn}</p>
                  </div>

                  {/* Dual Environment Implementations Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Earth Realm */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        selectedRealm === "earth" || selectedRealm === "both"
                          ? "bg-blue-50/60 border-blue-200"
                          : "bg-neutral-50/60 border-neutral-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>جێبەجێکردن لەسەر زەوی</span>
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                          Earth
                        </span>
                      </div>
                      <p className="text-xs font-medium text-neutral-800 leading-snug">{pillar.earthAppKu}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">{pillar.earthAppEn}</p>
                    </div>

                    {/* Deep Space / Extreme Realm */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        selectedRealm === "space_extreme" || selectedRealm === "both"
                          ? "bg-purple-50/60 border-purple-200"
                          : "bg-neutral-50/60 border-neutral-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                          <Rocket className="w-3.5 h-3.5 text-purple-600" />
                          <span>ناودەرەوە / بۆشایی سەخت</span>
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                          Mars / Space
                        </span>
                      </div>
                      <p className="text-xs font-medium text-neutral-800 leading-snug">{pillar.spaceAppKu}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">{pillar.spaceAppEn}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action and Stats */}
                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                    <span>
                      دۆزینەوەکان: <strong className="text-neutral-900">{pillarArtifacts.length}</strong>
                    </span>
                    <span>
                      پێوەر: <strong className="text-neutral-900">{pillar.metrics.benchmarkVal}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleLaunchMission(pillar.id, "earth")}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="دەستپێکردنی ئەرکی تاقیکردنەوەی سەر زەوی"
                    >
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span>ئەرکی زەوی</span>
                    </button>
                    <button
                      onClick={() => handleLaunchMission(pillar.id, "space_extreme")}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="دەستپێکردنی ئەرکی بۆشایی و ژینگەی سەخت لەسەر مەریخ"
                    >
                      <Rocket className="w-3 h-3 text-purple-600" />
                      <span>ئەرکی مەریخ/بۆشایی</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Active Missions & Tactical Dispatch Stream */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>تۆماری ئەرکە ڕاستەوخۆکان (Active Field Missions Dispatch)</span>
            </h3>
            <p className="text-xs text-neutral-500">
              ئۆپەراسیۆنە بەردەوامەکان لەسەر زەوی (نەشتەرگەری و کانزاکان) و مەریخ (خاوێنکردنەوە و بونیادنان)
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold self-start sm:self-auto">
            {simulatedMissions.length} ئەرکی تۆمارکراو
          </span>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {simulatedMissions.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.realm === "earth"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {m.realm === "earth" ? <Globe className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">{m.title}</div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">کۆڵەکە: {m.pillar}</span>
                    <span>•</span>
                    <span className="font-mono">Tick: {m.tick}</span>
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>چالاکە (Active)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Relevant Cross-Domain Artifacts Filtered by Realm */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>دۆزینەوە ئەندازیارییە دروستکراوەکان بەپێی ژینگە ({filteredArtifacts.length})</span>
            </h3>
            <p className="text-xs text-neutral-500">
              دەرئەنجامی تێکەڵکردنی زانستەکان بۆ کارپێکردن لەسەر زەوی و لە ژینگەی سەختدا
            </p>
          </div>

          {/* Filter by Pillar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setActivePillarFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activePillarFilter === "all"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              هەموو کۆڵەکەکان
            </button>
            {STRATEGIC_PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePillarFilter(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  activePillarFilter === p.id
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {p.titleKu.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {filteredArtifacts.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
            <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs text-neutral-600 font-medium">
              تا ئێستا دۆزینەوەیەک بەم فلتەرە دروست نەبووە.
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              تکایە چەند تیکێک بە پێشەوە بڕۆ (Step +10) تا بریکارەکان بەیەکەوە تێکەڵ ببن.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredArtifacts.slice(0, 8).map((art) => {
              const [d1, d2] = art.domains;
              const title =
                art.aiExpansion?.breakthroughTitle ||
                art.content.aiProposal?.title ||
                `${d1.toUpperCase()} ⨁ ${d2.toUpperCase()} Synthesis #${art.id}`;

              return (
                <div
                  key={art.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-white hover:border-neutral-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 uppercase font-mono">
                          {d1} + {d2}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">Tick {art.t}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Dual Realm
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-neutral-900 mb-2 leading-snug">{title}</h4>

                    {art.earthApplication && (
                      <div className="mb-1.5 text-[11px] text-neutral-700 flex items-start gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-blue-900">زەوی:</strong> {art.earthApplication}
                        </span>
                      </div>
                    )}

                    {art.spaceApplication && (
                      <div className="text-[11px] text-neutral-700 flex items-start gap-1.5">
                        <Rocket className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-purple-900">بۆشایی:</strong> {art.spaceApplication}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>
                      بەشداربووان: {art.contributors.slice(0, 2).join(", ")}
                    </span>
                    {onSelectAgent && art.contributors[0] && (
                      <button
                        onClick={() => onSelectAgent(art.contributors[0])}
                        className="text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                      >
                        پیشاندانی بریکار →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

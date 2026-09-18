import React, { useState, useMemo } from 'react';
import { EmergentArtifact, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import { DomainPieceRenderer } from './DomainPieceRenderer';
import {
  Sparkles,
  Filter,
  Search,
  ArrowRight,
  Layers,
  Bot,
  ChevronRight,
  GitBranch,
  Grid,
  FileText,
  Clock,
  Dna,
  Video,
  Globe,
  Rocket,
} from 'lucide-react';
import { AiArtifactModal } from './AiArtifactModal';

interface ArtifactsGalleryProps {
  artifacts: EmergentArtifact[];
  onSelectAgent?: (agentId: string) => void;
  onUpdateArtifact?: (updated: EmergentArtifact) => void;
  onOpenDossier?: () => void;
  onOpenWorkflowMap?: () => void;
}

export const ArtifactsGallery: React.FC<ArtifactsGalleryProps> = ({
  artifacts,
  onSelectAgent,
  onUpdateArtifact,
  onOpenDossier,
  onOpenWorkflowMap,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "lineage">("cards");
  const [expandingArtifact, setExpandingArtifact] = useState<EmergentArtifact | null>(null);

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((art) => {
      const matchesDomain =
        selectedDomain === "all" ||
        art.domains.includes(selectedDomain as Domain);

      const matchesSearch =
        searchQuery.trim() === "" ||
        art.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.contributors.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        art.domains.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
        JSON.stringify(art.content).toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(art.aiExpansion?.breakthroughTitle?.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDomain && matchesSearch;
    });
  }, [artifacts, selectedDomain, searchQuery]);

  // Compute Phylogenetic Generations
  const { generations, stats } = useMemo(() => {
    const sorted = [...artifacts].sort((a, b) => a.t - b.t);
    const agentContributionCount = new Map<string, number>();

    const gen1: EmergentArtifact[] = [];
    const gen2: EmergentArtifact[] = [];
    const gen3: EmergentArtifact[] = [];

    sorted.forEach((art) => {
      const c1Count = agentContributionCount.get(art.contributors[0]) || 0;
      const c2Count = agentContributionCount.get(art.contributors[1]) || 0;
      const maxPrior = Math.max(c1Count, c2Count);

      if (maxPrior === 0) {
        gen1.push(art);
      } else if (maxPrior < 3) {
        gen2.push(art);
      } else {
        gen3.push(art);
      }

      art.contributors.forEach((c) => {
        agentContributionCount.set(c, (agentContributionCount.get(c) || 0) + 1);
      });
    });

    return {
      generations: {
        gen1: gen1.reverse(),
        gen2: gen2.reverse(),
        gen3: gen3.reverse(),
      },
      stats: {
        gen1Count: gen1.length,
        gen2Count: gen2.length,
        gen3Count: gen3.length,
      },
    };
  }, [artifacts]);

  function renderArtifactCard(art: EmergentArtifact) {
    const [d1, d2] = art.domains;
    const style1 = DOMAIN_COLORS[d1 as Domain] || { badge: "bg-neutral-100 text-neutral-800" };
    const style2 = DOMAIN_COLORS[d2 as Domain] || { badge: "bg-neutral-100 text-neutral-800" };
    const pieces = art.content.pieces || [{}, {}];

    return (
      <div
        key={art.id}
        className={`bg-white rounded-xl border transition-all duration-200 flex flex-col shadow-xs overflow-hidden ${
          art.isAiGenerated
            ? "border-amber-300 ring-1 ring-amber-200"
            : "border-neutral-200/80 hover:border-neutral-300 hover:shadow-md"
        }`}
      >
        {/* Header Bar */}
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style1.badge}`}>
              {d1}
            </span>
            <span className="text-neutral-400 text-xs font-mono">⨁</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style2.badge}`}>
              {d2}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {art.isAiGenerated && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-400 text-neutral-900 flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 fill-current" /> AI Swarm
              </span>
            )}
            <span className="text-[11px] font-mono text-neutral-400">t={art.t}</span>
          </div>
        </div>

        {/* AI Proposal Title if present */}
        {art.content.aiProposal && (
          <div className="px-4 pt-3 pb-1 border-b border-neutral-100 bg-amber-50/30">
            <h4 className="text-xs font-bold text-neutral-900">
              {art.content.aiProposal.title}
            </h4>
            <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
              {art.content.aiProposal.summary}
            </p>
          </div>
        )}

        {/* Synthesis Pieces */}
        <div className="p-4 space-y-3 flex-1">
          {/* Piece A */}
          <div className="rounded-lg bg-neutral-50/80 border border-neutral-100 p-2.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
              <span className="font-semibold uppercase tracking-wide text-neutral-500">
                Piece A ({d1})
              </span>
              {art.contributors[0] && (
                <button
                  onClick={() => onSelectAgent?.(art.contributors[0])}
                  className="font-mono text-neutral-600 hover:text-neutral-900 hover:underline"
                >
                  {art.contributors[0]}
                </button>
              )}
            </div>
            <DomainPieceRenderer domain={d1} data={pieces[0]} />
          </div>

          {/* Piece B */}
          <div className="rounded-lg bg-neutral-50/80 border border-neutral-100 p-2.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
              <span className="font-semibold uppercase tracking-wide text-neutral-500">
                Piece B ({d2})
              </span>
              {art.contributors[1] && (
                <button
                  onClick={() => onSelectAgent?.(art.contributors[1])}
                  className="font-mono text-neutral-600 hover:text-neutral-900 hover:underline"
                >
                  {art.contributors[1]}
                </button>
              )}
            </div>
            <DomainPieceRenderer domain={d2} data={pieces[1]} />
          </div>

          {/* Earth & Space Deployment Applications */}
          {(art.earthApplication || art.spaceApplication) && (
            <div className="rounded-lg bg-neutral-100/70 border border-neutral-200/70 p-2.5 space-y-1.5 text-[11px]">
              {art.earthApplication && (
                <div className="flex items-start gap-1.5 text-neutral-800">
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-blue-900 font-semibold">سەر زەوی:</strong> {art.earthApplication}
                  </span>
                </div>
              )}
              {art.spaceApplication && (
                <div className="flex items-start gap-1.5 text-neutral-800">
                  <Rocket className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-purple-900 font-semibold">بۆشایی/ژینگەی سەخت:</strong> {art.spaceApplication}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Deep Dive Button & Footer with Contributors */}
        <div className="px-4 py-2.5 bg-neutral-50/40 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <button
            onClick={() => setExpandingArtifact(art)}
            className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>{art.aiExpansion ? "View AI Synthesis" : "Expand with Gemini AI"}</span>
          </button>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            {art.contributors.map((contrib, i) => (
              <React.Fragment key={contrib}>
                {i > 0 && <span className="text-neutral-300">×</span>}
                <button
                  onClick={() => onSelectAgent?.(contrib)}
                  className="text-neutral-700 hover:text-neutral-900 hover:underline font-medium"
                >
                  {contrib}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls: Mode Switcher & Dossier Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 text-xs">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "cards"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Breakthrough Cards</span>
          </button>

          <button
            onClick={() => setViewMode("lineage")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "lineage"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            <span>Phylogenetic Lineage Tree</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded-full font-mono">
              3 Gens
            </span>
          </button>
        </div>

        {/* Visual Workflow & Video Map Button */}
        {onOpenWorkflowMap && (
          <button
            onClick={onOpenWorkflowMap}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Video className="w-3.5 h-3.5 text-purple-200" />
            <span>نەخشەی کارەکان و ڤیدیۆ</span>
          </button>
        )}

        {/* Export Research Dossier Button */}
        {onOpenDossier && (
          <button
            onClick={onOpenDossier}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Research Dossier (.md)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Domain:
          </span>
          <button
            onClick={() => setSelectedDomain("all")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedDomain === "all"
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All ({artifacts.length})
          </button>
          {Object.values(Domain).map((d) => {
            const count = artifacts.filter((a) => a.domains.includes(d)).length;
            const style = DOMAIN_COLORS[d];
            const isSelected = selectedDomain === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all capitalize flex items-center gap-1 ${
                  isSelected
                    ? `${style.badge} ring-1 ${style.ring} shadow-xs font-semibold`
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                <span>{d}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search artifacts, agents, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Artifacts Counter / Empty State */}
      {filteredArtifacts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 p-8">
          <Layers className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
          <h3 className="text-sm font-semibold text-neutral-700">No emergent artifacts yet</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            Agents synthesize artifacts by taking proposals from differing domains and merging them with their own work.
            Click <strong>Step (+1 Tick)</strong> or <strong>Play</strong> to watch them collaborate!
          </p>
        </div>
      ) : viewMode === "lineage" ? (
        /* Phylogenetic Lineage Tree View */
        <div className="space-y-6">
          {/* Generation 3: Deep Evolutionary Syntheses */}
          {generations.gen3.length > 0 && (
            <div className="bg-white rounded-xl border border-purple-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-purple-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                    <Dna className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Generation III: Compound Evolutionary Syntheses ({generations.gen3.length})
                    </h3>
                    <p className="text-xs text-neutral-500">
                      High-order emergence built by veteran bridging agents compounding past cross-domain discoveries.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Deep Lineage
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generations.gen3.map((art) => renderArtifactCard(art))}
              </div>
            </div>
          )}

          {/* Generation 2: Cross-Pollination Syntheses */}
          {generations.gen2.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-teal-100 text-teal-700">
                    <GitBranch className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Generation II: Compounded Cross-Pollination ({generations.gen2.length})
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Second-order fusions combining established ideas from experienced agents.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Branching
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generations.gen2.map((art) => renderArtifactCard(art))}
              </div>
            </div>
          )}

          {/* Generation 1: Genesis Syntheses */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-neutral-100 text-neutral-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Generation I: Genesis Syntheses ({generations.gen1.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Foundational pairwise fusions between previously unlinked scientific & artistic domains.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                Genesis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.gen1.map((art) => renderArtifactCard(art))}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Breakthrough Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArtifacts.map((art) => renderArtifactCard(art))}
        </div>
      )}

      {/* Gemini AI Expansion Modal */}
      {expandingArtifact && (
        <AiArtifactModal
          artifact={expandingArtifact}
          onClose={() => setExpandingArtifact(null)}
          onSaveExpansion={(updated) => {
            setExpandingArtifact(updated);
            if (onUpdateArtifact) {
              onUpdateArtifact(updated);
            }
          }}
        />
      )}
    </div>
  );
};

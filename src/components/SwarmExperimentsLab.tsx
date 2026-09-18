import React, { useState } from 'react';
import { Domain, SwarmExperiment, PerturbationType } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import {
  FlaskConical,
  Zap,
  ShieldAlert,
  Dna,
  Shuffle,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  XCircle,
} from 'lucide-react';

interface SwarmExperimentsLabProps {
  currentTick: number;
  experiments: SwarmExperiment[];
  onApplyExperiment: (
    type: PerturbationType,
    params: {
      title: string;
      description: string;
      durationTicks?: number;
      targetDomain?: Domain;
      secondaryDomain?: Domain;
    }
  ) => void;
  onCancelExperiment: (id: string) => void;
  quarantinedDomains: Domain[];
  boostedDomains: Domain[];
}

export const SwarmExperimentsLab: React.FC<SwarmExperimentsLabProps> = ({
  currentTick,
  experiments,
  onApplyExperiment,
  onCancelExperiment,
  quarantinedDomains,
  boostedDomains,
}) => {
  const [selectedType, setSelectedType] = useState<PerturbationType>("renaissance");
  const [targetDomain, setTargetDomain] = useState<Domain>(Domain.MUSIC);
  const [secondaryDomain, setSecondaryDomain] = useState<Domain>(Domain.MATH);
  const [duration, setDuration] = useState<number>(15);

  const activeExperiments = experiments.filter((e) => e.status === "active");
  const completedExperiments = experiments.filter((e) => e.status === "completed");

  const handleLaunchPreset = (type: PerturbationType) => {
    switch (type) {
      case "renaissance":
        onApplyExperiment("renaissance", {
          title: `Renaissance Shock: ${targetDomain.toUpperCase()}`,
          description: `Doubles synthesis attempts and prioritizes cross-domain broadcast listening for all ${targetDomain} agents.`,
          durationTicks: duration,
          targetDomain,
        });
        break;
      case "quarantine":
        onApplyExperiment("quarantine", {
          title: `Information Quarantine: ${targetDomain.toUpperCase()}`,
          description: `Sever external transmission links to and from the ${targetDomain} cluster to test network fault tolerance and recovery.`,
          durationTicks: duration,
          targetDomain,
        });
        break;
      case "hyper_mutation":
        onApplyExperiment("hyper_mutation", {
          title: `Rule Hyper-Mutation (25% Fleet Shift)`,
          description: `Mutates decision strategies across 25% of the swarm into explore and merge templates to trigger phase shift.`,
          durationTicks: duration,
        });
        break;
      case "cross_pollination":
        onApplyExperiment("cross_pollination", {
          title: `Forced Coupling: ${targetDomain.toUpperCase()} ⨁ ${secondaryDomain.toUpperCase()}`,
          description: `Injects direct inter-domain cross-proposals between ${targetDomain} and ${secondaryDomain} agents.`,
          durationTicks: duration,
          targetDomain,
          secondaryDomain,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <FlaskConical className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-neutral-900">
              Swarm Perturbation & Stress-Testing Lab
            </h2>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            Inject controlled environmental shocks, behavioral mutations, and communication quarantines into the 500-agent collective to observe adaptive resilience, self-organization, and emergent breakthrough acceleration.
          </p>
        </div>

        {/* Active Status Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Tick: <strong>{currentTick}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Active Tests: <strong>{activeExperiments.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Experiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Preset 1: Renaissance */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900">Renaissance Shock</h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Supercharges innovation in a selected domain by doubling their synthesis attempts and broadcast listening priority.
            </p>
          </div>
          <button
            onClick={() => handleLaunchPreset("renaissance")}
            className="mt-4 w-full py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Inject ({targetDomain})</span>
          </button>
        </div>

        {/* Preset 2: Quarantine */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all">
          <div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900">Information Quarantine</h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Severs external transmission lines to a domain to measure swarm fault-tolerance and how other domains compensate.
            </p>
          </div>
          <button
            onClick={() => handleLaunchPreset("quarantine")}
            className="mt-4 w-full py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Isolate ({targetDomain})</span>
          </button>
        </div>

        {/* Preset 3: Rule Hyper-Mutation */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all">
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Shuffle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900">Rule Hyper-Mutation</h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Randomly cycles decision templates for 25% of the swarm into high-entropy exploration and cross-domain synthesis.
            </p>
          </div>
          <button
            onClick={() => handleLaunchPreset("hyper_mutation")}
            className="mt-4 w-full py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Mutate 25% Fleet</span>
          </button>
        </div>

        {/* Preset 4: Cross-Pollination */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all">
          <div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Dna className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900">Cross-Pollination Burst</h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Forces direct pairwise communication between two chosen domains to spark rapid interdisciplinary fusion.
            </p>
          </div>
          <button
            onClick={() => handleLaunchPreset("cross_pollination")}
            className="mt-4 w-full py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Force ({targetDomain} ⨁ {secondaryDomain})</span>
          </button>
        </div>
      </div>

      {/* Custom Configuration Control Panel */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200/80 p-4">
        <h3 className="text-xs font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Configure Perturbation Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              Primary Target Domain:
            </label>
            <select
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value as Domain)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-neutral-200 bg-white capitalize font-mono text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              {Object.values(Domain).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              Secondary Domain (For Pairing):
            </label>
            <select
              value={secondaryDomain}
              onChange={(e) => setSecondaryDomain(e.target.value as Domain)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-neutral-200 bg-white capitalize font-mono text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              {Object.values(Domain)
                .filter((d) => d !== targetDomain)
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              Perturbation Duration:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <span className="text-xs font-mono font-bold text-neutral-800 w-12 text-right">
                {duration} ticks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Experiments Stream */}
      {activeExperiments.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Currently Active Perturbations ({activeExperiments.length})</span>
          </h3>

          <div className="space-y-3">
            {activeExperiments.map((exp) => {
              const ticksElapsed = Math.max(0, currentTick - exp.appliedAtTick);
              const progressPct = Math.min(100, Math.round((ticksElapsed / exp.durationTicks) * 100));

              return (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">{exp.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                        Running ({ticksElapsed}/{exp.durationTicks}t)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{exp.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onCancelExperiment(exp.id)}
                    className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Abort</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Experiment Log */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Experiment Impact & Quantitative Outcomes</span>
        </h3>

        {completedExperiments.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-xs">
            No completed experiments yet. Launch a perturbation above and step the simulation to evaluate the empirical response.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                  <th className="pb-2">Experiment</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Tick Window</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2">Quantitative Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {completedExperiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-2.5 font-sans font-semibold text-neutral-900">
                      {exp.title}
                    </td>
                    <td className="py-2.5 uppercase text-[10px] font-bold text-purple-700">
                      {exp.type}
                    </td>
                    <td className="py-2.5 text-neutral-600">
                      t={exp.appliedAtTick} → t={exp.appliedAtTick + exp.durationTicks}
                    </td>
                    <td className="py-2.5 text-neutral-600">{exp.durationTicks} ticks</td>
                    <td className="py-2.5 font-sans font-medium text-emerald-700">
                      {exp.deltaSummary || "Completed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

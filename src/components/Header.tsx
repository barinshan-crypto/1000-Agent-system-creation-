import React from 'react';
import { Play, Pause, StepForward, FastForward, RotateCcw, Sparkles, Cpu, Radio, Network, Terminal, Layers, Share2, Compass, Bot, Activity, FlaskConical, Video, Globe, Rocket, ShieldAlert, Server } from 'lucide-react';

interface HeaderProps {
  tick: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onFastForward: (ticks: number) => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (s: number) => void;
  fleetSize: number;
  onChangeFleetSize: (size: number) => void;
  activeTab: "artifacts" | "matrix" | "deployment" | "cdl" | "heavy-thinking" | "collaboration" | "graph" | "analytics" | "experiments" | "bus" | "python" | "workflow";
  onChangeTab: (tab: "artifacts" | "matrix" | "deployment" | "cdl" | "heavy-thinking" | "collaboration" | "graph" | "analytics" | "experiments" | "bus" | "python" | "workflow") => void;
  artifactCount: number;
  activeExperimentsCount?: number;
  onOpenDirector?: () => void;
  onOpenConnectAi?: () => void;
  aiConnectedCount?: number;
  aiAutonomousMode?: boolean;
  cdlCrisesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  tick,
  isRunning,
  onTogglePlay,
  onStep,
  onFastForward,
  onReset,
  speed,
  onChangeSpeed,
  fleetSize,
  onChangeFleetSize,
  activeTab,
  onChangeTab,
  artifactCount,
  activeExperimentsCount = 0,
  onOpenDirector,
  onOpenConnectAi,
  aiConnectedCount = 0,
  aiAutonomousMode = false,
}) => {
  return (
    <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900 leading-tight">
                {fleetSize.toLocaleString()}-Agent Emergent Creation System
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                Tick: <strong className="text-neutral-900">{tick}</strong>
              </span>
              <button
                onClick={onOpenConnectAi}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-[11px] font-medium text-purple-800 transition-colors cursor-pointer"
                title="Click to view AI Connection details and settings"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-semibold">Gemini AI Active</span>
                {aiConnectedCount > 0 && (
                  <span className="bg-purple-200/80 text-purple-900 text-[10px] px-1.5 rounded-full font-mono">
                    {aiConnectedCount} Linked
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              {fleetSize.toLocaleString()} specialized agents • AI Connected • 1 job & 1 decision rule each • Cross-domain synthesis
            </p>
          </div>
        </div>

        {/* Simulation Execution Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Connect to AI Primary Trigger */}
          {onOpenConnectAi && (
            <button
              onClick={onOpenConnectAi}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              title="Configure and manage Google Gemini AI connection for the swarm"
            >
              <Bot className="w-3.5 h-3.5 text-purple-200" />
              <span>Connect to AI</span>
              {aiAutonomousMode && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-neutral-900 font-bold uppercase tracking-wider">
                  Auto
                </span>
              )}
            </button>
          )}

          {/* AI Swarm Director Button */}
          {onOpenDirector && (
            <button
              onClick={onOpenDirector}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/80 transition-colors"
              title="Open AI Swarm Director to guide the 500 agents with Gemini"
            >
              <Compass className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Director</span>
            </button>
          )}

          {/* Fleet Size Switcher (500 vs 1,000) */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5 text-xs font-medium mr-1">
            <span className="text-[10px] text-neutral-500 px-1.5 font-mono">Fleet:</span>
            {[500, 1000].map((size) => (
              <button
                key={size}
                onClick={() => onChangeFleetSize(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  fleetSize === size
                    ? "bg-purple-600 text-white shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                title={`Switch simulation fleet to ${size.toLocaleString()} agents`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            id="play-pause-btn"
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-neutral-900 hover:bg-neutral-800 text-white"
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? "Pause" : "Play"}</span>
          </button>

          {/* Step +1 Tick */}
          <button
            id="step-btn"
            onClick={onStep}
            disabled={isRunning}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 flex items-center gap-1 transition-colors"
            title="Advance 1 simulation tick"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>+1 Tick</span>
          </button>

          {/* Fast Forward +10 Ticks */}
          <button
            id="ff-btn"
            onClick={() => onFastForward(10)}
            disabled={isRunning}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 flex items-center gap-1 transition-colors"
            title="Fast forward 10 ticks"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+10</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5 text-xs font-medium">
            <span className="text-[10px] text-neutral-500 px-1 font-mono">Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  speed === s ? "bg-white text-neutral-900 shadow-xs font-bold" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            id="reset-btn"
            onClick={onReset}
            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors"
            title="Reset simulation to tick 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-neutral-100 py-1.5">
        <button
          onClick={() => onChangeTab("artifacts")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "artifacts"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Emergent Artifacts</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "artifacts" ? "bg-neutral-800 text-purple-300" : "bg-neutral-200 text-neutral-700"
            }`}
          >
            {artifactCount}
          </span>
        </button>

        <button
          onClick={() => onChangeTab("matrix")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "matrix"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{fleetSize.toLocaleString()} Agents Matrix</span>
        </button>

        <button
          onClick={() => onChangeTab("workflow")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "workflow"
              ? "bg-purple-900 text-white shadow-xs font-semibold ring-1 ring-purple-500/50"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Video className="w-3.5 h-3.5 text-purple-400" />
          <span>Workflow & Video Map</span>
          <span className="text-[10px] px-1 rounded bg-purple-100 text-purple-800 font-bold ml-0.5">
            ڕەسم و ڤیدیۆ
          </span>
        </button>

        <button
          onClick={() => onChangeTab("deployment")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "deployment"
              ? "bg-indigo-900 text-white shadow-xs font-semibold ring-1 ring-indigo-500/50"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>Earth & Space Deploy</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-bold font-mono">
            زەوی و بۆشایی
          </span>
        </button>

        <button
          onClick={() => onChangeTab("cdl")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "cdl"
              ? "bg-rose-900 text-white shadow-xs font-semibold ring-1 ring-rose-500/50"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Crisis Learning (CDL)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 font-bold font-mono">
            قەیرانەکان
          </span>
        </button>

        <button
          onClick={() => onChangeTab("heavy-thinking")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "heavy-thinking"
              ? "bg-purple-900 text-white shadow-xs font-semibold ring-1 ring-purple-400"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Server className="w-3.5 h-3.5 text-purple-400" />
          <span>Massive Server (Gemini)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold font-mono">
            بیرکردنەوەی قووڵ
          </span>
        </button>

        <button
          onClick={() => onChangeTab("collaboration")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "collaboration"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Domain Synthesis Grid</span>
        </button>

        <button
          onClick={() => onChangeTab("graph")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "graph"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Network Graph</span>
        </button>

        <button
          onClick={() => onChangeTab("analytics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "analytics"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Complexity & Phase Transitions</span>
        </button>

        <button
          onClick={() => onChangeTab("experiments")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "experiments"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
          <span>Perturbation Lab</span>
          {activeExperimentsCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-400 text-neutral-900 font-bold animate-pulse">
              {activeExperimentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onChangeTab("bus")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "bus"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>MessageBus Telemetry</span>
        </button>

        <button
          onClick={() => onChangeTab("python")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === "python"
              ? "bg-neutral-900 text-white shadow-xs font-semibold"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>agents500.py & CLI</span>
        </button>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationSystem } from './engine/simulationEngine';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { ArtifactsGallery } from './components/ArtifactsGallery';
import { AgentMatrix } from './components/AgentMatrix';
import { CollaborationMatrix } from './components/CollaborationMatrix';
import { NetworkGraphView } from './components/NetworkGraphView';
import { MessageBusView } from './components/MessageBusView';
import { PythonRunnerView } from './components/PythonRunnerView';
import { EmergenceAnalyticsView } from './components/EmergenceAnalyticsView';
import { SwarmExperimentsLab } from './components/SwarmExperimentsLab';
import { WorkflowVideoMap } from './components/WorkflowVideoMap';
import { DeploymentEnvironmentsView } from './components/DeploymentEnvironmentsView';
import { CrisisDrivenLearningView } from './components/CrisisDrivenLearningView';
import { HeavyThinkingServerView } from './components/HeavyThinkingServerView';
import { ResearchDossierModal } from './components/ResearchDossierModal';
import { AiDirectorModal } from './components/AiDirectorModal';
import { ConnectAiModal } from './components/ConnectAiModal';
import {
  AgentData,
  EmergentArtifact,
  SimulationStats,
  Domain,
  AiConnectionStatus,
  AiSwarmConfig,
  AiLogEntry,
  TelemetrySnapshot,
  SwarmExperiment,
  HubAgentMetric,
  PerturbationType,
  CdlModuleState,
  GeminiHeavyThinkingResult,
} from './types';

export default function App() {
  const simRef = useRef<SimulationSystem | null>(null);
  const [fleetSize, setFleetSize] = useState<number>(1000);
  const [isDirectorOpen, setIsDirectorOpen] = useState<boolean>(false);
  const [isConnectAiOpen, setIsConnectAiOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [dossierMarkdown, setDossierMarkdown] = useState<string>("");

  // AI Connection & Swarm State
  const [aiStatus, setAiStatus] = useState<AiConnectionStatus | null>(null);
  const [swarmConfig, setSwarmConfig] = useState<AiSwarmConfig>({
    autonomousMode: true,
    tickInterval: 25,
    globalDirective: "Synthesize biomimetic engineering with cellular biology to discover self-healing architectural lattices.",
  });
  const [aiLogs, setAiLogs] = useState<AiLogEntry[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const lastAiCallTimeRef = useRef<number>(0);
  const aiCooldownMsRef = useRef<number>(12000); // Minimum 12s cooldown between autonomous API calls to protect RPM limits

  // Initialize simulation system with 1,000 agents by default
  if (!simRef.current) {
    const sys = new SimulationSystem(1000, 42);
    // Pre-run 10 ticks so the app displays initial emergent results immediately
    sys.stepN(10);
    // Connect initial 50 vanguard agents to Gemini AI
    sys.connectAiCohort(50);
    simRef.current = sys;
  }

  const [tick, setTick] = useState<number>(() => simRef.current?.bus.tick || 10);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    "artifacts" | "matrix" | "deployment" | "cdl" | "heavy-thinking" | "collaboration" | "graph" | "analytics" | "experiments" | "bus" | "python" | "workflow"
  >("artifacts");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [stats, setStats] = useState<SimulationStats>(() => simRef.current!.getStats());
  const [artifacts, setArtifacts] = useState<EmergentArtifact[]>(() => [...simRef.current!.artifacts]);
  const [agentsData, setAgentsData] = useState<AgentData[]>(() =>
    simRef.current!.agents.map((a) => a.toData())
  );
  const [collabMatrix, setCollabMatrix] = useState<Record<string, Record<string, number>>>(() =>
    simRef.current!.getDomainCollaborationMatrix()
  );
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetrySnapshot[]>(() => [
    ...simRef.current!.telemetryHistory,
  ]);
  const [experiments, setExperiments] = useState<SwarmExperiment[]>(() => [
    ...simRef.current!.experiments,
  ]);
  const [hubAgents, setHubAgents] = useState<HubAgentMetric[]>(() =>
    simRef.current!.getHubAgents(10)
  );
  const [quarantinedDomains, setQuarantinedDomains] = useState<Domain[]>(() =>
    Array.from(simRef.current!.quarantinedDomains)
  );
  const [boostedDomains, setBoostedDomains] = useState<Domain[]>(() =>
    Array.from(simRef.current!.boostedDomains)
  );
  const [cdlState, setCdlState] = useState<CdlModuleState>(() =>
    simRef.current!.getCdlState()
  );
  const [heavyThinkingHistory, setHeavyThinkingHistory] = useState<GeminiHeavyThinkingResult[]>(() =>
    simRef.current ? simRef.current.getHeavyThinkingHistory() : []
  );
  const [isHeavyThinkingLoading, setIsHeavyThinkingLoading] = useState<boolean>(false);
  const [autoEscalateOnCrisis, setAutoEscalateOnCrisis] = useState<boolean>(true);
  const lastHeavyThinkingTimeRef = useRef<number>(0);

  // Sync state from simulation ref
  const syncSimState = useCallback(() => {
    if (!simRef.current) return;
    const sim = simRef.current;
    setTick(sim.bus.tick);
    setStats(sim.getStats());
    setArtifacts([...sim.artifacts]);
    setAgentsData(sim.agents.map((a) => a.toData()));
    setCollabMatrix(sim.getDomainCollaborationMatrix());
    setTelemetryHistory([...sim.telemetryHistory]);
    setExperiments([...sim.experiments]);
    setHubAgents(sim.getHubAgents(10));
    setQuarantinedDomains(Array.from(sim.quarantinedDomains));
    setBoostedDomains(Array.from(sim.boostedDomains));
    setCdlState(sim.getCdlState());
    setHeavyThinkingHistory(sim.getHeavyThinkingHistory());
  }, []);

  // Fetch AI connection status on mount
  const fetchAiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus({
          connected: true,
          model: data.model,
          hasKey: data.hasKey,
          engine: data.engine || 'Google GenAI SDK',
        });
      }
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    }
  }, []);

  useEffect(() => {
    fetchAiStatus();
  }, [fetchAiStatus]);

  // Connect / Disconnect AI Cohorts
  const handleConnectCohort = useCallback((count: number) => {
    if (!simRef.current) return;
    simRef.current.connectAiCohort(count);
    syncSimState();
  }, [syncSimState]);

  const handleDisconnectAll = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.disconnectAllAi();
    syncSimState();
  }, [syncSimState]);

  // Trigger real AI action for an agent
  const triggerAiSynthesisForRandomAgent = useCallback(async (isManual: boolean = false) => {
    if (!simRef.current || isAiGenerating) return;
    const now = Date.now();
    if (!isManual && now - lastAiCallTimeRef.current < aiCooldownMsRef.current) {
      return; // Safe rate limit guard to avoid 429 quota exhaustion
    }

    const connectedIds = Array.from(simRef.current.aiConnectedAgentIds);
    if (connectedIds.length === 0) return;

    // Pick random connected agent
    const randId = connectedIds[Math.floor(Math.random() * connectedIds.length)];
    const agent = simRef.current.agents.find((a) => a.id === randId);
    if (!agent) return;

    lastAiCallTimeRef.current = now;
    setIsAiGenerating(true);
    try {
      // Pick a cross-domain partner if available
      const otherAgents = simRef.current.agents.filter((a) => a.domain !== agent.domain);
      const partner = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      const isMerge = Math.random() > 0.4 && Boolean(partner);

      const res = await fetch('/api/agent/generate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agent.toData(),
          actionType: isMerge ? 'merge' : 'produce',
          otherAgent: isMerge && partner ? partner.toData() : undefined,
          directive: swarmConfig.globalDirective,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // If recovery fallback was triggered, dynamically extend cooldown to allow Gemini quota to refresh
        if (data.isFallback) {
          aiCooldownMsRef.current = 25000;
        } else {
          aiCooldownMsRef.current = 12000;
        }

        const proposal = data.proposal;

        if (isMerge && partner) {
          const newArtifact: EmergentArtifact = {
            id: `ai-art-${Date.now().toString(16)}`,
            domains: [agent.domain, partner.domain].sort() as [Domain, Domain],
            contributors: [agent.id, partner.id],
            t: simRef.current.bus.tick,
            content: {
              kind: 'ai-synthesis',
              domain_a: agent.domain,
              domain_b: partner.domain,
              pieces: [
                {
                  title: proposal.title,
                  summary: proposal.summary,
                  detail: proposal.detail,
                },
                {
                  job: partner.job,
                  domain: partner.domain,
                  influence: "Collaborative synthesis via Gemini autonomous swarm",
                },
              ],
              job_b: partner.job,
              by: [agent.id, partner.id],
              aiProposal: proposal,
            },
            isAiGenerated: true,
          };
          simRef.current.injectAiArtifact(newArtifact);

          setAiLogs((prev) => [
            {
              id: `log-${Date.now()}`,
              timestamp: Date.now(),
              agentId: agent.id,
              domain: agent.domain,
              action: `Cross-Domain AI Fusion: ${agent.domain} ⨁ ${partner.domain}`,
              title: proposal.title,
              summary: proposal.summary,
            },
            ...prev.slice(0, 49),
          ]);
        } else {
          simRef.current.injectAiBroadcast(agent.id, `ai-proposal:${agent.domain}`, {
            title: proposal.title,
            summary: proposal.summary,
            detail: proposal.detail,
            tags: proposal.tags,
          });

          setAiLogs((prev) => [
            {
              id: `log-${Date.now()}`,
              timestamp: Date.now(),
              agentId: agent.id,
              domain: agent.domain,
              action: `AI Domain Broadcast (${agent.job})`,
              title: proposal.title,
              summary: proposal.summary,
            },
            ...prev.slice(0, 49),
          ]);
        }
        syncSimState();
      }
    } catch (err) {
      console.error('AI synthesis failed:', err);
    } finally {
      setIsAiGenerating(false);
    }
  }, [isAiGenerating, swarmConfig.globalDirective, syncSimState]);

  // Step simulation forward
  const handleStep = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.step();
    syncSimState();

    if (swarmConfig.autonomousMode && simRef.current.bus.tick % swarmConfig.tickInterval === 0) {
      triggerAiSynthesisForRandomAgent(false);
    }
  }, [syncSimState, swarmConfig.autonomousMode, swarmConfig.tickInterval, triggerAiSynthesisForRandomAgent]);

  // Fast forward N ticks
  const handleFastForward = useCallback(
    (n: number) => {
      if (!simRef.current) return;
      simRef.current.stepN(n);
      syncSimState();

      if (swarmConfig.autonomousMode) {
        triggerAiSynthesisForRandomAgent(false);
      }
    },
    [syncSimState, swarmConfig.autonomousMode, triggerAiSynthesisForRandomAgent]
  );

  // Reset simulation
  const handleReset = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.reset();
    simRef.current.connectAiCohort(50);
    syncSimState();
  }, [syncSimState]);

  // Change fleet size
  const handleChangeFleetSize = useCallback(
    (newSize: number) => {
      if (newSize === fleetSize) return;
      setFleetSize(newSize);
      if (!simRef.current) return;
      simRef.current.init(newSize);
      simRef.current.stepN(10);
      simRef.current.connectAiCohort(50);
      syncSimState();
    },
    [fleetSize, syncSimState]
  );

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Interval timer for simulation loop
  useEffect(() => {
    if (!isRunning) return;

    // Speed: 1x = 500ms, 2x = 250ms, 5x = 100ms
    const intervalMs = Math.max(80, Math.floor(500 / speed));
    const timer = setInterval(() => {
      if (!simRef.current) return;
      simRef.current.step();
      syncSimState();

      if (
        swarmConfig.autonomousMode &&
        simRef.current.bus.tick % swarmConfig.tickInterval === 0
      ) {
        triggerAiSynthesisForRandomAgent(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    isRunning,
    speed,
    syncSimState,
    swarmConfig.autonomousMode,
    swarmConfig.tickInterval,
    triggerAiSynthesisForRandomAgent,
  ]);

  // Handle clicking an agent from any card or stream
  const handleSelectAgent = (agentId: string | null) => {
    setSelectedAgentId(agentId);
    if (agentId && activeTab !== "matrix") {
      setActiveTab("matrix");
    }
  };

  // Handle clicking a domain pair from the collaboration matrix
  const handleFilterDomainPair = (d1: string, d2: string) => {
    setActiveTab("artifacts");
  };

  // AI Injection Handlers
  const handleInjectArtifact = useCallback((artifact: EmergentArtifact) => {
    if (!simRef.current) return;
    simRef.current.injectAiArtifact(artifact);
    syncSimState();
  }, [syncSimState]);

  const handleInjectBroadcast = useCallback((senderId: string, topic: string, content: any) => {
    if (!simRef.current) return;
    simRef.current.injectAiBroadcast(senderId, topic, content);
    syncSimState();
  }, [syncSimState]);

  const handleBroadcastDirective = useCallback((prompt: string, pairing?: { domainA: string; domainB: string }) => {
    if (!simRef.current) return;
    simRef.current.injectAiBroadcast("AI-DIRECTOR", "ai-directive:challenge", {
      prompt,
      targetPairing: pairing,
      note: "Director challenge issued to all agents via Gemini 3.5 Flash",
    });
    setSwarmConfig((prev) => ({ ...prev, globalDirective: prompt }));
    syncSimState();
  }, [syncSimState]);

  const handleUpdateArtifact = useCallback((updated: EmergentArtifact) => {
    if (!simRef.current) return;
    const idx = simRef.current.artifacts.findIndex((a) => a.id === updated.id);
    if (idx !== -1) {
      simRef.current.artifacts[idx] = updated;
      syncSimState();
    }
  }, [syncSimState]);

  // Experiments Handlers
  const handleApplyExperiment = useCallback(
    (
      type: PerturbationType,
      params: {
        title: string;
        description: string;
        durationTicks?: number;
        targetDomain?: Domain;
        secondaryDomain?: Domain;
      }
    ) => {
      if (!simRef.current) return;
      simRef.current.applyExperiment(type, params);
      syncSimState();
    },
    [syncSimState]
  );

  const handleCancelExperiment = useCallback(
    (id: string) => {
      if (!simRef.current) return;
      simRef.current.cancelExperiment(id);
      syncSimState();
    },
    [syncSimState]
  );

  // Open Research Dossier
  const handleOpenDossier = useCallback(() => {
    if (!simRef.current) return;
    const dossier = simRef.current.generateResearchDossier();
    setDossierMarkdown(dossier);
    setIsDossierOpen(true);
  }, []);

  // Dispatch to Massive Server (Gemini) for Heavy Thinking & Feed Back into 1,000-Agent Pool
  const handleDispatchHeavyThinking = useCallback(
    async (userGoal?: string) => {
      if (!simRef.current || isHeavyThinkingLoading) return;
      setIsHeavyThinkingLoading(true);
      try {
        const payload = simRef.current.exportHeavyThinkingTelemetry(userGoal);
        const res = await fetch('/api/swarm/heavy-thinking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.result) {
            simRef.current.ingestHeavyThinkingFeedback({
              result: data.result,
              model: data.model,
              durationMs: data.durationMs,
              isFallback: data.isFallback,
            });
            syncSimState();

            setAiLogs((prev) => [
              {
                id: `ht-${Date.now()}`,
                timestamp: Date.now(),
                agentId: "MASSIVE_SERVER_CORE",
                domain: Domain.ENGINEERING,
                action: `Massive Server Heavy Thinking (${data.model || "Gemini"})`,
                title: `${data.result.synthesizedTheorems?.length || 0} Theorems & ${data.result.globalMetaConstraints?.length || 0} Meta-Constraints Injected`,
                summary: data.result.heavyThinkingSummaryKu || data.result.heavyThinkingSummary,
              },
              ...prev.slice(0, 49),
            ]);
          }
        } else {
          console.error("Heavy thinking endpoint returned status:", res.status);
        }
      } catch (err) {
        console.error("Failed to dispatch to massive server:", err);
      } finally {
        setIsHeavyThinkingLoading(false);
        lastHeavyThinkingTimeRef.current = Date.now();
      }
    },
    [isHeavyThinkingLoading, syncSimState]
  );

  // CDL Manual Trigger
  const handleTriggerManualCrisis = useCallback(
    (type: "stagnation" | "hallucination_cascade" | "stress_fracture", domain = "global") => {
      if (!simRef.current) return;
      simRef.current.triggerManualCrisis(type, domain);
      syncSimState();

      if (autoEscalateOnCrisis && Date.now() - lastHeavyThinkingTimeRef.current > 8000) {
        setTimeout(() => {
          handleDispatchHeavyThinking(`Resolve critical ${type} crisis in ${domain} domain.`);
        }, 400);
      }
    },
    [syncSimState, autoEscalateOnCrisis, handleDispatchHeavyThinking]
  );

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Header */}
      <Header
        tick={tick}
        isRunning={isRunning}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onFastForward={handleFastForward}
        onReset={handleReset}
        speed={speed}
        onChangeSpeed={setSpeed}
        fleetSize={fleetSize}
        onChangeFleetSize={handleChangeFleetSize}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        artifactCount={artifacts.length}
        activeExperimentsCount={experiments.filter((e) => e.status === "active").length}
        onOpenDirector={() => setIsDirectorOpen(true)}
        onOpenConnectAi={() => setIsConnectAiOpen(true)}
        aiConnectedCount={simRef.current?.aiConnectedAgentIds.size || 0}
        aiAutonomousMode={swarmConfig.autonomousMode}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 py-5 flex-1 space-y-5">
        {/* Real-time Metrics Bar */}
        <MetricsBar stats={stats} />

        {/* Tab Views */}
        {activeTab === "artifacts" && (
          <ArtifactsGallery
            artifacts={artifacts}
            onSelectAgent={handleSelectAgent}
            onUpdateArtifact={handleUpdateArtifact}
            onOpenDossier={handleOpenDossier}
            onOpenWorkflowMap={() => setActiveTab("workflow")}
          />
        )}

        {activeTab === "matrix" && (
          <AgentMatrix
            agents={agentsData}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onInjectArtifact={handleInjectArtifact}
            onInjectBroadcast={handleInjectBroadcast}
          />
        )}

        {activeTab === "workflow" && (
          <WorkflowVideoMap
            agents={agentsData}
            artifacts={artifacts}
            currentTick={tick}
            onSelectAgent={handleSelectAgent}
          />
        )}

        {activeTab === "deployment" && (
          <DeploymentEnvironmentsView
            agents={agentsData}
            artifacts={artifacts}
            currentTick={tick}
            onSelectAgent={handleSelectAgent}
            onOpenDossier={handleOpenDossier}
          />
        )}

        {activeTab === "cdl" && (
          <CrisisDrivenLearningView
            cdlState={cdlState}
            onTriggerManualCrisis={handleTriggerManualCrisis}
            onStepSimulation={handleStep}
            tick={tick}
            onOpenHeavyThinking={() => setActiveTab("heavy-thinking")}
          />
        )}

        {activeTab === "heavy-thinking" && simRef.current && (
          <HeavyThinkingServerView
            tick={tick}
            payload={simRef.current.exportHeavyThinkingTelemetry()}
            history={heavyThinkingHistory}
            isLoading={isHeavyThinkingLoading}
            onDispatchHeavyThinking={handleDispatchHeavyThinking}
            onStepSimulation={handleStep}
            cdlState={cdlState}
            autoEscalateOnCrisis={autoEscalateOnCrisis}
            onToggleAutoEscalate={() => setAutoEscalateOnCrisis((prev) => !prev)}
          />
        )}

        {activeTab === "collaboration" && (
          <CollaborationMatrix
            matrix={collabMatrix}
            onFilterDomainPair={handleFilterDomainPair}
          />
        )}

        {activeTab === "graph" && (
          <NetworkGraphView
            agents={agentsData}
            onSelectAgent={handleSelectAgent}
            onOpenPythonTab={() => setActiveTab("python")}
          />
        )}

        {activeTab === "analytics" && (
          <EmergenceAnalyticsView
            telemetryHistory={telemetryHistory}
            currentTick={tick}
            totalAgents={fleetSize}
            artifactsCount={artifacts.length}
            totalMessages={stats.totalMessages}
            hubAgents={hubAgents}
            onSelectAgent={handleSelectAgent}
            onOpenExperiments={() => setActiveTab("experiments")}
          />
        )}

        {activeTab === "experiments" && (
          <SwarmExperimentsLab
            currentTick={tick}
            experiments={experiments}
            onApplyExperiment={handleApplyExperiment}
            onCancelExperiment={handleCancelExperiment}
            quarantinedDomains={quarantinedDomains}
            boostedDomains={boostedDomains}
          />
        )}

        {activeTab === "bus" && (
          <MessageBusView
            messages={simRef.current?.bus.allMessages || []}
            onSelectAgent={handleSelectAgent}
          />
        )}

        {activeTab === "python" && <PythonRunnerView />}
      </main>

      {/* Connect to AI Hub Modal */}
      <ConnectAiModal
        isOpen={isConnectAiOpen}
        onClose={() => setIsConnectAiOpen(false)}
        status={aiStatus}
        onRefreshStatus={fetchAiStatus}
        swarmConfig={swarmConfig}
        onUpdateConfig={(updates) => setSwarmConfig((prev) => ({ ...prev, ...updates }))}
        totalAgents={fleetSize}
        aiConnectedCount={simRef.current?.aiConnectedAgentIds.size || 0}
        onConnectCohort={handleConnectCohort}
        onDisconnectAll={handleDisconnectAll}
        aiLogs={aiLogs}
        onTriggerManualAiAction={() => triggerAiSynthesisForRandomAgent(true)}
        isAiGenerating={isAiGenerating}
      />

      {/* AI Swarm Director Modal */}
      {isDirectorOpen && (
        <AiDirectorModal
          tick={tick}
          artifactCount={artifacts.length}
          fleetSize={fleetSize}
          onClose={() => setIsDirectorOpen(false)}
          onBroadcastDirective={handleBroadcastDirective}
        />
      )}

      {/* Research Dossier Export Modal */}
      <ResearchDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        markdownContent={dossierMarkdown}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 bg-white py-3 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>{fleetSize.toLocaleString()}-Agent Emergent Creation System</strong> • Standalone runnable in Python (`agents500.py`)
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            {fleetSize.toLocaleString()} Agents • 10 Domains • 4 Decision Templates • MessageBus Protocol
          </span>
        </div>
      </footer>
    </div>
  );
}

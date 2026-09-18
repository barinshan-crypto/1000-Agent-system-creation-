export enum Domain {
  SCIENCE = "science",
  ART = "art",
  ENGINEERING = "engineering",
  PHILOSOPHY = "philosophy",
  ECONOMICS = "economics",
  BIOLOGY = "biology",
  LANGUAGE = "language",
  MATH = "math",
  MUSIC = "music",
  SOCIAL = "social",
}

export type DeploymentRealm = "earth" | "space_extreme" | "both";

export type EmbodiedNeuroRole =
  | "symbol_grounding"
  | "neuro_symbolic_verifier"
  | "spatial_kinematics"
  | "extreme_adaptation";

export interface EmbodiedRoleInfo {
  role: EmbodiedNeuroRole;
  titleEn: string;
  titleKu: string;
  taskEn: string;
  taskKu: string;
  decisionRuleEn: string;
  decisionRuleKu: string;
  icon: string;
  badgeColor: string;
}

export type VerificationStatus = "verified_breakthrough" | "theoretical_hypothesis";

export interface RealityVerificationResult {
  status: VerificationStatus;
  smtSatPassed: boolean;
  smtFormula: string;
  proofAxioms: string[];
  physicsGroundingScore: number; // 0 - 100%
  spatialBounding: { x: number; y: number; z: number };
  physicalProperties: {
    massKg: number;
    volumeM3: number;
    temperatureK: number;
  };
  kinematics: {
    passed: boolean;
    torqueNm: number;
    stressRatio: number; // <= 1.0 means no fracture
    gravityTested: "Earth (1.0g)" | "Mars (0.38g)" | "Deep Space (0.0g)";
    shearSafetyMargin: number;
  };
  extremeAdaptation: {
    radiationHardenedKrad: number;
    cryoTempK: number;
    vacuumResistant: boolean;
    seuImmunityPercent: number;
  };
  verdictReasonEn: string;
  verdictReasonKu: string;
}

export type EntropyRegime = "stagnation_risk" | "optimal_homeostasis" | "chaos_risk";

export interface TopologyRewiringEvent {
  tick: number;
  entropyBits: number;
  entropyRegime: EntropyRegime;
  action: "renaissance_burst" | "hub_consolidation" | "homeostasis_stable";
  titleKu: string;
  titleEn: string;
  detailsKu: string;
  edgesRewired: number;
  timestamp: number;
}

export type StrategicPillarId =
  | "embodied_robotics"
  | "neuro_symbolic"
  | "neuromorphic_nano"
  | "biosphere_logistics";

export interface StrategicPillarInfo {
  id: StrategicPillarId;
  titleEn: string;
  titleKu: string;
  coreConceptEn: string;
  coreConceptKu: string;
  earthAppEn: string;
  earthAppKu: string;
  spaceAppEn: string;
  spaceAppKu: string;
  associatedDomains: Domain[];
  icon: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    accent: string;
  };
  metrics: {
    label: string;
    earthUnit: string;
    spaceUnit: string;
    benchmarkVal: number;
  };
}

export type DecisionTemplate = "produce_first" | "respond_first" | "merge_first" | "explore";

export interface Message {
  msg_id: string;
  sender: string;
  recipient: string; // agent_id or "broadcast"
  topic: string;
  content: any;
  timestamp: number;
  isAiGenerated?: boolean;
}

export interface AgentData {
  id: string;
  idx: number;
  domain: Domain;
  verb: string;
  job: string;
  decision_name: DecisionTemplate;
  made: number;
  partners: string[];
  memory: Message[];
  lastAction?: "produce" | "respond" | "merge" | "idle";
  status?: "ACTIVE" | "CDL_REVIEW" | "QUARANTINED" | "BOOSTED";
  cdlConstraintsApplied?: string[];
  geminiDirective?: string;
  isAiConnected?: boolean;
  strategicPillar?: StrategicPillarId;
  primaryRealm?: "earth" | "space_extreme";
  embodiedRole?: EmbodiedNeuroRole;
  roleTelemetry?: {
    groundingScore?: number;
    satClausesChecked?: number;
    stressYieldRatio?: number;
    radiationToleranceKrad?: number;
    lastAuditDecision?: string;
  };
}

export interface AiExpandedArtifact {
  breakthroughTitle: string;
  conceptOverview: string;
  technicalManifesto: string;
  potentialApplications: string[];
  nextSwarmDirections: string;
  earthDeploymentNote?: string;
  spaceDeploymentNote?: string;
}

export interface EmergentArtifact {
  id: string;
  domains: [Domain, Domain] | [string, string];
  contributors: string[];
  t: number;
  content: {
    kind: string;
    domain_a: string;
    domain_b: string;
    pieces: [any, any];
    job_b: string;
    by: string[];
    aiProposal?: {
      title: string;
      summary: string;
      detail: string;
      tags: string[];
    };
  };
  isAiGenerated?: boolean;
  aiExpansion?: AiExpandedArtifact;
  deploymentRealm?: DeploymentRealm;
  strategicPillars?: StrategicPillarId[];
  earthApplication?: string;
  spaceApplication?: string;
  realityVerification?: RealityVerificationResult;
}

export interface AiAgentChatMessage {
  role: "user" | "agent";
  text: string;
  timestamp: number;
}

export interface AiSwarmDirective {
  directiveTitle: string;
  analysis: string;
  recommendedPairings: Array<{ domainA: string; domainB: string; rationale: string }>;
  challengePrompt: string;
}

export interface CdlCrisisEvent {
  tick: number;
  crisisType: "stagnation" | "hallucination_cascade" | "stress_fracture" | "vacuum_breach";
  domain: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedAgentsCount: number;
  ruleInjected: string;
  ruleInjectedKu: string;
  timestamp: number;
}

export interface CdlActiveConstraint {
  id: string;
  domain: string;
  ruleEn: string;
  ruleKu: string;
  originCrisis: string;
  decayWeight: number; // 1.0 down to 0.0
  activeSinceTick: number;
}

export interface CdlModuleState {
  crisisThreshold: number;
  memoryDecay: number;
  crisisCounters: Record<string, number>;
  activeConstraints: Record<string, string[]>;
  crisisLog: CdlCrisisEvent[];
  isolatedAgentIds: string[];
  totalCrisesPrevented: number;
}

export interface SimulationStats {
  tick: number;
  totalMessages: number;
  broadcastsCount: number;
  pendingQueueCount: number;
  proposalsCount: number;
  artifactsCount: number;
  uniqueEdgesCount: number;
  aiConnectedCount?: number;
  aiArtifactsCount?: number;
}

export interface AiConnectionStatus {
  connected: boolean;
  model: string;
  hasKey: boolean;
  engine: string;
  latencyMs?: number;
  lastTestMessage?: string;
  lastTestedAt?: string;
}

export interface AiSwarmConfig {
  autonomousMode: boolean;
  tickInterval: number;
  globalDirective: string;
}

export interface AiLogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  domain: string;
  action: string;
  model: string;
  summary: string;
}

export interface TelemetrySnapshot {
  tick: number;
  timestamp: number;
  artifacts: number;
  messages: number;
  entropy: number;
  entropyBits: number;
  entropyRegime?: EntropyRegime;
  velocity: number;
  activeBridges: number;
  percolation: number;
  rewiringEvent?: TopologyRewiringEvent;
  cdlCrisesCount?: number;
  cdlActiveConstraintsCount?: number;
}

export type PerturbationType =
  | "renaissance"
  | "quarantine"
  | "hyper_mutation"
  | "cross_pollination"
  | "directive_injection";

export interface SwarmExperiment {
  id: string;
  type: PerturbationType;
  title: string;
  description: string;
  appliedAtTick: number;
  targetDomain?: Domain;
  secondaryDomain?: Domain;
  status: "active" | "completed";
  durationTicks: number;
  startingArtifacts: number;
  startingMessages: number;
  resultingArtifacts?: number;
  resultingMessages?: number;
  deltaSummary?: string;
}

export interface HubAgentMetric {
  agentId: string;
  domain: Domain;
  job: string;
  degree: number;
  bridgedDomainsCount: number;
  bridgedDomains: Domain[];
  artifactsSynthesized: number;
  influenceScore: number;
}

export interface GeminiSynthesizedTheorem {
  title: string;
  domainA: Domain | string;
  domainB: Domain | string;
  formalStatement: string;
  noveltyAxiom: string;
  deploymentTarget: DeploymentRealm;
}

export interface GeminiHeavyThinkingPayload {
  tick: number;
  agentPoolSize: number;
  domainDistribution: Record<string, number>;
  recentCrises: CdlCrisisEvent[];
  activeConstraints: Record<string, string[]>;
  isolatedAgentsCount: number;
  sampleArtifacts: Array<{
    id: string;
    title: string;
    domains: string[];
    groundingScore?: number;
    status?: string;
  }>;
  systemEntropy: number;
  entropyRegime: EntropyRegime;
  userGoal?: string;
}

export interface GeminiHeavyThinkingRawResponse {
  heavyThinkingSummary: string;
  heavyThinkingSummaryKu: string;
  synthesizedTheorems: GeminiSynthesizedTheorem[];
  globalMetaConstraints: string[];
  domainDirectiveBoosts: Record<string, { boostWeight: number; instruction: string }>;
  releaseQuarantinedAgents?: boolean;
}

export interface GeminiHeavyThinkingResult {
  id: string;
  tick: number;
  timestamp: number;
  model: string;
  durationMs: number;
  isFallback?: boolean;
  result: GeminiHeavyThinkingRawResponse;
  feedbackApplied: {
    theoremsInjectedCount: number;
    constraintsInjectedCount: number;
    agentsReleasedCount: number;
    domainsBoosted: string[];
    agentsDirectivesUpdated: number;
  };
}


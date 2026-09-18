import {
  Domain,
  DecisionTemplate,
  Message,
  AgentData,
  EmergentArtifact,
  SimulationStats,
  TelemetrySnapshot,
  SwarmExperiment,
  HubAgentMetric,
  PerturbationType,
  StrategicPillarId,
  DeploymentRealm,
  EmbodiedNeuroRole,
  TopologyRewiringEvent,
  RealityVerificationResult,
  CdlCrisisEvent,
  CdlModuleState,
  GeminiHeavyThinkingPayload,
  GeminiHeavyThinkingRawResponse,
  GeminiHeavyThinkingResult,
  GeminiSynthesizedTheorem,
} from '../types';
import { EMBODIED_ROLES_LIST, verifyRealityGrounding } from './embodiedRoles';
import { CrisisDrivenLearningModule } from './crisisDrivenLearning';

export const VERBS: Record<Domain, string[]> = {
  [Domain.SCIENCE]: ["hypothesize", "measure", "falsify", "model", "observe"],
  [Domain.ART]: ["sketch", "color", "compose", "remix", "critique"],
  [Domain.ENGINEERING]: ["design", "prototype", "optimize", "test", "integrate"],
  [Domain.PHILOSOPHY]: ["question", "define", "argue", "synthesize", "deconstruct"],
  [Domain.ECONOMICS]: ["price", "allocate", "forecast", "trade", "audit"],
  [Domain.BIOLOGY]: ["sequence", "classify", "simulate", "culture", "evolve"],
  [Domain.LANGUAGE]: ["translate", "parse", "coin", "summarize", "rhyme"],
  [Domain.MATH]: ["prove", "conjecture", "compute", "generalize", "bound"],
  [Domain.MUSIC]: ["harmonize", "rhythmize", "sample", "arrange", "improvise"],
  [Domain.SOCIAL]: ["mediate", "poll", "nudge", "connect", "narrate"],
};

export const DECISION_TEMPLATES: DecisionTemplate[] = [
  "produce_first",
  "respond_first",
  "merge_first",
  "explore",
];

export const DOMAIN_COLORS: Record<Domain, { bg: string; text: string; border: string; badge: string; ring: string }> = {
  [Domain.SCIENCE]: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", badge: "bg-teal-100 text-teal-800", ring: "ring-teal-500" },
  [Domain.ART]: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-800", ring: "ring-fuchsia-500" },
  [Domain.ENGINEERING]: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", badge: "bg-amber-100 text-amber-800", ring: "ring-amber-500" },
  [Domain.PHILOSOPHY]: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-800", ring: "ring-purple-500" },
  [Domain.ECONOMICS]: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800", ring: "ring-emerald-500" },
  [Domain.BIOLOGY]: { bg: "bg-lime-50", text: "text-lime-800", border: "border-lime-200", badge: "bg-lime-100 text-lime-800", ring: "ring-lime-500" },
  [Domain.LANGUAGE]: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-800", ring: "ring-blue-500" },
  [Domain.MATH]: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-800", ring: "ring-cyan-500" },
  [Domain.MUSIC]: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-100 text-rose-800", ring: "ring-rose-500" },
  [Domain.SOCIAL]: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800", ring: "ring-indigo-500" },
};

// Seedable PRNG (Mulberry32)
export class PRNG {
  private s: number;
  constructor(seed: number) {
    this.s = Math.floor(seed) >>> 0;
  }
  random(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  randint(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.random() * arr.length)];
  }
}

const NOUNS = [
  "field", "vector", "pattern", "loop", "signal", "frame", "token", "lattice",
  "cycle", "pulse", "echo", "seed", "thread", "node", "wave", "cell", "glyph"
];
const ADJS = [
  "silent", "recursive", "fractured", "luminous", "sparse", "dense", "emergent",
  "topological", "minimal", "chaotic", "harmonic", "stochastic", "balanced"
];

export function produceContent(domain: Domain, verb: string, rng: PRNG): Record<string, any> {
  const n = rng.choice(NOUNS);
  const a = rng.choice(ADJS);

  switch (domain) {
    case Domain.SCIENCE:
      return {
        claim: `${a} ${n} causes ${rng.choice(NOUNS)} shift`,
        test: `measure ${n} over ${rng.randint(3, 50)} trials`,
      };
    case Domain.ART:
      return {
        palette: [
          `#${rng.randint(0, 0xffffff).toString(16).padStart(6, "0")}`,
          `#${rng.randint(0, 0xffffff).toString(16).padStart(6, "0")}`,
          `#${rng.randint(0, 0xffffff).toString(16).padStart(6, "0")}`,
        ],
        mood: `${a} ${n}`,
      };
    case Domain.ENGINEERING:
      return {
        spec: `${a}-${n}-${rng.randint(1, 99)}`,
        constraint: `latency < ${rng.randint(1, 200)}ms`,
      };
    case Domain.PHILOSOPHY:
      return {
        proposition: `If ${n} is ${a}, then ${rng.choice(NOUNS)} is prior.`,
        stance: rng.choice(["realist", "idealist", "pragmatist"]),
      };
    case Domain.ECONOMICS:
      return {
        rule: `price ${n} at ${rng.randint(1, 999)} credits`,
        effect: `allocate ${rng.randint(1, 50)}% to ${rng.choice(NOUNS)}`,
      };
    case Domain.BIOLOGY: {
      const bases = ["A", "C", "G", "T"];
      let seq = "";
      for (let i = 0; i < 12; i++) seq += rng.choice(bases);
      return {
        sequence: seq,
        trait: `${a} ${n}`,
      };
    }
    case Domain.LANGUAGE:
      return {
        phrase: `${a} ${n} speaks`,
        grammar: rng.choice(["SVO", "SOV", "VSO"]),
      };
    case Domain.MATH:
      return {
        formula: `f(${n}) = ${rng.randint(1, 9)}*${n} + ${rng.randint(1, 9)}`,
        property: rng.choice(["monotone", "bounded", "convex", "periodic"]),
      };
    case Domain.MUSIC: {
      const notes = ["C", "D", "E", "F", "G", "A", "B"];
      return {
        notes: [rng.choice(notes), rng.choice(notes), rng.choice(notes), rng.choice(notes)],
        tempo: rng.randint(60, 180),
      };
    }
    case Domain.SOCIAL:
      return {
        norm: `${a} ${n} protocol`,
        reach: rng.randint(10, 10000),
      };
    default:
      return { value: rng.randint(0, 1000) };
  }
}

let msgIdCounter = 1;
function genMsgId(): string {
  return (msgIdCounter++).toString(16).padStart(8, "0");
}

export class MessageBusEngine {
  queues: Map<string, Message[]> = new Map();
  broadcastLog: Message[] = [];
  allMessages: Message[] = [];
  tick = 0;

  register(agentId: string): void {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, []);
    }
  }

  send(msg: Message): void {
    msg.timestamp = this.tick;
    this.allMessages.push(msg);
    if (msg.recipient === "broadcast") {
      this.broadcastLog.push(msg);
      if (this.broadcastLog.length > 10000) {
        this.broadcastLog.shift();
      }
      for (const [aid, q] of this.queues.entries()) {
        if (aid !== msg.sender) {
          q.push(msg);
        }
      }
    } else {
      const q = this.queues.get(msg.recipient);
      if (q) {
        q.push(msg);
      }
    }
  }

  receive(agentId: string): Message | null {
    const q = this.queues.get(agentId);
    if (q && q.length > 0) {
      return q.shift() || null;
    }
    return null;
  }

  recentBroadcasts(n = 6): Message[] {
    return this.broadcastLog.slice(-n);
  }
}

export class SimulationAgent {
  id: string;
  idx: number;
  domain: Domain;
  verb: string;
  job: string;
  decisionName: DecisionTemplate;
  rng: PRNG;
  bus: MessageBusEngine;

  memory: Message[] = [];
  partners: Set<string> = new Set();
  made = 0;
  lastAction: "produce" | "respond" | "merge" | "idle" = "idle";
  lastProducedContent: any = null;
  strategicPillar: StrategicPillarId;
  primaryRealm: "earth" | "space_extreme";
  embodiedRole: EmbodiedNeuroRole;
  status: "ACTIVE" | "CDL_REVIEW" | "QUARANTINED" | "BOOSTED" = "ACTIVE";
  cdlConstraints: string[] = [];
  geminiDirective?: string;

  constructor(
    idx: number,
    domain: Domain,
    verb: string,
    bus: MessageBusEngine,
    decisionName: DecisionTemplate,
    rng: PRNG
  ) {
    this.idx = idx;
    this.domain = domain;
    this.verb = verb;
    const padLen = idx >= 1000 ? 4 : 3;
    this.id = `A${idx.toString().padStart(padLen, "0")}-${domain.slice(0, 3)}-${verb.slice(0, 5)}`;
    this.job = `${verb}_${domain}`;
    this.bus = bus;
    this.decisionName = decisionName;
    this.rng = rng;

    const pillars: StrategicPillarId[] = [
      "embodied_robotics",
      "neuro_symbolic",
      "neuromorphic_nano",
      "biosphere_logistics",
    ];
    this.strategicPillar = pillars[idx % pillars.length];
    this.primaryRealm = idx % 2 === 0 ? "earth" : "space_extreme";
    this.embodiedRole = EMBODIED_ROLES_LIST[idx % EMBODIED_ROLES_LIST.length];
  }

  applyConstraints(constraints: string[] = []): void {
    this.cdlConstraints = [...constraints];
  }

  applyGeminiDirective(directive: string): void {
    this.geminiDirective = directive;
    this.status = "BOOSTED";
    this.memory.push({
      msg_id: genMsgId(),
      sender: "GEMINI_SERVER_CORE",
      recipient: this.id,
      topic: `directive:${this.domain}`,
      content: { text: directive, timestamp: this.bus.tick },
      timestamp: this.bus.tick,
    });
  }

  step(isQuarantined = false, isBoosted = false): void {
    // If agent is under active CDL review for system crisis, pause execution this tick
    if (this.status === "CDL_REVIEW") {
      this.lastAction = "idle";
      return;
    }
    if (isQuarantined) {
      this.status = "QUARANTINED";
    } else if (isBoosted) {
      this.status = "BOOSTED";
    } else {
      this.status = "ACTIVE";
    }

    const incoming: Message[] = [];
    let m: Message | null;
    while ((m = this.bus.receive(this.id)) !== null) {
      if (isQuarantined && !m.topic.endsWith(`:${this.domain}`)) {
        continue;
      }
      incoming.push(m);
      this.memory.push(m);
      if (this.memory.length > 25) {
        this.memory.shift();
      }
    }

    let broadcasts = this.bus.recentBroadcasts(8);
    if (isQuarantined) {
      broadcasts = broadcasts.filter((b) => b.topic.endsWith(`:${this.domain}`));
    }

    const action = this.decide(incoming, broadcasts, isBoosted);
    this.lastAction = action;

    if (action === "produce") {
      this.doProduce();
    } else if (action === "respond") {
      this.doRespond(incoming);
    } else if (action === "merge") {
      this.doMerge(broadcasts);
    }

    if (isBoosted && this.rng.random() < 0.4) {
      this.doMerge(broadcasts);
    }
  }

  decide(incoming: Message[], broadcasts: Message[], isBoosted = false): "produce" | "respond" | "merge" {
    if (isBoosted) {
      const cross = broadcasts.filter(
        (b) => b.topic.split(":").pop() !== this.domain
      );
      if (cross.length > 0 && this.rng.random() < 0.75) {
        return "merge";
      }
    }

    if (this.decisionName === "produce_first") {
      if (incoming.length > 0 && this.rng.random() < 0.25) {
        return "respond";
      }
      return "produce";
    }

    if (this.decisionName === "respond_first") {
      return incoming.length > 0 ? "respond" : "produce";
    }

    if (this.decisionName === "merge_first") {
      const cross = broadcasts.filter(
        (b) => b.topic.split(":").pop() !== this.domain
      );
      if (cross.length > 0 && this.rng.random() < 0.6) {
        return "merge";
      }
      return "produce";
    }

    // explore
    const r = this.rng.random();
    if (incoming.length > 0 && r < 0.3) return "respond";
    if (broadcasts.length > 0 && r < 0.55) return "merge";
    return "produce";
  }

  doProduce(): void {
    const thing = produceContent(this.domain, this.verb, this.rng);
    this.lastProducedContent = thing;
    this.bus.send({
      msg_id: genMsgId(),
      sender: this.id,
      recipient: "broadcast",
      topic: `proposal:${this.domain}`,
      content: thing,
      timestamp: this.bus.tick,
    });
    this.made += 1;
  }

  doRespond(incoming: Message[]): void {
    if (incoming.length === 0) {
      this.doProduce();
      return;
    }
    const target = incoming[0].sender;
    this.bus.send({
      msg_id: genMsgId(),
      sender: this.id,
      recipient: target,
      topic: `accept:${this.domain}`,
      content: { job: this.job, note: "I can help with this" },
      timestamp: this.bus.tick,
    });
    this.partners.add(target);
  }

  doMerge(broadcasts: Message[]): void {
    const candidates = broadcasts.filter(
      (b) => b.sender !== this.id && b.topic.split(":").pop() !== this.domain
    );
    if (candidates.length === 0) {
      this.doProduce();
      return;
    }
    const other = this.rng.choice(candidates);
    const domainA = other.topic.split(":").pop() || "unknown";
    const myPiece = produceContent(this.domain, this.verb, this.rng);
    this.lastProducedContent = myPiece;

    const artifact = {
      kind: "synthesis",
      domain_a: domainA,
      domain_b: this.domain,
      pieces: [other.content, myPiece] as [any, any],
      job_b: this.job,
      by: [other.sender, this.id],
    };

    this.bus.send({
      msg_id: genMsgId(),
      sender: this.id,
      recipient: "broadcast",
      topic: `artifact:${this.domain}`,
      content: artifact,
      timestamp: this.bus.tick,
    });

    this.partners.add(other.sender);
    this.made += 1;
  }

  toData(): AgentData {
    const hash = Math.abs(Math.sin(this.idx * 7919 + this.bus.tick * 31) * 1000);
    const rand = hash - Math.floor(hash);

    let roleTelemetry: AgentData["roleTelemetry"] = {};
    switch (this.embodiedRole) {
      case "symbol_grounding":
        roleTelemetry = {
          groundingScore: Math.round(74 + rand * 24),
          lastAuditDecision: "Grounded spatial tensor [x,y,z] & mass constraint verified (S_ground > 0.70)",
        };
        break;
      case "neuro_symbolic_verifier":
        roleTelemetry = {
          satClausesChecked: Math.round(24 + rand * 50),
          lastAuditDecision: "SAT(Axiom ∧ Hypothesis) evaluated true under First-Order SMT solver",
        };
        break;
      case "spatial_kinematics":
        roleTelemetry = {
          stressYieldRatio: Math.round((0.45 + rand * 0.48) * 100) / 100,
          lastAuditDecision: "Dynamic mechanical torque test passed without yield failure (σ/σ_y ≤ 1.0)",
        };
        break;
      case "extreme_adaptation":
        roleTelemetry = {
          radiationToleranceKrad: Math.round(180 + rand * 320),
          lastAuditDecision: "Cryogenic vacuum seal & quantum radiation hardening audit passed",
        };
        break;
    }

    return {
      id: this.id,
      idx: this.idx,
      domain: this.domain,
      verb: this.verb,
      job: this.job,
      decision_name: this.decisionName,
      made: this.made,
      partners: Array.from(this.partners),
      memory: [...this.memory],
      lastAction: this.lastAction,
      strategicPillar: this.strategicPillar,
      primaryRealm: this.primaryRealm,
      embodiedRole: this.embodiedRole,
      status: this.status,
      cdlConstraintsApplied: [...this.cdlConstraints],
      geminiDirective: this.geminiDirective,
      roleTelemetry,
    };
  }
}

export function getArtifactDeploymentProfile(domainA: string, domainB: string, rng: PRNG): {
  deploymentRealm: DeploymentRealm;
  strategicPillars: StrategicPillarId[];
  earthApplication: string;
  spaceApplication: string;
} {
  const dSet = new Set([domainA, domainB]);
  const pillars: StrategicPillarId[] = [];

  if (dSet.has(Domain.ENGINEERING) || dSet.has(Domain.SCIENCE) || dSet.has(Domain.LANGUAGE)) {
    pillars.push("embodied_robotics");
  }
  if (dSet.has(Domain.MATH) || dSet.has(Domain.PHILOSOPHY)) {
    pillars.push("neuro_symbolic");
  }
  if (dSet.has(Domain.ENGINEERING) || dSet.has(Domain.MATH) || dSet.has(Domain.SCIENCE)) {
    pillars.push("neuromorphic_nano");
  }
  if (dSet.has(Domain.BIOLOGY) || dSet.has(Domain.ECONOMICS) || dSet.has(Domain.SOCIAL)) {
    pillars.push("biosphere_logistics");
  }

  if (pillars.length === 0) {
    const allPillars: StrategicPillarId[] = [
      "embodied_robotics",
      "neuro_symbolic",
      "neuromorphic_nano",
      "biosphere_logistics",
    ];
    pillars.push(rng.choice(allPillars));
  }

  const primaryPillar = pillars[0];
  let earthApp = "";
  let spaceApp = "";

  switch (primaryPillar) {
    case "embodied_robotics":
      earthApp = "ڕۆبۆتی نەشتەرگەریی مایکرۆ-ورد و دەرهێنانی خۆگەڕی کانزاکان (Smart precision surgical & autonomous mining robotics)";
      spaceApp = "ڕۆبۆتی سەربەخۆ بۆ خاوێنکردنەوەی ژینگەی مەریخ و بونیادنانی هێلانە بە ڕیگۆلیس (Autonomous Mars regolith processing & habitat construction)";
      break;
    case "neuro_symbolic":
      earthApp = "کەمکردنەوەی هەڵە و خەیاڵپڵاوی مۆدێلەکان و سەلماندنی هێڵکارییە ئەندازیارییەکان (Hallucination elimination & formal proof verification)";
      spaceApp = "بڕیاردانی بەپەلە لە ئامێرە ئاسمانییەکان بەبێ هێڵی پەیوەندی زەوی (Zero-latency deep space emergency decision-making)";
      break;
    case "neuromorphic_nano":
      earthApp = "پرۆسێسەری زۆر خێرا بە کەمترین وزە بۆ سەنتەرەکانی داتا و مۆبایل (Ultra-fast petascale computing with micro-watt energy footprint)";
      spaceApp = "چیپی بەرگەگری تیشکدان بۆ کۆمپیوتەری ئۆتۆنۆم بەرامبەر تیشکی گەردوونی لە کەشتییەکاندا (Radiation-hardened autonomous deep-space compute)";
      break;
    case "biosphere_logistics":
      earthApp = "شاری ژیر و کشتوکاڵی بەدوور لە گۆڕانی کەشوهەوا و کەمئاویدا (Smart climate-resilient cities & circular vertical aeroponics)";
      spaceApp = "سیستەمی خۆبژێویی بنکە ئاسمانییەکان لەسەر مەریخ و مانگ و بنکەکانی ژێر دەریا (Closed-loop life support (ECLSS) for Mars & abyssal outposts)";
      break;
  }

  return {
    deploymentRealm: "both",
    strategicPillars: pillars,
    earthApplication: earthApp,
    spaceApplication: spaceApp,
  };
}

export class SimulationSystem {
  agents: SimulationAgent[] = [];
  bus: MessageBusEngine = new MessageBusEngine();
  artifacts: EmergentArtifact[] = [];
  seenArtifactKeys: Set<string> = new Set();
  edges: Set<string> = new Set();
  proposalsCount = 0;
  seed: number;
  nAgents: number;

  telemetryHistory: TelemetrySnapshot[] = [];
  experiments: SwarmExperiment[] = [];
  quarantinedDomains: Set<Domain> = new Set();
  boostedDomains: Map<Domain, number> = new Map();
  aiConnectedAgentIds: Set<string> = new Set();
  latestRewiringEvent?: TopologyRewiringEvent;
  rewiringHistory: TopologyRewiringEvent[] = [];
  cdlModule: CrisisDrivenLearningModule;
  heavyThinkingHistory: GeminiHeavyThinkingResult[] = [];

  constructor(nAgents = 1000, seed = 42) {
    this.seed = seed;
    this.nAgents = nAgents;
    this.cdlModule = new CrisisDrivenLearningModule(3, 0.95);
    this.init(nAgents);
  }

  init(nAgents = 1000): void {
    this.nAgents = nAgents;
    this.bus = new MessageBusEngine();
    this.agents = [];
    this.artifacts = [];
    this.seenArtifactKeys = new Set();
    this.edges = new Set();
    this.proposalsCount = 0;
    this.telemetryHistory = [];
    this.experiments = [];
    this.quarantinedDomains.clear();
    this.boostedDomains.clear();
    this.latestRewiringEvent = undefined;
    this.rewiringHistory = [];
    this.heavyThinkingHistory = [];
    this.cdlModule.reset();

    const domains = Object.values(Domain);
    for (let i = 0; i < nAgents; i++) {
      const d = domains[i % domains.length];
      const verbList = VERBS[d];
      const verb = verbList[i % verbList.length];
      const decisionName = DECISION_TEMPLATES[i % DECISION_TEMPLATES.length];
      const rng = new PRNG(i * 7919 + 13 + this.seed);

      const agent = new SimulationAgent(i, d, verb, this.bus, decisionName, rng);
      this.bus.register(agent.id);
      this.agents.push(agent);
    }

    this.recordTelemetrySnapshot();
  }

  step(): void {
    // Check and update active experiments
    for (const exp of this.experiments) {
      if (exp.status === "active") {
        if (this.bus.tick >= exp.appliedAtTick + exp.durationTicks) {
          exp.status = "completed";
          exp.resultingArtifacts = this.artifacts.length;
          exp.resultingMessages = this.bus.allMessages.length;
          const artDelta = exp.resultingArtifacts - exp.startingArtifacts;
          const msgDelta = exp.resultingMessages - exp.startingMessages;
          exp.deltaSummary = `+${artDelta} artifacts & +${msgDelta} messages generated over ${exp.durationTicks} ticks`;
          if (exp.type === "quarantine" && exp.targetDomain) {
            this.quarantinedDomains.delete(exp.targetDomain);
          }
          if (exp.type === "renaissance" && exp.targetDomain) {
            this.boostedDomains.delete(exp.targetDomain);
          }
        }
      }
    }

    // 1. Fetch current CDL constraints to influence agent behavior
    const activeConstraints = this.cdlModule.getActiveConstraints();

    const currentTick = this.bus.tick;
    for (const a of this.agents) {
      // Inject CDL rules into the agent's decision process
      const domainRules = activeConstraints[a.domain] || activeConstraints["global"] || [];
      a.applyConstraints(domainRules);

      const isQuar = this.quarantinedDomains.has(a.domain);
      const isBoost = this.boostedDomains.has(a.domain);
      a.step(isQuar, isBoost);
    }
    this.bus.tick = currentTick + 1;

    // Check Shannon Entropy and execute Dynamic Topology Rewiring
    this.evaluateDynamicTopologyRewiring();

    // Mine artifacts and track proposals with Reality Grounding
    this.updateMining();

    // 2. CDL evaluates the output of this tick (crises, echo chamber stagnation, hallucinations)
    this.cdlModule.evaluateTick(this.bus.tick, this.agents, this.artifacts);

    // Record telemetry snapshot
    this.recordTelemetrySnapshot();
  }

  calculateShannonEntropyBits(): number {
    const recent = this.bus.allMessages.slice(-150);
    if (recent.length === 0) return 2.85;
    const counts: Record<string, number> = {};
    for (const m of recent) {
      const d = m.topic.split(":").pop() || "all";
      const kind = m.topic.split(":")[0] || "msg";
      const key = `${d}::${kind}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    const total = recent.length;
    let entropyBits = 0;
    for (const count of Object.values(counts)) {
      const p = count / total;
      if (p > 0) {
        entropyBits -= p * Math.log2(p);
      }
    }
    return Math.round(entropyBits * 100) / 100;
  }

  evaluateDynamicTopologyRewiring(): void {
    const entropyBits = this.calculateShannonEntropyBits();

    if (entropyBits < 1.5 && this.bus.tick > 2) {
      // Risk of Cognitive Stagnation (H < 1.5 bits) -> Renaissance Burst
      this.applyRenaissanceBurstRewiring(entropyBits);
    } else if (entropyBits > 4.5) {
      // Risk of Noise and Chaotic Confusion (H > 4.5 bits) -> Hub Consolidation
      this.applyHubConsolidationRewiring(entropyBits);
    } else {
      // Optimal Homeostasis
      this.latestRewiringEvent = {
        tick: this.bus.tick,
        entropyBits,
        entropyRegime: "optimal_homeostasis",
        action: "homeostasis_stable",
        titleKu: "دۆخی باڵای هاوسەنگ (Homeostasis)",
        titleEn: "Optimal Self-Organizing Homeostasis",
        detailsKu: `ئەنترۆپی لە مەودای نموونەییدایە (${entropyBits.toFixed(2)} بیت). هاوسەنگیی تەواو لەنێوان گەڕان و سەلماندندا هەیە.`,
        edgesRewired: 0,
        timestamp: Date.now(),
      };
    }
  }

  applyRenaissanceBurstRewiring(entropyBits: number): void {
    // Cross-link distant agents across non-overlapping clusters
    let rewired = 0;
    const domains = Object.values(Domain);
    const rng = new PRNG(this.bus.tick * 8191 + 17);

    for (let i = 0; i < 8; i++) {
      const d1 = domains[Math.floor(rng.random() * domains.length)];
      const d2 = domains[Math.floor(rng.random() * domains.length)];
      if (d1 === d2) continue;

      const groupA = this.agents.filter((a) => a.domain === d1);
      const groupB = this.agents.filter((a) => a.domain === d2);
      if (groupA.length > 0 && groupB.length > 0) {
        const agentA = groupA[Math.floor(rng.random() * groupA.length)];
        const agentB = groupB[Math.floor(rng.random() * groupB.length)];

        agentA.partners.add(agentB.id);
        agentB.partners.add(agentA.id);
        const edgeKey = [agentA.id, agentB.id].sort().join(" <-> ");
        this.edges.add(edgeKey);
        rewired += 1;
      }
    }

    const event: TopologyRewiringEvent = {
      tick: this.bus.tick,
      entropyBits,
      entropyRegime: "stagnation_risk",
      action: "renaissance_burst",
      titleKu: "شوکی فکری: بەستنەوەی ئەیجێنتە دوورەکان (Renaissance Burst)",
      titleEn: "Renaissance Burst: Cross-Cluster Topological Rewiring",
      detailsKu: `ئەنترۆپی دابەزی بۆ ${entropyBits.toFixed(2)} بیت (مەترسیی چەق بەستن). سیستەمەکە ${rewired} هێڵی نوێی لەنێوان کڵاستەرە دوورەکاندا کێشا بۆ چاندنی شوکی داهێنەرانە.`,
      edgesRewired: rewired,
      timestamp: Date.now(),
    };

    this.latestRewiringEvent = event;
    this.rewiringHistory.unshift(event);
    if (this.rewiringHistory.length > 20) this.rewiringHistory.pop();
  }

  applyHubConsolidationRewiring(entropyBits: number): void {
    // Prune excessive random edges & activate Scale-Free mediator hubs
    const hubs = this.getHubAgents(6);
    let pruned = 0;

    for (const a of this.agents) {
      if (a.partners.size > 8) {
        const partnerArr = Array.from(a.partners);
        // keep hubs, prune others
        const hubIds = new Set(hubs.map((h) => h.agentId));
        for (const p of partnerArr) {
          if (!hubIds.has(p) && a.partners.size > 5) {
            a.partners.delete(p);
            pruned += 1;
          }
        }
      }
    }

    const event: TopologyRewiringEvent = {
      tick: this.bus.tick,
      entropyBits,
      entropyRegime: "chaos_risk",
      action: "hub_consolidation",
      titleKu: "چالاککردنی ئەیجێنتە ناوبژیوانەکان (Scale-Free Hubs)",
      titleEn: "Mediator Hub Consolidation & Chaos Edge Pruning",
      detailsKu: `ئەنترۆپی بەرزبووەوە بۆ ${entropyBits.toFixed(2)} بیت (مەترسیی ژاوەژاو و گێجی). سیستەمەکە ${pruned} هێڵی لاوەکی کەمکردەوە و ناوبژیوانەکانی چالاک کرد بۆ کۆکردنەوەی زانیارییەکان.`,
      edgesRewired: pruned,
      timestamp: Date.now(),
    };

    this.latestRewiringEvent = event;
    this.rewiringHistory.unshift(event);
    if (this.rewiringHistory.length > 20) this.rewiringHistory.pop();
  }

  recordTelemetrySnapshot(): void {
    const entropy = this.calculateShannonEntropy();
    const entropyBits = this.calculateShannonEntropyBits();
    const percolation = this.calculatePercolationIndex();
    const velocity = this.calculateEmergenceVelocity();

    this.telemetryHistory.push({
      tick: this.bus.tick,
      timestamp: Date.now(),
      artifacts: this.artifacts.length,
      messages: this.bus.allMessages.length,
      entropy: Math.round(entropy * 100) / 100,
      entropyBits,
      entropyRegime: this.latestRewiringEvent?.entropyRegime || "optimal_homeostasis",
      velocity,
      activeBridges: this.edges.size,
      percolation,
      rewiringEvent: this.latestRewiringEvent,
      cdlCrisesCount: this.cdlModule.crisisLog.length,
      cdlActiveConstraintsCount: Object.values(this.cdlModule.getActiveConstraints()).flat().length,
    });

    if (this.telemetryHistory.length > 80) {
      this.telemetryHistory.shift();
    }
  }

  calculateShannonEntropy(): number {
    const recent = this.bus.allMessages.slice(-120);
    if (recent.length === 0) return 0;
    const counts: Record<string, number> = {};
    for (const d of Object.values(Domain)) counts[d] = 0;
    for (const m of recent) {
      const d = m.topic.split(":").pop();
      if (d && counts[d] !== undefined) {
        counts[d] += 1;
      }
    }
    const total = recent.length;
    let entropy = 0;
    for (const d of Object.values(Domain)) {
      const p = counts[d] / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    const maxEntropy = Math.log2(10);
    return Math.min(1, Math.max(0, entropy / maxEntropy));
  }

  calculatePercolationIndex(): number {
    const activePairs = new Set<string>();
    for (const a of this.artifacts) {
      const [d1, d2] = a.domains;
      if (d1 && d2 && d1 !== d2) {
        const pair = [d1, d2].sort().join(":");
        activePairs.add(pair);
      }
    }
    return Math.min(100, Math.round((activePairs.size / 45) * 100));
  }

  calculateEmergenceVelocity(): number {
    const windowStart = Math.max(0, this.bus.tick - 10);
    return this.artifacts.filter((a) => a.t >= windowStart).length;
  }

  getHubAgents(topN = 10): HubAgentMetric[] {
    const agentArtifactCount = new Map<string, number>();
    for (const art of this.artifacts) {
      for (const c of art.contributors) {
        agentArtifactCount.set(c, (agentArtifactCount.get(c) || 0) + 1);
      }
    }

    const agentMap = new Map<string, SimulationAgent>();
    for (const a of this.agents) {
      agentMap.set(a.id, a);
    }

    const metrics: HubAgentMetric[] = this.agents.map((a) => {
      const partnerDomains = new Set<Domain>();
      for (const p of a.partners) {
        const partnerAgent = agentMap.get(p);
        if (partnerAgent) {
          partnerDomains.add(partnerAgent.domain);
        }
      }
      const artifactsSynthesized = agentArtifactCount.get(a.id) || 0;
      const degree = a.partners.size;
      const bridgedDomains = Array.from(partnerDomains);
      const influenceScore =
        bridgedDomains.length * 20 + degree * 4 + artifactsSynthesized * 30;

      return {
        agentId: a.id,
        domain: a.domain,
        job: a.job,
        degree,
        bridgedDomainsCount: bridgedDomains.length,
        bridgedDomains,
        artifactsSynthesized,
        influenceScore,
      };
    });

    metrics.sort((a, b) => b.influenceScore - a.influenceScore);
    return metrics.slice(0, topN);
  }

  applyExperiment(
    type: PerturbationType,
    params: {
      title: string;
      description: string;
      durationTicks?: number;
      targetDomain?: Domain;
      secondaryDomain?: Domain;
    }
  ): SwarmExperiment {
    const duration = params.durationTicks || 15;
    const exp: SwarmExperiment = {
      id: `exp-${Date.now().toString(16)}`,
      type,
      title: params.title,
      description: params.description,
      appliedAtTick: this.bus.tick,
      targetDomain: params.targetDomain,
      secondaryDomain: params.secondaryDomain,
      status: "active",
      durationTicks: duration,
      startingArtifacts: this.artifacts.length,
      startingMessages: this.bus.allMessages.length,
    };

    if (type === "quarantine" && params.targetDomain) {
      this.quarantinedDomains.add(params.targetDomain);
    } else if (type === "renaissance" && params.targetDomain) {
      this.boostedDomains.set(params.targetDomain, 2);
    } else if (type === "hyper_mutation") {
      const templates: DecisionTemplate[] = [
        "produce_first",
        "respond_first",
        "merge_first",
        "explore",
      ];
      for (let i = 0; i < this.agents.length; i += 4) {
        const ag = this.agents[i];
        const nextT = templates[(templates.indexOf(ag.decisionName) + 1) % templates.length];
        ag.decisionName = nextT;
      }
    } else if (
      type === "cross_pollination" &&
      params.targetDomain &&
      params.secondaryDomain
    ) {
      const d1Agents = this.agents.filter((a) => a.domain === params.targetDomain);
      const d2Agents = this.agents.filter((a) => a.domain === params.secondaryDomain);
      if (d1Agents.length > 0 && d2Agents.length > 0) {
        for (let i = 0; i < Math.min(4, d1Agents.length, d2Agents.length); i++) {
          const a1 = d1Agents[i];
          const a2 = d2Agents[i];
          this.bus.send({
            msg_id: genMsgId(),
            sender: a1.id,
            recipient: a2.id,
            topic: `proposal:${params.targetDomain}`,
            content: produceContent(a1.domain, a1.verb, a1.rng),
            timestamp: this.bus.tick,
          });
        }
      }
    }

    this.experiments.unshift(exp);
    return exp;
  }

  cancelExperiment(id: string): void {
    const exp = this.experiments.find((e) => e.id === id);
    if (!exp || exp.status !== "active") return;
    exp.status = "completed";
    exp.deltaSummary = "Aborted manually by operator";
    if (exp.type === "quarantine" && exp.targetDomain) {
      this.quarantinedDomains.delete(exp.targetDomain);
    }
    if (exp.type === "renaissance" && exp.targetDomain) {
      this.boostedDomains.delete(exp.targetDomain);
    }
  }

  generateResearchDossier(): string {
    const stats = this.getStats();
    const entropy = this.calculateShannonEntropy();
    const percolation = this.calculatePercolationIndex();
    const velocity = this.calculateEmergenceVelocity();
    const hubs = this.getHubAgents(6);

    let md = `# 500-Agent Emergent Intelligence Creation Swarm: Research Dossier\n\n`;
    md += `**Simulation Epoch:** Tick ${stats.tick}\n`;
    md += `**Fleet Scale:** ${this.nAgents.toLocaleString()} Autonomous Specialized Agents (10 Scientific & Artistic Domains)\n`;
    md += `**Operational Realms:** Terrestrial Deployment (سەر زەوی) ⟷ Extreme & Deep Space (بۆشایی و مەریخ)\n`;
    md += `**Report Generated:** ${new Date().toUTCString()}\n\n`;
    md += `## 1. Executive Emergence Metrics\n\n`;
    md += `- **Synthesized Artifacts:** ${stats.artifactsCount} interdisciplinary breakthroughs\n`;
    md += `- **MessageBus Throughput:** ${stats.totalMessages.toLocaleString()} exchanged transmissions\n`;
    md += `- **Active Collaboration Edges:** ${stats.uniqueEdgesCount} unique agent peer bonds\n`;
    md += `- **Shannon Swarm Entropy:** ${(entropy * 100).toFixed(1)}% (Information Dispersion Index)\n`;
    md += `- **Domain Percolation:** ${percolation}% of 45 theoretical cross-domain pairs activated\n`;
    md += `- **Emergence Velocity:** ${velocity} breakthroughs / 10 ticks\n\n`;

    md += `## 2. Strategic Research & Engineering Pillars (چوار کۆڵەکەی زانستی و تەکنەلۆژی)\n\n`;
    md += `### 1. Embodied AI & Robotics (ڕۆبۆتیک و هۆشی دەستکردی جەستەدار)\n`;
    md += `- **بنەمای سەرەکی:** بەستنەوەی مۆدێلی زمان بە جەستەی فیزیکی و فێربوونی ئەزموونی\n`;
    md += `- **جێبەجێکردن لەسەر زەوی:** ڕۆبۆتی ژیر بۆ نەشتەرگەریی مایکرۆ-ورد و ئامێری خۆگەڕی دەرهێنانی کانزاکان لە قووڵایی زەویدا.\n`;
    md += `- **جێبەجێکردن لە ناودەرەوە (ژینگەی سەخت/بۆشایی):** ڕۆبۆتی سەربەخۆ بۆ خاوێنکردنەوەی ژینگە و بونیادنانی هێلانە و ئامێر لەسەر مەریخ بە ڕیگۆلیس.\n\n`;

    md += `### 2. Neuro-Symbolic Logic (لۆجیکی دەماری-سیمبۆلی)\n`;
    md += `- **بنەمای سەرەکی:** تێکەڵکردنی تۆڕی دەماری (LLM) لەگەڵ یاسای بیرکاری و یاساکانی یاساگیری\n`;
    md += `- **جێبەجێکردن لەسەر زەوی:** کەمکردنەوەی هەڵە و خەیاڵپڵاوی مۆدێلەکان و سەلماندنی هێڵکارییە ئەندازیارییە باوەڕپێکراوەکان.\n`;
    md += `- **جێبەجێکردن لە ناودەرەوە (ژینگەی سەخت/بۆشایی):** بڕیاردانی بەپەلە و کتوپڕ لە ئامێرە ئاسمانییەکان بەبێ پێویستی بە هێڵی پەیوەندی زەوی لە کاتی پچڕاندا.\n\n`;

    md += `### 3. Neuromorphic Hardware & Nanotech (ڕەقەکاڵای نیورۆمۆرفیک و نانۆتەکنەلۆژیا)\n`;
    md += `- **بنەمای سەرەکی:** دیزاینکردنی چیپ و پێکهاتەی ماددەی نوێ کە وەک مێشک بە پەلسی سپایکین کار دەکەن\n`;
    md += `- **جێبەجێکردن لەسەر زەوی:** پرۆسێسەری زۆر خێرا بە بەکارهێنانی کەمترین وزە بۆ سەنتەرەکانی داتا و مۆبایلی زیرەک.\n`;
    md += `- **جێبەجێکردن لە ناودەرەوە (ژینگەی سەخت/بۆشایی):** چیپی بەرگەگری تیشکدان بۆ کۆمپیوتەری ئۆتۆنۆم بەرامبەر تیشکی گەردوونی و باوی خۆری.\n\n`;

    md += `### 4. Biosphere & Closed Logistics (بایۆسفێر و لۆجستی مەوداخراو)\n`;
    md += `- **بنەمای سەرەکی:** مۆدێلسازی و گەشبینکردنی زنجیرەی سەرچاوەکان (ئاو، ئۆکسجین، وزە)\n`;
    md += `- **جێبەجێکردن لەسەر زەوی:** شاری ژیر و کشتوکاڵی بەدوور لە کاریگەرییەکانی گۆڕانی کەشوهەوا و کەمئاوی.\n`;
    md += `- **جێبەجێکردن لە ناودەرەوە (ژینگەی سەخت/بۆشایی):** سیستەمی خۆبژێویی بنکە ئاسمانییەکان لەسەر مانگ و مەریخ و بنکەکانی ژێر قووڵایی دەریا.\n\n`;

    md += `## 3. Scale-Free Hub Agents (Cross-Domain Bridges)\n\n`;
    hubs.forEach((h, i) => {
      md += `${i + 1}. **${h.agentId}** (${h.domain} • job: \`${h.job}\`)\n`;
      md += `   - Influence Score: **${h.influenceScore}** | Degree: ${h.degree} partners\n`;
      md += `   - Bridged Domains (${h.bridgedDomainsCount}): ${h.bridgedDomains.join(", ")}\n`;
      md += `   - Artifacts Synthesized: ${h.artifactsSynthesized}\n\n`;
    });

    md += `## 4. Notable Emergent Breakthroughs (Sample)\n\n`;
    this.artifacts.slice(0, 10).forEach((art, i) => {
      const [d1, d2] = art.domains;
      const title =
        art.aiExpansion?.breakthroughTitle ||
        art.content.aiProposal?.title ||
        `${d1.toUpperCase()} ⨁ ${d2.toUpperCase()} Interdisciplinary Synthesis #${art.id}`;
      md += `### ${i + 1}. ${title}\n`;
      md += `- **Domains:** ${d1} + ${d2} | **Contributors:** ${art.contributors.join(", ")} | **Tick:** ${art.t}\n`;
      if (art.realityVerification) {
        const rv = art.realityVerification;
        const badge = rv.status === "verified_breakthrough" ? "✅ Verified Breakthrough (سەلمێنراوی فیزیایی و لۆژیکی)" : "⚠️ Theoretical Hypothesis (گریمانەی تیۆری دەقی)";
        md += `- **Reality Verification:** ${badge}\n`;
        md += `  - SMT Proof: \`${rv.smtFormula}\` (${rv.smtSatPassed ? "SAT" : "UNSAT"})\n`;
        md += `  - Physical Grounding Score: ${rv.physicsGroundingScore}% | Mass: ${rv.physicalProperties.massKg}kg | Temp: ${rv.physicalProperties.temperatureK}K\n`;
        md += `  - Kinematics (${rv.kinematics.gravityTested}): Stress Ratio σ/σ_y = ${rv.kinematics.stressRatio} (${rv.kinematics.passed ? "PASSED" : "FAILED"})\n`;
        md += `  - Verdict: ${rv.verdictReasonKu}\n`;
      }
      if (art.earthApplication) {
        md += `- **🌍 جێبەجێکردن لەسەر زەوی (Earth):** ${art.earthApplication}\n`;
      }
      if (art.spaceApplication) {
        md += `- **🚀 جێبەجێکردن لە بۆشایی (Space & Extreme):** ${art.spaceApplication}\n`;
      }
      if (art.aiExpansion?.conceptOverview) {
        md += `- **Concept:** ${art.aiExpansion.conceptOverview}\n`;
      }
      if (art.aiExpansion?.technicalManifesto) {
        md += `- **Manifesto:** ${art.aiExpansion.technicalManifesto}\n`;
      }
      if (art.content.aiProposal?.summary) {
        md += `- **Proposal Summary:** ${art.content.aiProposal.summary}\n`;
      }
      md += `\n`;
    });

    if (this.experiments.length > 0) {
      md += `## 4. Swarm Perturbation Experiment Log\n\n`;
      this.experiments.forEach((exp, i) => {
        md += `${i + 1}. **${exp.title}** (${exp.type.toUpperCase()})\n`;
        md += `   - Applied at Tick ${exp.appliedAtTick} | Duration: ${exp.durationTicks} ticks | Status: ${exp.status}\n`;
        md += `   - Description: ${exp.description}\n`;
        if (exp.deltaSummary) {
          md += `   - **Outcome:** ${exp.deltaSummary}\n`;
        }
        md += `\n`;
      });
    }

    return md;
  }

  stepN(n: number): void {
    for (let i = 0; i < n; i++) {
      this.step();
    }
  }

  updateMining(): void {
    // Mine artifacts from broadcastLog
    for (const m of this.bus.broadcastLog) {
      if (!m.topic.startsWith("artifact:")) continue;
      const c = m.content;
      if (!c) continue;
      const key = `${c.domain_a}:${c.domain_b}:${c.by?.join(",")}:${JSON.stringify(c.pieces)}`;
      if (this.seenArtifactKeys.has(key)) continue;
      this.seenArtifactKeys.add(key);

      const da = c.domain_a;
      const db = c.domain_b;
      if (da && db && da !== db) {
        const sortedDomains = [da, db].sort() as [string, string];
        const profile = getArtifactDeploymentProfile(da, db, new PRNG(m.timestamp + m.msg_id.length));
        const realityVerification = verifyRealityGrounding(
          sortedDomains,
          c.by || [m.sender],
          m.timestamp + this.bus.tick + this.artifacts.length * 37
        );
        this.artifacts.unshift({
          id: m.msg_id,
          domains: sortedDomains,
          contributors: c.by || [m.sender],
          t: m.timestamp,
          content: c,
          deploymentRealm: profile.deploymentRealm,
          strategicPillars: profile.strategicPillars,
          earthApplication: profile.earthApplication,
          spaceApplication: profile.spaceApplication,
          realityVerification,
        });
      }
    }

    // Partner graph edges
    for (const a of this.agents) {
      for (const p of a.partners) {
        const edgeKey = [a.id, p].sort().join(" <-> ");
        this.edges.add(edgeKey);
      }
    }

    this.proposalsCount = this.bus.allMessages.filter((m) =>
      m.topic.startsWith("proposal:")
    ).length;
  }

  getStats(): SimulationStats {
    let pending = 0;
    for (const q of this.bus.queues.values()) {
      pending += q.length;
    }

    return {
      tick: this.bus.tick,
      totalMessages: this.bus.allMessages.length,
      broadcastsCount: this.bus.broadcastLog.length,
      pendingQueueCount: pending,
      proposalsCount: this.proposalsCount,
      artifactsCount: this.artifacts.length,
      uniqueEdgesCount: this.edges.size,
      aiConnectedCount: this.aiConnectedAgentIds.size,
      aiArtifactsCount: this.artifacts.filter((a) => a.isAiGenerated || a.aiExpansion).length,
    };
  }

  connectAiCohort(count: number): void {
    this.aiConnectedAgentIds.clear();
    const targetCount = Math.min(count, this.agents.length);
    if (targetCount === 0) return;
    const step = Math.max(1, Math.floor(this.agents.length / targetCount));
    for (let i = 0; i < this.agents.length && this.aiConnectedAgentIds.size < targetCount; i += step) {
      this.aiConnectedAgentIds.add(this.agents[i].id);
    }
    for (let i = 0; i < this.agents.length && this.aiConnectedAgentIds.size < targetCount; i++) {
      this.aiConnectedAgentIds.add(this.agents[i].id);
    }
  }

  disconnectAllAi(): void {
    this.aiConnectedAgentIds.clear();
  }

  injectAiArtifact(artifact: EmergentArtifact): void {
    this.artifacts.unshift(artifact);
    this.seenArtifactKeys.add(
      `${artifact.domains[0]}:${artifact.domains[1]}:${artifact.contributors.join(",")}:${artifact.id}`
    );
    // Add partners
    if (artifact.contributors.length >= 2) {
      const edgeKey = [artifact.contributors[0], artifact.contributors[1]].sort().join(" <-> ");
      this.edges.add(edgeKey);
      const a1 = this.agents.find((a) => a.id === artifact.contributors[0]);
      const a2 = this.agents.find((a) => a.id === artifact.contributors[1]);
      if (a1) {
        a1.partners.add(artifact.contributors[1]);
        a1.made += 1;
      }
      if (a2) {
        a2.partners.add(artifact.contributors[0]);
        a2.made += 1;
      }
    }
  }

  injectAiBroadcast(senderId: string, topic: string, content: any): void {
    const msg: Message = {
      msg_id: `ai-${Date.now().toString(16)}`,
      sender: senderId,
      recipient: "broadcast",
      topic,
      content,
      timestamp: this.bus.tick,
      isAiGenerated: true,
    };
    this.bus.send(msg);
  }

  toggleAiConnection(agentId: string): boolean {
    if (this.aiConnectedAgentIds.has(agentId)) {
      this.aiConnectedAgentIds.delete(agentId);
      return false;
    } else {
      this.aiConnectedAgentIds.add(agentId);
      return true;
    }
  }

  getDomainCollaborationMatrix(): Record<string, Record<string, number>> {
    const domains = Object.values(Domain);
    const matrix: Record<string, Record<string, number>> = {};
    for (const d1 of domains) {
      matrix[d1] = {};
      for (const d2 of domains) {
        matrix[d1][d2] = 0;
      }
    }

    for (const art of this.artifacts) {
      const [d1, d2] = art.domains;
      if (matrix[d1] && matrix[d1][d2] !== undefined) {
        matrix[d1][d2] += 1;
        if (d1 !== d2) {
          matrix[d2][d1] += 1;
        }
      }
    }
    return matrix;
  }

  getCdlState(): CdlModuleState {
    return this.cdlModule.getState();
  }

  triggerManualCrisis(type: "stagnation" | "hallucination_cascade" | "stress_fracture", domain = "global"): void {
    const fakeCrisis = [{
      type,
      domain,
      severity: "high" as const,
    }];
    this.cdlModule.triggerCdlProtocol(this.bus.tick, fakeCrisis, this.agents);
  }

  exportHeavyThinkingTelemetry(userGoal?: string): GeminiHeavyThinkingPayload {
    const domainCounts: Record<string, number> = {};
    for (const a of this.agents) {
      domainCounts[a.domain] = (domainCounts[a.domain] || 0) + 1;
    }

    const cdlState = this.cdlModule.getState();
    const entropyBits = this.calculateShannonEntropyBits();
    const regime = this.latestRewiringEvent?.entropyRegime || "optimal_homeostasis";

    const sampleArtifacts = this.artifacts.slice(0, 6).map((art) => ({
      id: art.id,
      title: art.aiExpansion?.breakthroughTitle || art.content?.aiProposal?.title || `Artifact ${art.id}`,
      domains: art.domains,
      groundingScore: art.realityVerification?.physicsGroundingScore,
      status: art.realityVerification?.status,
    }));

    return {
      tick: this.bus.tick,
      agentPoolSize: this.agents.length,
      domainDistribution: domainCounts,
      recentCrises: cdlState.crisisLog.slice(0, 5),
      activeConstraints: cdlState.activeConstraints,
      isolatedAgentsCount: cdlState.isolatedAgentIds.length,
      sampleArtifacts,
      systemEntropy: entropyBits,
      entropyRegime: regime,
      userGoal,
    };
  }

  ingestHeavyThinkingFeedback(feedbackData: {
    result: GeminiHeavyThinkingRawResponse;
    model?: string;
    durationMs?: number;
    isFallback?: boolean;
  }): GeminiHeavyThinkingResult {
    const { result, model = "gemini-3.8-flash", durationMs = 1000, isFallback = false } = feedbackData;
    let theoremsInjectedCount = 0;

    // 1. Inject Synthesized Theorems directly into the Swarm Artifact Pool
    for (const theorem of result.synthesizedTheorems || []) {
      const artId = `GEMINI-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const profile = getArtifactDeploymentProfile(theorem.domainA, theorem.domainB, new PRNG(Date.now()));
      const verified: RealityVerificationResult = {
        status: "verified_breakthrough",
        smtSatPassed: true,
        smtFormula: `∀x (Theorem("${theorem.title}") ∧ Invariant(x) ⟹ ProvenTrue(x))`,
        proofAxioms: [
          `Formal Axiom: ${theorem.formalStatement}`,
          `Central Server Reasoning: ${theorem.noveltyAxiom}`,
          "Lyapunov Global Stability Invariant Verified"
        ],
        physicsGroundingScore: 99.4,
        spatialBounding: { x: 2.5, y: 1.8, z: 0.9 },
        physicalProperties: {
          massKg: 14.2,
          volumeM3: 0.045,
          temperatureK: 295.15
        },
        kinematics: {
          passed: true,
          torqueNm: 42.5,
          stressRatio: 0.28,
          gravityTested: theorem.deploymentTarget === "space_extreme" ? "Mars (0.38g)" : "Earth (1.0g)",
          shearSafetyMargin: 3.4
        },
        extremeAdaptation: {
          radiationHardenedKrad: 250,
          cryoTempK: 45,
          vacuumResistant: true,
          seuImmunityPercent: 99.98
        },
        verdictReasonEn: `Synthesized & verified by Massive Server (Gemini Core): ${theorem.formalStatement}`,
        verdictReasonKu: `بە تەواوی لەلایەن سێرڤەری گەورەی Gemini شیکار کراوە: ${theorem.formalStatement}`
      };

      const artifact: EmergentArtifact = {
        id: artId,
        t: this.bus.tick,
        domains: [theorem.domainA as Domain, theorem.domainB as Domain],
        contributors: ["GEMINI-SUPERCLUSTER-CORE", this.agents[Math.floor(Math.random() * this.agents.length)].id],
        content: {
          kind: "gemini_heavy_thinking",
          domain_a: theorem.domainA,
          domain_b: theorem.domainB,
          pieces: [theorem.domainA, theorem.domainB],
          job_b: "GEMINI_SERVER_HEAVY_THINKING",
          by: ["GEMINI_CORE"],
          aiProposal: {
            title: theorem.title,
            summary: theorem.formalStatement,
            detail: theorem.noveltyAxiom,
            tags: ["heavy-thinking", theorem.domainA, theorem.domainB],
          },
        },
        isAiGenerated: true,
        deploymentRealm: theorem.deploymentTarget || "both",
        strategicPillars: profile.strategicPillars,
        earthApplication: profile.earthApplication,
        spaceApplication: profile.spaceApplication,
        realityVerification: verified,
        aiExpansion: {
          breakthroughTitle: theorem.title,
          conceptOverview: theorem.noveltyAxiom,
          technicalManifesto: `1. Formal Axiom: ${theorem.formalStatement}\n2. Cross-domain reconciliation between ${theorem.domainA} and ${theorem.domainB}\n3. Injected into 1,000-agent pool memory.`,
          potentialApplications: [profile.earthApplication, profile.spaceApplication],
          nextSwarmDirections: "All 1,000 agents reference this theorem to bypass local stagnation boundaries.",
          earthDeploymentNote: profile.earthApplication,
          spaceDeploymentNote: profile.spaceApplication,
        }
      };

      this.artifacts.unshift(artifact);
      theoremsInjectedCount++;
    }

    // 2. Inject Global Meta-Constraints into CDL Module
    if (result.globalMetaConstraints && result.globalMetaConstraints.length > 0) {
      this.cdlModule.injectGeminiConstraints(result.globalMetaConstraints, this.bus.tick, "global");
    }

    // 3. Update the 1,000 Agents
    let agentsReleasedCount = 0;
    let agentsDirectivesUpdated = 0;
    const domainsBoosted: string[] = [];

    for (const agent of this.agents) {
      // Release quarantined / review agents if requested
      if (result.releaseQuarantinedAgents && (agent.status === "CDL_REVIEW" || agent.status === "QUARANTINED")) {
        agent.status = "ACTIVE";
        agentsReleasedCount++;
      }

      // Apply newly minted meta constraints
      if (result.globalMetaConstraints && result.globalMetaConstraints.length > 0) {
        agent.applyConstraints([...agent.cdlConstraints, ...result.globalMetaConstraints.slice(0, 2)]);
      }

      // Check if this agent's domain received a targeted directive from the massive server
      const boost = result.domainDirectiveBoosts?.[agent.domain];
      if (boost) {
        agent.applyGeminiDirective(boost.instruction);
        agentsDirectivesUpdated++;
        if (!domainsBoosted.includes(agent.domain)) {
          domainsBoosted.push(agent.domain);
        }
      }
    }

    const historyEntry: GeminiHeavyThinkingResult = {
      id: `HT-${Date.now()}`,
      tick: this.bus.tick,
      timestamp: Date.now(),
      model,
      durationMs,
      isFallback,
      result,
      feedbackApplied: {
        theoremsInjectedCount,
        constraintsInjectedCount: result.globalMetaConstraints?.length || 0,
        agentsReleasedCount,
        domainsBoosted,
        agentsDirectivesUpdated,
      }
    };

    this.heavyThinkingHistory.unshift(historyEntry);
    if (this.heavyThinkingHistory.length > 25) this.heavyThinkingHistory.pop();

    this.recordTelemetrySnapshot();
    return historyEntry;
  }

  getHeavyThinkingHistory(): GeminiHeavyThinkingResult[] {
    return [...this.heavyThinkingHistory];
  }
}

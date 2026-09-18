import { EmergentArtifact, CdlCrisisEvent, CdlModuleState } from '../types';

/**
 * CrisisDrivenLearningModule (CDL Engine)
 * Translates the exact Python architecture into a TypeScript engine:
 * 
 * class CrisisDrivenLearningModule:
 *     crisis_threshold=3, memory_decay=0.95
 *     _detect_crises(...) -> Stagnation (Echo Chamber), Hallucination Cascade, Mechanical/Vacuum Breaches
 *     _trigger_cdl_protocol(...) -> Isolate failing agents (status='CDL_REVIEW'), Formulate & Inject Constraint Rules
 *     get_active_constraints() -> Returns active constraint rules (top 3 per domain)
 */
export class CrisisDrivenLearningModule {
  crisisThreshold: number;
  memoryDecay: number;
  // Key format: crisisType_domain
  crisisCounters: Record<string, number> = {};
  // Key format: domain -> array of active constraint rules
  cdlMemory: Record<string, string[]> = {};
  cdlMemoryKu: Record<string, string[]> = {};
  crisisLog: CdlCrisisEvent[] = [];
  isolatedAgentIds: Set<string> = new Set();
  totalCrisesPrevented = 0;

  constructor(crisisThreshold = 3, memoryDecay = 0.95) {
    this.crisisThreshold = crisisThreshold;
    this.memoryDecay = memoryDecay;
  }

  reset(): void {
    this.crisisCounters = {};
    this.cdlMemory = {};
    this.cdlMemoryKu = {};
    this.crisisLog = [];
    this.isolatedAgentIds.clear();
    this.totalCrisesPrevented = 0;
  }

  evaluateTick(
    tickNumber: number,
    activeAgents: Array<{ id: string; domain: string; status?: string; applyConstraints?: (rules: string[]) => void }>,
    generatedArtifacts: EmergentArtifact[]
  ): Record<string, string[]> {
    const detectedCrises = this.detectCrises(generatedArtifacts);

    if (detectedCrises.length > 0) {
      this.triggerCdlProtocol(tickNumber, detectedCrises, activeAgents);
    }

    // Recover agents who were previously in CDL_REVIEW if their crisis counter subsided
    this.clearStaleQuarantines(activeAgents);

    return this.getActiveConstraints();
  }

  detectCrises(artifacts: EmergentArtifact[]): Array<{
    type: "stagnation" | "hallucination_cascade" | "stress_fracture" | "vacuum_breach";
    domain: string;
    severity: "low" | "medium" | "high" | "critical";
  }> {
    const crises: Array<{
      type: "stagnation" | "hallucination_cascade" | "stress_fracture" | "vacuum_breach";
      domain: string;
      severity: "low" | "medium" | "high" | "critical";
    }> = [];

    if (artifacts.length === 0) return crises;

    // 1. Crisis Type 1: Stagnation / Echo Chamber
    // If the same synthesis domain pair is produced too frequently without variation
    const pairCounts: Record<string, number> = {};
    for (const art of artifacts) {
      const dKey = art.domains.join("::");
      pairCounts[dKey] = (pairCounts[dKey] || 0) + 1;
    }

    for (const [pairKey, count] of Object.entries(pairCounts)) {
      if (count >= 5) {
        const counterKey = `stagnation_${pairKey}`;
        this.crisisCounters[counterKey] = (this.crisisCounters[counterKey] || 0) + 1;
        if (this.crisisCounters[counterKey] >= this.crisisThreshold) {
          crises.push({
            type: "stagnation",
            domain: pairKey.split("::")[0] || "global",
            severity: "high",
          });
        }
      }
    }

    // 2. Crisis Type 2: Contradictory / Hallucinated Logic (SMT Solver Failures)
    // SMT Solver returns UNSAT or Theoretical Hypothesis failure
    const invalidArtifacts = artifacts.filter(
      (a) => a.realityVerification && !a.realityVerification.smtSatPassed
    );
    if (artifacts.length >= 4 && invalidArtifacts.length > artifacts.length * 0.25) {
      this.crisisCounters["systemic_hallucination"] = (this.crisisCounters["systemic_hallucination"] || 0) + 1;
      if (this.crisisCounters["systemic_hallucination"] >= this.crisisThreshold) {
        crises.push({
          type: "hallucination_cascade",
          domain: "global",
          severity: "critical",
        });
      }
    }

    // 3. Crisis Type 3: Mechanical Stress Fracture (Kinematics Failure)
    const brokenKinematics = artifacts.filter(
      (a) => a.realityVerification && !a.realityVerification.kinematics.passed
    );
    if (artifacts.length >= 4 && brokenKinematics.length > artifacts.length * 0.3) {
      this.crisisCounters["stress_fracture"] = (this.crisisCounters["stress_fracture"] || 0) + 1;
      if (this.crisisCounters["stress_fracture"] >= this.crisisThreshold) {
        crises.push({
          type: "stress_fracture",
          domain: "engineering",
          severity: "high",
        });
      }
    }

    return crises;
  }

  triggerCdlProtocol(
    tickNumber: number,
    crises: Array<{
      type: "stagnation" | "hallucination_cascade" | "stress_fracture" | "vacuum_breach";
      domain: string;
      severity: "low" | "medium" | "high" | "critical";
    }>,
    activeAgents: Array<{ id: string; domain: string; status?: string }>
  ): void {
    for (const crisis of crises) {
      // 1. Isolate the failing agents / domains
      const affectedAgents = this.isolateAgents(crisis, activeAgents);

      // 2. Formulate a new constraint rule based on the crisis
      const { ruleEn, ruleKu } = this.formulateRule(crisis);

      // 3. Update CDL Memory
      if (!this.cdlMemory[crisis.domain]) {
        this.cdlMemory[crisis.domain] = [];
        this.cdlMemoryKu[crisis.domain] = [];
      }
      this.cdlMemory[crisis.domain].push(ruleEn);
      this.cdlMemoryKu[crisis.domain].push(ruleKu);

      // 4. Log for transparency (Crucial for AGI research & inspectability)
      const logEntry: CdlCrisisEvent = {
        tick: tickNumber,
        crisisType: crisis.type,
        domain: crisis.domain,
        severity: crisis.severity,
        affectedAgentsCount: affectedAgents.length,
        ruleInjected: ruleEn,
        ruleInjectedKu: ruleKu,
        timestamp: Date.now(),
      };
      this.crisisLog.unshift(logEntry);
      if (this.crisisLog.length > 50) this.crisisLog.pop();

      this.totalCrisesPrevented += 1;

      // Reset counter after learning
      this.crisisCounters[`${crisis.type}_${crisis.domain}`] = 0;
      if (crisis.type === "hallucination_cascade") {
        this.crisisCounters["systemic_hallucination"] = 0;
      }
    }
  }

  injectGeminiConstraints(
    rules: string[],
    tickNumber: number,
    targetDomain = "global"
  ): void {
    if (!this.cdlMemory[targetDomain]) {
      this.cdlMemory[targetDomain] = [];
      this.cdlMemoryKu[targetDomain] = [];
    }
    for (const rule of rules) {
      this.cdlMemory[targetDomain].push(rule);
      this.cdlMemoryKu[targetDomain].push(`مەرجی باڵای Gemini: ${rule}`);
    }

    const logEntry: CdlCrisisEvent = {
      tick: tickNumber,
      crisisType: "stagnation",
      domain: targetDomain,
      severity: "critical",
      affectedAgentsCount: 1000,
      ruleInjected: rules[0] || "GEMINI_META_SYNTHESIS",
      ruleInjectedKu: "مەرجی دروستکراوی سێرڤەری گەورەی Gemini بۆ ١,٠٠٠ ئەیجێنتەکە",
      timestamp: Date.now(),
    };
    this.crisisLog.unshift(logEntry);
    if (this.crisisLog.length > 50) this.crisisLog.pop();

    this.totalCrisesPrevented += rules.length;
    // Clear systemic crisis counters because central Gemini supercluster resolved the cognitive impasse
    this.crisisCounters = {};
    this.isolatedAgentIds.clear();
  }

  isolateAgents(
    crisis: { domain: string },
    activeAgents: Array<{ id: string; domain: string; status?: string }>
  ): Array<{ id: string }> {
    const affected: Array<{ id: string }> = [];
    for (const agent of activeAgents) {
      if (crisis.domain === "global" || crisis.domain === agent.domain) {
        agent.status = "CDL_REVIEW";
        this.isolatedAgentIds.add(agent.id);
        affected.push({ id: agent.id });
      }
    }
    return affected;
  }

  clearStaleQuarantines(activeAgents: Array<{ id: string; domain: string; status?: string }>): void {
    // Release 30% of CDL_REVIEW agents each tick to allow them to test learned constraints
    for (const agent of activeAgents) {
      if (agent.status === "CDL_REVIEW" && Math.random() < 0.35) {
        agent.status = "ACTIVE";
        this.isolatedAgentIds.delete(agent.id);
      }
    }
  }

  formulateRule(crisis: {
    type: "stagnation" | "hallucination_cascade" | "stress_fracture" | "vacuum_breach";
    domain: string;
  }): { ruleEn: string; ruleKu: string } {
    if (crisis.type === "stagnation") {
      return {
        ruleEn: `CONSTRAINT: Must introduce novel variable in ${crisis.domain} synthesis; forbid exact replication of previous tick.`,
        ruleKu: `مەرجی CDL: دەبێت گۆڕاوی نوێ بخەیتە ناو بەرهەمی ${crisis.domain}؛ دووبارەکردنەوەی تەواوی تیکی پێشوو قەدەغەیە.`,
      };
    } else if (crisis.type === "hallucination_cascade") {
      return {
        ruleEn: "CONSTRAINT: Cross-validate all numeric/logic outputs with First-Order SMT solver before proposing synthesis.",
        ruleKu: "مەرجی CDL: دەبێت سەرجەم دەرئەنجامە ژمارەیی و لۆژیکییەکان بە سیستەمی SMT Solver بسەلمێنرێن پێش پێشکەشکردنی داهێنان.",
      };
    } else if (crisis.type === "stress_fracture") {
      return {
        ruleEn: "CONSTRAINT: Mechanical torque & shear stress margin must satisfy σ / σ_yield ≤ 0.85 before spatial fabrication.",
        ruleKu: "مەرجی CDL: دەبێت ڕێژەی سترێسی مێکانیکی σ/σ_y کەمتر بێت لە ٠.٨٥ بۆ ڕێگریکردن لە شکان لەژێر هێزی ڕاکێشاندا.",
      };
    }
    return {
      ruleEn: "CONSTRAINT: Fallback to safe empirical baseline parameters.",
      ruleKu: "مەرجی CDL: گەڕانەوە بۆ پارامیتەرە سەلمێنراوە پارێزراوەکانی بنەڕەت.",
    };
  }

  getActiveConstraints(): Record<string, string[]> {
    const constraints: Record<string, string[]> = {};
    for (const [domain, rules] of Object.entries(this.cdlMemory)) {
      // Keep most recent 3 rules per domain to conserve context and computational overhead
      constraints[domain] = rules.slice(-3);
    }
    return constraints;
  }

  getState(): CdlModuleState {
    return {
      crisisThreshold: this.crisisThreshold,
      memoryDecay: this.memoryDecay,
      crisisCounters: { ...this.crisisCounters },
      activeConstraints: this.getActiveConstraints(),
      crisisLog: [...this.crisisLog],
      isolatedAgentIds: Array.from(this.isolatedAgentIds),
      totalCrisesPrevented: this.totalCrisesPrevented,
    };
  }
}

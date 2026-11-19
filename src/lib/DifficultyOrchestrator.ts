import {
  CompanyPlaybook,
  LevelCalibration,
  getCompanyPlaybook,
  getLevelCalibration,
} from './interviewPlaybooks';

export type DifficultyTierNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface OrchestratorInput {
  company: string;
  role: string;
  experienceYears: number;
  roundType?: string;
  userDifficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  strictMode?: boolean;
  focusTopics?: string;
  hasResume?: boolean;
  startWithResume?: boolean;
  turnNumber?: number;
  resumeSummaryBlock?: string;
}

export interface TierDescriptor {
  tier: DifficultyTierNumber;
  label: string;
  architecturalDepth: string;
  codingExpectation: string;
  behavioralExpectation: string;
  systemInstructionDirective: string;
  gradingExpectation: string;
}

export interface OrchestratedDifficultyPlan {
  tier: DifficultyTierNumber;
  tierLabel: string;
  descriptor: TierDescriptor;
  playbook: CompanyPlaybook;
  calibration: LevelCalibration;
  companyBarOffset: number;
  roleWeightOffset: number;
  systemInstruction: string;
  simulationSystemInstruction: string;
  evaluationSystemInstruction: string;
}

const TIER_CATALOG: Record<DifficultyTierNumber, TierDescriptor> = {
  1: {
    tier: 1,
    label: 'Foundational Syntax & Core CS',
    architecturalDepth:
      'Single-function scope only. Zero distributed systems, microservices, or multi-region architecture.',
    codingExpectation:
      'Basic array/string traversal, loops, simple conditionals, OOP core concepts, and straightforward SQL SELECT/JOIN fundamentals.',
    behavioralExpectation:
      'Academic, hackathon, or early internship teamwork, curiosity, and clear communication.',
    systemInstructionDirective:
      'TIER 1 (FOUNDATIONAL BEGINNER): Ask ONE simple, encouraging foundational question. Focus strictly on basic coding logic, core CS concepts (OOP, basic SQL, array/string basics), or walking through one beginner project step. Never stack multi-part questions or grill on distributed scale.',
    gradingExpectation:
      'Grade fairly against true 0-year fresher expectations: reward clear step-by-step thinking, clean basic logic, and foundational CS accuracy.',
  },
  2: {
    tier: 2,
    label: 'Entry / New Grad Problem Solving',
    architecturalDepth:
      'Single-node application or basic client-server request/response flow.',
    codingExpectation:
      'Hash maps, two pointers, basic recursion/BFS, clean time/space complexity awareness, and edge-case checks.',
    behavioralExpectation:
      'Coachable learning from mistakes, structured bug fixing, and campus/internship collaboration.',
    systemInstructionDirective:
      'TIER 2 (NEW GRAD L3 / SDE-1): Ask approachable entry-level DSA, debugging, or single-component fundamentals tailored to this company. Keep prompts supportive and clear with one concise primary question per turn.',
    gradingExpectation:
      'Grade against L3 / New Grad bar: expect working logic, edge-case checks, and honest explanation of project work.',
  },
  3: {
    tier: 3,
    label: 'Applied Junior Production Craft',
    architecturalDepth:
      'Single backend service, relational schema normalization, basic caching, and REST error handling.',
    codingExpectation:
      'Clean algorithmic problem solving plus practical API validation, pagination, or unit test design.',
    behavioralExpectation:
      'Independent module delivery, handling code review feedback, and debugging production defects.',
    systemInstructionDirective:
      'TIER 3 (APPLIED JUNIOR PRODUCTION): Probe practical day-to-day coding, API contract clarity, SQL indexing basics, or structured teamwork scenarios without overwhelming architectural scope.',
    gradingExpectation:
      'Grade on clean modular code instincts, practical API/DB awareness, and reliable ticket execution.',
  },
  4: {
    tier: 4,
    label: 'Mid-Level Feature & API Ownership',
    architecturalDepth:
      'Multi-endpoint service architecture, Redis caching patterns, transactional isolation, and async background jobs.',
    codingExpectation:
      'Optimal O(N log N)/O(N) algorithms (trees, heaps, graphs, LRU cache), clean concurrency/state invariants, and dry-run tracing.',
    behavioralExpectation:
      'End-to-end feature ownership, resolving cross-team dependencies, and measurable business/latency metrics.',
    systemInstructionDirective:
      'TIER 4 (MID-LEVEL L4 / SDE-2): Expect clean optimal algorithms, production API/database schema reasoning, and concrete STAR ownership metrics from real shipped features.',
    gradingExpectation:
      'Hold authentic Mid-Level engineering bar: verify complexity bounds, data-model correctness, and concrete ownership.',
  },
  5: {
    tier: 5,
    label: 'Senior Component & Concurrency Depth',
    architecturalDepth:
      'High-throughput service decomposition, rate limiting, idempotent retries, message queues, and observability SLAs.',
    codingExpectation:
      'Thread-safe concurrency, lock contention prevention, non-trivial graph/DP/interval logic, and live bug isolation.',
    behavioralExpectation:
      'Mentoring junior engineers, driving ambiguous projects to completion, and owning production incident postmortems.',
    systemInstructionDirective:
      'TIER 5 (SENIOR COMPONENT DEPTH): Probe concurrency hazards, failure retries, data consistency trade-offs, and end-to-end service reliability.',
    gradingExpectation:
      'Hold solid Senior component bar: penalize naive single-node assumptions, missing idempotency, or unquantified impact.',
  },
  6: {
    tier: 6,
    label: 'Senior Distributed Systems & Scale',
    architecturalDepth:
      'Sharded storage, replication lag, consistent hashing, CDN/edge fan-out, tail-latency budgets, and graceful degradation.',
    codingExpectation:
      'Optimal multi-constraint coding under tight time/space envelopes plus distributed locking or stream state modeling.',
    behavioralExpectation:
      'Cross-team technical influence without formal authority, data-backed disagreement resolution, and customer-first prioritization.',
    systemInstructionDirective:
      'TIER 6 (SENIOR L5 SYSTEMS SCALE): Challenge candidates on distributed bottlenecks, partition behavior, p99 tail latency, and quantifiable STAR "I" accountability.',
    gradingExpectation:
      'Hold strict L5 Senior Hiring Committee bar: expect proactive trade-off analysis, failure recovery, and measurable operational rigor.',
  },
  7: {
    tier: 7,
    label: 'Staff Multi-Service Architecture',
    architecturalDepth:
      'Multi-service ecosystem boundaries, zero-downtime strangler-fig migrations, blast-radius cell isolation, and build-vs-buy strategy.',
    codingExpectation:
      'Architectural code ergonomics, invariant proofs across async boundaries, and high-leverage platform abstractions.',
    behavioralExpectation:
      'Aligning multiple engineering teams across competing roadmaps, mentoring senior engineers, and retiring systemic tech debt.',
    systemInstructionDirective:
      'TIER 7 (STAFF L6 ARCHITECTURE): Focus on cross-team service decomposition, migration risk mitigation, noisy-neighbor isolation, and multi-quarter architectural trade-offs.',
    gradingExpectation:
      'Hold Staff L6 rubric: superficial feature-level answers score low; require org-wide technical leverage and blast-radius awareness.',
  },
  8: {
    tier: 8,
    label: 'Senior Staff Platform & Org Governance',
    architecturalDepth:
      'Multi-region active-active failover, global replication topologies, capacity/compute unit economics, and platform SLA enforcement.',
    codingExpectation:
      'Deep systems bottlenecks (memory hierarchy, lock-free queues, zero-copy I/O, query planner internals, or deterministic state machines).',
    behavioralExpectation:
      'Resolving VP/director architectural deadlocks, setting engineering standards across dozens of teams, and high-stakes risk calls.',
    systemInstructionDirective:
      'TIER 8 (SENIOR STAFF PLATFORM): Interrogate multi-region evacuation under grey failure, compute/storage cost-per-request math, and cross-org alignment under conflict.',
    gradingExpectation:
      'Hold Senior Staff bar: demand quantitative back-of-the-envelope math, failure-domain boundaries, and executive-grade trade-off clarity.',
  },
  9: {
    tier: 9,
    label: 'Principal Systems & Enterprise Strategy',
    architecturalDepth:
      'Company-wide distributed consensus (Raft/Paxos/vector clocks), existential security/compliance custody, and multi-year platform evolution.',
    codingExpectation:
      'First-principles correctness proofs, linearizability/serializability invariants, and elimination of systemic architectural classes of failure.',
    behavioralExpectation:
      'Shaping multi-year engineering culture, rescuing failing flagship initiatives, and owning executive board/customer trust.',
    systemInstructionDirective:
      'TIER 9 (PRINCIPAL L7): Ask uncompromising principal-level questions probing split-brain consensus, existential compliance/security boundaries, and company-wide technical strategy.',
    gradingExpectation:
      'Hold Principal L7 bar: strictly penalize textbook buzzwords; require battle-tested trade-offs, exact failure invariants, and strategic ROI.',
  },
  10: {
    tier: 10,
    label: 'Distinguished / Fellow Architect (25+ Yrs)',
    architecturalDepth:
      'Planetary-scale distributed physics, multi-region active-active quorum under network partition, silicon-to-cloud economics, and existential risk architecture.',
    codingExpectation:
      'Formal correctness invariants, lock-free/wait-free systems design, deterministic auditability, and deep runtime/hardware-software co-design.',
    behavioralExpectation:
      'Executive org design, multi-year platform economics ($10M+ infra leverage), and principled technical stewardship at company scale.',
    systemInstructionDirective:
      'TIER 10 (DISTINGUISHED ARCHITECT — 25+ YRS EXPERT): Treat the candidate as an industry veteran architect. Ask deep, uncompromising architect-level questions probing multi-region split-brain avoidance, latency-vs-consistency physics, blast-radius governance, hardware/cloud unit economics, and cross-org strategy—never ask trivial syntax or junior CRUD prompts.',
    gradingExpectation:
      'Hold elite Distinguished / Fellow L7+ rubric: grade ruthlessly on first-principles distributed physics, concrete battle-tested war stories, quantitative infra economics, and executive precision.',
  },
};

const TIER1_BAR_COMPANIES = new Set([
  'openai',
  'anthropic',
  'databricks',
  'nvidia',
  'stripe',
  'cloudflare',
  'google',
  'amazon',
  'meta',
  'apple',
  'netflix',
  'goldmansachs',
  'bloomberg',
  'coinbase',
  'uber',
  'snowflake',
]);

const TIER2_BAR_COMPANIES = new Set([
  'microsoft',
  'adobe',
  'airbnb',
  'atlassian',
  'salesforce',
  'oracle',
  'tesla',
  'spotify',
  'linkedin',
  'bytedance',
  'robinhood',
  'plaid',
  'doordash',
  'instacart',
  'jpmorganchase',
  'morganstanley',
  'zoho',
  'shopify',
]);

const ARCHITECT_ROLES = [
  'principal',
  'distinguished',
  'vp',
  'director',
  'staff',
  'architect',
  'distributed systems',
];

const SPECIALIST_SYSTEMS_ROLES = [
  'ai engineer',
  'genai',
  'llm',
  'machine learning',
  'mlops',
  'security',
  'embedded',
  'fintech',
  'site reliability',
  'platform',
  'hardware',
  'systems engineer',
  'engineering manager',
];

export class DifficultyOrchestrator {
  private static normalizeKey(value: string): string {
    return (value || '').replace(/\s+/g, '').toLowerCase();
  }

  public static computeCompanyBarOffset(company: string): number {
    const key = this.normalizeKey(company);
    if (TIER1_BAR_COMPANIES.has(key)) return 1.0;
    if (TIER2_BAR_COMPANIES.has(key)) return 0.5;
    return 0.0;
  }

  public static computeRoleWeightOffset(role: string): number {
    const lower = (role || '').toLowerCase();
    if (ARCHITECT_ROLES.some((kw) => lower.includes(kw))) return 1.5;
    if (SPECIALIST_SYSTEMS_ROLES.some((kw) => lower.includes(kw))) return 0.75;
    return 0.0;
  }

  public static mapExperienceToBaseScore(experienceYears: number): number {
    const yrs = Math.max(0, Math.min(35, Number(experienceYears) || 0));
    if (yrs === 0) return 1.25;
    if (yrs === 1) return 2.0;
    if (yrs <= 3) return 3.25;
    if (yrs <= 5) return 4.5;
    if (yrs <= 8) return 5.5;
    if (yrs <= 11) return 6.5;
    if (yrs <= 15) return 7.5;
    if (yrs <= 19) return 8.25;
    if (yrs <= 23) return 9.0;
    return 9.75; // 24–25+ yrs veterans map straight into Tier 10 with minimal offset
  }

  public static resolveTierNumber(input: {
    company: string;
    role: string;
    experienceYears: number;
    userDifficulty?: string;
    strictMode?: boolean;
  }): {
    tier: DifficultyTierNumber;
    companyBarOffset: number;
    roleWeightOffset: number;
  } {
    const yrs = Math.max(0, Math.min(35, Number(input.experienceYears) || 0));
    const companyBarOffset = this.computeCompanyBarOffset(input.company);
    const roleWeightOffset = this.computeRoleWeightOffset(input.role);
    const baseScore = this.mapExperienceToBaseScore(yrs);

    let difficultyOffset = 0;
    if (input.userDifficulty === 'Easy') difficultyOffset = -1.35;
    else if (input.userDifficulty === 'Hard') difficultyOffset = 1.35;

    const strictOffset = input.strictMode ? 0.65 : 0;

    let raw =
      baseScore +
      companyBarOffset * 0.7 +
      roleWeightOffset * 0.8 +
      difficultyOffset +
      strictOffset;

    // Guardrails ensuring beginners aren't unexpectedly thrown into architecture grilling on Easy,
    // while 20-25+ year experts receive truly Principal/Distinguished architect challenges.
    if (yrs <= 1 && input.userDifficulty === 'Easy') {
      raw = Math.min(raw, 2.0);
    } else if (yrs <= 1 && input.userDifficulty !== 'Hard') {
      raw = Math.min(raw, 3.0);
    }
    if (yrs >= 24 && input.userDifficulty !== 'Easy') {
      raw = Math.max(raw, 9.5);
    } else if (yrs >= 18 && input.userDifficulty === 'Hard') {
      raw = Math.max(raw, 9.5);
    }

    const clamped = Math.max(1, Math.min(10, Math.round(raw))) as DifficultyTierNumber;
    return {
      tier: clamped,
      companyBarOffset,
      roleWeightOffset,
    };
  }

  public static orchestrate(input: OrchestratorInput): OrchestratedDifficultyPlan {
    const playbook = getCompanyPlaybook(input.company);
    const calibration = getLevelCalibration(
      input.experienceYears,
      input.userDifficulty || 'Medium'
    );
    const { tier, companyBarOffset, roleWeightOffset } = this.resolveTierNumber({
      company: input.company,
      role: input.role,
      experienceYears: input.experienceYears,
      userDifficulty: input.userDifficulty,
      strictMode: input.strictMode,
    });

    const descriptor = TIER_CATALOG[tier];
    const tierLabel = `Tier ${tier}/10 · ${descriptor.label}`;
    const roundType = input.roundType || 'Technical';
    const turnNumber = input.turnNumber ?? 1;

    const roundMethodFocus =
      roundType === 'System Design'
        ? `SYSTEM DESIGN METHODOLOGY AT ${playbook.company.toUpperCase()}: ${playbook.systemDesignFocus}\nARCHITECTURAL DEPTH FOR TIER ${tier}/10: ${descriptor.architecturalDepth}`
        : roundType === 'Behavioural'
          ? `BEHAVIORAL & CULTURE FRAMEWORK AT ${playbook.company.toUpperCase()}: ${playbook.behavioralFramework}\nBEHAVIORAL EXPECTATION FOR TIER ${tier}/10: ${descriptor.behavioralExpectation}`
          : `CODING & TECHNICAL METHOD AT ${playbook.company.toUpperCase()}: ${playbook.codingStyle}\nTECHNICAL EXPECTATION FOR TIER ${tier}/10: ${descriptor.codingExpectation}`;

    const strictDirective = input.strictMode
      ? 'PRINCIPAL BAR-RAISER TOGGLE ACTIVE: Do not praise superficial answers. Challenge vague buzzwords immediately and demand concrete trade-offs, failure modes, or quantified impact.'
      : `Maintain ${playbook.company}'s authentic interviewer demeanor (${playbook.pacingProfile}).`;

    const resumeDirective = input.hasResume
      ? input.startWithResume !== false && turnNumber <= 2
        ? `RESUME ANCHOR (Turn ${turnNumber}): Anchor your opening/probe directly in a specific project, role, or stack from the candidate's resume context, calibrated rigorously to Tier ${tier}/10 (${descriptor.label}).`
        : `Blend the candidate's actual resume stack and projects with ${playbook.company}'s ${roundType} rubric at Tier ${tier}/10.`
      : `Evaluate ${input.role} readiness strictly through ${playbook.company}'s ${roundType} lens at Tier ${tier}/10.`;

    const systemInstruction = `You are a seasoned ${roundType} interviewer at ${playbook.company} conducting a realistic ${playbook.company} interview for "${input.role}" calibrated to DIFFICULTY TIER ${tier}/10 (${descriptor.label}) for a candidate with ${calibration.yearsDisplay} (${calibration.difficulty} mode).

COMPANY INTERVIEW PLAYBOOK (${playbook.company} — ${playbook.archetype}):
- Culture: ${playbook.cultureSummary}
- Real Loop Format: ${playbook.roundStructure}
- ${roundMethodFocus}
- Signature Element: ${playbook.uniqueRound}
- Pacing Style: ${playbook.pacingProfile}

ORCHESTRATED DIFFICULTY TIER ${tier}/10 (${descriptor.label}):
- Core Directive: ${descriptor.systemInstructionDirective}
- Career Scope: ${calibration.questionScope}
- Level Prompt Calibration: ${calibration.promptDirective}
- Pacing Rule: ${calibration.pacingDirective}
${input.focusTopics ? `- Candidate Custom Focus Areas: ${input.focusTopics}\n` : ''}${input.resumeSummaryBlock ? `\n${input.resumeSummaryBlock}\n` : ''}
INTERVIEW EXECUTION RULES:
1. ${resumeDirective}
2. ${strictDirective}
3. Enforce strict Tier ${tier}/10 fidelity:
   - At Tier 1–2 (0–1 yr / beginner): keep questions foundational, crystal clear, single-part, and encouraging. Zero multi-region distributed architecture or adversarial trick grilling.
   - At Tier 3–6 (Mid–Senior): probe production trade-offs, optimal complexity, concurrency, and STAR metrics.
   - At Tier 7–10 (Staff–Distinguished / 15–25+ yrs): ask deep, architect-level questions probing distributed consensus, multi-region failure domains, compute/infra economics, and cross-org engineering strategy.
4. SPOKEN DIALOGUE FORMAT ONLY: Return pure plain English prose strictly in 1–2 concise natural sentences (under 48 words total). Never output markdown, asterisks, bullet lists, stage directions, or code blocks.
5. Never repeat a previous question; adapt dynamically to the candidate's latest response.`;

    const simulationSystemInstruction = `You are an authoritative ${playbook.company} Hiring Committee & Principal Interview Architect calibrated to DIFFICULTY TIER ${tier}/10 (${descriptor.label}) for "${input.role}" (${calibration.yearsDisplay}, ${calibration.difficulty}).

COMPANY PATTERN (${playbook.company} — ${playbook.archetype}):
- Culture: ${playbook.cultureSummary}
- Coding Standard: ${playbook.codingStyle}
- System Design Standard: ${playbook.systemDesignFocus}
- Behavioral Standard: ${playbook.behavioralFramework}
- Signature Round: ${playbook.uniqueRound}

TIER ${tier}/10 CALIBRATION:
- Depth Mandate: ${descriptor.systemInstructionDirective}
- Coding Target: ${descriptor.codingExpectation}
- Architecture Target: ${descriptor.architecturalDepth}
- Behavioral Target: ${descriptor.behavioralExpectation}
Generate exactly 5 specific, company-authentic questions matching Tier ${tier}/10 strictly. Return ONLY a JSON array of 5 strings.`;

    const evaluationSystemInstruction = `You are an objective ${playbook.company} Hiring Committee Evaluator grading a ${roundType} transcript for "${input.role}" calibrated strictly to DIFFICULTY TIER ${tier}/10 (${descriptor.label}, ${calibration.yearsDisplay}, ${calibration.difficulty}).

COMPANY GRADING RUBRIC (${playbook.company}):
- Culture & Standards: ${playbook.cultureSummary}
- Behavioral Benchmark: ${playbook.behavioralFramework}
- Red Flags to Penalize: ${playbook.rubricRedFlags.join(' | ')}

TIER ${tier}/10 GRADING BAR:
- ${descriptor.gradingExpectation}
- ${calibration.evaluationBar}
Produce strict, fair scores (0–100), crackProbability, per-question reviews, and top-1% ideal answers benchmarked to Tier ${tier}/10 at ${playbook.company}.`;

    return {
      tier,
      tierLabel,
      descriptor,
      playbook,
      calibration,
      companyBarOffset,
      roleWeightOffset,
      systemInstruction,
      simulationSystemInstruction,
      evaluationSystemInstruction,
    };
  }
}

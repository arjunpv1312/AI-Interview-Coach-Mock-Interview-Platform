export interface HorizonPillar {
  id: string;
  eraCode: string;
  title: string;
  horizonShift: string;
  summary: string;
  keyBreakthroughs: string[];
  applicationImpact: string;
}

export interface AlgorithmEvolutionCase {
  id: string;
  domain: string;
  problem: string;
  bruteForce2026: {
    complexity: string;
    approach: string;
    bottleneck: string;
  };
  optimal2026: {
    complexity: string;
    approach: string;
    gain: string;
  };
  horizon5026: {
    complexity: string;
    approach: string;
    paradigm: string;
  };
}

export interface FrontierTrack {
  id: string;
  title: string;
  company: string;
  role: string;
  type: 'System Design' | 'Technical' | 'Behavioural';
  experience: number;
  difficulty: 'Hard' | 'Medium';
  focusTopics: string;
  summary: string;
}

export const HORIZON_5026_PILLARS: HorizonPillar[] = [
  {
    id: 'substrate',
    eraCode: '01',
    title: 'Reversible Photonic & Topological Compute',
    horizonShift: 'From Silicon Transistors to Zero-Heat Optical Lattices',
    summary:
      'Over 3,000 years, classical CMOS transistor scaling hits thermodynamic walls (Landauer limit). Year 5026 systems compute via reversible optical interference and topological braiding, trading heat dissipation for coherent energy recycling.',
    keyBreakthroughs: [
      'Reversible logic gates approach zero energy loss per bit transition',
      'Non-volatile holographic phase memory unifies RAM and archival storage',
      'Sub-millimeter photonic interconnects eliminate copper serialization overhead',
    ],
    applicationImpact:
      'Applications never cold-boot or page from disk; persistent state remains instantaneously addressable inside unified fabric memory.',
  },
  {
    id: 'algorithms',
    eraCode: '02',
    title: 'Proof-Carrying & Sub-Linear Intent Algorithms',
    horizonShift: 'From Imperative Brute-Force Loops to Verified Synthesis',
    summary:
      'Brute-force O(N²) traversal and fragile hand-tuned heuristics are extinct. Every Year 5026 computation carries a compact zero-knowledge cryptographic proof verifying complexity bounds, termination, and invariant safety before execution.',
    keyBreakthroughs: [
      'Intent compilers synthesize optimal graph and index plans from formal constraints',
      'Sub-linear probabilistic and quantum-walk indexing scales across planetary datasets',
      'Automated formal proofs replace brittle manual unit and regression suites',
    ],
    applicationImpact:
      'Codebases shrink by orders of magnitude: engineers author invariants and failure budgets rather than boilerplate CRUD wiring.',
  },
  {
    id: 'ai-mesh',
    eraCode: '03',
    title: 'Self-Healing Autonomous AI Meshes',
    horizonShift: 'From Prompted Chatbots to Co-Evolving Systems Custodians',
    summary:
      'In Year 5026, AI is no longer a stateless request-response oracle. Ambient neuro-symbolic meshes continuously sense grey failures, migrate stateful workloads ahead of physical degradation, and formally negotiate schema changes across centuries.',
    keyBreakthroughs: [
      'Causal world-model verification prevents hallucinated actions in production meshes',
      'Autonomous strangler-fig migrations retire legacy protocols without human downtime',
      'Explainable deterministic audit trails bind every autonomous decision to safety bounds',
    ],
    applicationImpact:
      'Zero-downtime systems run across decades without manual on-call firefighting; human architects focus purely on intent, ethics, and trade-offs.',
  },
  {
    id: 'ephemeral-apps',
    eraCode: '04',
    title: 'Life of an Application / Website in Year 5026',
    horizonShift: 'From Static Websites to Ephemeral Semantic Projections',
    summary:
      'Fixed URLs, rigid HTML pages, and monolithic client bundles vanish. In Year 5026, an "application" is a live semantic capability negotiated between a user’s local cryptographic vault and remote verified compute—projecting an adaptive interface built specifically for the immediate cognitive goal.',
    keyBreakthroughs: [
      'Intent-driven spatial & accessible UI synthesis adapts contrast, modality, and pacing live',
      'Zero-install capability streams materialize tools instantly and dissolve cleanly after completion',
      'Continuous cryptographic provenance verifies every rendered calculation against tampering',
    ],
    applicationImpact:
      'Users no longer hunt through nested menus; the workspace reshapes dynamically around the task while preserving strict accessibility and privacy guarantees.',
  },
  {
    id: 'sovereignty',
    eraCode: '05',
    title: 'Post-Quantum Zero-Knowledge Sovereignty',
    horizonShift: 'From Centralized Data Lakes to Local Cryptographic Custody',
    summary:
      'By Year 5026, raw PII never leaves personal custody. Applications compute over encrypted zero-knowledge commitments and homomorphic tokens, proving eligibility, skill mastery, or payment integrity without ever exposing underlying secrets.',
    keyBreakthroughs: [
      'Lattice- and isogeny-hardened non-extractable hardware-bound identity proofs',
      'Zero-knowledge credential attestations replace plaintext resumes and transcripts',
      'Ephemeral memory enclaves guarantee mathematical zero-retention processing',
    ],
    applicationImpact:
      'Breaches become mathematically inert—centralized servers hold zero raw user credentials or personal histories to exfiltrate.',
  },
];

export const ALGORITHM_EVOLUTION_CASES: AlgorithmEvolutionCase[] = [
  {
    id: 'search-routing',
    domain: 'High-Dimensional Knowledge Retrieval',
    problem: 'Finding top-K semantically valid answers across 10^15 records',
    bruteForce2026: {
      complexity: 'O(N · D) linear scan',
      approach: 'Exhaustive cosine scan across unindexed flat vectors',
      bottleneck: 'Seconds to minutes per query; massive compute & RAM waste',
    },
    optimal2026: {
      complexity: 'O(log N · M) HNSW + quantization',
      approach: 'Hierarchical navigable small-world graphs with product quantization',
      gain: 'Sub-15ms p99 retrieval with bounded memory footprint',
    },
    horizon5026: {
      complexity: 'O(log log N) optical associative',
      approach: 'Coherent photonic associative wave matching with proof-of-recall',
      paradigm: 'Single-cycle associative resonance with cryptographic completeness',
    },
  },
  {
    id: 'distributed-consensus',
    domain: 'Global State Synchronization',
    problem: 'Ordering concurrent transactions across interplanetary distances',
    bruteForce2026: {
      complexity: 'O(N²) broadcast lock',
      approach: 'Synchronous two-phase global lock across every replica',
      bottleneck: 'Availability collapses on any single-node partition or spike',
    },
    optimal2026: {
      complexity: 'O(N) Raft/Paxos + bounded clocks',
      approach: 'Partitioned shard quorums with hybrid logical clocks & lease reads',
      gain: 'High throughput inside regional cells with strict serializability',
    },
    horizon5026: {
      complexity: 'O(1) local invariant + causal merge',
      approach: 'CRDT-lattice semantic state proofs with entanglement-synced epochs',
      paradigm: 'Zero-stall local finality merged mathematically without rollback',
    },
  },
  {
    id: 'verification-testing',
    domain: 'Software Reliability & Security',
    problem: 'Guaranteeing zero memory bugs, auth bypasses, or race hazards',
    bruteForce2026: {
      complexity: 'Exponential path fuzzing',
      approach: 'Ad-hoc manual QA + blind random fuzzing after deployment',
      bottleneck: 'Misses rare race conditions & zero-day auth bypasses in prod',
    },
    optimal2026: {
      complexity: 'Static AST + property testing',
      approach: 'Type-safe boundaries, constant-time crypto, and automated CI checks',
      gain: 'Catches entire classes of injection & state bugs pre-merge',
    },
    horizon5026: {
      complexity: 'O(1) runtime proof check',
      approach: 'Intent compiler emits formally proven execution certificates',
      paradigm: 'Invalid security or concurrency states are unrepresentable at compile time',
    },
  },
  {
    id: 'interface-rendering',
    domain: 'Application Delivery & UX',
    problem: 'Delivering personalized, accessible workspaces across any device',
    bruteForce2026: {
      complexity: 'O(DOM) full re-render',
      approach: 'Heavy monolithic bundles re-hydrating static templates on every route',
      bottleneck: 'Layout shift, slow TTI, rigid one-size-fits-all screens',
    },
    optimal2026: {
      complexity: 'O(Δ) fine-grained signals',
      approach: 'Compositor-only GPU motion, WCAG AA tokens, and pre-warmed streams',
      gain: 'Instant responsiveness, zero layout thrash, full accessibility',
    },
    horizon5026: {
      complexity: 'Intent-bound spatial projection',
      approach: 'Ephemeral semantic UI synthesized around live cognitive goal & vault state',
      paradigm: 'No static pages—interfaces assemble, adapt, and dissolve cleanly',
    },
  },
];

export const FRONTIER_5026_TRACKS: FrontierTrack[] = [
  {
    id: 'frontier-consensus',
    title: 'Post-Silicon Intent & Causal Consensus Architecture',
    company: 'OpenAI',
    role: 'Distinguished Systems Architect',
    type: 'System Design',
    experience: 20,
    difficulty: 'Hard',
    focusTopics:
      'Year 5026 frontier: Causal CRDT lattices, zero-knowledge state proofs, sub-50ms regional sovereignty, and self-healing autonomous failover',
    summary:
      'Design a sovereign semantic compute mesh that eliminates brute-force global locking and preserves zero-knowledge auditability.',
  },
  {
    id: 'frontier-algorithms',
    title: 'Sub-Linear Algorithms & Proof-Carrying Verification',
    company: 'Google',
    role: 'Principal Engineer',
    type: 'Technical',
    experience: 14,
    difficulty: 'Hard',
    focusTopics:
      'Year 5026 frontier: Replacing O(N^2) brute force with O(log N) indexed graphs, formal invariant proofs, and lock-free concurrency',
    summary:
      'Eliminate naive quadratic bottlenecks and prove lock-free, constant-time cryptographic invariants under adversarial load.',
  },
  {
    id: 'frontier-ephemeral-ui',
    title: 'Ephemeral Semantic Interfaces & Human-AI Governance',
    company: 'Anthropic',
    role: 'Staff AI Engineer',
    type: 'Behavioural',
    experience: 10,
    difficulty: 'Medium',
    focusTopics:
      'Year 5026 frontier: Ephemeral intent-driven applications, WCAG accessibility invariants, and zero-trust user custody',
    summary:
      'Architect autonomous AI workflows that synthesize adaptive applications safely while keeping humans in sovereign control.',
  },
];

export const CURRENT_2026_TRACKS: FrontierTrack[] = [
  {
    id: 'current-consensus',
    title: 'Multi-Region Quorum, Sharding & Distributed Locks',
    company: 'OpenAI',
    role: 'Staff Backend Engineer',
    type: 'System Design',
    experience: 10,
    difficulty: 'Hard',
    focusTopics:
      'Year 2026 production architecture: Raft quorum leases, hybrid logical clocks, partition recovery, and idempotent distributed pipelines',
    summary:
      'Design a globally replicated inference & stateful workflow backbone balancing p99 latency, failover, and strict consistency.',
  },
  {
    id: 'current-algorithms',
    title: 'Lock-Free Concurrency, HNSW Indexing & Latency Budgets',
    company: 'Google',
    role: 'Senior Software Engineer',
    type: 'Technical',
    experience: 7,
    difficulty: 'Hard',
    focusTopics:
      'Year 2026 optimal algorithms: HNSW vector indexing, wait-free ring buffers, bounded rate limiters, and O(N log N) stream aggregation',
    summary:
      'Refactor quadratic bottlenecks into sub-linear retrieval structures and lock-free concurrent pipelines under burst load.',
  },
  {
    id: 'current-ephemeral-ui',
    title: 'Accessible Reactive UI, Safety Guardrails & AI UX',
    company: 'Anthropic',
    role: 'Senior Frontend Engineer',
    type: 'Behavioural',
    experience: 6,
    difficulty: 'Medium',
    focusTopics:
      'Year 2026 production craft: Streaming AI interfaces, WCAG AA accessibility compliance, Web Crypto client vaults, and human-in-the-loop safety',
    summary:
      'Navigate high-stakes product trade-offs around deterministic trust boundaries, streaming latency, and inclusive accessibility.',
  },
];


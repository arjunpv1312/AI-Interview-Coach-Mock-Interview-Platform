import { ExperienceTier } from '../types';

export interface CompanyPlaybook {
  company: string;
  archetype: string;
  cultureSummary: string;
  roundStructure: string;
  codingStyle: string;
  systemDesignFocus: string;
  behavioralFramework: string;
  uniqueRound: string;
  pacingProfile: string;
  rubricRedFlags: string[];
}

export interface LevelCalibration {
  tier: ExperienceTier;
  titleLabel: string;
  yearsDisplay: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionScope: string;
  promptDirective: string;
  pacingDirective: string;
  evaluationBar: string;
  silencePatienceMs: number;
  recommendedMinutes: number;
}

const FLAGSHIP_PLAYBOOKS: Record<string, CompanyPlaybook> = {
  Google: {
    company: 'Google',
    archetype: 'Big Tech · Hiring Committee & Engineering Excellence',
    cultureSummary:
      'Values first-principles algorithmic reasoning, Googleyness (intellectual humility, ambiguity tolerance, collaborative ownership), and clean scalable design without relying on IDE autocomplete.',
    roundStructure:
      'Phone Screen (DSA) -> 4-5 Onsite Loops (DSA Coding, System Design for L5+, Googleyness & Leadership) -> Independent Hiring Committee packet review.',
    codingStyle:
      'DSA & problem-solving heavy: graph traversal, dynamic programming, intervals, prefix sums, and clear articulation of time/space complexity and edge cases.',
    systemDesignFocus:
      'L5+ (Senior/Staff): large-scale distributed storage, MapReduce/batch pipelines, sharding, global replication, consistency vs availability trade-offs.',
    behavioralFramework:
      'Googleyness & Leadership: navigating ambiguity without formal authority, data-backed disagreements, inclusive collaboration, psychological safety.',
    uniqueRound:
      'Independent Hiring Committee calibration requiring unambiguous written evidence of complexity analysis and trade-off thinking.',
    pacingProfile:
      'Methodical and conversational: lets candidates clarify constraints first before expecting optimal complexity.',
    rubricRedFlags: [
      'Jumping into code before clarifying constraints or input bounds',
      'Omitting Big-O time/space complexity or boundary edge cases',
      'Blaming teammates or avoiding ownership during ambiguity prompts',
    ],
  },
  Amazon: {
    company: 'Amazon',
    archetype: 'Big Tech · 16 Leadership Principles & Bar Raiser',
    cultureSummary:
      'Every technical and behavioral round enforces Amazon’s 16 Leadership Principles (Customer Obsession, Ownership, Dive Deep, Bias for Action, Disagree and Commit) alongside crisp STAR metrics.',
    roundStructure:
      'OA -> Technical Phone Screen -> 4-5 Onsite Loops (Coding/OO Design, System Design, Dedicated Bar Raiser LP Deep Dive).',
    codingStyle:
      'Practical DSA combined with clean Object-Oriented / Low-Level Design (parking lot, locker allocator, LRU cache) emphasizing maintainability and edge cases.',
    systemDesignFocus:
      'Customer-facing high-throughput microservices, Dynamo-style partitioning, SQS/SNS async decoupling, idempotency, operational runbooks, and cost per request.',
    behavioralFramework:
      'Strict STAR (Situation, Task, Action, Result) probing individual "I" ownership (never hiding behind "we") with multi-turn "why" follow-ups anchored to the 16 LPs.',
    uniqueRound:
      'Bar Raiser veto loop: tests whether you raise the 50th percentile bar of existing Amazon engineers on Ownership and Dive Deep.',
    pacingProfile:
      'Inquisitive and metric-driven: digs multiple layers deep ("what was your exact metric delta?") on past projects.',
    rubricRedFlags: [
      'Using vague "we" statements instead of clear personal ownership ("I")',
      'Behavioral stories without quantifiable impact or measurable customer outcome',
      'Over-engineering architecture without cost, SLA, or operational alarms',
    ],
  },
  Meta: {
    company: 'Meta',
    archetype: 'Hyper-Scale Consumer · High-Velocity Coding & Execution',
    cultureSummary:
      'Fast, pragmatic execution culture ("Move Fast", "Focus on Impact"): expects bug-free production code on two distinct coding prompts per 45m loop plus high-scale consumer systems.',
    roundStructure:
      'Coding Screen (2 problems) -> Onsite (2 Coding loops, 1 System Design/Product Architecture, 1 Behavioral Execution & Conflict).',
    codingStyle:
      'Speed and precision: dry-run tracing on real inputs, trees/graphs/sliding-window/BFS, clean bug-free syntax without hints.',
    systemDesignFocus:
      'Consumer scale (billions of users): News Feed fan-out, real-time Messaging, distributed caches (Memcached/TAO), live reactions, and CDN/edge latency.',
    behavioralFramework:
      'Cross-functional alignment, resolving engineering disagreements pragmatically, prioritizing highest-leverage impact, receiving blunt feedback.',
    uniqueRound:
      'Product Architecture vs Infrastructure Design split depending on full-stack/product vs core infra alignment.',
    pacingProfile:
      'Crisp and brisk on senior/hard loops; expects candidates to spot off-by-one bugs proactively during walkthroughs.',
    rubricRedFlags: [
      'Slow problem decomposition or missing dry-run verification of edge cases',
      'Ignoring read/write amplification in billion-user feed or messaging architectures',
      'Defensive reactions when asked about critical peer feedback',
    ],
  },
  Microsoft: {
    company: 'Microsoft',
    archetype: 'Enterprise Cloud · Growth Mindset & Practical Engineering',
    cultureSummary:
      'Anchored in Growth Mindset, "Customer Obsessed", and collaborative debugging; wraps loops with an As-Appropriate (AA) Executive Partner round.',
    roundStructure:
      'Recruiter/OA -> 4-5 Virtual/Onsite Loops covering coding/debugging, architecture, teamwork, concluding with Senior/Principal AA Hire Sign-off.',
    codingStyle:
      'Clean algorithmic problem-solving, recursion/trees/string parsing, API correctness, plus debugging and code maintainability.',
    systemDesignFocus:
      'Enterprise reliability, multi-tenant isolation, Azure cloud resilience, backward compatibility across SDK/API versions, disaster recovery RPO/RTO.',
    behavioralFramework:
      'Growth Mindset & Learn-it-all ethos: learning openly from production postmortems, mentoring peers, bridging teams constructively.',
    uniqueRound:
      'As-Appropriate (AA) Executive Final Round assessing long-term trajectory, cultural additive impact, and technical judgment.',
    pacingProfile:
      'Respectful, collaborative pairing cadence; values candidates who ask thoughtful clarifying questions and iterate cleanly.',
    rubricRedFlags: [
      'Know-it-all rigidity when presented with alternative designs',
      'Overlooking backward compatibility or enterprise SLA/compliance constraints',
      'Superficial handling of production incident postmortems',
    ],
  },
  Apple: {
    company: 'Apple',
    archetype: 'Hardware-Software Craft · Deep Domain & First-Principles Systems',
    cultureSummary:
      'Decentralized org-specific hiring with extreme standards for craft, privacy-by-design, memory/battery efficiency, and deep mastery of core fundamentals.',
    roundStructure:
      'Hiring Manager Screen -> Team-Specific 5-6 Panel Loops probing domain internals (OS/runtime/UI/ML), debugging, and product craft.',
    codingStyle:
      'Low-level mechanics and clean code: memory layout, pointer/reference safety, concurrency locks, deterministic latency, bitwise/buffer manipulation or Swift/C++ fundamentals.',
    systemDesignFocus:
      'On-device privacy & sync architecture, battery/thermal-aware background execution, End-to-End Encryption (E2EE), seamless multi-device continuity.',
    behavioralFramework:
      'Uncompromising product craft, discretion, extreme cross-functional ownership with design/hardware teams, zero tolerance for "good enough".',
    uniqueRound:
      'Team-bespoke deep dive directly into the specific subsystem you would own (e.g., Metal/CoreAudio, iCloud sync, Apple Silicon firmware, Safari/UIKit).',
    pacingProfile:
      'Focused and deeply probing on fundamentals — expects you to know *why* abstractions behave the way they do under the hood.',
    rubricRedFlags: [
      'Treating OS threads, memory allocation, or network radios as magic black boxes',
      'Ignoring battery/CPU/privacy impact on end-user devices',
      'Sloppy API ergonomics or lack of attention to subtle edge-case polish',
    ],
  },
  Netflix: {
    company: 'Netflix',
    archetype: 'High-Autonomy Senior Culture · Keeper Test & Context not Control',
    cultureSummary:
      'Famous Netflix Culture Memo ("Context, not Control", Radical Candor, "Dream Team" density): primarily hires autonomous senior+ engineers judged against the Keeper Test.',
    roundStructure:
      'Recruiter + Hiring Manager Culture Calibration -> Technical Architecture & Domain Loop -> Cross-Functional Director / HR Culture Panel.',
    codingStyle:
      'Pragmatic real-world service/data modeling and concurrency debugging rather than academic whiteboard puzzles.',
    systemDesignFocus:
      'Global streaming resilience, Chaos Engineering (Simian Army), adaptive bitrate CDN steering, multi-region active-active failover, microservice observability.',
    behavioralFramework:
      'Netflix Culture Memo alignment: giving direct candor up/down, owning high-stakes decisions with minimal process ("Context not Control"), curating top-decile talent.',
    uniqueRound:
      'Dedicated Culture & Director Bar Panel weighing Netflix Culture Memo values equal to 50% of the final hire decision.',
    pacingProfile:
      'Peer-to-peer executive dialogue; expects strong, defensible opinions paired with willingness to be proven wrong.',
    rubricRedFlags: [
      'Waiting for top-down permission or rigid process rather than exercising judgment',
      'Avoiding uncomfortable candid feedback with peers or managers',
      'Weak operational observability or missing graceful-degradation fallbacks',
    ],
  },
  Stripe: {
    company: 'Stripe',
    archetype: 'FinTech Precision · Live Pairing, Bug Hunt & Integration Craft',
    cultureSummary:
      'Rejects abstract whiteboard trivia in favor of real-world IDE pairing: HTTP client integration, multi-file codebase bug hunts, API ergonomics, and financial correctness.',
    roundStructure:
      '1-Hour Coding Screen (realistic parser/ledger) -> Onsite (Integration Exercise, Multi-File Bug Hunt, System Design, Manager Behavioral).',
    codingStyle:
      'Hands-on pragmatic engineering: parsing real HTTP/JSON payloads, idempotent ledger math (cents, never floats), reading existing multi-file repos and writing clean tests.',
    systemDesignFocus:
      'Financial ledger immutability, double-entry accounting, idempotency keys, webhook retry with exponential backoff, payment processor failover, strict PCI/compliance.',
    behavioralFramework:
      'Users-first craftsmanship, extreme rigor on correctness ("move fast with high correctness"), thoughtful written communication.',
    uniqueRound:
      'Bug Hunt & Integration Pairing: cloning a real repository, navigating unfamiliar modules, diagnosing failing test suites, and shipping a safe fix.',
    pacingProfile:
      'Collaborative engineering pairing — assesses how systematically you isolate root causes, read docs/tests, and guard edge cases.',
    rubricRedFlags: [
      'Using floating-point arithmetic for currency or ignoring idempotency retries',
      'Guessing blindly during debugging instead of binary-searching logs/tests',
      'Ignoring webhook out-of-order delivery or partial state corruption',
    ],
  },
  OpenAI: {
    company: 'OpenAI',
    archetype: 'Frontier AI Lab · Distributed ML Systems & High-Velocity Craft',
    cultureSummary:
      'Intense frontier research + production scale culture: expects deep understanding of GPU/distributed compute, async inference reliability, safety guardrails, and high shipping velocity.',
    roundStructure:
      'Coding/ML Screen -> Onsite Loops covering Practical Systems Coding, Distributed Inference/Training Architecture, Debugging/ML Foundations, Culture.',
    codingStyle:
      'Clean concurrency, async queues, tensor/batching/tokenization logic, rate-aware orchestration, and debugging subtle performance bottlenecks.',
    systemDesignFocus:
      'High-throughput LLM inference (KV cache routing, continuous batching, speculative decoding), streaming SSE/WebSocket delivery, GPU cluster scheduling, eval pipelines.',
    behavioralFramework:
      'Navigating extreme ambiguity at frontier speed, responsible AI safety rigor, low-ego collaboration between research and systems engineering.',
    uniqueRound:
      'Large-scale AI Infrastructure / Model-Serving Design probing GPU memory bandwidth, tail latency (TTFT / TPOT), and safety evaluation harnesses.',
    pacingProfile:
      'High-signal systems inquiry — rewards clear quantitative math (memory footprint, tokens/sec, batching trade-offs).',
    rubricRedFlags: [
      'Treating LLM serving like a stateless CRUD REST API without batching/KV-cache math',
      'Missing failure isolation when GPU workers OOM or stall mid-stream',
      'Lack of systematic offline/online evaluation methodology',
    ],
  },
  Zoho: {
    company: 'Zoho',
    archetype: 'Anti-Pedigree Product Craft · Scratch Logic & Machine Coding',
    cultureSummary:
      'Renowned for hiring pure problem solvers from first principles without relying on frameworks or college pedigree; prioritizes scratch C/Java/OOP logic and clean data structure implementation.',
    roundStructure:
      'Round 1: Aptitude & C/Output Tracing -> Round 2: Short Coding Problems -> Round 3: Advanced Low-Level Machine Coding (3 hrs console app without external libs) -> Technical & HR.',
    codingStyle:
      'Zero-library scratch implementation: arrays, matrices, string parsing, custom classes/state machines (e.g., Railway Booking, Taxi Dispatch, Call Center, Console Spreadsheet).',
    systemDesignFocus:
      'Clean single-node and multi-module Object-Oriented Architecture, modular class hierarchies, in-memory persistence, transactional consistency.',
    behavioralFramework:
      'Long-term product dedication, self-taught engineering grit, clean maintainable code without bloated dependencies.',
    uniqueRound:
      '3-Hour Live Console Machine Coding round building an end-to-end extensible OOP system cleanly from scratch.',
    pacingProfile:
      'Step-by-step incremental complexity: starts with basic working requirements then layers extensibility constraints.',
    rubricRedFlags: [
      'Hardcoding logic or over-relying on external libraries/frameworks for basic structures',
      'Spaghetti procedural code with zero modular separation of entities and services',
      'Failing to handle invalid user inputs or edge-case state transitions cleanly',
    ],
  },
  TCS: {
    company: 'TCS',
    archetype: 'Enterprise IT & Global Delivery · Fundamentals & Client Execution',
    cultureSummary:
      'Structured hiring via NQT/Ninja/Digital/Prime tracks focusing on solid CS fundamentals (OOP, DBMS, OS, SQL), reliable enterprise delivery, and client-facing professionalism.',
    roundStructure:
      'NQT Aptitude & Coding Assessment -> Technical Panel (CS Core + Resume Projects + SQL/OOP) -> Managerial (MR) -> HR Fit & Mobility.',
    codingStyle:
      'Clean foundational algorithms (arrays, strings, primes, sorting, recursion) for entry/Digital, progressing to Spring/Microservices/Cloud integration for Senior/Architects.',
    systemDesignFocus:
      'Enterprise ERP/banking modernization, legacy-to-cloud migration, Oracle/PostgreSQL schema normalization, SLA governance, zero-downtime cutovers.',
    behavioralFramework:
      'Client empathy, adaptability across global teams/time zones, steady execution under enterprise SLAs and compliance rules.',
    uniqueRound:
      'Combined Technical + Managerial (MR) deep-check verifying both project fundamentals and client/team reliability.',
    pacingProfile:
      'Structured and supportive on entry/easy tracks; becomes strict on architecture, legacy migration, and stakeholder management at senior tiers.',
    rubricRedFlags: [
      'Unable to explain SQL joins, ACID properties, or basic OOP polymorphism clearly',
      'Listing projects on resume without knowing how your own module actually works',
      'Lack of clarity on deployment, testing, or enterprise defect lifecycle',
    ],
  },
};

function createCustomizedPlaybook(
  company: string,
  archetype: string,
  cultureSummary: string,
  roundStructure: string,
  codingStyle: string,
  systemDesignFocus: string,
  behavioralFramework: string,
  uniqueRound: string,
  pacingProfile: string,
  rubricRedFlags: string[]
): CompanyPlaybook {
  return {
    company,
    archetype,
    cultureSummary,
    roundStructure,
    codingStyle,
    systemDesignFocus,
    behavioralFramework,
    uniqueRound,
    pacingProfile,
    rubricRedFlags,
  };
}

const CUSTOM_OVERRIDES: Record<string, CompanyPlaybook> = {
  Airbnb: createCustomizedPlaybook(
    'Airbnb',
    'Two-Sided Marketplace · Core Values & Practical Pairing',
    'Heavy emphasis on Airbnb Core Values ("Champion the Mission", "Be a Host", "Embrace the Adventure") alongside real-world collaborative coding.',
    'Phone Screen -> 4-5 Onsite Loops (Practical Coding/IDE, Architecture, 2 Dedicated Cross-Functional Core Values Rounds).',
    'Clean stateful logic (calendars, booking intervals, pagination/search, pricing rules) solved interactively with clear test cases.',
    'Two-sided marketplace consistency: preventing double-bookings under high concurrency, geo-search indexing, trust & safety fraud pipelines.',
    'Core Values panel: deep empathy for hosts/guests, cross-functional warmth, principled integrity when metrics conflict.',
    'Dedicated two-person Core Values interview weighted as heavily as technical loops.',
    'Warm, collaborative pairing; tests clarity of thought under realistic marketplace edge cases.',
    [
      'Race conditions in double-booking / inventory locking flows',
      'Transactional answers to Core Values lacking genuine human empathy',
      'Overlooking multi-currency, timezone, or localization edge cases',
    ]
  ),
  Uber: createCustomizedPlaybook(
    'Uber',
    'Real-Time Geo-Logistics · Low-Latency Dispatch & Concurrency',
    'Obsessed with real-world physical-world scale: GPS location streams, geospatial indexing (H3), surge pricing consistency, and fault-tolerant microservices.',
    'Coding Screen -> 4-5 Onsite Loops (DSA/Concurrency, Real-Time Architecture, Bar Raiser / Behavioral).',
    'Graphs, shortest paths, priority queues, concurrent state machines, and high-throughput stream aggregation.',
    'Geospatial sharding (H3/QuadTree), millions of driver location updates/sec, trip state machine durability, dynamic surge pricing consistency.',
    'Ownership under extreme operational pressure, resolving incidents rapidly, pragmatic trade-offs.',
    'Real-time Geo-Scale Architecture round testing stateful distributed dispatch under partition.',
    'Direct, scale-oriented probing: immediately pushes QPS, payload sizes, and partition behavior.',
    [
      'Storing raw real-time GPS streams directly in an unsharded relational table',
      'Failing to guard trip matching against duplicate/stale state transitions',
      'Ignoring regional datacenter failover for live trips',
    ]
  ),
  Spotify: createCustomizedPlaybook(
    'Spotify',
    'Audio Streaming & Squad Autonomy · Product-Driven Craft',
    'Famous for autonomous Squad/Tribe engineering, recommendation personalization, offline-first mobile sync, and user-delight craft.',
    'Recruiter -> Technical Pair Screen -> 4-Stage Onsite (Coding, Systems Architecture, Agile/Squad Collaboration, Values).',
    'Clean modular code with unit tests, playlist/graph traversal, streaming buffer/queue handling.',
    'Global audio CDN/edge caching, offline playlist delta sync, recommendation feature pipelines, real-time collaborative playback.',
    'Cross-functional Squad autonomy, experimentation mindset (A/B testing), constructive retrospectives.',
    'Squad Collaboration / Product Craft pairing session evaluating team chemistry.',
    'Collaborative and conversational — evaluates clean testing habits and product intuition.',
    [
      'Ignoring offline-first conflict resolution and mobile bandwidth limits',
      'Building rigid top-down designs that block squad iteration',
      'Missing metrics/A-B experiment design on user-facing features',
    ]
  ),
  Tesla: createCustomizedPlaybook(
    'Tesla',
    'First-Principles Hardware-Software · Extreme Speed & Ownership',
    'Intense first-principles engineering ("Delete unnecessary parts"): values raw ownership, low-level performance, telemetry reliability, and zero bureaucracy.',
    'Hiring Manager Screen -> Technical Deep Dive -> 4-5 Panel Loops -> Executive / Director Review.',
    'Real-time data processing, embedded/systems efficiency, deterministic algorithms, high-throughput telemetry ingestion.',
    'Fleet telemetry streaming at millions of vehicles, OTA firmware rollouts with safe rollback, factory automation MES reliability.',
    'Radical ownership in crisis, cutting complexity rather than adding layers, extreme bias for measurable physical outcomes.',
    'First-Principles Deep Dive on past hardest engineering project where interviewer dissects every layer down to physics/OS limits.',
    'Fast, direct, impatient with buzzwords — cuts straight to bottleneck math and root causes.',
    [
      'Recommending heavyweight enterprise abstractions where simple direct code works',
      'Unable to defend architectural numbers from first principles',
      'Passive "committee" mindset during urgent failures',
    ]
  ),
  GoldmanSachs: createCustomizedPlaybook(
    'Goldman Sachs',
    'Tier-1 Investment Banking · CoderPad Precision & Risk Integrity',
    'Rigorous CoderPad live execution combined with financial domain integrity, multi-threading correctness, deterministic latency, and regulatory auditability.',
    'CoderPad Screen -> Superday (3-4 Back-to-Back Technical, System Design, & Behavioral/Leadership Loops).',
    'CoderPad runnable test-driven coding: strings, DP, hash maps, concurrency/locks, clean complexity & live execution.',
    'Low-latency order routing, deterministic audit trails, high-availability risk calculation grids, ACID settlement pipelines.',
    'Integrity under pressure, stakeholder trust with trading desks, clear risk escalation.',
    'Superday Back-to-Back Panel evaluating precision across live executable CoderPad tests.',
    'Structured and exact — expects code and reasoning to hold up under live edge-case testing.',
    [
      'Unhandled race conditions or floating-point rounding bugs in financial flows',
      'Code that fails basic CoderPad edge-case inputs (empty, negative, duplicates)',
      'Casual attitude toward compliance, audit logs, or operational risk',
    ]
  ),
  JPMorganChase: createCustomizedPlaybook(
    'JPMorgan Chase',
    'Global Banking Scale · Resilience, Security & Enterprise Systems',
    'Focuses on mission-critical banking resilience, zero-trust security, Java/Cloud modernization, and disciplined teamwork.',
    'HireVue/CodeForGood or Coding Screen -> Superday (Technical Coding, Architecture, Behavioral).',
    'Clean OOP, concurrency/threading, collections, SQL optimization, defensive error handling.',
    'Core banking ledger consistency, idempotent payments, zero-downtime blue/green deploys, SOC2/PCI compliance.',
    'Risk-aware accountability, mentoring across large teams, crisp communication to non-technical stakeholders.',
    'Superday Architecture & Risk Review testing disaster recovery and audit compliance.',
    'Balanced, methodical, emphasizes defensive engineering and reliability.',
    [
      'Ignoring disaster recovery, active-passive failover, or encryption at rest/in transit',
      'Vague answers on SQL transactions, isolation levels, or deadlocks',
    ]
  ),
  Bloomberg: createCustomizedPlaybook(
    'Bloomberg',
    'Real-Time Financial Data · C++/Systems Depth & Terminal Scale',
    'Values rock-solid data structures, memory awareness, low-latency market feeds, and multi-round engineering depth in C++/Python/TS.',
    'Phone Coding -> 2 Onsite Technical Loops -> System Design -> Engineering Manager & HR.',
    'Clean optimal DSA (trees, heaps, LRU/LFU, design-a-data-structure), memory efficiency, iterative refinement.',
    'Real-time tick ingestion (millions/sec), pub/sub terminal distribution, time-series storage, low-latency alerts.',
    'Long-term craft, collaborative code reviews, genuine curiosity for financial infrastructure.',
    'Design-a-Data-Structure live coding (e.g., Moving Average / Order Book / Ticker Leaderboard).',
    'Friendly yet technically exacting — probes memory overhead and worst-case latency.',
    [
      'Ignoring O(N) memory leaks or cache-unfriendly allocations in streaming systems',
      'Failing to trace worst-case runtime complexity cleanly',
    ]
  ),
  Coinbase: createCustomizedPlaybook(
    'Coinbase',
    'Crypto & High-Stakes FinTech · Practical Pairing & Security First',
    'Structured bar emphasizing production-ready pairing, key custody/security paranoia, distributed consensus reliability, and zero-trust validation.',
    'OA -> Live Pairing Screen -> Onsite (Architecture, Live Multi-Step Pairing, Engineering Values).',
    'Clean modular IDE pairing: rate limiters, order-book matching, iterator/stream pagination, cryptographic/validation invariants.',
    'Double-spend prevention, hot/cold wallet custody flows, idempotent exchange matching, spike tolerance during market volatility.',
    'Clear written communication, security-first paranoia, staying calm during 10x traffic surges.',
    'Practical Multi-Step Pairing (iterating a working service as requirements evolve live).',
    'Structured, practical, checks code cleanliness, naming, and test coverage at every step.',
    [
      'Lack of input validation, replay protection, or integer precision safeguards',
      'Architecture that collapses under 10x sudden market-volatility spikes',
    ]
  ),
  Atlassian: createCustomizedPlaybook(
    'Atlassian',
    'Collaborative SaaS · Values-Anchored & Clean Code Design',
    'Structured interviews famous for evaluating "Open Company, No Bullshit", "Play as a Team", clean code-design (no tricky puzzles), and multi-tenant scale.',
    'Karat/Coding Screen -> Code Design -> System Design -> Management & Dedicated Values Loop.',
    'Clean Code Design (rate limiter, middleware router, voting tally, snake game) evaluated on modularity, readability, and unit tests.',
    'Multi-tenant SaaS isolation, Jira/Confluence collaborative sync, webhook fan-out, noisy-neighbor protection.',
    'Explicit Atlassian Values alignment: radical transparency, blameless retrospectives, empowering teammates.',
    'Dedicated Code Design + Atlassian Values two-pillar evaluation.',
    'Supportive and transparent — wants clean extensible code and honest self-reflection.',
    [
      'Noisy-neighbor vulnerability in multi-tenant architectures',
      'Bragging or hiding mistakes instead of practicing blameless transparency',
    ]
  ),
  Databricks: createCustomizedPlaybook(
    'Databricks',
    'Data & AI Infrastructure · Hardcore Distributed Storage & Compute',
    'High technical bar focused on distributed query engines, Spark/Delta internals, lock-free concurrency, and multi-terabyte reliability.',
    'Coding Screen -> Onsite (Harder Practical Coding/Concurrency, Storage/Compute Architecture, Manager Behavioral).',
    'Multi-threaded coding, custom iterators, interval merging, snapshot isolation, external sorting.',
    'Lakehouse ACID transactions (Delta), distributed query shuffling, metadata catalogs, cloud object-store consistency.',
    'Customer obsession for enterprise data teams, extreme technical rigor.',
    'Concurrency & Distributed Storage Internals coding/architecture round.',
    'Rigorous and systems-deep — checks thread safety and I/O bottlenecks immediately.',
    [
      'Ignoring disk/object-store I/O amplification or metadata bottlenecks',
      'Incorrect mutex/lock ordering causing deadlocks in concurrent exercises',
    ]
  ),
  Anthropic: createCustomizedPlaybook(
    'Anthropic',
    'Frontier AI Safety & Systems · High-Integrity Reasoning & Concurrency',
    'Prioritizes clear first-principles thinking, high-reliability Python/systems concurrency, interpretability/eval discipline, and thoughtful safety judgment.',
    'Work-Sample / Take-Home or Live Coding -> Systems/Debugging -> Alignment/Research Discussion -> Values.',
    'Practical multi-stage problem solving: async pipelines, web crawler/rate-aware batcher, deterministic state & concurrency.',
    'Scalable RLHF/eval infrastructure, high-throughput inference routing, fault-tolerant distributed training checkpoints.',
    'Intellectual honesty, nuance on risk/safety trade-offs, collaborative low-ego rigor.',
    'Pragmatic Code + Concurrency Work-Sample evaluating real engineering judgment.',
    'Calm, intellectually deep, rewards explicit uncertainty awareness and clean invariants.',
    [
      'Overconfident hand-waving instead of reasoning cleanly from constraints',
      'Unbounded async concurrency or missing backpressure in worker pools',
    ]
  ),
  Nvidia: createCustomizedPlaybook(
    'Nvidia',
    'Accelerated Computing & AI Hardware · Low-Level Performance & Architecture',
    'Deep engineering focus on parallel compute, memory hierarchy, CUDA/kernel concepts, C++/systems performance, and hardware-software co-design.',
    'Technical Screen -> 4-5 Panel Rounds across C++/Systems, Parallelism/Memory, Domain Architecture, Hiring Manager.',
    'Bit manipulation, cache-friendly memory layouts, lock-free queues, producer-consumer synchronization, C++/Python internals.',
    'GPU cluster interconnects, tensor-parallel communication, zero-copy DMA pipelines, deterministic latency.',
    'Intellectual fearlessness, cross-layer curiosity from silicon up to frameworks.',
    'Hardware-Aware Performance Optimization & Memory Hierarchy round.',
    'Methodical and performance-obsessed — digs into cache misses, branches, and bandwidth.',
    [
      'Ignoring memory bandwidth, cache locality, or thread contention',
      'Surface-level abstractions without understanding underlying execution cost',
    ]
  ),
  Salesforce: createCustomizedPlaybook(
    'Salesforce',
    'Enterprise Multi-Tenant Cloud · Metadata Architecture & Trust',
    'Anchored in Trust (#1 Value), multi-tenant metadata architectures, governor limits, and collaborative customer success.',
    'Coding Screen -> 4 Onsite Loops (DSA/OOP, Multi-Tenant System Design, Trust/Behavioral, Manager).',
    'Clean OOP, tree/graph/map problems, clean API design with explicit validation and tenant boundaries.',
    'Multi-tenant shared database isolation, governor limits, async event buses, enterprise RBAC & audit logging.',
    'Ohana & Trust-first leadership, stakeholder alignment, transparent escalation.',
    'Multi-Tenant Enterprise Scale & Security Architecture review.',
    'Constructive and enterprise-focused — values security, maintainability, and governance.',
    [
      'Cross-tenant data leakage risks or missing rate/governor quotas',
      'Dismissing accessibility, compliance, or audit requirements',
    ]
  ),
  Oracle: createCustomizedPlaybook(
    'Oracle',
    'Database & Cloud Infrastructure (OCI) · Internals & Reliability',
    'Strong emphasis on database internals, concurrency control, distributed consensus, B-Trees, and enterprise cloud isolation.',
    'Screening -> 4-5 OCI/Database Panel Loops (Coding, Internals/SQL, Architecture, Behavioral).',
    'Solid DSA, concurrency primitives, memory/transaction modeling, SQL tuning.',
    'Distributed consensus (Raft/Paxos), MVCC isolation, virtual cloud networking, bare-metal tenant isolation.',
    'High reliability, disciplined engineering documentation, principled technical debate.',
    'Database / Distributed Consensus & Isolation Level deep dive.',
    'Technical and foundational — expects precision on locks, indexes, and durability.',
    [
      'Confusing ACID isolation anomalies (dirty/phantom reads) or WAL durability guarantees',
      'Ignoring quorum/split-brain handling in consensus architectures',
    ]
  ),
  Cloudflare: createCustomizedPlaybook(
    'Cloudflare',
    'Global Edge Network · Networking, Security & Zero-Overhead Systems',
    'Obsessed with Anycast routing, HTTP/TLS/DNS internals, Workers V8 isolates, DDoS mitigation, and sub-millisecond overhead.',
    'Take-Home or Systems Screen -> 4 Onsite Loops (Systems Coding, Networking/Edge Architecture, Manager, Executive).',
    'Low-overhead parsing, ring buffers, trie/IP-prefix matching, stream processing.',
    'Global edge Anycast failover, DDoS packet filtering at Tbps scale, distributed KV/Durable Objects consistency.',
    'Internet-scale curiosity, transparent postmortems, fast pragmatic execution.',
    'Networking & Edge Protocol Troubleshooting (DNS/TLS/BGP/HTTP/2) loop.',
    'Fast, practical, deeply technical on protocols and latency budgets.',
    [
      'Unfamiliarity with TCP/TLS handshakes, DNS resolution, or reverse-proxy bottlenecks',
      'High-allocation synchronous work in latency-critical edge paths',
    ]
  ),
  Adobe: createCustomizedPlaybook(
    'Adobe',
    'Creative & Document Cloud · Rendering, Collaboration & Craft',
    'Balances strong CS/OOP fundamentals with client-cloud performance, CRDT real-time collaboration, and enterprise asset workflows.',
    'OA/Screen -> 3 Technical Coding & Design Rounds -> Director/Architect + HR.',
    'Graphs, trees, undo/redo command patterns, geometry/buffer manipulation, clean UI/state architecture.',
    'Real-time collaborative editing (CRDTs/OT), large binary media pipelines, low-latency canvas/WebAssembly rendering.',
    'Creative empathy, cross-discipline partnership with product design, resilient delivery.',
    'Product/Architecture Craft deep dive bridging client responsiveness and cloud sync.',
    'Measured and craft-oriented — checks state modeling, undo/redo edge cases, and responsiveness.',
    [
      'Blocking the UI thread during heavy canvas/document operations',
      'Weak conflict resolution strategies for concurrent multi-user edits',
    ]
  ),
  Infosys: createCustomizedPlaybook(
    'Infosys',
    'Global Digital Consulting · Core CS, Cloud Modernization & Delivery',
    'Evaluates clean CS fundamentals, enterprise Java/Python/.NET/React stacks, structured communication, and scalable client project delivery.',
    'SP/DSE/InfyTQ Coding Assessment -> Technical Panel (Core CS + Stack + Project Architecture) -> HR.',
    'Clean DSA fundamentals (arrays, DP/greedy for SP track, SQL joins, OOP design) and debugging.',
    'Enterprise microservice migration, API gateway governance, CI/CD release gates, relational schema tuning.',
    'Client-first accountability, continuous learning, structured delivery under milestones.',
    'Resume Project Architecture Defense + Live Fundamental Coding.',
    'Structured and clear; scales sharply from foundational CS at entry to enterprise governance at senior levels.',
    [
      'Surface-level knowledge of your own resume project deployment or database schema',
      'Missing basic error handling, logging, or SQL indexing strategies',
    ]
  ),
  Wipro: createCustomizedPlaybook(
    'Wipro',
    'Enterprise Engineering Services · Full-Stack Fundamentals & Cloud Ops',
    'Tests practical full-stack foundations, OS/DBMS/Network core concepts, clean debugging, and reliable client team collaboration.',
    'NLTH/Assessment -> Technical Interview (Stack + Core CS + Coding) -> HR Round.',
    'Foundational coding (strings, arrays, recursion), OOP concepts, SQL queries, REST API basics.',
    'Enterprise application supportability, cloud CI/CD, database indexing, SLA monitoring.',
    'Dependability, clear stakeholder updates, eagerness to learn new stacks.',
    'Core CS + Project Troubleshooting round.',
    'Clear, encouraging on entry/easy; practical enterprise architecture focus at senior tiers.',
    [
      'Inability to trace simple recursive or array edge cases',
      'Ignoring testing, logging, or rollback plans in production releases',
    ]
  ),
};

function normalizeKey(company: string): string {
  return company.replace(/\s+/g, '').toLowerCase();
}

const NORMALIZED_FLAGSHIPS: Record<string, CompanyPlaybook> = {};
for (const [k, v] of Object.entries(FLAGSHIP_PLAYBOOKS)) {
  NORMALIZED_FLAGSHIPS[normalizeKey(k)] = v;
}
for (const [k, v] of Object.entries(CUSTOM_OVERRIDES)) {
  if (v) NORMALIZED_FLAGSHIPS[normalizeKey(k)] = v;
}

const DOMAIN_ARCHETYPES: Record<
  string,
  Omit<CompanyPlaybook, 'company'>
> = {
  fintech: {
    archetype: 'FinTech & Trading Systems · Correctness, Auditability & Low Latency',
    cultureSummary:
      'Zero-tolerance for silent data corruption, race conditions, or precision bugs; combines practical live coding with strong security and ledger rigor.',
    roundStructure:
      'Live Coding/Pairing Screen -> 4 Panel Loops (Concurrency/Coding, Ledger & Risk Architecture, Domain Behavioral).',
    codingStyle:
      'Exact state modeling, integer currency math, idempotency, rate limiters, concurrent order-book/ledger invariants.',
    systemDesignFocus:
      'Double-entry immutable ledgers, idempotency keys, outbox/CDC event reliability, regulatory audit logs, traffic burst isolation.',
    behavioralFramework:
      'Radical accountability for financial risk, structured incident postmortems, clear cross-team escalation.',
    uniqueRound:
      'Transaction Correctness & Failure Mode Pairing (preventing double-charges or partial-commit states).',
    pacingProfile:
      'Detail-oriented and exact — probes race conditions, retries, and edge-case failure recovery.',
    rubricRedFlags: [
      'Floating-point currency math or missing idempotency guarantees',
      'No recovery plan for partial failures between external payment gateways and local DB',
    ],
  },
  consulting: {
    archetype: 'Global IT Consulting & Enterprise Delivery · Core CS & Architecture Governance',
    cultureSummary:
      'Balances rock-solid computer science fundamentals and resume verification at entry levels with enterprise cloud transformation and client governance at senior/principal levels.',
    roundStructure:
      'Aptitude/Coding Screen -> Technical Stack & CS Core Panel -> Managerial/Client Delivery -> HR.',
    codingStyle:
      'Clear algorithmic fundamentals (arrays, strings, SQL, OOP) progressing to clean microservices, API security, and design patterns at senior tiers.',
    systemDesignFocus:
      'Enterprise cloud migration, legacy strangler-fig modernization, multi-region DR, RBAC compliance, cost governance.',
    behavioralFramework:
      'Client trust, structured milestone delivery, cross-cultural team mentorship, pragmatic scope management.',
    uniqueRound:
      'Combined Resume Deep-Dive & Managerial Client Scenario Simulation.',
    pacingProfile:
      'Methodical and supportive for entry/easy; strict on SLA governance, ROI, and enterprise trade-offs at senior/hard.',
    rubricRedFlags: [
      'Unable to explain databases, OOP, or core mechanics behind resume projects',
      'Overlooking client SLA, backward compatibility, or operational handover',
    ],
  },
  enterpriseSaas: {
    archetype: 'Enterprise B2B SaaS · Multi-Tenancy, Reliability & Maintainability',
    cultureSummary:
      'Prioritizes clean modular software engineering, multi-tenant data isolation, predictable SLAs, and collaborative customer empathy.',
    roundStructure:
      'Recruiter/Coding Screen -> Onsite Loops (Code Craft, Multi-Tenant System Design, Cross-Functional Behavioral).',
    codingStyle:
      'Clean readable abstractions, API validation, extensible OOP/functional design, unit-testability.',
    systemDesignFocus:
      'Multi-tenant isolation, noisy-neighbor rate limiting, RBAC permissions, async background job queues, audit trails.',
    behavioralFramework:
      'Cross-functional clarity, customer empathy, blameless retrospectives, sustainable engineering.',
    uniqueRound:
      'Clean Code & API Ergonomics Design paired with cross-functional collaboration.',
    pacingProfile:
      'Collaborative and structured — values clarity, maintainability, and thoughtful edge-case coverage.',
    rubricRedFlags: [
      'Missing tenant isolation or unbounded bulk queries in multi-tenant APIs',
      'Brittle abstractions tightly coupled to a single use case',
    ],
  },
  consumerScale: {
    archetype: 'High-Scale Consumer Platform · Latency, Experimentation & Real-Time Feeds',
    cultureSummary:
      'Driven by snappy user experiences, global caching, real-time notifications/feeds, and measurable product impact.',
    roundStructure:
      'Coding Screen -> Onsite Loops (DSA/Product Coding, Consumer Architecture, Product/Values Behavioral).',
    codingStyle:
      'Fast, clean algorithms (sliding windows, graphs, heaps, async UI/state handling) with strong edge-case coverage.',
    systemDesignFocus:
      'Read-heavy CDN/cache hierarchies, fan-out feeds, real-time WebSocket presence, ranking/search pipelines, A/B experimentation.',
    behavioralFramework:
      'Impact orientation, user obsession, fast iteration balanced with telemetry and quality.',
    uniqueRound:
      'Product-Engineering Architecture balancing UX latency with backend fan-out cost.',
    pacingProfile:
      'Energetic and product-aware — pushes read/write ratios, p99 latency, and experimentation metrics.',
    rubricRedFlags: [
      'Ignoring read-heavy caching or fan-out spikes from celebrity/viral entities',
      'Building features without success metrics or guardrail monitoring',
    ],
  },
};

const COMPANY_DOMAIN_MAP: Record<string, keyof typeof DOMAIN_ARCHETYPES> = {
  morganstanley: 'fintech',
  robinhood: 'fintech',
  plaid: 'fintech',
  square: 'fintech',
  paypal: 'fintech',
  hcl: 'consulting',
  techmahindra: 'consulting',
  cognizant: 'consulting',
  accenture: 'consulting',
  capgemini: 'consulting',
  deloitte: 'consulting',
  pwc: 'consulting',
  ey: 'consulting',
  kpmg: 'consulting',
  ibm: 'enterpriseSaas',
  sap: 'enterpriseSaas',
  servicenow: 'enterpriseSaas',
  snowflake: 'enterpriseSaas',
  slack: 'enterpriseSaas',
  zoom: 'enterpriseSaas',
  dropbox: 'enterpriseSaas',
  box: 'enterpriseSaas',
  twilio: 'enterpriseSaas',
  shopify: 'enterpriseSaas',
  intel: 'enterpriseSaas',
  linkedin: 'consumerScale',
  twitter: 'consumerScale',
  snapchat: 'consumerScale',
  pinterest: 'consumerScale',
  reddit: 'consumerScale',
  bytedance: 'consumerScale',
  etsy: 'consumerScale',
  zillow: 'consumerScale',
  doordash: 'consumerScale',
  instacart: 'consumerScale',
};

export function getCompanyPlaybook(company: string): CompanyPlaybook {
  const cleanName = (company || 'Google').trim();
  const key = normalizeKey(cleanName);
  if (NORMALIZED_FLAGSHIPS[key]) {
    return NORMALIZED_FLAGSHIPS[key];
  }
  const domain = COMPANY_DOMAIN_MAP[key] || 'consumerScale';
  const base = DOMAIN_ARCHETYPES[domain];
  return {
    company: cleanName,
    ...base,
  };
}

export function getExperienceTier(experienceYears: number): {
  tier: ExperienceTier;
  titleLabel: string;
  yearsDisplay: string;
  questionScope: string;
} {
  const yrs = Math.max(0, Math.min(30, Number(experienceYears) || 0));
  if (yrs <= 1) {
    return {
      tier: 'Entry',
      titleLabel: 'Entry / New Grad (L3 / SDE-1)',
      yearsDisplay: yrs === 0 ? '0 yrs (Fresher)' : '1 yr',
      questionScope:
        'Core CS fundamentals, clean data structures, single-component debugging, academic/internship projects, and coachable reasoning.',
    };
  }
  if (yrs <= 4) {
    return {
      tier: 'Mid-Level',
      titleLabel: 'Mid-Level Engineer (L4 / SDE-2)',
      yearsDisplay: `${yrs} yrs`,
      questionScope:
        'End-to-end feature ownership, production APIs, SQL/NoSQL modeling, practical testing, and scoped service design.',
    };
  }
  if (yrs <= 9) {
    return {
      tier: 'Senior',
      titleLabel: 'Senior Engineer (L5 / Senior)',
      yearsDisplay: `${yrs} yrs`,
      questionScope:
        'Ambiguous distributed system trade-offs, cross-team technical leadership, incident ownership, reliability SLAs, and mentorship.',
    };
  }
  if (yrs <= 16) {
    return {
      tier: 'Staff',
      titleLabel: 'Staff Engineer (L6 / Staff)',
      yearsDisplay: `${yrs} yrs`,
      questionScope:
        'Multi-year org-wide architecture, build-vs-buy strategy, technical debt retirement, cross-org alignment without authority, and blast-radius isolation.',
    };
  }
  return {
    tier: 'Principal',
    titleLabel: 'Principal / Distinguished (L7+ · 17-25+ yrs)',
    yearsDisplay: yrs >= 25 ? '25+ yrs' : `${yrs} yrs`,
    questionScope:
      'Company-wide platform economics, existential risk mitigation, executive alignment, multi-region architectural governance, and long-horizon engineering strategy.',
  };
}

export function getLevelCalibration(
  experienceYears: number,
  difficultyInput: string
): LevelCalibration {
  const diff: 'Easy' | 'Medium' | 'Hard' =
    difficultyInput === 'Easy' || difficultyInput === 'Hard'
      ? difficultyInput
      : 'Medium';
  const base = getExperienceTier(experienceYears);

  let promptDirective = '';
  let pacingDirective = '';
  let evaluationBar = '';
  let silencePatienceMs = 5500;
  let recommendedMinutes = 30;

  if (diff === 'Easy') {
    silencePatienceMs = 7500;
    recommendedMinutes = 20;
    pacingDirective =
      'CALM & GUIDED PACING (EASY): Ask ONE focused, digestible question at a time. Never stack multi-part questions or fire rapid-fire interruptions. Give the candidate room to think, warmly acknowledge partial steps, and provide a gentle nudge if stuck.';
    if (base.tier === 'Entry') {
      promptDirective =
        'Ask genuine entry-level (0-1 yr) warm-up / foundational questions appropriate for this company: core language/CS fundamentals, clean straightforward coding logic, or walking through a personal/college project step by step. Zero senior distributed-systems grilling.';
      evaluationBar =
        'Evaluate on clarity of foundational understanding, honest reasoning, willingness to think step-by-step, and basic correctness—NOT Staff/Principal distributed systems depth.';
    } else if (base.tier === 'Mid-Level' || base.tier === 'Senior') {
      promptDirective = `Keep questions well-scoped and approachable for a ${base.titleLabel}: focus on bread-and-butter day-to-day engineering, clean API contracts, or structured STAR behavioral storytelling without adversarial traps.`;
      evaluationBar = `Evaluate against baseline expectations for ${base.titleLabel} with supportive weighting on clean communication and practical fundamentals.`;
    } else {
      promptDirective = `Focus on clean foundational architecture framing and crisp executive communication suited to a warm-up loop for a ${base.titleLabel}.`;
      evaluationBar = `Evaluate clarity, sound fundamentals, and structured judgment for a ${base.titleLabel} warm-up round.`;
    }
  } else if (diff === 'Medium') {
    silencePatienceMs = 5500;
    recommendedMinutes = 30;
    pacingDirective =
      'BALANCED PRODUCTION PACING (MEDIUM): Ask one clear primary question per turn, listen carefully, and follow up naturally on missing edge cases, complexity, or concrete trade-offs.';
    if (base.tier === 'Entry') {
      promptDirective =
        'Real-world New Grad / Junior loop standard: solid DSA (arrays/maps/trees/BFS), clean code walkthroughs, SQL/API fundamentals, and concrete ownership stories from projects or internships.';
      evaluationBar =
        'Hold true Entry-level (SDE-1/L3) bar: clean problem decomposition, edge-case checks, complexity awareness, and honest teamwork.';
    } else if (base.tier === 'Mid-Level') {
      promptDirective =
        'Real-world Mid-Level (L4/SDE-2) onsite standard: optimal algorithms, debugging production race conditions, practical service design, and STAR impact stories.';
      evaluationBar =
        'Hold realistic Mid-Level bar: independent execution, solid complexity/database instincts, and measurable project ownership.';
    } else if (base.tier === 'Senior') {
      promptDirective =
        'Real-world Senior (L5) onsite standard: end-to-end distributed architecture, operational trade-offs, cross-team technical influence, and quantifiable STAR impact.';
      evaluationBar =
        'Hold authentic Senior (L5) bar: expects proactive edge-case detection, trade-off articulation, and cross-team ownership.';
    } else {
      promptDirective = `Authentic ${base.titleLabel} onsite standard: multi-team platform design, migration risk mitigation, build-vs-buy trade-offs, and organizational alignment.`;
      evaluationBar = `Hold authentic ${base.titleLabel} bar: requires quantitative scale math, failure-domain isolation, and leadership clarity.`;
    }
  } else {
    // Hard
    silencePatienceMs = 5000;
    recommendedMinutes = 45;
    pacingDirective =
      'HIGH-BAR EXECUTIVE / BAR-RAISER PACING (HARD): Probe deeply on ambiguities, bottlenecks, consistency/failure modes, and exact metrics. Do not accept hand-waving or buzzwords—challenge weak assumptions concisely and incisively.';
    if (base.tier === 'Entry') {
      promptDirective =
        'Top-decile New Grad Hard loop: non-trivial algorithms (graphs/DP/sliding-window), tricky edge cases, strict Big-O proof, and probing every technical claim made on resume projects.';
      evaluationBar =
        'Strict top-10% New Grad / Intern-conversion bar: must handle optimal complexity, edge cases, and explain every line of claimed project work cleanly.';
    } else if (base.tier === 'Mid-Level') {
      promptDirective =
        'Tough Mid-Level Bar-Raiser loop: tricky concurrency/locking bugs, optimal multi-constraint coding, high-QPS partitioning bottlenecks, and deep-dive behavioral scrutiny.';
      evaluationBar =
        'Strict high-bar Mid-Level evaluation: penalizes superficial buzzwords, missing concurrency invariants, or unquantified results.';
    } else if (base.tier === 'Senior') {
      promptDirective =
        'Senior (L5) Bar-Raiser loop: multi-region consistency vs latency trade-offs, tail-latency spikes, graceful degradation under cascading failure, and tough conflict resolution.';
      evaluationBar =
        'Uncompromising Senior Bar-Raiser rubric: demands quantitative estimates, concrete failure recovery, and crystal-clear personal ("I") impact.';
    } else if (base.tier === 'Staff') {
      promptDirective =
        'Staff (L6) Calibration Loop (10-16 yrs): ask multi-year platform architecture, zero-downtime migration across dozens of services, organizational alignment across disagreeing VPs/teams, and ROI trade-offs.';
      evaluationBar =
        'True Staff (L6) Hiring Committee bar: requires org-level leverage, quantified cost/latency envelopes, blast-radius governance, and strategic clarity.';
    } else {
      promptDirective =
        'Principal / Distinguished (L7+, 17-25+ yrs) Executive Loop: interrogate company-wide multi-region active-active failover, split-brain consensus, existential security/compliance risk, multi-million-dollar compute efficiency, and org-shaping leadership.';
      evaluationBar =
        'Elite Principal / Distinguished (L7+) rubric: superficial textbook answers score low; demands battle-tested war stories, first-principles distributed physics, and executive business alignment.';
    }
  }

  return {
    tier: base.tier,
    titleLabel: base.titleLabel,
    yearsDisplay: base.yearsDisplay,
    difficulty: diff,
    questionScope: base.questionScope,
    promptDirective,
    pacingDirective,
    evaluationBar,
    silencePatienceMs,
    recommendedMinutes,
  };
}

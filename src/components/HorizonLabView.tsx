import React, { useState } from 'react';
import { InterviewConfig, User } from '../types';
import {
  ALGORITHM_EVOLUTION_CASES,
  CURRENT_2026_TRACKS,
  FRONTIER_5026_TRACKS,
  HORIZON_5026_PILLARS,
} from '../data/horizon5026';
import {
  ChronosDirection,
  QuantumChronosTransition,
} from './QuantumChronosTransition';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Cpu,
  Layers,
  Loader2,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface HorizonLabViewProps {
  user?: User | null;
  onNavigate: (view: any) => void;
  onLaunchTrack: (prefill: Partial<InterviewConfig>) => void;
}

type HorizonTabId = 'pillars' | 'algorithms' | 'dossier';
type EraMode = '2026' | '5026';

interface HorizonDossier {
  topic: string;
  eraTitle: string;
  substrateShift: string;
  algorithmBreakthrough: string;
  applicationForm: string;
  humanAiSymbiosis: string;
  paradigmComparisons: {
    dimension: string;
    year2026: string;
    year5026: string;
  }[];
  frontierInterviewQuestions: {
    question: string;
    whyItMatters: string;
  }[];
}

const QUICK_TOPICS = [
  'Life of an Application in 5026',
  'Ephemeral Semantic Web',
  'Reversible Optical Compute',
  'Self-Healing AI Meshes',
  'Zero-Knowledge Identity',
];

export function HorizonLabView({
  onNavigate,
  onLaunchTrack,
}: HorizonLabViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<HorizonTabId>('pillars');
  const [eraMode, setEraMode] = useState<EraMode>('5026');
  const [chronosState, setChronosState] = useState<{
    triggerKey: number;
    direction: ChronosDirection;
    label?: string;
  }>({
    triggerKey: 1,
    direction: 'forward',
    label: 'Quantum Chronos · Entering Year 5026 Horizon Lab',
  });

  const [selectedPillarId, setSelectedPillarId] = useState(
    HORIZON_5026_PILLARS[3].id
  );
  const [selectedAlgoId, setSelectedAlgoId] = useState(
    ALGORITHM_EVOLUTION_CASES[0].id
  );

  const [researchTopic, setResearchTopic] = useState(
    'Life of an Application in 5026'
  );
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<HorizonDossier | null>(null);

  const selectedPillar =
    HORIZON_5026_PILLARS.find((p) => p.id === selectedPillarId) ||
    HORIZON_5026_PILLARS[0];

  const selectedAlgo =
    ALGORITHM_EVOLUTION_CASES.find((a) => a.id === selectedAlgoId) ||
    ALGORITHM_EVOLUTION_CASES[0];

  const handleSwitchEra = (nextEra: EraMode) => {
    if (nextEra === eraMode) return;
    setEraMode(nextEra);
    setChronosState((prev) => ({
      triggerKey: prev.triggerKey + 1,
      direction: nextEra === '5026' ? 'forward' : 'rewind',
      label:
        nextEra === '5026'
          ? 'Quantum Chronos · Warping +3,000 Years Ahead'
          : 'Quantum Chronos · Shifting to 2026 Classical Baseline',
    }));
  };

  const activeTracks =
    eraMode === '5026' ? FRONTIER_5026_TRACKS : CURRENT_2026_TRACKS;

  const synthesizeDossier = async (topicOverride?: string) => {
    const query = (topicOverride ?? researchTopic).trim();
    if (!query) return;
    setResearchTopic(query);
    setActiveTab('dossier');
    if (eraMode !== '5026') {
      handleSwitchEra('5026');
    }
    setLoadingDossier(true);
    setDossierError(null);
    try {
      const res = await fetch('/api/horizon-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query }),
      });
      if (!res.ok) {
        throw new Error('Failed to synthesize Year 5026 dossier.');
      }
      const data = (await res.json()) as HorizonDossier;
      setDossier(data);
    } catch {
      setDossierError(
        'Unable to synthesize a custom Year 5026 dossier right now. Explore the curated research pillars and interview modules below.'
      );
    } finally {
      setLoadingDossier(false);
    }
  };

  const temporalStageMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.985, filter: 'blur(5px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 1.015, filter: 'blur(4px)' },
        transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">
      {/* Quantum Chronos Particle Distortion Overlay */}
      <QuantumChronosTransition
        triggerKey={chronosState.triggerKey}
        direction={chronosState.direction}
        label={chronosState.label}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e4ddf5] dark:border-[#26193f] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Back to Dashboard"
            onClick={() => onNavigate('dashboard')}
            className="p-2.5 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] hover:border-violet-500/50 rounded-xl text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#140f1f] dark:text-white flex items-center gap-2.5">
              <Sparkles
                className="text-violet-700 dark:text-violet-400 shrink-0"
                size={24}
              />
              <span>Year 5026 Horizon Lab</span>
            </h1>
            <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm mt-1">
              Researching post-silicon applications, ephemeral semantic
              interfaces, and sub-linear algorithms across a 3,000-year delta.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Interactive Era Lens Switcher */}
          <div
            role="group"
            aria-label="Switch interview era lens"
            className="inline-flex items-center p-1 rounded-xl bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f]"
          >
            <button
              type="button"
              aria-pressed={eraMode === '2026'}
              onClick={() => handleSwitchEra('2026')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                eraMode === '2026'
                  ? 'amoled-btn-primary text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              <Clock size={13} />
              <span>2026 Current</span>
            </button>
            <button
              type="button"
              aria-pressed={eraMode === '5026'}
              onClick={() => handleSwitchEra('5026')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                eraMode === '5026'
                  ? 'amoled-btn-primary text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>5026 Horizon</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => synthesizeDossier()}
            disabled={loadingDossier}
            className="amoled-btn-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            {loadingDossier ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Zap size={15} />
            )}
            <span>Synthesize Dossier</span>
          </button>
        </div>
      </div>

      {/* Research Synthesizer Bar */}
      <div className="amoled-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5170] dark:text-[#a69cbe]"
            />
            <input
              type="text"
              aria-label="Topic to research 3,000 years ahead"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') synthesizeDossier();
              }}
              placeholder="Research any domain in Year 5026 (e.g. Zero-Knowledge Identity, Photonic Routing, Ephemeral Web)..."
              className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl py-3 pl-11 pr-4 text-sm text-[#140f1f] dark:text-white placeholder:text-[#5a5170] dark:placeholder:text-[#a69cbe] focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => synthesizeDossier()}
            disabled={loadingDossier}
            className="amoled-btn-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {loadingDossier ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{loadingDossier ? 'Researching...' : 'Run Research'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#5a5170] dark:text-[#a69cbe] mr-1">
            Horizon queries:
          </span>
          {QUICK_TOPICS.map((qt) => (
            <button
              key={qt}
              type="button"
              onClick={() => synthesizeDossier(qt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                researchTopic === qt
                  ? 'bg-violet-600/15 border-violet-500 text-violet-700 dark:text-violet-300'
                  : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#362f47] dark:text-[#d8d0ea] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              {qt}
            </button>
          ))}
        </div>
      </div>

      {/* Section Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ddf5] dark:border-[#26193f] pb-3">
        <div
          role="tablist"
          aria-label="Year 5026 research sections"
          className="flex flex-wrap items-center gap-2"
        >
          {[
            {
              id: 'pillars' as HorizonTabId,
              label: '5-Pillar 3,000-Year Research',
              icon: <Layers size={15} />,
            },
            {
              id: 'algorithms' as HorizonTabId,
              label: 'Algorithmic Evolution Lab',
              icon: <Cpu size={15} />,
            },
            {
              id: 'dossier' as HorizonTabId,
              label: 'Era Interview Modules & Dossier',
              icon: <ShieldCheck size={15} />,
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'amoled-btn-primary text-white'
                    : 'bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono tabular-nums text-[#5a5170] dark:text-[#a69cbe]">
          Active Temporal Frame · Year {eraMode}
        </div>
      </div>

      {/* Temporal Stage with Motion Distortion Across Era & Module Transitions */}
      <AnimatePresence mode="wait">
        {activeTab === 'pillars' && (
          <motion.div
            key={`pillars-${eraMode}`}
            {...temporalStageMotion}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Pillar Selector */}
              <div className="lg:col-span-5 space-y-3">
                {HORIZON_5026_PILLARS.map((pillar) => {
                  const active = pillar.id === selectedPillar.id;
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedPillarId(pillar.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer kinetic-card ${
                        active
                          ? 'bg-violet-600/12 border-violet-500 shadow-lg shadow-violet-500/10'
                          : 'amoled-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-violet-700 dark:text-violet-400 mb-1">
                        <span>Horizon {pillar.eraCode}</span>
                        <span>2026 → 5026</span>
                      </div>
                      <div className="text-sm font-bold text-[#140f1f] dark:text-white">
                        {pillar.title}
                      </div>
                      <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-1">
                        {pillar.horizonShift}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Active Pillar Dossier */}
              <div className="lg:col-span-7 amoled-surface rounded-2xl p-6 sm:p-7 space-y-6">
                <div className="space-y-2 border-b border-[#e4ddf5] dark:border-[#26193f] pb-5">
                  <div className="text-xs font-mono font-semibold text-violet-700 dark:text-violet-400">
                    Pillar {selectedPillar.eraCode} ·{' '}
                    {selectedPillar.horizonShift}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#140f1f] dark:text-white">
                    {selectedPillar.title}
                  </h2>
                  <p className="text-sm text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                    {selectedPillar.summary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wide text-[#5a5170] dark:text-[#a69cbe]">
                    Key Technological &amp; Mathematical Breakthroughs
                  </h3>
                  <ul className="space-y-2.5">
                    {selectedPillar.keyBreakthroughs.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-3.5 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-sm text-[#140f1f] dark:text-[#f5f3ff] flex items-start gap-3"
                      >
                        <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400 mt-0.5 tabular-nums">
                          0{idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/35 space-y-1.5">
                  <div className="text-xs font-bold text-violet-800 dark:text-violet-300">
                    Impact on Applications &amp; Websites After 3,000 Years
                  </div>
                  <p className="text-sm text-[#140f1f] dark:text-[#f5f3ff] leading-relaxed">
                    {selectedPillar.applicationImpact}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => synthesizeDossier(selectedPillar.title)}
                    className="px-4 py-2.5 rounded-xl amoled-btn-primary text-white text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles size={14} />
                    <span>Synthesize Deep AI Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLaunchTrack({
                        company: 'OpenAI',
                        role: 'Principal Engineer',
                        type: 'System Design',
                        difficulty: 'Hard',
                        experience: eraMode === '5026' ? 15 : 8,
                        focusTopics:
                          eraMode === '5026'
                            ? `Year 5026 Horizon · ${selectedPillar.title}: ${selectedPillar.applicationImpact}`
                            : `Year 2026 Classical Baseline · ${selectedPillar.title}: Production trade-offs and current systems constraints`,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] hover:border-violet-500 text-xs font-semibold text-[#140f1f] dark:text-white flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <PlayCircle
                      size={14}
                      className="text-violet-600 dark:text-violet-400"
                    />
                    <span>Practice {eraMode} Era Drill</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Era-Matched Interview Modules Strip */}
            <EraModuleGrid
              eraMode={eraMode}
              activeTracks={activeTracks}
              onSwitchEra={handleSwitchEra}
              onLaunchTrack={onLaunchTrack}
            />
          </motion.div>
        )}

        {activeTab === 'algorithms' && (
          <motion.div
            key={`algorithms-${eraMode}`}
            {...temporalStageMotion}
            className="space-y-5"
          >
            <div className="flex flex-wrap gap-2">
              {ALGORITHM_EVOLUTION_CASES.map((algo) => (
                <button
                  key={algo.id}
                  type="button"
                  aria-pressed={algo.id === selectedAlgo.id}
                  onClick={() => setSelectedAlgoId(algo.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    algo.id === selectedAlgo.id
                      ? 'bg-violet-600/15 border-violet-500 text-violet-700 dark:text-violet-300'
                      : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#362f47] dark:text-[#d8d0ea]'
                  }`}
                >
                  {algo.domain}
                </button>
              ))}
            </div>

            <div className="amoled-surface rounded-2xl p-6 space-y-5">
              <div className="border-b border-[#e4ddf5] dark:border-[#26193f] pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-violet-700 dark:text-violet-400">
                    {selectedAlgo.domain}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#140f1f] dark:text-white mt-1">
                    Problem: {selectedAlgo.problem}
                  </h2>
                </div>
                <div className="text-xs font-mono tabular-nums text-[#5a5170] dark:text-[#a69cbe]">
                  Highlighted Epoch · Year {eraMode}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Brute Force */}
                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-3">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
                    Naive Brute Force (Eliminated)
                  </div>
                  <div className="font-mono text-sm font-bold text-[#140f1f] dark:text-white tabular-nums">
                    {selectedAlgo.bruteForce2026.complexity}
                  </div>
                  <p className="text-xs text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                    {selectedAlgo.bruteForce2026.approach}
                  </p>
                  <div className="pt-2 border-t border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                    Failure mode: {selectedAlgo.bruteForce2026.bottleneck}
                  </div>
                </div>

                {/* 2026 Optimal Classical */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                    eraMode === '2026'
                      ? 'bg-violet-600/12 border-violet-500 shadow-lg shadow-violet-500/10'
                      : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f]'
                  }`}
                >
                  <div className="text-xs font-bold text-violet-700 dark:text-violet-400">
                    2026 Production Optimal
                  </div>
                  <div className="font-mono text-sm font-bold text-[#140f1f] dark:text-white tabular-nums">
                    {selectedAlgo.optimal2026.complexity}
                  </div>
                  <p className="text-xs text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                    {selectedAlgo.optimal2026.approach}
                  </p>
                  <div className="pt-2 border-t border-[#e4ddf5] dark:border-[#26193f] text-xs text-emerald-700 dark:text-emerald-400">
                    Production gain: {selectedAlgo.optimal2026.gain}
                  </div>
                </div>

                {/* 5026 Horizon Paradigm */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                    eraMode === '5026'
                      ? 'bg-violet-600/12 border-violet-500 shadow-lg shadow-violet-500/10'
                      : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f]'
                  }`}
                >
                  <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    Year 5026 Post-Silicon Horizon
                  </div>
                  <div className="font-mono text-sm font-bold text-[#140f1f] dark:text-white tabular-nums">
                    {selectedAlgo.horizon5026.complexity}
                  </div>
                  <p className="text-xs text-[#140f1f] dark:text-[#f5f3ff] leading-relaxed">
                    {selectedAlgo.horizon5026.approach}
                  </p>
                  <div className="pt-2 border-t border-violet-500/30 text-xs text-violet-800 dark:text-violet-200">
                    Shift: {selectedAlgo.horizon5026.paradigm}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dossier' && (
          <motion.div
            key={`dossier-${eraMode}`}
            {...temporalStageMotion}
            className="space-y-6"
          >
            {loadingDossier && (
              <div
                aria-live="polite"
                className="amoled-surface rounded-2xl py-16 flex flex-col items-center justify-center gap-3"
              >
                <Loader2
                  size={28}
                  className="animate-spin text-violet-700 dark:text-violet-400"
                />
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Synthesizing 3,000-year evolution research for “{researchTopic}”...
                </p>
              </div>
            )}

            {dossierError && !loadingDossier && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-700 dark:text-rose-300"
              >
                {dossierError}
              </div>
            )}

            {dossier && !loadingDossier && (
              <div className="amoled-surface rounded-2xl p-6 space-y-6">
                <div className="border-b border-[#e4ddf5] dark:border-[#26193f] pb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-violet-700 dark:text-violet-400">
                      Topic · {dossier.topic}
                    </div>
                    <h2 className="text-xl font-bold text-[#140f1f] dark:text-white mt-0.5">
                      {dossier.eraTitle}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Compute Substrate Shift', text: dossier.substrateShift },
                    {
                      label: 'Algorithmic Breakthrough',
                      text: dossier.algorithmBreakthrough,
                    },
                    {
                      label: 'Life of an Application / Website',
                      text: dossier.applicationForm,
                    },
                    {
                      label: 'Human–AI Symbiosis & Custody',
                      text: dossier.humanAiSymbiosis,
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="p-4 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] space-y-1.5"
                    >
                      <div className="text-xs font-bold text-violet-700 dark:text-violet-400">
                        {card.label}
                      </div>
                      <p className="text-sm text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                        {card.text}
                      </p>
                    </div>
                  ))}
                </div>

                {dossier.paradigmComparisons?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wide text-[#5a5170] dark:text-[#a69cbe]">
                      2026 vs. Year 5026 Architecture Matrix
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {dossier.paradigmComparisons.map((row, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] space-y-2 text-xs"
                        >
                          <div className="font-bold text-[#140f1f] dark:text-white">
                            {row.dimension}
                          </div>
                          <div className="text-[#5a5170] dark:text-[#a69cbe]">
                            <strong>2026:</strong> {row.year2026}
                          </div>
                          <div className="text-violet-700 dark:text-violet-300">
                            <strong>5026:</strong> {row.year5026}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dossier.frontierInterviewQuestions?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wide text-[#5a5170] dark:text-[#a69cbe]">
                      Practice Frontier Questions From This Dossier
                    </h3>
                    <div className="space-y-3">
                      {dossier.frontierInterviewQuestions.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-[#140f1f] dark:text-white">
                              {item.question}
                            </div>
                            <div className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
                              {item.whyItMatters}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onLaunchTrack({
                                company: 'OpenAI',
                                role: 'Staff AI Engineer',
                                type: 'System Design',
                                difficulty: 'Hard',
                                experience: 14,
                                focusTopics: `${dossier.topic}: ${item.question}`,
                              })
                            }
                            className="px-4 py-2 rounded-xl amoled-btn-primary text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap self-start sm:self-center"
                          >
                            <PlayCircle size={14} />
                            <span>Practice Now</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Era-Matched Interview Modules */}
            <EraModuleGrid
              eraMode={eraMode}
              activeTracks={activeTracks}
              onSwitchEra={handleSwitchEra}
              onLaunchTrack={onLaunchTrack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EraModuleGrid({
  eraMode,
  activeTracks,
  onSwitchEra,
  onLaunchTrack,
}: {
  eraMode: EraMode;
  activeTracks: typeof FRONTIER_5026_TRACKS;
  onSwitchEra: (next: EraMode) => void;
  onLaunchTrack: (prefill: Partial<InterviewConfig>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#140f1f] dark:text-white">
            {eraMode === '5026'
              ? 'Year 5026 Future-Era Interview Modules'
              : 'Year 2026 Current-Era Interview Modules'}
          </h2>
          <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
            {eraMode === '5026'
              ? 'Post-silicon causal consensus, proof-carrying algorithms, and ephemeral UI prompts.'
              : 'Present-day distributed systems, optimal HNSW/lock-free DSA, and production AI guardrails.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSwitchEra(eraMode === '5026' ? '2026' : '5026')}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] hover:border-violet-500 text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Clock size={13} />
          <span>
            {eraMode === '5026'
              ? 'Switch to 2026 Current Modules'
              : 'Warp to 5026 Future Modules'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTracks.map((track) => (
          <div
            key={`${eraMode}-${track.id}`}
            className="amoled-surface kinetic-card rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="text-xs font-mono tabular-nums text-violet-700 dark:text-violet-400">
                Year {eraMode} · {track.company} · {track.type} ·{' '}
                {track.experience} yrs
              </div>
              <h3 className="text-sm font-bold text-[#140f1f] dark:text-white">
                {track.title}
              </h3>
              <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] leading-relaxed">
                {track.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onLaunchTrack({
                  company: track.company,
                  role: track.role,
                  type: track.type,
                  experience: track.experience,
                  difficulty: track.difficulty,
                  focusTopics: track.focusTopics,
                })
              }
              className="w-full py-2.5 px-4 rounded-xl amoled-btn-primary text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Launch {eraMode} Module</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

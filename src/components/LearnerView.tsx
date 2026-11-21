import React, { useState, useEffect } from 'react';
import { User, InterviewConfig } from '../types';
import {
  ArrowLeft,
  BookOpen,
  Search,
  Sparkles,
  RefreshCcw,
  ExternalLink,
  Code2,
  Cpu,
  PlayCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LearnerViewProps {
  user?: User | null;
  onNavigate: (view: any) => void;
  onPracticeConcept?: (prefill: Partial<InterviewConfig>) => void;
}

const DEFAULT_TOPICS = [
  'System Design',
  'Distributed Caching',
  'React Concurrency',
  'SQL Indexing & Query Plans',
  'LLM Architecture',
];

export function LearnerView({
  user,
  onNavigate,
  onPracticeConcept,
}: LearnerViewProps) {
  const [topic, setTopic] = useState('System Design');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const resumeSkills = (user?.resumeProfile?.skills || []).slice(0, 4);
  const quickTopics = Array.from(
    new Set([...resumeSkills, ...DEFAULT_TOPICS])
  ).slice(0, 6);

  const fetchModule = async (searchTopic: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic }),
      });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ error: 'Unable to load learning module right now.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule(topic);
  }, []);

  const resolveSafeResourceUrl = (
    rawUrl: string | undefined,
    name: string
  ) => {
    if (rawUrl && /^https:\/\//i.test(rawUrl.trim())) {
      return rawUrl.trim();
    }
    return `https://www.google.com/search?q=${encodeURIComponent(
      `${name} ${topic} engineering documentation`
    )}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
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
              <Cpu className="text-violet-700 dark:text-violet-400" size={24} />
              <span>Auto-Learner Curriculum</span>
            </h1>
            <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm mt-1">
              Explore modern system architecture trends, technical resources,
              and targeted interview drills.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('horizon')}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] hover:border-violet-500 text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2 self-start md:self-auto cursor-pointer whitespace-nowrap"
        >
          <Sparkles size={14} />
          <span>Explore Year 5026 Horizon Lab</span>
        </button>
      </div>

      <div className="amoled-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5170] dark:text-[#a69cbe]"
            />
            <input
              type="text"
              aria-label="Search curriculum concept"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Search any concept (e.g. Distributed Locks, GraphQL Federation, Kafka)..."
              className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl py-3 pl-11 pr-4 text-sm text-[#140f1f] dark:text-white placeholder:text-[#5a5170] dark:placeholder:text-[#a69cbe] focus:outline-none focus:border-violet-500 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && fetchModule(topic)}
            />
          </div>
          <button
            type="button"
            onClick={() => fetchModule(topic)}
            disabled={loading}
            className="flex items-center justify-center gap-2 amoled-btn-primary text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shrink-0 cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{loading ? 'Generating...' : 'Generate Module'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#5a5170] dark:text-[#a69cbe] mr-1">
            Quick topics:
          </span>
          {quickTopics.map((qt) => (
            <button
              type="button"
              key={qt}
              aria-pressed={topic === qt}
              onClick={() => {
                setTopic(qt);
                fetchModule(qt);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                topic === qt
                  ? 'bg-violet-600/15 border-violet-500 text-violet-700 dark:text-violet-300'
                  : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#362f47] dark:text-[#d8d0ea] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              {qt}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
            className="amoled-surface rounded-2xl py-16 flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-10 h-10 border-2 border-violet-500/25 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin" />
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
              Synthesizing industry curriculum for {topic}...
            </p>
          </motion.div>
        ) : data?.error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
            className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl text-center"
          >
            <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">
              {data.error}
            </p>
          </motion.div>
        ) : data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#e4ddf5] dark:border-[#26193f] pb-3">
              <h2 className="text-xl font-bold text-[#140f1f] dark:text-white">
                {data.title}
              </h2>
              <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-mono">
                Updated {data.lastUpdated}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="amoled-surface rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Sparkles size={17} />
                  <span>Key Industry Patterns</span>
                </h3>
                <ul className="space-y-3 text-sm text-[#362f47] dark:text-[#d8d0ea]">
                  {data.trends?.map((t: string, i: number) => (
                    <li key={i} className="flex gap-2.5 leading-relaxed">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        •
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="amoled-surface rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                  <BookOpen size={17} />
                  <span>Recommended Reading</span>
                </h3>
                <ul className="space-y-3">
                  {data.resources?.map((r: any, i: number) => {
                    const href = resolveSafeResourceUrl(r.url, r.name);
                    return (
                      <li key={i}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2.5 text-sm text-[#362f47] dark:text-[#d8d0ea] hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                        >
                          <ExternalLink
                            size={15}
                            className="text-violet-700 dark:text-violet-400 mt-1 shrink-0"
                          />
                          <span>{r.name}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="amoled-surface rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-violet-700 dark:text-purple-400 flex items-center gap-2">
                <Code2 size={18} />
                <span>Curated Interview Prompts</span>
              </h3>
              <div className="space-y-3">
                {data.newQuestions?.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono text-violet-700 dark:text-violet-400">
                        0{i + 1}. {q.concept}
                      </div>
                      <p className="text-[#140f1f] dark:text-white font-semibold text-base">
                        {q.question}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onPracticeConcept
                          ? onPracticeConcept({
                              focusTopics: `${topic}: ${q.question}`,
                            })
                          : onNavigate('setup')
                      }
                      className="px-4 py-2 rounded-xl amoled-btn-primary text-xs font-bold text-white flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap self-start sm:self-center"
                    >
                      <PlayCircle size={14} />
                      <span>Practice</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

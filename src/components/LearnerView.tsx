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
  const quickTopics = Array.from(new Set([...resumeSkills, ...DEFAULT_TOPICS])).slice(
    0,
    6
  );

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

  const resolveSafeResourceUrl = (rawUrl: string | undefined, name: string) => {
    if (rawUrl && /^https:\/\//i.test(rawUrl.trim())) {
      return rawUrl.trim();
    }
    return `https://www.google.com/search?q=${encodeURIComponent(
      `${name} ${topic} engineering documentation`
    )}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16223b] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="p-2.5 bg-black border border-[#16223b] hover:border-blue-500/40 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Cpu className="text-blue-400" size={24} />
              <span>Auto-Learner Curriculum</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore modern system architecture trends, technical resources,
              and targeted interview drills.
            </p>
          </div>
        </div>
      </div>

      <div className="amoled-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Search any concept (e.g. Distributed Locks, GraphQL Federation, Kafka)..."
              className="w-full bg-black border border-[#16223b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
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
          <span className="text-xs text-slate-500 mr-1">Quick topics:</span>
          {quickTopics.map((qt) => (
            <button
              type="button"
              key={qt}
              onClick={() => {
                setTopic(qt);
                fetchModule(qt);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                topic === qt
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-black border-[#16223b] text-slate-300 hover:text-white'
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
            className="amoled-surface rounded-2xl py-16 flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs font-medium text-blue-300">
              Synthesizing industry curriculum for {topic}...
            </p>
          </motion.div>
        ) : data?.error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl text-center"
          >
            <p className="text-rose-300 text-sm font-medium">{data.error}</p>
          </motion.div>
        ) : data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#16223b] pb-3">
              <h2 className="text-xl font-bold text-white">{data.title}</h2>
              <p className="text-xs text-slate-500 font-mono">
                Updated {data.lastUpdated}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="amoled-surface rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles size={17} />
                  <span>Key Industry Patterns</span>
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  {data.trends?.map((t: string, i: number) => (
                    <li key={i} className="flex gap-2.5 leading-relaxed">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="amoled-surface rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
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
                          className="flex items-start gap-2.5 text-sm text-slate-200 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink
                            size={15}
                            className="text-blue-400 mt-1 shrink-0"
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
              <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                <Code2 size={18} />
                <span>Curated Interview Prompts</span>
              </h3>
              <div className="space-y-3">
                {data.newQuestions?.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="bg-black border border-[#16223b] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono text-blue-400">
                        0{i + 1}. {q.concept}
                      </div>
                      <p className="text-white font-semibold text-base">
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

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Search, Sparkles, RefreshCcw, ExternalLink, Code2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LearnerViewProps {
  onNavigate: (view: any) => void;
}

export function LearnerView({ onNavigate }: LearnerViewProps) {
  const [topic, setTopic] = useState('System Design');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchModule = async (searchTopic: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic })
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule(topic);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cpu className="text-indigo-400" />
            Auto-Learner AI
          </h1>
          <p className="text-slate-400 mt-1">Real-time curriculum generation dynamically discovering the latest trends and methods.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
        <div className="relative flex-1">
           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
             type="text"
             value={topic}
             onChange={e => setTopic(e.target.value)}
             placeholder="Search any tech topic, framework, or concept (e.g. distributed systems, next.js, AI coding)..."
             className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
             onKeyDown={(e) => e.key === 'Enter' && fetchModule(topic)}
           />
        </div>
        <button 
          onClick={() => fetchModule(topic)}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 shrink-0"
        >
           {loading ? <RefreshCcw size={20} className="animate-spin" /> : <Sparkles size={20} />}
           {loading ? 'Generating...' : 'Learn Now'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="py-20 flex flex-col items-center justify-center space-y-4">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Cpu size={20} className="text-indigo-400 animate-pulse" />
                </div>
             </div>
             <p className="text-indigo-400 font-medium">Scraping latest knowledge and generating curriculum...</p>
          </motion.div>
        ) : data?.error ? (
          <motion.div key="error" initial={{opacity: 0}} animate={{opacity: 1}} className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
             <p className="text-red-400 font-medium">{data.error}</p>
          </motion.div>
        ) : data ? (
          <motion.div key="content" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="space-y-6">
            
            <div className="flex items-end justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">{data.title}</h2>
              <p className="text-sm text-slate-500 font-medium tracking-wider uppercase">Auto-Updated {data.lastUpdated}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Sparkles size={20} /> Latest Industry Trends
                </h3>
                <ul className="space-y-3">
                  {data.trends?.map((t: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-300 items-start">
                      <span className="text-emerald-500 mt-1">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <BookOpen size={20} /> Advanced Resources
                </h3>
                <ul className="space-y-3">
                  {data.resources?.map((r: any, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-300 items-start">
                       <ExternalLink size={16} className="text-blue-500 mt-0.5 shrink-0" />
                       <div className="flex flex-col">
                         <span className="font-medium text-slate-200">{r.name}</span>
                         {r.url !== "#" && r.url !== "url if known, or text" && (
                           <span className="text-xs text-slate-500">{r.url}</span>
                         )}
                       </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-indigo-400 mb-6 flex items-center gap-2">
                <Code2 size={20} /> Auto-Generated New Questions
              </h3>
              <div className="space-y-4">
                {data.newQuestions?.map((q: any, i: number) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg font-black text-sm uppercase tracking-wider shrink-0">
                        Q{i+1}
                      </div>
                      <div>
                        <p className="text-white font-medium text-lg mb-2">{q.question}</p>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Concept: <span className="text-indigo-300">{q.concept}</span></p>
                      </div>
                    </div>
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

import React, { useState } from 'react';
import { User } from '../types';
import { Brain, ArrowLeft, Loader2, PlayCircle, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { COMPANIES, ROLES } from '../data';

interface SimulationViewProps {
  onNavigate: (view: any) => void;
}

export function SimulationView({ onNavigate }: SimulationViewProps) {
  const [config, setConfig] = useState({
    company: '',
    role: '',
    experience: 3
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const isFormValid = config.company && config.role;

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/simulate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Failed to generate questions.');
      }
    } catch (e) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="text-purple-400" />
            Mock Simulation Mode
          </h1>
          <p className="text-slate-400 mt-1">Generate a custom set of 5 persona-specific practice questions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Form */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6  shadow-xl space-y-6 flex flex-col h-fit">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Building2 size={16} className="text-blue-400"/>
              Target Company / Industry
            </label>
            <select 
              className="w-full bg-slate-800 border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={config.company}
              onChange={e => setConfig({...config, company: e.target.value})}
            >
              <option value="" disabled>Select a company</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Briefcase size={16} className="text-amber-400"/>
              Target Role
            </label>
            <select 
              className="w-full bg-slate-800 border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={config.role}
              onChange={e => setConfig({...config, role: e.target.value})}
            >
              <option value="" disabled>Select a role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={!isFormValid || loading}
            className={`w-full py-4 rounded-xl flex justify-center items-center gap-2 font-bold transition-all ${
              !isFormValid || loading
                ? 'bg-slate-800 text-slate-500 pointer-events-none'
                : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Generate Questions'}
          </button>
          
          {error && <div className="text-rose-400 text-sm text-center font-medium bg-rose-500/10 p-3 rounded-xl">{error}</div>}
        </div>

        {/* Right Side: Results */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6  shadow-xl overflow-hidden min-h-[400px]">
          {questions.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 mt-20 md:mt-auto">
               <Brain size={48} className="mb-4 opacity-50" />
               <p className="text-center font-medium">Configure your simulation and click generate<br/>to produce your tailored practice questions.</p>
             </div>
          )}
          {loading && (
             <div className="flex flex-col items-center justify-center h-full text-purple-400 mt-20 md:mt-auto space-y-4">
               <Loader2 size={48} className="animate-spin opacity-80" />
               <p className="font-medium animate-pulse">Generating Persona Prompts...</p>
             </div>
          )}
          {questions.length > 0 && !loading && (
             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               <h3 className="text-lg font-bold text-white sticky top-0 bg-slate-900/90 py-2 backdrop-blur-md z-10 flex items-center justify-between">
                 Your Custom Questions
                 <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{config.company} - {config.role}</span>
               </h3>
               {questions.map((q, i) => (
                 <div key={i} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors group">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Question {i + 1}</div>
                    <div className="text-slate-200 leading-relaxed font-medium">
                      {q}
                    </div>
                 </div>
               ))}
               
               <div className="pt-4 pb-2">
                 <button onClick={() => onNavigate('setup')} className="w-full flex items-center justify-center py-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 rounded-xl font-bold transition-all gap-2">
                   <PlayCircle size={20} />
                   Start a Full Live Interview
                 </button>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

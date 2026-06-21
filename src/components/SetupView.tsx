import React, { useState } from 'react';
import { COMPANIES, ROLES } from '../data';
import { Building2, Briefcase, FileCode2, Users, Sliders, ChevronRight } from 'lucide-react';

interface SetupViewProps {
  onStart: (config: any) => void;
  onCancel: () => void;
}

export function SetupView({ onStart, onCancel }: SetupViewProps) {
  const [config, setConfig] = useState({
    company: '',
    role: '',
    type: '',
    experience: 3,
    difficulty: ''
  });

  const isFormValid = config.company && config.role && config.type && config.difficulty;

  const handleStart = () => {
    if (isFormValid) {
        if ('speechSynthesis' in window) {
           const utterance = new SpeechSynthesisUtterance('');
           utterance.volume = 0;
           window.speechSynthesis.speak(utterance);
        }
        onStart(config);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Choose Your Interview</h1>
        <p className="text-slate-400">Configure your mock interview session to match your target role.</p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
        
        {/* Section 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Building2 size={16} className="text-blue-400"/>
              Target Company
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer pr-10"
                value={config.company}
                onChange={e => setConfig({...config, company: e.target.value})}
              >
                <option value="" disabled>Select a company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Briefcase size={16} className="text-purple-400"/>
              Target Role
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer pr-10"
                value={config.role}
                onChange={e => setConfig({...config, role: e.target.value})}
              >
                <option value="" disabled>Select a role</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-slate-400">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-800" />

        {/* Section 3: Type */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <FileCode2 size={16} className="text-emerald-400"/>
            Interview Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Technical', 'Behavioural', 'System Design'].map(type => (
              <label 
                key={type}
                className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer border transition-all ${
                  config.type === type 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <input 
                  type="radio" 
                  name="type" 
                  value={type} 
                  checked={config.type === type}
                  onChange={e => setConfig({...config, type: e.target.value})}
                  className="sr-only"
                />
                <span className="font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 4: Experience */}
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-amber-400"/>
              Experience Level: <span className="text-white">{config.experience} years</span>
            </div>
            <input 
              type="range" 
              min="0" max="15" 
              value={config.experience}
              onChange={e => setConfig({...config, experience: parseInt(e.target.value)})}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Fresher (0)</span>
              <span>Senior (15+)</span>
            </div>
          </label>
        </div>

        {/* Section 5: Difficulty */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Sliders size={16} className="text-rose-400"/>
            Difficulty Level
          </label>
          <div className="flex gap-3">
            {['Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setConfig({...config, difficulty: diff})}
                className={`flex-1 py-3 px-4 rounded-xl font-medium border transition-all ${
                  config.difficulty === diff
                    ? diff === 'Easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : diff === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-4 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleStart}
            disabled={!isFormValid}
            className={`w-full relative group overflow-hidden rounded-xl font-bold text-lg transition-all ${
                isFormValid 
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isFormValid && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>}
            <div className="relative px-8 py-4 flex items-center justify-center gap-2">
              {isFormValid ? 'Start Interview' : 'Complete Selections to Start'}
              {isFormValid && <ChevronRight size={20} />}
            </div>
          </button>
        </div>
        <p className="text-center text-sm text-slate-500">Estimated duration: ~30 mins</p>
      </div>
    </div>
  );
}

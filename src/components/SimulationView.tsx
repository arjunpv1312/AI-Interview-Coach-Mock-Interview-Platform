import React, { useState } from 'react';
import { User, InterviewConfig } from '../types';
import {
  Brain,
  ArrowLeft,
  Loader2,
  PlayCircle,
  Building2,
  Briefcase,
  FileText,
  Sliders,
} from 'lucide-react';
import { COMPANIES, ROLES } from '../data';

interface SimulationViewProps {
  user?: User | null;
  onNavigate: (view: any) => void;
  onLaunchSession?: (prefill: Partial<InterviewConfig>) => void;
}

export function SimulationView({
  user,
  onNavigate,
  onLaunchSession,
}: SimulationViewProps) {
  const [config, setConfig] = useState({
    company: 'Google',
    role: 'Software Engineer',
    experience: user?.resumeProfile?.yearsExperience || 3,
    useResume: Boolean(user?.resumeProfile),
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const isFormValid = Boolean(config.company && config.role);

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/simulate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: config.company,
          role: config.role,
          experience: config.experience,
          resumeProfile: config.useResume ? user?.resumeProfile || null : null,
        }),
      });
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Failed to generate questions.');
      }
    } catch {
      setError('Failed to connect to the question generator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16223b] pb-6">
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
              <Brain className="text-blue-400" size={24} />
              <span>AI Question Simulation</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Generate 5 targeted questions tailored to your role, experience,
              and uploaded resume.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Config */}
        <div className="md:col-span-5 amoled-surface rounded-2xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Building2 size={14} className="text-blue-400" />
              <span>Target Company</span>
            </label>
            <select
              className="w-full bg-black border border-[#16223b] text-white text-sm rounded-xl p-3 focus:border-blue-500 outline-none cursor-pointer"
              value={config.company}
              onChange={(e) =>
                setConfig({ ...config, company: e.target.value })
              }
            >
              {COMPANIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Briefcase size={14} className="text-cyan-400" />
              <span>Target Role</span>
            </label>
            <select
              className="w-full bg-black border border-[#16223b] text-white text-sm rounded-xl p-3 focus:border-blue-500 outline-none cursor-pointer"
              value={config.role}
              onChange={(e) => setConfig({ ...config, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-2">
                <Sliders size={14} className="text-blue-400" />
                <span>Experience Level</span>
              </span>
              <span className="font-mono tabular-nums text-white">
                {config.experience} yrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={config.experience}
              onChange={(e) =>
                setConfig({
                  ...config,
                  experience: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-blue-500 h-2 bg-[#0a1120] rounded-lg cursor-pointer"
            />
          </div>

          {user?.resumeProfile ? (
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-black border border-[#16223b] cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={16} className="text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    Ground in Active Resume
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {user.resumeProfile.fileName}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.useResume}
                onChange={(e) =>
                  setConfig({ ...config, useResume: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
              />
            </label>
          ) : (
            <div className="p-3.5 rounded-xl bg-black border border-[#16223b] text-xs text-slate-400">
              Upload a resume in Session Setup to generate project-specific
              questions here.
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isFormValid || loading}
            className={`w-full py-3.5 rounded-xl flex justify-center items-center gap-2 text-sm font-bold transition-all cursor-pointer ${
              !isFormValid || loading
                ? 'bg-[#0a1120] text-slate-500 border border-[#16223b] cursor-not-allowed'
                : 'amoled-btn-primary text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Generating Prompt Set...</span>
              </>
            ) : (
              <span>Generate 5 Questions</span>
            )}
          </button>

          {error && (
            <div className="text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Right Output */}
        <div className="md:col-span-7 amoled-surface rounded-2xl p-6 min-h-[420px] flex flex-col">
          {questions.length === 0 && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <Brain size={40} className="mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                Ready to synthesize tailored questions
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select your target company and role on the left to produce 5
                focused interview prompts.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12">
              <Loader2 size={36} className="animate-spin text-blue-400" />
              <p className="text-sm font-medium text-blue-300">
                Synthesizing interviewer prompt set...
              </p>
            </div>
          )}

          {questions.length > 0 && !loading && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#16223b]">
                <h2 className="text-base font-bold text-white">
                  Generated Prompt Set
                </h2>
                <span className="text-xs text-cyan-400 font-medium">
                  {config.company} · {config.role}
                </span>
              </div>

              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-black p-4 rounded-xl border border-[#16223b] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        0{i + 1}. Prompt
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchSession
                            ? onLaunchSession({
                                company: config.company,
                                role: config.role,
                                experience: config.experience,
                                focusTopics: q,
                              })
                            : onNavigate('setup')
                        }
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        Practice in Live Studio →
                      </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {q}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  onLaunchSession
                    ? onLaunchSession({
                        company: config.company,
                        role: config.role,
                        experience: config.experience,
                      })
                    : onNavigate('setup')
                }
                className="w-full py-3.5 amoled-btn-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlayCircle size={18} />
                <span>Launch Full Live Interview</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

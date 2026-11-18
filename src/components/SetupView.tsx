import React, { useState, useRef } from 'react';
import { COMPANIES, ROLES } from '../data';
import { InterviewConfig, ResumeProfile } from '../types';
import {
  Building2,
  Briefcase,
  FileCode2,
  Users,
  Sliders,
  ChevronRight,
  Upload,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface SetupViewProps {
  savedResume?: ResumeProfile | null;
  prefillConfig?: Partial<InterviewConfig> | null;
  onSaveResume?: (resume: ResumeProfile | null) => void;
  onStart: (config: InterviewConfig) => void;
  onCancel: () => void;
}

export function SetupView({
  savedResume,
  prefillConfig,
  onSaveResume,
  onStart,
  onCancel,
}: SetupViewProps) {
  const [config, setConfig] = useState<InterviewConfig>({
    company: prefillConfig?.company || 'Google',
    role: prefillConfig?.role || 'Software Engineer',
    type: prefillConfig?.type || 'Technical',
    experience: prefillConfig?.experience ?? 3,
    difficulty: prefillConfig?.difficulty || 'Medium',
    resumeProfile: savedResume || null,
    startWithResume: true,
    strictMode: false,
    focusTopics: prefillConfig?.focusTopics || '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid =
    Boolean(config.company) &&
    Boolean(config.role) &&
    Boolean(config.type) &&
    Boolean(config.difficulty);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });

  const handleResumeFile = async (file: File) => {
    setParseError('');
    const lower = file.name.toLowerCase();
    const isValidExt =
      lower.endsWith('.pdf') ||
      lower.endsWith('.docx') ||
      lower.endsWith('.txt');
    if (!isValidExt) {
      setParseError('Please upload a PDF, DOCX, or TXT resume file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError('Resume file must be under 10 MB.');
      return;
    }

    setParsing(true);
    try {
      let payload: any = {
        fileName: file.name,
        mimeType: file.type,
      };
      if (lower.endsWith('.txt')) {
        payload.textContent = await file.text();
      } else {
        payload.base64Data = await readFileAsBase64(file);
      }

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.profile) {
        throw new Error(data.error || 'Could not parse resume.');
      }

      const parsedProfile: ResumeProfile = data.profile;
      setConfig((prev) => ({
        ...prev,
        resumeProfile: parsedProfile,
        experience:
          typeof parsedProfile.yearsExperience === 'number'
            ? Math.min(15, Math.max(0, Math.round(parsedProfile.yearsExperience)))
            : prev.experience,
        startWithResume: true,
      }));
      if (saveToProfile && onSaveResume) {
        onSaveResume(parsedProfile);
      }
    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse resume.');
    } finally {
      setParsing(false);
    }
  };

  const handleClearResume = () => {
    setConfig((prev) => ({ ...prev, resumeProfile: null }));
    if (onSaveResume) onSaveResume(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = () => {
    if (!isFormValid) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    }
    if (saveToProfile && config.resumeProfile && onSaveResume) {
      onSaveResume(config.resumeProfile);
    }
    onStart(config);
  };

  const resume = config.resumeProfile;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#16223b] pb-6">
        <div>
          <p className="text-xs font-medium text-blue-400 mb-1.5">
            Session Configuration
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Configure Your Resume-Grounded Interview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload your resume to anchor opening probes in your real projects,
            then calibrate role, difficulty, and interviewer rigor.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors self-start md:self-auto cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Resume Upload & Extracted Intelligence (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="amoled-surface rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-blue-400" />
                <h2 className="text-base font-bold text-white">
                  Resume Intelligence
                </h2>
              </div>
              {resume && (
                <button
                  type="button"
                  onClick={handleClearResume}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleResumeFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-400 bg-blue-600/10'
                  : 'border-[#253659] bg-black/70 hover:border-blue-500/60 hover:bg-[#070d1a]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeFile(file);
                }}
              />
              {parsing ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <Loader2 size={28} className="text-blue-400 animate-spin" />
                  <div className="text-sm font-semibold text-white">
                    Analyzing Resume with AI...
                  </div>
                  <p className="text-xs text-slate-400">
                    Extracting projects, stack depth, and opening interview
                    questions.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-1">
                  <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Upload size={20} />
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {resume
                      ? 'Replace Resume File'
                      : 'Upload PDF, DOCX, or TXT Resume'}
                  </div>
                  <p className="text-xs text-slate-400">
                    Drag and drop or browse · Max 10 MB
                  </p>
                </div>
              )}
            </div>

            {parseError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed Resume Snapshot */}
            {resume ? (
              <div className="space-y-4 pt-2 border-t border-[#16223b]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>{resume.candidateName}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {resume.headline} · {resume.fileName}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-blue-400 tabular-nums shrink-0">
                    {resume.yearsExperience}y exp
                  </span>
                </div>

                {resume.rawSummary && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-black/60 border border-[#16223b] rounded-xl p-3">
                    {resume.rawSummary}
                  </p>
                )}

                {resume.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-slate-400">
                      Detected Stack ({resume.skills.length})
                    </div>
                    <p className="text-xs text-blue-300 leading-relaxed">
                      {resume.skills.slice(0, 14).join(' · ')}
                    </p>
                  </div>
                )}

                {resume.projects.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-400">
                      Projects Targeted for Opening Questions
                    </div>
                    <div className="space-y-2">
                      {resume.projects.slice(0, 3).map((proj, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-black/60 border border-[#16223b] p-3"
                        >
                          <div className="text-xs font-semibold text-white">
                            {proj.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {proj.highlights}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Behavior Toggles */}
                <div className="space-y-2.5 pt-2 border-t border-[#16223b]">
                  <label className="flex items-center justify-between gap-3 text-xs text-slate-300 cursor-pointer">
                    <span>Start opening stage from resume projects</span>
                    <input
                      type="checkbox"
                      checked={config.startWithResume !== false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          startWithResume: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-xs text-slate-300 cursor-pointer">
                    <span>Save parsed resume to my profile</span>
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-black/60 border border-[#16223b] p-4 text-xs text-slate-400 leading-relaxed">
                No resume attached yet. Uploading your resume unlocks
                project-specific opening questions and tailored architecture
                follow-ups instead of generic prompts.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Role, Company, Difficulty & Pro Toggles (7 cols) */}
        <div className="lg:col-span-7 amoled-surface rounded-2xl p-6 md:p-8 space-y-7">
          {/* Target Company & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Building2 size={15} className="text-blue-400" />
                Target Company
              </label>
              <select
                className="w-full bg-black border border-[#16223b] text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                value={config.company}
                onChange={(e) =>
                  setConfig({ ...config, company: e.target.value })
                }
              >
                <option value="" disabled>
                  Select a company
                </option>
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Briefcase size={15} className="text-cyan-400" />
                Target Role
              </label>
              <select
                className="w-full bg-black border border-[#16223b] text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interview Round Type */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileCode2 size={15} className="text-blue-400" />
              Interview Round Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Technical', 'Behavioural', 'System Design'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setConfig({ ...config, type })}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    config.type === type
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-950/30'
                      : 'bg-black border-[#16223b] text-slate-400 hover:text-white hover:border-[#253659]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-2">
                <Users size={15} className="text-cyan-400" />
                Experience Calibration
              </span>
              <span className="font-mono text-white tabular-nums">
                {config.experience} years
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
              className="w-full accent-blue-500 h-2 bg-[#0a1120] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Entry (0 yrs)</span>
              <span>Mid-Level (5 yrs)</span>
              <span>Staff / Principal (15+ yrs)</span>
            </div>
          </div>

          {/* Custom Difficulty */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sliders size={15} className="text-blue-400" />
              Difficulty Calibration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  type="button"
                  key={diff}
                  onClick={() => setConfig({ ...config, difficulty: diff })}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    config.difficulty === diff
                      ? diff === 'Easy'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                        : diff === 'Medium'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-black border-[#16223b] text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Focus Topics + Strict Bar-Raiser Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#16223b]">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sparkles size={14} className="text-cyan-400" />
                Specific Focus Topics (Optional)
              </label>
              <input
                type="text"
                value={config.focusTopics || ''}
                onChange={(e) =>
                  setConfig({ ...config, focusTopics: e.target.value })
                }
                placeholder="e.g. Microservices, React concurrency, SQL"
                className="w-full bg-black border border-[#16223b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-black border border-[#16223b] px-4 py-3">
              <div className="pr-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <ShieldAlert size={14} className="text-blue-400" />
                  <span>Principal Bar-Raiser Mode</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Challenges vague answers with deep follow-ups
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(config.strictMode)}
                onChange={(e) =>
                  setConfig({ ...config, strictMode: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Launch Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              disabled={!isFormValid || parsing}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isFormValid && !parsing
                  ? 'amoled-btn-primary text-white'
                  : 'bg-[#0a1120] text-slate-500 border border-[#16223b] cursor-not-allowed'
              }`}
            >
              <span>
                {resume && config.startWithResume !== false
                  ? 'Launch Resume-Tailored Interview'
                  : 'Launch Interview Session'}
              </span>
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

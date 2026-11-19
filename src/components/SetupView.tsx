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
      const payload: any = {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e4ddf5] dark:border-[#26193f] pb-6">
        <div>
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 mb-1.5">
            Session Configuration
          </p>
          <h1 className="text-3xl font-bold text-[#140f1f] dark:text-white tracking-tight [text-wrap:balance]">
            Configure Your Resume-Grounded Interview
          </h1>
          <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm mt-1">
            Upload your resume to anchor opening probes in your real projects,
            then calibrate role, difficulty, and interviewer rigor.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white transition-colors self-start md:self-auto cursor-pointer"
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
                <FileText
                  size={18}
                  className="text-violet-700 dark:text-violet-400"
                />
                <h2 className="text-base font-bold text-[#140f1f] dark:text-white">
                  Resume Intelligence
                </h2>
              </div>
              {resume && (
                <button
                  type="button"
                  onClick={handleClearResume}
                  aria-label="Remove uploaded resume"
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Keyboard & Drag-and-Drop Dropzone */}
            <div
              role="button"
              tabIndex={0}
              aria-label={
                resume
                  ? 'Replace resume file. Press Enter or Space to browse.'
                  : 'Upload PDF, DOCX, or TXT resume. Press Enter or Space to browse.'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
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
                  ? 'border-violet-500 bg-violet-600/10'
                  : 'border-[#d3c8ef] dark:border-[#352459] bg-white dark:bg-black/80 hover:border-violet-500 hover:bg-[#f3effb] dark:hover:bg-[#120b1f]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeFile(file);
                }}
              />
              {parsing ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <Loader2
                    size={28}
                    className="text-violet-700 dark:text-violet-400 animate-spin"
                  />
                  <div className="text-sm font-semibold text-[#140f1f] dark:text-white">
                    Analyzing Resume...
                  </div>
                  <p className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
                    Extracting projects, stack depth, and opening interview
                    questions.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-1">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-300 dark:border-violet-500/35 flex items-center justify-center text-violet-700 dark:text-violet-400">
                    <Upload size={20} />
                  </div>
                  <div className="text-sm font-semibold text-[#140f1f] dark:text-white">
                    {resume
                      ? 'Replace Resume File'
                      : 'Upload PDF, DOCX, or TXT Resume'}
                  </div>
                  <p className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
                    Drag and drop or browse · Max 10 MB
                  </p>
                </div>
              )}
            </div>

            <div aria-live="polite">
              {parseError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>

            {/* Parsed Resume Snapshot */}
            {resume ? (
              <div className="space-y-4 pt-2 border-t border-[#e4ddf5] dark:border-[#26193f]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#140f1f] dark:text-white">
                      <CheckCircle2
                        size={15}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                      <span>{resume.candidateName}</span>
                    </div>
                    <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                      {resume.headline} · {resume.fileName}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-violet-700 dark:text-violet-400 tabular-nums shrink-0 font-semibold">
                    {resume.yearsExperience}y exp
                  </span>
                </div>

                {resume.rawSummary && (
                  <p className="text-xs text-[#362f47] dark:text-[#d8d0ea] leading-relaxed bg-white dark:bg-black/70 border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-3">
                    {resume.rawSummary}
                  </p>
                )}

                {resume.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-[#5a5170] dark:text-[#a69cbe]">
                      Detected Stack ({resume.skills.length})
                    </div>
                    <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                      {resume.skills.slice(0, 14).join(' · ')}
                    </p>
                  </div>
                )}

                {resume.projects.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-[#5a5170] dark:text-[#a69cbe]">
                      Projects Targeted for Opening Questions
                    </div>
                    <div className="space-y-2">
                      {resume.projects.slice(0, 3).map((proj, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white dark:bg-black/70 border border-[#e4ddf5] dark:border-[#26193f] p-3"
                        >
                          <div className="text-xs font-semibold text-[#140f1f] dark:text-white">
                            {proj.name}
                          </div>
                          <div className="text-[11px] text-[#5a5170] dark:text-[#a69cbe] mt-0.5 line-clamp-2">
                            {proj.highlights}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Behavior Toggles */}
                <div className="space-y-2.5 pt-2 border-t border-[#e4ddf5] dark:border-[#26193f]">
                  <label className="flex items-center justify-between gap-3 text-xs text-[#362f47] dark:text-[#d8d0ea] cursor-pointer">
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
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-xs text-[#362f47] dark:text-[#d8d0ea] cursor-pointer">
                    <span>Save parsed resume to encrypted profile</span>
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white dark:bg-black/70 border border-[#e4ddf5] dark:border-[#26193f] p-4 text-xs text-[#5a5170] dark:text-[#a69cbe] leading-relaxed">
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
              <label
                htmlFor="setup-company"
                className="flex items-center gap-2 text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea]"
              >
                <Building2
                  size={15}
                  className="text-violet-700 dark:text-violet-400"
                />
                <span>Target Company</span>
              </label>
              <select
                id="setup-company"
                className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all cursor-pointer"
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
              <label
                htmlFor="setup-role"
                className="flex items-center gap-2 text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea]"
              >
                <Briefcase
                  size={15}
                  className="text-purple-700 dark:text-purple-400"
                />
                <span>Target Role</span>
              </label>
              <select
                id="setup-role"
                className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all cursor-pointer"
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
            <span className="flex items-center gap-2 text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea]">
              <FileCode2
                size={15}
                className="text-violet-700 dark:text-violet-400"
              />
              <span>Interview Round Type</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Technical', 'Behavioural', 'System Design'].map((type) => (
                <button
                  type="button"
                  key={type}
                  aria-pressed={config.type === type}
                  onClick={() => setConfig({ ...config, type })}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    config.type === type
                      ? 'bg-violet-600/15 border-violet-500 text-violet-800 dark:text-violet-300 shadow-sm'
                      : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:border-violet-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea]">
              <label
                htmlFor="setup-experience"
                className="flex items-center gap-2"
              >
                <Users
                  size={15}
                  className="text-purple-700 dark:text-purple-400"
                />
                <span>Experience Calibration</span>
              </label>
              <span className="font-mono text-[#140f1f] dark:text-white tabular-nums">
                {config.experience} years
              </span>
            </div>
            <input
              id="setup-experience"
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
              className="w-full accent-violet-600 h-2 bg-[#f3effb] dark:bg-[#120b1f] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#5a5170] dark:text-[#a69cbe]">
              <span>Entry (0 yrs)</span>
              <span>Mid-Level (5 yrs)</span>
              <span>Staff / Principal (15+ yrs)</span>
            </div>
          </div>

          {/* Custom Difficulty */}
          <div className="space-y-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea]">
              <Sliders
                size={15}
                className="text-violet-700 dark:text-violet-400"
              />
              <span>Difficulty Calibration</span>
            </span>
            <div className="grid grid-cols-3 gap-3">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  type="button"
                  key={diff}
                  aria-pressed={config.difficulty === diff}
                  onClick={() => setConfig({ ...config, difficulty: diff })}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    config.difficulty === diff
                      ? diff === 'Easy'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : diff === 'Medium'
                          ? 'bg-violet-600/15 border-violet-500 text-violet-800 dark:text-violet-300'
                          : 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Focus Topics + Strict Bar-Raiser Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#e4ddf5] dark:border-[#26193f]">
            <div className="space-y-2">
              <label
                htmlFor="setup-focus-topics"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea]"
              >
                <Sparkles
                  size={14}
                  className="text-purple-700 dark:text-purple-400"
                />
                <span>Specific Focus Topics (Optional)</span>
              </label>
              <input
                id="setup-focus-topics"
                type="text"
                value={config.focusTopics || ''}
                onChange={(e) =>
                  setConfig({ ...config, focusTopics: e.target.value })
                }
                placeholder="e.g. Microservices, React concurrency, SQL"
                className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl px-3.5 py-2.5 text-xs text-[#140f1f] dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <label className="flex items-center justify-between rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] px-4 py-3 cursor-pointer">
              <div className="pr-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#140f1f] dark:text-white">
                  <ShieldAlert
                    size={14}
                    className="text-violet-700 dark:text-violet-400"
                  />
                  <span>Principal Bar-Raiser Mode</span>
                </div>
                <div className="text-[11px] text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                  Challenges vague answers with deep follow-ups
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(config.strictMode)}
                onChange={(e) =>
                  setConfig({ ...config, strictMode: e.target.checked })
                }
                className="w-4 h-4 accent-violet-600 cursor-pointer shrink-0"
              />
            </label>
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
                  : 'bg-[#f3effb] dark:bg-[#120b1f] text-[#5a5170] dark:text-[#a69cbe] border border-[#e4ddf5] dark:border-[#26193f] cursor-not-allowed'
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

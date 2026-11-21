import React, { useEffect, useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Mic,
  ShieldCheck,
  Keyboard,
  SunMoon,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ViewState } from '../types';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
  colorMode: 'dark' | 'light';
  onToggleColorMode: () => void;
}

type GuideSectionId = 'workflow' | 'resume' | 'studio' | 'security' | 'a11y';

export function GuideModal({
  isOpen,
  onClose,
  onNavigate,
  colorMode,
  onToggleColorMode,
}: GuideModalProps) {
  const [activeSection, setActiveSection] = useState<GuideSectionId>('workflow');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections: {
    id: GuideSectionId;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'workflow', label: 'Core Workflow', icon: <BookOpen size={15} /> },
    { id: 'resume', label: 'Resume Parsing', icon: <FileText size={15} /> },
    { id: 'studio', label: 'Live Studio', icon: <Mic size={15} /> },
    { id: 'security', label: 'Vault Security', icon: <ShieldCheck size={15} /> },
    { id: 'a11y', label: 'Shortcuts & A11y', icon: <Keyboard size={15} /> },
  ];

  const jumpTo = (view: ViewState) => {
    onClose();
    onNavigate(view);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e4ddf5] dark:border-[#26193f] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-300 dark:border-violet-500/40 flex items-center justify-center text-violet-700 dark:text-violet-300">
              <BookOpen size={18} />
            </div>
            <div>
              <h2
                id="guide-modal-title"
                className="text-lg font-bold text-[#140f1f] dark:text-white"
              >
                Platform Guide &amp; Accessibility Reference
              </h2>
              <p className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
                Step-by-step operating guide, privacy architecture, and keyboard
                navigation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="p-2 rounded-xl border border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:bg-[#f3effb] dark:hover:bg-[#120b1f] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Tabs */}
        <div
          className="px-6 py-3 border-b border-[#e4ddf5] dark:border-[#26193f] bg-[#faf8ff] dark:bg-black/60 flex items-center gap-2 overflow-x-auto"
          role="tablist"
          aria-label="Guide topics"
        >
          {sections.map((sec) => {
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSection(sec.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'amoled-btn-primary text-white'
                    : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:bg-[#f3effb] dark:hover:bg-[#120b1f]'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#362f47] dark:text-[#d8d0ea] custom-scrollbar">
          {activeSection === 'workflow' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#140f1f] dark:text-white">
                End-to-End Interview Preparation Loop
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    step: '01. Upload Resume',
                    desc: 'Drop a PDF, DOCX, or TXT file in Session Setup. Key projects and skills are extracted with zero server disk retention.',
                  },
                  {
                    step: '02. Calibrate Rigor',
                    desc: 'Choose company, role, difficulty (Easy/Medium/Hard), years of experience, and optional Principal Bar-Raiser mode.',
                  },
                  {
                    step: '03. Conduct Voice or Text Round',
                    desc: 'Respond naturally via microphone or keyboard. Toggle camera focus mode, transcript visibility, and AI voice controls live.',
                  },
                  {
                    step: '04. Review Circular Scorecard',
                    desc: 'Inspect your 5 competency rings, turn-by-turn benchmark answers, and tailored improvement roadmap—or export to PDF.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-4 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] space-y-1.5"
                  >
                    <div className="text-xs font-mono font-bold text-violet-700 dark:text-violet-400">
                      {item.step}
                    </div>
                    <p className="text-xs leading-relaxed text-[#5a5170] dark:text-[#a69cbe]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => jumpTo('setup')}
                  className="px-4 py-2 rounded-xl amoled-btn-primary text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Session Setup</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => jumpTo('bank')}
                  className="px-4 py-2 rounded-xl border border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black text-[#140f1f] dark:text-white text-xs font-semibold hover:border-violet-500 cursor-pointer"
                >
                  Open Study Bank
                </button>
                <button
                  type="button"
                  onClick={() => jumpTo('horizon')}
                  className="px-4 py-2 rounded-xl border border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black text-violet-700 dark:text-violet-300 text-xs font-semibold hover:border-violet-500 cursor-pointer"
                >
                  Open Year 5026 Horizon Lab
                </button>
              </div>
            </div>
          )}

          {activeSection === 'resume' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#140f1f] dark:text-white">
                How Resume-Grounded Questioning Works
              </h3>
              <ul className="space-y-3 text-xs leading-relaxed">
                <li className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                  <CheckCircle2
                    size={16}
                    className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
                  />
                  <span>
                    <strong className="text-[#140f1f] dark:text-white">
                      Opening Stage Anchoring:
                    </strong>{' '}
                    When “Start opening stage from resume projects” is checked,
                    your interviewer begins directly by probing an architecture
                    decision or scaling metric from your actual projects.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                  <CheckCircle2
                    size={16}
                    className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
                  />
                  <span>
                    <strong className="text-[#140f1f] dark:text-white">
                      Zero Server Disk Retention:
                    </strong>{' '}
                    Uploaded PDF/DOCX buffers are parsed in volatile server
                    memory, wiped immediately, and encrypted only inside your
                    browser vault.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                  <CheckCircle2
                    size={16}
                    className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
                  />
                  <span>
                    <strong className="text-[#140f1f] dark:text-white">
                      Keyboard Upload Support:
                    </strong>{' '}
                    Tab to the resume upload dropzone in Session Setup and press
                    Enter or Space to select a file without a mouse.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {activeSection === 'studio' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#140f1f] dark:text-white">
                Live Studio Audio, Camera &amp; Multi-Toggle Guide
              </h3>
              <div className="space-y-2.5 text-xs leading-relaxed">
                <p className="p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                  <strong className="text-[#140f1f] dark:text-white">
                    Voice &amp; Auto-Send:
                  </strong>{' '}
                  Speech recognition automatically pauses while the AI interviewer
                  is speaking to prevent echo. Disable “Auto-Send: 5s” anytime if
                  you want unlimited time to refine written answers before pressing
                  Send Response.
                </p>
                <p className="p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                  <strong className="text-[#140f1f] dark:text-white">
                    Audio Focus Mode:
                  </strong>{' '}
                  Toggle Camera Off to switch into distraction-free audio focus
                  mode. Your microphone, live transcript, and resume reference
                  drawer remain fully active.
                </p>
                <p className="p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                  <strong className="text-[#140f1f] dark:text-white">
                    Network Drop Recovery:
                  </strong>{' '}
                  If an API request ever fails mid-session, your typed/spoken
                  response stays preserved in the editor so nothing is lost.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#140f1f] dark:text-white">
                Zero-Knowledge Vault &amp; 15-Minute Auto-Lock
              </h3>
              <p className="text-xs leading-relaxed text-[#5a5170] dark:text-[#a69cbe]">
                Every user profile, resume, score history entry, and bookmark is
                encrypted locally with <strong className="text-[#140f1f] dark:text-white">AES-256-GCM</strong>{' '}
                using a non-extractable key stored in IndexedDB. Credentials use{' '}
                <strong className="text-[#140f1f] dark:text-white">PBKDF2-HMAC-SHA-256</strong>{' '}
                (120,000 iterations) with per-account random salts.
              </p>
              <p className="text-xs leading-relaxed text-[#5a5170] dark:text-[#a69cbe]">
                For session protection, inactive sessions automatically lock after
                15 minutes, displaying a 60-second countdown notice before clearing
                the decrypted session state.
              </p>
              <button
                type="button"
                onClick={() => jumpTo('security')}
                className="px-4 py-2 rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>Inspect Live Security Audit</span>
              </button>
            </div>
          )}

          {activeSection === 'a11y' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#140f1f] dark:text-white">
                Theme Modes, WCAG Contrast &amp; Keyboard Shortcuts
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f]">
                <div>
                  <div className="text-xs font-bold text-[#140f1f] dark:text-white">
                    Active Display Mode:{' '}
                    {colorMode === 'dark'
                      ? 'Dark Mode (Black + Violet)'
                      : 'White Mode (Light + Violet)'}
                  </div>
                  <div className="text-[11px] text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                    Switch anytime between high-contrast black and crisp white
                    surfaces.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleColorMode}
                  className="px-3.5 py-2 rounded-xl amoled-btn-primary text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <SunMoon size={14} />
                  <span>
                    Switch to {colorMode === 'dark' ? 'White Mode' : 'Dark Mode'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { keys: 'Tab / Shift + Tab', action: 'Navigate all controls with visible violet focus rings' },
                  { keys: 'Ctrl / Cmd + Enter', action: 'Submit typed response inside Live Studio' },
                  { keys: 'Enter / Space', action: 'Activate resume file dropzone or accordion items' },
                  { keys: 'Escape', action: 'Close Guide drawer, Theme picker, and History modal' },
                ].map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="p-3.5 rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] flex flex-col gap-1"
                  >
                    <kbd className="font-mono text-[11px] font-bold text-violet-700 dark:text-violet-300">
                      {shortcut.keys}
                    </kbd>
                    <span className="text-[#5a5170] dark:text-[#a69cbe]">
                      {shortcut.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

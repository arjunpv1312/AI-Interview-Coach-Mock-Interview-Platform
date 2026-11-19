import React, { useState } from 'react';
import { mockQuestions, COMPANIES, ROLES } from '../data';
import { User, InterviewConfig, ExperienceTier } from '../types';
import { getCompanyPlaybook } from '../lib/interviewPlaybooks';
import {
  Search,
  BookmarkPlus,
  BookmarkCheck,
  PlayCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';

interface QuestionBankViewProps {
  user?: User | null;
  onNavigate: (v: any) => void;
  onUpdateUser?: (props: Partial<User>) => void;
  onPracticeQuestion?: (prefill: Partial<InterviewConfig>) => void;
}

export function QuestionBankView({
  user,
  onNavigate,
  onUpdateUser,
  onPracticeQuestion,
}: QuestionBankViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterLevel, setFilterLevel] = useState<'' | ExperienceTier>('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [expandedTipsId, setExpandedTipsId] = useState<string | null>(null);

  const bookmarkedIds = user?.bookmarkedQuestionIds || [];

  const toggleBookmark = (id: string) => {
    if (!onUpdateUser) return;
    const exists = bookmarkedIds.includes(id);
    const updated = exists
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    onUpdateUser({ bookmarkedQuestionIds: updated });
  };

  const levelToExperience = (level?: ExperienceTier): number => {
    switch (level) {
      case 'Entry':
        return 0;
      case 'Mid-Level':
        return 3;
      case 'Senior':
        return 7;
      case 'Staff':
        return 12;
      case 'Principal':
        return 20;
      default:
        return 3;
    }
  };

  const filtered = mockQuestions.filter((q) => {
    if (activeTab === 'saved' && !bookmarkedIds.includes(q.id)) return false;
    if (
      searchTerm &&
      !q.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !q.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !q.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (filterCompany && q.company !== filterCompany) return false;
    if (filterRole && q.role !== filterRole) return false;
    if (filterDiff && q.difficulty !== filterDiff) return false;
    if (filterLevel && q.level !== filterLevel) return false;
    return true;
  });

  const selectedPlaybook = filterCompany
    ? getCompanyPlaybook(filterCompany)
    : null;

  const getDiffColor = (diff: string) => {
    if (diff === 'Easy') return 'text-emerald-700 dark:text-emerald-400';
    if (diff === 'Medium') return 'text-violet-700 dark:text-violet-400';
    return 'text-rose-700 dark:text-rose-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e4ddf5] dark:border-[#26193f] pb-6">
        <div>
          <p className="text-xs font-medium text-violet-700 dark:text-violet-400 mb-1.5">
            Curated Technical Scenarios
          </p>
          <h1 className="text-3xl font-bold text-[#140f1f] dark:text-white flex items-center gap-3">
            <BookOpen className="text-violet-700 dark:text-violet-400" size={26} />
            <span>Study Question Bank</span>
          </h1>
          <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm mt-1">
            Bookmark high-yield prompts to your encrypted vault or launch any
            scenario directly in the live studio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('simulation')}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-black hover:bg-[#f6f3fd] dark:hover:bg-[#120b24] border border-[#e4ddf5] dark:border-[#26193f] text-xs font-semibold text-[#140f1f] dark:text-violet-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            AI Question Generator
          </button>
          <button
            type="button"
            onClick={() => onNavigate('setup')}
            className="flex items-center gap-2 px-5 py-2.5 amoled-btn-primary text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <PlayCircle size={16} />
            <span>Start Mock Interview</span>
          </button>
        </div>
      </div>

      {/* Filters & Segmented Tabs */}
      <div className="amoled-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl w-fit">
            <button
              type="button"
              aria-pressed={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              All Questions ({mockQuestions.length})
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-violet-600 text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              Saved Bookmarks ({bookmarkedIds.length})
            </button>
          </div>
          <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-mono tabular-nums">
            Showing {filtered.length} of {mockQuestions.length} scenarios
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5170] dark:text-[#a69cbe]"
            size={18}
          />
          <input
            type="text"
            aria-label="Search questions by topic, company, or role"
            placeholder="Search by topic, company, or role (e.g. 'Rate limiter', 'React', 'Google')..."
            className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl py-3 pl-11 pr-4 text-sm text-[#140f1f] dark:text-white placeholder:text-[#5a5170] dark:placeholder:text-[#a69cbe] focus:ring-2 focus:ring-violet-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            aria-label="Filter by company"
            className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-violet-100 text-xs rounded-xl p-3 outline-none focus:border-violet-500 cursor-pointer"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {COMPANIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by role"
            className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-violet-100 text-xs rounded-xl p-3 outline-none focus:border-violet-500 cursor-pointer"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by career level"
            className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-violet-100 text-xs rounded-xl p-3 outline-none focus:border-violet-500 cursor-pointer"
            value={filterLevel}
            onChange={(e) =>
              setFilterLevel(e.target.value as '' | ExperienceTier)
            }
          >
            <option value="">All Career Levels</option>
            <option value="Entry">Entry (0-1y)</option>
            <option value="Mid-Level">Mid-Level (2-4y)</option>
            <option value="Senior">Senior (5-9y)</option>
            <option value="Staff">Staff (10-16y)</option>
            <option value="Principal">Principal (17-25+y)</option>
          </select>
          <select
            aria-label="Filter by difficulty"
            className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-violet-100 text-xs rounded-xl p-3 outline-none focus:border-violet-500 cursor-pointer"
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {selectedPlaybook && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-violet-700 dark:text-violet-300">
                {selectedPlaybook.company} Real-World Pattern ·{' '}
                {selectedPlaybook.archetype}
              </span>
            </div>
            <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] leading-relaxed">
              {selectedPlaybook.cultureSummary}
            </p>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((q) => {
          const isSaved = bookmarkedIds.includes(q.id);
          const isExpanded = expandedTipsId === q.id;
          return (
            <div
              key={q.id}
              className="amoled-surface rounded-2xl p-6 flex flex-col justify-between gap-5 hover:border-violet-500/50 transition-colors"
            >
              <div className="space-y-3">
                {/* Quiet unboxed metadata line */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a5170] dark:text-[#a69cbe]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-violet-700 dark:text-violet-300">
                      {q.company}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{q.role}</span>
                    {q.level && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{q.level}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{q.category}</span>
                  </div>
                  <span
                    className={`font-mono font-semibold ${getDiffColor(
                      q.difficulty
                    )}`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                {q.cultureFocus && (
                  <div className="text-[11px] font-medium text-[#5a5170] dark:text-[#a69cbe]">
                    Culture Focus: {q.cultureFocus}
                  </div>
                )}

                <h3 className="text-base font-bold text-[#140f1f] dark:text-white leading-snug">
                  {q.text}
                </h3>

                {isExpanded && q.tips && q.tips.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-purple-400">
                      <Lightbulb size={13} />
                      <span>Interviewer Hints</span>
                    </div>
                    <ul className="space-y-1 text-xs text-[#362f47] dark:text-[#d8d0ea]">
                      {q.tips.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e4ddf5] dark:border-[#26193f]">
                <span className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-mono tabular-nums">
                  {q.timesAsked || 0} candidate runs
                </span>
                <div className="flex items-center gap-2">
                  {q.tips && q.tips.length > 0 && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedTipsId(isExpanded ? null : q.id)
                      }
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-xs font-medium text-[#362f47] dark:text-[#d8d0ea] hover:text-[#140f1f] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Hints' : 'Hints'}</span>
                      {isExpanded ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-pressed={isSaved}
                    onClick={() => toggleBookmark(q.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-violet-600/15 border-violet-500/40 text-violet-700 dark:text-violet-300'
                        : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
                    }`}
                    title={isSaved ? 'Remove bookmark' : 'Bookmark scenario'}
                  >
                    {isSaved ? (
                      <BookmarkCheck size={14} />
                    ) : (
                      <BookmarkPlus size={14} />
                    )}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onPracticeQuestion) {
                        onPracticeQuestion({
                          company: q.company,
                          role: q.role,
                          type: q.category,
                          difficulty: q.difficulty,
                          experience: levelToExperience(q.level),
                          focusTopics: q.text,
                        });
                      } else {
                        onNavigate('setup');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg amoled-btn-primary text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle size={14} />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-1 lg:col-span-2 amoled-surface rounded-2xl py-12 px-6 text-center space-y-3">
            <p className="text-sm font-semibold text-[#362f47] dark:text-[#d8d0ea]">
              {activeTab === 'saved'
                ? 'No bookmarked questions yet.'
                : 'No questions match your current filters.'}
            </p>
            {activeTab === 'saved' && (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-xl bg-white dark:bg-black border border-violet-500/40 text-xs font-semibold text-violet-700 dark:text-violet-300 cursor-pointer"
              >
                Browse All Questions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

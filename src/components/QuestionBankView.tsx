import React, { useState } from 'react';
import { mockQuestions, COMPANIES, ROLES } from '../data';
import { User, InterviewConfig } from '../types';
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
    return true;
  });

  const getDiffColor = (diff: string) => {
    if (diff === 'Easy') return 'text-emerald-400';
    if (diff === 'Medium') return 'text-cyan-400';
    return 'text-rose-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#16223b] pb-6">
        <div>
          <p className="text-xs font-medium text-blue-400 mb-1.5">
            Curated Technical Scenarios
          </p>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-blue-400" size={26} />
            <span>Study Question Bank</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Bookmark high-yield prompts to your encrypted vault or launch any
            scenario directly in the live studio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('simulation')}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-[#0a1120] border border-[#16223b] text-xs font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
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
          <div className="inline-flex items-center gap-1 p-1 bg-black border border-[#16223b] rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Questions ({mockQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Saved Bookmarks ({bookmarkedIds.length})
            </button>
          </div>
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            Showing {filtered.length} of {mockQuestions.length} scenarios
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by topic, company, or role (e.g. 'Rate limiter', 'React', 'Google')..."
            className="w-full bg-black border border-[#16223b] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="bg-black border border-[#16223b] text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-blue-500 cursor-pointer"
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
            className="bg-black border border-[#16223b] text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-blue-500 cursor-pointer"
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
            className="bg-black border border-[#16223b] text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-blue-500 cursor-pointer"
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((q) => {
          const isSaved = bookmarkedIds.includes(q.id);
          const isExpanded = expandedTipsId === q.id;
          return (
            <div
              key={q.id}
              className="amoled-surface rounded-2xl p-6 flex flex-col justify-between gap-5 hover:border-blue-500/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Quiet unboxed metadata line */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-blue-300">
                      {q.company}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{q.role}</span>
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

                <h3 className="text-base font-bold text-white leading-snug">
                  {q.text}
                </h3>

                {isExpanded && q.tips && q.tips.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-black border border-[#16223b] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                      <Lightbulb size={13} />
                      <span>Interviewer Hints</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {q.tips.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#16223b]">
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {q.timesAsked || 0} candidate runs
                </span>
                <div className="flex items-center gap-2">
                  {q.tips && q.tips.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTipsId(isExpanded ? null : q.id)
                      }
                      className="px-3 py-1.5 rounded-lg bg-black border border-[#16223b] text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
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
                    onClick={() => toggleBookmark(q.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-300'
                        : 'bg-black border-[#16223b] text-slate-400 hover:text-white'
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
            <p className="text-sm font-semibold text-slate-300">
              {activeTab === 'saved'
                ? 'No bookmarked questions yet.'
                : 'No questions match your current filters.'}
            </p>
            {activeTab === 'saved' && (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-xl bg-black border border-blue-500/40 text-xs font-semibold text-blue-300 cursor-pointer"
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

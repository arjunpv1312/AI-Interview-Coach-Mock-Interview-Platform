import React from 'react';
import { ColorMode, User } from '../types';
import {
  PlayCircle,
  History,
  BookOpen,
  Video,
  Target,
  Clock,
  Building,
  FileText,
  Lightbulb,
  Brain,
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  Upload,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badges } from './Badges';
import { Logo } from './Logo';
import { CalendarWidget } from './CalendarWidget';
import { DailyGoalTracker } from './DailyGoalTracker';

interface DashboardViewProps {
  user: User;
  colorMode?: ColorMode;
  onOpenGuide?: () => void;
  onNavigate: (view: any) => void;
  onUpdateUser?: (props: Partial<User>) => void;
  onLaunchPrefill?: (prefill: Partial<import('../types').InterviewConfig>) => void;
}

export function DashboardView({
  user,
  colorMode = 'dark',
  onOpenGuide,
  onNavigate,
  onUpdateUser,
  onLaunchPrefill,
}: DashboardViewProps) {
  const isDark = colorMode === 'dark';

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      if (m > 0) return `${h}h ${m}m`;
      return `${h}h`;
    }
    return `${m}m`;
  };

  const getRankInfo = (interviews: number) => {
    if (interviews < 5)
      return {
        level: 1,
        rank: 'Foundation',
        next: 'Practitioner',
        max: 5,
        current: interviews,
        color: 'text-[#362f47] dark:text-[#d8d0ea]',
        bg: 'bg-violet-600',
      };
    if (interviews < 13)
      return {
        level: 2,
        rank: 'Practitioner',
        next: 'Specialist',
        max: 13,
        current: interviews,
        color: 'text-violet-700 dark:text-violet-400',
        bg: 'bg-violet-600',
      };
    if (interviews < 20)
      return {
        level: 3,
        rank: 'Specialist',
        next: 'Principal',
        max: 20,
        current: interviews,
        color: 'text-purple-700 dark:text-purple-400',
        bg: 'bg-purple-600',
      };
    if (interviews < 50)
      return {
        level: 4,
        rank: 'Principal',
        next: 'Distinguished',
        max: 50,
        current: interviews,
        color: 'text-violet-800 dark:text-violet-300',
        bg: 'bg-violet-500',
      };
    return {
      level: 5,
      rank: 'Distinguished',
      next: 'Fellow',
      max: 100,
      current: Math.min(interviews, 100),
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-500',
    };
  };

  const rankInfo = getRankInfo(user.totalInterviews);
  const resume = user.resumeProfile;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4 border-b border-[#e4ddf5] dark:border-[#26193f]">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl border border-violet-300 dark:border-violet-500/35 overflow-hidden shrink-0">
            <Logo />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#140f1f] dark:text-white tracking-tight [text-wrap:balance]">
              Welcome back,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-purple-500 dark:from-violet-400 dark:to-purple-300">
                {user.fullName.split(' ')[0]}
              </span>
            </h1>
            <p className="text-[#5a5170] dark:text-[#a69cbe] mt-1 text-sm sm:text-base">
              Launch a resume-grounded mock interview or inspect your readiness
              metrics.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-2 bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] border border-[#e4ddf5] dark:border-[#26193f] text-[#140f1f] dark:text-[#f5f3ff] px-4 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <HelpCircle
                size={17}
                className="text-violet-700 dark:text-violet-400"
              />
              <span>Platform Guide</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('setup')}
            className="flex items-center gap-2 amoled-btn-primary text-white px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <PlayCircle size={18} />
            <span>Start Practice</span>
          </button>
        </div>
      </div>

      {/* Resume Profile Banner */}
      <div className="amoled-surface rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-300 dark:border-violet-500/35 flex items-center justify-center text-violet-700 dark:text-violet-400 shrink-0">
            <FileText size={20} />
          </div>
          <div>
            {resume ? (
              <>
                <div className="flex items-center gap-2 text-sm font-bold text-[#140f1f] dark:text-white">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <span>Active Resume: {resume.fileName}</span>
                </div>
                <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                  {resume.candidateName} · {resume.skills.length} skills ·{' '}
                  {resume.projects.length} projects ready for tailored opening
                  questions
                </p>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-[#140f1f] dark:text-white">
                  No Resume Uploaded Yet
                </div>
                <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                  Upload a PDF, DOCX, or TXT resume in Session Setup so the AI
                  starts with questions from your real projects.
                </p>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('setup')}
          className="px-4 py-2 rounded-xl bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] border border-violet-400/50 text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
        >
          <Upload size={14} />
          <span>{resume ? 'Manage Resume' : 'Upload Resume'}</span>
        </button>
      </div>

      {/* Progress & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="amoled-surface rounded-2xl p-6"
        >
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-medium mb-1">
                Readiness Tier
              </div>
              <div className={`text-2xl font-bold ${rankInfo.color}`}>
                Tier {rankInfo.level}: {rankInfo.rank}
              </div>
            </div>
            <div className="text-xs font-medium text-[#5a5170] dark:text-[#a69cbe] text-right tabular-nums">
              <span className="text-[#140f1f] dark:text-white font-bold font-mono">
                {rankInfo.current}
              </span>{' '}
              / {rankInfo.max} to {rankInfo.next}
            </div>
          </div>
          <div className="h-2.5 w-full bg-[#f3effb] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-full overflow-hidden mt-4">
            <div
              className={`h-full rounded-full transition-all duration-700 ${rankInfo.bg}`}
              style={{ width: `${(rankInfo.current / rankInfo.max) * 100}%` }}
            />
          </div>
        </motion.div>

        <DailyGoalTracker
          user={user}
          onUpdateGoal={(goal) => onUpdateUser?.({ dailyGoal: goal })}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <Video
              className="text-violet-700 dark:text-violet-400"
              size={20}
            />
          }
          title="Mock Interviews"
          value={user.totalInterviews.toString()}
        />
        <StatCard
          icon={
            <Target
              className="text-purple-700 dark:text-purple-400"
              size={20}
            />
          }
          title="Average Score"
          value={user.totalInterviews > 0 ? `${user.averageScore}%` : '—'}
        />
        <StatCard
          icon={
            <Clock
              className="text-emerald-600 dark:text-emerald-400"
              size={20}
            />
          }
          title="Time Practiced"
          value={formatTimeSpent(user.timeSpentSeconds)}
        />
        <StatCard
          icon={
            <Building
              className="text-violet-700 dark:text-violet-300"
              size={20}
            />
          }
          title="Companies"
          value={
            user.companiesInterviewed
              ? user.companiesInterviewed.length.toString()
              : '0'
          }
        />
      </div>

      <Badges user={user} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trajectory Chart */}
        <div className="lg:col-span-2 amoled-surface rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-bold text-[#140f1f] dark:text-white mb-5">
            Score Progression
          </h2>
          <div className="flex-1 min-h-[250px] w-full relative">
            {user.totalInterviews === 0 ||
            !user.scoreHistory ||
            user.scoreHistory.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-[#e4ddf5] dark:border-[#26193f] rounded-xl text-[#5a5170] dark:text-[#a69cbe] bg-[#faf8ff] dark:bg-black/50">
                <Target
                  className="mb-2 text-violet-500/70 dark:text-violet-400/70"
                  size={28}
                />
                <p className="text-sm font-medium text-[#140f1f] dark:text-white">
                  No interview data yet
                </p>
                <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-1">
                  Complete a mock interview to track your score curve.
                </p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={user.scoreHistory.map((score, i) => ({
                      name: `#${i + 1}`,
                      score,
                    }))}
                  >
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={isDark ? 0.45 : 0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#26193f' : '#e4ddf5'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? '#a69cbe' : '#5a5170'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={isDark ? '#a69cbe' : '#5a5170'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#08050f' : '#ffffff',
                        border: isDark
                          ? '1px solid #26193f'
                          : '1px solid #e4ddf5',
                        borderRadius: '10px',
                        color: isDark ? '#f5f3ff' : '#140f1f',
                      }}
                      itemStyle={{
                        color: isDark ? '#c084fc' : '#6d28d9',
                        fontWeight: 'bold',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={isDark ? '#a855f7' : '#7c3aed'}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      activeDot={{
                        r: 5,
                        fill: isDark ? '#c084fc' : '#6d28d9',
                        strokeWidth: 0,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Pro Tips */}
        <div className="flex flex-col gap-6">
          <div className="amoled-surface rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#140f1f] dark:text-white mb-1">
              Quick Actions
            </h2>

            <QuickActionBtn
              onClick={() => onNavigate('setup')}
              icon={
                <PlayCircle
                  size={18}
                  className="text-violet-700 dark:text-violet-400"
                />
              }
              title="Start Resume Interview"
              subtitle="Upload resume & customize round"
            />
            <QuickActionBtn
              onClick={() => onNavigate('suggestions')}
              icon={
                <Sparkles
                  size={18}
                  className="text-purple-700 dark:text-purple-400"
                />
              }
              title="AI Career Coach"
              subtitle="Personalized performance insights"
            />
            <QuickActionBtn
              onClick={() => onNavigate('learner')}
              icon={
                <Brain
                  size={18}
                  className="text-violet-700 dark:text-violet-300"
                />
              }
              title="Auto-Learner Hub"
              subtitle="Generate study modules & trends"
            />
            <QuickActionBtn
              onClick={() => onNavigate('history')}
              icon={
                <History
                  size={18}
                  className="text-[#362f47] dark:text-[#d8d0ea]"
                />
              }
              title="Interview History"
              subtitle="Review past sessions & scores"
            />
            <QuickActionBtn
              onClick={() => onNavigate('bank')}
              icon={
                <BookOpen
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              }
              title="Study Scenarios"
              subtitle="Browse curated technical bank"
            />
          </div>

          <div className="amoled-surface rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
              <Lightbulb size={18} />
              <h2 className="text-base font-bold text-[#140f1f] dark:text-white">
                Interview Strategy Tips
              </h2>
            </div>
            <div className="space-y-3 text-xs text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
              <p className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-3">
                Anchor resume project answers in concrete bottlenecks, scale
                numbers, and why you rejected alternatives.
              </p>
              <p className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-3">
                Think aloud before coding or designing—clarify constraints in
                the first 60 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#140f1f] dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon
            className="text-violet-700 dark:text-violet-400"
            size={18}
          />
          <span>Interview Schedule</span>
        </h2>
        <CalendarWidget
          user={user}
          onNavigate={onNavigate}
          onUpdateUser={onUpdateUser}
          onLaunchSession={(prefill) =>
            onLaunchPrefill ? onLaunchPrefill(prefill) : onNavigate('setup')
          }
        />
      </div>
    </div>
  );
}

function QuickActionBtn({
  onClick,
  icon,
  title,
  subtitle,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] hover:border-violet-500/50 transition-all text-left cursor-pointer"
    >
      <div className="p-2 rounded-lg bg-[#faf8ff] dark:bg-[#120b1f] border border-[#e4ddf5] dark:border-[#26193f] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#140f1f] dark:text-white truncate">
          {title}
        </div>
        <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] truncate">
          {subtitle}
        </div>
      </div>
    </button>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="amoled-surface rounded-2xl p-5 flex items-center gap-4">
      <div className="p-3 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-medium">
          {title}
        </div>
        <div className="text-2xl font-bold text-[#140f1f] dark:text-white mt-0.5 font-mono tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

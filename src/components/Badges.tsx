import React from 'react';
import { User } from '../types';
import {
  Award,
  Star,
  Flame,
  Trophy,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface BadgesProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function Badges({ user, onNavigate }: BadgesProps) {
  const streak = user.loginStreak || 0;
  const hasImprovementStreak = Boolean(
    user.scoreHistory &&
      user.scoreHistory.length >= 2 &&
      user.scoreHistory[user.scoreHistory.length - 1] >
        user.scoreHistory[user.scoreHistory.length - 2]
  );
  const isTopPerformer = Boolean(
    user.scoreHistory && user.scoreHistory.some((score) => score >= 90)
  );

  const badges = [
    {
      id: 'first-interview',
      title: 'First Benchmark',
      description: 'Complete your first interview session',
      icon: Star,
      active: user.totalInterviews > 0,
      statusText: user.totalInterviews > 0 ? 'Unlocked' : '0/1',
    },
    {
      id: 'ten-sessions',
      title: 'Ten Rounds',
      description: 'Complete 10 interview sessions',
      icon: Award,
      active: user.totalInterviews >= 10,
      statusText:
        user.totalInterviews >= 10
          ? 'Unlocked'
          : `${user.totalInterviews}/10`,
    },
    {
      id: 'seven-day-streak',
      title: '7-Session Cadence',
      description: 'Practice across 7 consecutive sessions',
      icon: Flame,
      active: streak >= 7,
      statusText: streak >= 7 ? 'Unlocked' : `${streak}/7`,
    },
    {
      id: 'improvement-streak',
      title: 'Upward Trajectory',
      description: 'Surpass your previous session score',
      icon: TrendingUp,
      active: hasImprovementStreak,
      statusText: hasImprovementStreak ? 'Unlocked' : 'Pending',
    },
    {
      id: 'top-performer',
      title: 'Top Percentile',
      description: 'Achieve a score of 90+ in a round',
      icon: Trophy,
      active: isTopPerformer,
      statusText: isTopPerformer ? 'Unlocked' : '90+ Target',
    },
  ];

  const hasCertificate =
    user.totalInterviews >= 10 || isTopPerformer || streak >= 7;

  return (
    <div className="amoled-surface rounded-2xl p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-600/20 border border-violet-300 dark:border-violet-500/35 rounded-xl text-violet-700 dark:text-violet-400">
            <Award size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#140f1f] dark:text-white">
              Milestones &amp; Credentials
            </h2>
            <p className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
              Earned automatically from your encrypted interview history
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('certificate')}
          className="flex items-center gap-2 bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] text-violet-700 dark:text-violet-300 border border-violet-400/50 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Award size={15} />
          <span>
            {hasCertificate
              ? 'View Unlocked Certificates'
              : 'Certificate Milestones'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`flex flex-col gap-3 p-4 rounded-xl border transition-colors ${
                badge.active
                  ? 'bg-white dark:bg-black border-violet-500/45'
                  : 'bg-[#faf8ff] dark:bg-black/60 border-[#e4ddf5] dark:border-[#26193f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2.5 rounded-xl border ${
                    badge.active
                      ? 'bg-violet-100 dark:bg-violet-600/20 border-violet-300 dark:border-violet-500/35 text-violet-700 dark:text-violet-400'
                      : 'bg-white dark:bg-[#08050f] border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe]'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs font-mono tabular-nums flex items-center gap-1 ${
                    badge.active
                      ? 'text-purple-700 dark:text-purple-400 font-semibold'
                      : 'text-[#5a5170] dark:text-[#a69cbe]'
                  }`}
                >
                  {badge.active && <CheckCircle2 size={12} />}
                  {badge.statusText}
                </span>
              </div>

              <div>
                <h3
                  className={`text-sm font-bold ${
                    badge.active
                      ? 'text-[#140f1f] dark:text-white'
                      : 'text-[#362f47] dark:text-[#d8d0ea]'
                  }`}
                >
                  {badge.title}
                </h3>
                <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

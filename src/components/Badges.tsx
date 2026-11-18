import React from 'react';
import { User } from '../types';
import { Award, Star, Flame, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';

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
      title: 'First Step',
      description: 'Complete your first interview session',
      icon: Star,
      active: user.totalInterviews > 0,
      statusText: user.totalInterviews > 0 ? 'Unlocked' : '0/1',
    },
    {
      id: 'ten-sessions',
      title: 'Interview Veteran',
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
      title: '7-Day Streak',
      description: 'Practice across 7 sessions or days',
      icon: Flame,
      active: streak >= 7,
      statusText: streak >= 7 ? 'Unlocked' : `${streak}/7`,
    },
    {
      id: 'improvement-streak',
      title: 'Trending Up',
      description: 'Beat your previous session score',
      icon: TrendingUp,
      active: hasImprovementStreak,
      statusText: hasImprovementStreak ? 'Unlocked' : 'Pending',
    },
    {
      id: 'top-performer',
      title: 'Top Performer',
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
          <div className="p-2 bg-blue-600/15 border border-blue-500/30 rounded-xl text-blue-400">
            <Award size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Milestones & Badges
            </h2>
            <p className="text-xs text-slate-400">
              Earned automatically from your encrypted interview history
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('certificate')}
          className="flex items-center gap-2 bg-black hover:bg-[#0a1120] text-blue-300 border border-blue-500/40 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Award size={15} />
          <span>
            {hasCertificate ? 'View Unlocked Certificates' : 'Certificate Milestones'}
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
                  ? 'bg-black border-blue-500/40'
                  : 'bg-black/60 border-[#16223b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2.5 rounded-xl border ${
                    badge.active
                      ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                      : 'bg-[#050912] border-[#16223b] text-slate-500'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs font-mono tabular-nums flex items-center gap-1 ${
                    badge.active ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {badge.active && <CheckCircle2 size={12} />}
                  {badge.statusText}
                </span>
              </div>

              <div>
                <h3
                  className={`text-sm font-bold ${
                    badge.active ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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

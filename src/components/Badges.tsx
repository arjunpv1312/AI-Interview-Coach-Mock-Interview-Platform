import React from 'react';
import { User } from '../types';
import { Award, Star, Flame, Trophy, TrendingUp } from 'lucide-react';

interface BadgesProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function Badges({ user, onNavigate }: BadgesProps) {
  const badges = [];

  // Badge 1: First Interview
  if (user.totalInterviews > 0) {
    badges.push({
      id: 'first-interview',
      title: 'First Step',
      description: 'Completed your first interview session',
      icon: <Star className="text-amber-400" size={24} />,
      color: 'bg-amber-400/20 border-amber-500/50',
      active: true
    });
  } else {
    badges.push({
      id: 'first-interview',
      title: 'First Step',
      description: 'Complete your first interview session',
      icon: <Star className="text-slate-500" size={24} />,
      color: 'bg-slate-800/50 border-slate-700',
      active: false
    });
  }

  // Badge 2: 13 Sessions
  if (user.totalInterviews >= 13) {
    badges.push({
      id: 'thirteen-sessions',
      title: 'Dedicated Candidate',
      description: 'Completed 13 interview sessions',
      icon: <Flame className="text-rose-500" size={24} />,
      color: 'bg-rose-500/20 border-rose-500/50',
      active: true
    });
  } else {
    badges.push({
      id: 'thirteen-sessions',
      title: 'Dedicated Candidate',
      description: 'Complete 13 interview sessions',
      icon: <Flame className="text-slate-500" size={24} />,
      color: 'bg-slate-800/50 border-slate-700',
      active: false,
      progress: `${user.totalInterviews}/13`
    });
  }

  // Badge 3: Improvement Streak
  let hasImprovementStreak = false;
  if (user.scoreHistory && user.scoreHistory.length >= 2) {
    const lastTwo = user.scoreHistory.slice(-2);
    if (lastTwo[1] > lastTwo[0]) {
      hasImprovementStreak = true;
    }
  }

  if (hasImprovementStreak) {
    badges.push({
      id: 'improvement-streak',
      title: 'Trending Up',
      description: 'Improved your score from the last session',
      icon: <TrendingUp className="text-emerald-400" size={24} />,
      color: 'bg-emerald-500/20 border-emerald-500/50',
      active: true
    });
  } else {
    badges.push({
      id: 'improvement-streak',
      title: 'Trending Up',
      description: 'Improve your score from the last session',
      icon: <TrendingUp className="text-slate-500" size={24} />,
      color: 'bg-slate-800/50 border-slate-700',
      active: false
    });
  }

  // Badge 4: Top Performer (Score > 90)
  const isTopPerformer = user.scoreHistory && user.scoreHistory.some(score => score >= 90);
  
  if (isTopPerformer) {
    badges.push({
      id: 'top-performer',
      title: 'Top Performer',
      description: 'Achieved a score of 90+ in an interview',
      icon: <Trophy className="text-purple-400" size={24} />,
      color: 'bg-purple-500/20 border-purple-500/50',
      active: true
    });
  } else {
    badges.push({
      id: 'top-performer',
      title: 'Top Performer',
      description: 'Achieve a score of 90+ in an interview',
      icon: <Trophy className="text-slate-500" size={24} />,
      color: 'bg-slate-800/50 border-slate-700',
      active: false
    });
  }

  const hasCertificate = user.totalInterviews >= 13 || isTopPerformer || (user.loginStreak && user.loginStreak >= 7);

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Award className="text-indigo-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Your Badges</h2>
        </div>
        
        {hasCertificate && (
          <button 
            onClick={() => onNavigate('certificate')}
            className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
          >
            <Award size={16} />
            View Certificate
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id}
            className={`flex flex-col gap-3 p-4 rounded-xl border ${badge.color} transition-all duration-300 relative overflow-hidden group`}
          >
            {badge.active && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-full flex items-center justify-center ${badge.active ? 'bg-slate-900/50 shadow-inner block' : 'bg-slate-800/80 grayscale'}`}>
                 {badge.icon}
              </div>
              {!badge.active && badge.progress && (
                <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{badge.progress}</span>
              )}
              {badge.active && (
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-md uppercase tracking-wider">Unlocked</span>
              )}
            </div>
            
            <div>
              <h3 className={`font-bold ${badge.active ? 'text-white' : 'text-slate-400'}`}>{badge.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

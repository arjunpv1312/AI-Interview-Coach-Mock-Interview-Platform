import React, { useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface DailyGoalTrackerProps {
  user: User;
  onUpdateGoal: (goal: number) => void;
}

export function DailyGoalTracker({
  user,
  onUpdateGoal,
}: DailyGoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(user.dailyGoal || 1);

  const handleSave = () => {
    let newGoal = parseInt(goalInput.toString(), 10);
    if (isNaN(newGoal) || newGoal < 1) newGoal = 1;
    if (newGoal > 20) newGoal = 20;
    onUpdateGoal(newGoal);
    setIsEditing(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday =
    user.pastSessions?.filter((s) => s.date.startsWith(todayStr)).length || 0;
  const goal = user.dailyGoal || 1;
  const progress = Math.min((completedToday / goal) * 100, 100);
  const isGoalReached = completedToday >= goal;

  return (
    <div className="amoled-surface rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isGoalReached
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:text-emerald-400'
                : 'bg-violet-100 dark:bg-violet-600/20 border-violet-300 dark:border-violet-500/35 text-violet-700 dark:text-violet-400'
            }`}
          >
            {isGoalReached ? <CheckCircle2 size={18} /> : <Target size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#140f1f] dark:text-white">
              Daily Practice Goal
            </h3>
            <p className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
              Mock interviews completed today
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min="1"
              max="20"
              aria-label="Daily practice session goal"
              value={goalInput}
              onChange={(e) => setGoalInput(parseInt(e.target.value, 10) || 1)}
              className="w-16 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-lg text-[#140f1f] dark:text-white text-center text-xs font-mono tabular-nums py-1.5 outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 amoled-btn-primary text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setGoalInput(goal);
              setIsEditing(true);
            }}
            className="text-xs font-medium text-violet-700 dark:text-violet-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Edit Goal
          </button>
        )}
      </div>

      <div className="mt-5 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
            <span
              className={`text-2xl font-bold ${
                isGoalReached
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[#140f1f] dark:text-white'
              }`}
            >
              {completedToday}
            </span>
            <span className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
              / {goal} sessions
            </span>
          </div>
          <span
            className={`text-xs font-medium ${
              isGoalReached
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-[#5a5170] dark:text-[#a69cbe]'
            }`}
          >
            {isGoalReached
              ? 'Target achieved'
              : `${goal - completedToday} remaining today`}
          </span>
        </div>

        <div className="w-full h-2.5 bg-[#f3effb] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isGoalReached
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-violet-600 to-purple-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

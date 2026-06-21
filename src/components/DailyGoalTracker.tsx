import React, { useState } from 'react';
import { Target, TrendingUp, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface DailyGoalTrackerProps {
  user: User;
  onUpdateGoal: (goal: number) => void;
}

export function DailyGoalTracker({ user, onUpdateGoal }: DailyGoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(user.dailyGoal || 1);

  const handleSave = () => {
    let newGoal = parseInt(goalInput.toString(), 10);
    if (isNaN(newGoal) || newGoal < 1) newGoal = 1;
    onUpdateGoal(newGoal);
    setIsEditing(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = user.pastSessions?.filter(s => s.date.startsWith(todayStr)).length || 0;
  const goal = user.dailyGoal || 1;
  const progress = Math.min((completedToday / goal) * 100, 100);
  const isGoalReached = completedToday >= goal;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isGoalReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {isGoalReached ? <CheckCircle size={20} /> : <Target size={20} />}
          </div>
          <div>
            <h3 className="text-white font-bold">Daily Goal</h3>
            <p className="text-sm text-slate-400">Mock interviews today</p>
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="1"
              value={goalInput}
              onChange={e => setGoalInput(parseInt(e.target.value) || 1)}
              className="w-16 bg-slate-800 border border-slate-700 rounded text-white text-center text-sm py-1"
            />
            <button 
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors underline"
          >
            Edit Goal
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="flex items-end gap-1 mb-2">
          <span className={`text-4xl font-bold ${isGoalReached ? 'text-emerald-400' : 'text-white'}`}>
            {completedToday}
          </span>
          <span className="text-slate-500 font-medium pb-1.5">/ {goal}</span>
        </div>
        
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-2 relative">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isGoalReached ? 'bg-emerald-400' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm font-medium mt-4 text-center">
          {isGoalReached ? (
             <span className="text-emerald-400">Goal reached! Great work!</span>
          ) : (
             <span className="text-slate-400">{goal - completedToday} more to reach your goal.</span>
          )}
        </p>
      </div>
    </div>
  );
}

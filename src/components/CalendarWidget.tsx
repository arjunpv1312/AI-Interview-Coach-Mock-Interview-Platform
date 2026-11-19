import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Building,
  Target,
  CheckCircle2,
  Plus,
  Trash2,
  PlayCircle,
  X,
} from 'lucide-react';
import { User, ScheduledSession } from '../types';
import { COMPANIES, ROLES } from '../data';

interface CalendarWidgetProps {
  user: User;
  onNavigate: (view: any) => void;
  onUpdateUser?: (props: Partial<User>) => void;
  onLaunchSession?: (prefill: {
    company: string;
    role: string;
    type: string;
  }) => void;
}

export function CalendarWidget({
  user,
  onNavigate,
  onUpdateUser,
  onLaunchSession,
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newCompany, setNewCompany] = useState('Google');
  const [newRole, setNewRole] = useState('Software Engineer');
  const [newType, setNewType] = useState('Technical');
  const [newTime, setNewTime] = useState('18:00');

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const toLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const scheduledSessions = user.scheduledSessions || [];
  const selectedDateStr = toLocalDateKey(selectedDate);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const isoDate = `${selectedDateStr}T${newTime}:00`;
    const newSession: ScheduledSession = {
      id: Math.random().toString(36).slice(2, 10),
      date: isoDate,
      company: newCompany,
      role: newRole,
      type: newType,
    };
    const updated = [...scheduledSessions, newSession];
    onUpdateUser?.({ scheduledSessions: updated });
    setShowScheduleForm(false);
  };

  const handleDeleteScheduled = (id: string) => {
    const updated = scheduledSessions.filter((s) => s.id !== id);
    onUpdateUser?.({ scheduledSessions: updated });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const todayKey = toLocalDateKey(new Date());

    const blankCount = firstDay === 0 ? 6 : firstDay - 1;
    const blanks = Array.from({ length: blankCount }, (_, i) => (
      <div key={`blank-${i}`} className="h-9" />
    ));

    const daysArray = Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const dateObj = new Date(year, month, day);
      const dateStr = toLocalDateKey(dateObj);

      const hasPast = user.pastSessions?.some((s) =>
        s.date.startsWith(dateStr)
      );
      const hasUpcoming = scheduledSessions.some((s) =>
        s.date.startsWith(dateStr)
      );

      const isSelected = selectedDateStr === dateStr;
      const isToday = todayKey === dateStr;

      return (
        <button
          type="button"
          key={day}
          aria-label={`Select ${dateObj.toDateString()}`}
          aria-pressed={isSelected}
          onClick={() => {
            setSelectedDate(dateObj);
            setShowScheduleForm(false);
          }}
          className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-mono tabular-nums transition-all relative mx-auto cursor-pointer ${
            isSelected
              ? 'bg-violet-600 text-white font-bold'
              : 'hover:bg-[#f3effb] dark:hover:bg-[#120b1f] text-[#362f47] dark:text-[#d8d0ea]'
          } ${isToday && !isSelected ? 'border border-violet-500/60' : ''}`}
        >
          <span>{day}</span>
          {(hasPast || hasUpcoming) && (
            <span className="absolute bottom-1 flex gap-1">
              {hasPast && (
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
              )}
              {hasUpcoming && (
                <span className="w-1 h-1 rounded-full bg-violet-400" />
              )}
            </span>
          )}
        </button>
      );
    });

    const totalSlots = [...blanks, ...daysArray];
    const rows: React.ReactNode[][] = [];
    for (let i = 0; i < totalSlots.length; i += 7) {
      rows.push(totalSlots.slice(i, i + 7));
    }

    return rows.map((row, i) => (
      <div key={`row-${i}`} className="grid grid-cols-7 gap-1">
        {row}
      </div>
    ));
  };

  const selectedPast =
    user.pastSessions?.filter((s) => s.date.startsWith(selectedDateStr)) || [];
  const selectedUpcoming = scheduledSessions.filter((s) =>
    s.date.startsWith(selectedDateStr)
  );
  const hasEvents = selectedPast.length > 0 || selectedUpcoming.length > 0;

  return (
    <div className="amoled-surface rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[400px]">
      {/* Left Calendar Grid */}
      <div className="w-full md:w-[340px] border-b md:border-b-0 md:border-r border-[#e4ddf5] dark:border-[#26193f] p-6 flex flex-col bg-[#faf8ff] dark:bg-black/50">
        <div className="flex w-full items-center justify-between mb-5">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-1.5 hover:bg-[#f3effb] dark:hover:bg-[#120b1f] rounded-lg text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-sm font-bold text-[#140f1f] dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long' })}{' '}
            {currentDate.getFullYear()}
          </div>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="p-1.5 hover:bg-[#f3effb] dark:hover:bg-[#120b1f] rounded-lg text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 w-full text-center text-[11px] font-semibold text-[#5a5170] dark:text-[#a69cbe] mb-2">
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>Su</div>
        </div>

        <div className="w-full flex-1 space-y-1">{renderCalendar()}</div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#e4ddf5] dark:border-[#26193f] text-xs text-[#5a5170] dark:text-[#a69cbe]">
          <span>Emerald mark: Completed</span>
          <span>Violet mark: Scheduled</span>
        </div>
      </div>

      {/* Right Event & Scheduler Panel */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#e4ddf5] dark:border-[#26193f]">
          <div className="flex items-center gap-2.5 text-[#140f1f] dark:text-white">
            <CalendarIcon
              size={18}
              className="text-violet-700 dark:text-violet-400"
            />
            <h3 className="text-base font-bold">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] border border-violet-400/50 text-xs font-semibold text-violet-700 dark:text-violet-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            {showScheduleForm ? <X size={14} /> : <Plus size={14} />}
            <span>{showScheduleForm ? 'Cancel' : 'Schedule Session'}</span>
          </button>
        </div>

        {showScheduleForm && (
          <form
            onSubmit={handleAddSchedule}
            className="mb-5 p-4 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] space-y-3"
          >
            <div className="text-xs font-bold text-[#140f1f] dark:text-white">
              Add Practice Session to Encrypted Vault ({selectedDateStr})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                aria-label="Scheduled company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-lg px-3 py-2 text-xs text-[#140f1f] dark:text-white outline-none focus:border-violet-500"
              >
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                aria-label="Scheduled role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-lg px-3 py-2 text-xs text-[#140f1f] dark:text-white outline-none focus:border-violet-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                aria-label="Scheduled round type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-lg px-3 py-2 text-xs text-[#140f1f] dark:text-white outline-none focus:border-violet-500"
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Behavioural">Behavioural</option>
              </select>
              <input
                aria-label="Scheduled time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-lg px-3 py-2 text-xs text-[#140f1f] dark:text-white font-mono outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              className="amoled-btn-primary text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Save Scheduled Session
            </button>
          </form>
        )}

        {!hasEvents && !showScheduleForm ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <CalendarIcon
              size={36}
              className="mb-3 text-violet-700 dark:text-violet-400"
            />
            <p className="text-sm font-semibold text-[#140f1f] dark:text-white">
              No sessions recorded for this date
            </p>
            <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-1 max-w-xs">
              Schedule a practice session on this date or launch a live mock
              interview right now.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowScheduleForm(true)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] border border-[#e4ddf5] dark:border-[#26193f] text-xs font-semibold text-[#140f1f] dark:text-white transition-colors cursor-pointer"
              >
                Add to Schedule
              </button>
              <button
                type="button"
                onClick={() => onNavigate('setup')}
                className="px-4 py-2 rounded-xl amoled-btn-primary text-xs font-semibold text-white cursor-pointer"
              >
                Start Live Now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {selectedUpcoming.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
                  <Clock size={14} />
                  <span>Scheduled Practice</span>
                </div>
                {selectedUpcoming.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-violet-500/35 bg-white dark:bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-600/20 text-violet-700 dark:text-violet-400 shrink-0">
                        <Building size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#140f1f] dark:text-white">
                          {session.company}
                        </div>
                        <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                          {session.role} · {session.type} ·{' '}
                          <span className="font-mono tabular-nums text-violet-700 dark:text-violet-300">
                            {new Date(session.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchSession
                            ? onLaunchSession({
                                company: session.company,
                                role: session.role,
                                type: session.type,
                              })
                            : onNavigate('setup')
                        }
                        className="px-3 py-1.5 rounded-lg amoled-btn-primary text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle size={13} />
                        <span>Launch</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduled(session.id)}
                        aria-label={`Delete scheduled ${session.company} session`}
                        className="p-1.5 rounded-lg bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-rose-700 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove scheduled session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedPast.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>Completed Sessions</span>
                </div>
                {selectedPast.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-[#140f1f] dark:text-white">
                          {session.company}
                        </div>
                        <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] mt-0.5">
                          {session.role} · {session.crackProbability}
                        </div>
                      </div>
                      <div className="text-sm font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Target size={13} />
                        <span>{session.score}%</span>
                      </div>
                    </div>
                    {session.overallSummary && (
                      <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] leading-relaxed line-clamp-2">
                        {session.overallSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Building, Target, CheckCircle2 } from 'lucide-react';
import { User, PastSession, ScheduledSession } from '../types';

interface CalendarWidgetProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function CalendarWidget({ user, onNavigate }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const [fakeScheduledSessions, setFakeScheduledSessions] = useState<ScheduledSession[]>([]);
  React.useEffect(() => {
     if (!user.scheduledSessions || user.scheduledSessions.length === 0) {
         const tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         const tmwStr = tomorrow.toISOString();
         setFakeScheduledSessions([{
             id: 'mock-scheduled-1',
             date: tmwStr,
             company: 'Google',
             role: 'Software Engineer',
             type: 'System Design Mock'
         }]);
     }
  }, [user.scheduledSessions]);

  const activeScheduledSessions = (user.scheduledSessions && user.scheduledSessions.length > 0) ? user.scheduledSessions : fakeScheduledSessions;

  // Build the calendar grid
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => <div key={`blank-${i}`} className="p-2"></div>);
    
    const daysArray = Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const dateObj = new Date(year, month, day);
      const dateStr = dateObj.toISOString().split('T')[0];
      
      const hasPast = user.pastSessions?.some(s => s.date.startsWith(dateStr));
      const hasUpcoming = activeScheduledSessions.some(s => s.date.startsWith(dateStr));
      
      const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      return (
        <button
          key={day}
          onClick={() => setSelectedDate(dateObj)}
          className={`h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all relative mx-auto
            ${isSelected ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30' : 'hover:bg-slate-800 text-slate-300'}
            ${isToday && !isSelected ? 'border border-blue-500/50' : ''}
          `}
        >
          <span>{day}</span>
          <div className="absolute bottom-1 flex gap-1">
            {hasPast && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
            {hasUpcoming && <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>}
          </div>
        </button>
      );
    });

    const totalSlots = [...blanks, ...daysArray];
    const rows = [];
    let cells = [];

    totalSlots.forEach((slot, i) => {
      if (i % 7 !== 0) {
        cells.push(slot);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(slot);
      }
      if (i === totalSlots.length - 1) {
        rows.push(cells);
      }
    });

    return rows.map((row, i) => <div key={`row-${i}`} className="grid grid-cols-7 gap-1">{row}</div>);
  };

  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const selectedPast = user.pastSessions?.filter(s => s.date.startsWith(selectedDateStr || ''));
  const selectedUpcoming = activeScheduledSessions.filter(s => s.date.startsWith(selectedDateStr || ''));
  
  const hasEvents = (selectedPast?.length || 0) > 0 || (selectedUpcoming?.length || 0) > 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden flex flex-col md:flex-row h-[420px]">
      {/* Calendar Area */}
      <div className="w-full md:w-[350px] border-b md:border-b-0 md:border-r border-slate-700/50 p-6 flex flex-col items-center bg-slate-900/30 relative">
        <div className="flex w-full items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="font-bold text-slate-200">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </div>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 w-full text-center text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
        </div>
        
        <div className="w-full flex-1">
          {renderCalendar()}
        </div>
        
        <div className="flex gap-4 mt-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Past</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Upcoming</div>
        </div>
      </div>
      
      {/* Detail Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-900/20">
        <div className="flex items-center gap-2 mb-6 text-slate-300">
          <CalendarIcon size={20} className="text-blue-400" />
          <h3 className="text-lg font-bold">
            {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
          </h3>
        </div>

        {!hasEvents ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 pb-10 opacity-70">
             <CalendarIcon size={48} className="mb-4 text-slate-600 opacity-50" />
             <p className="font-medium text-slate-400">No sessions scheduled.</p>
             <p className="text-sm mt-1">Take a break or schedule a new mock interview!</p>
             <button 
                onClick={() => onNavigate('setup')}
                className="mt-6 px-4 py-2 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 text-sm font-medium rounded-lg transition-all"
             >
               Schedule Mock Interview
             </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upcoming Sessions */}
            {selectedUpcoming && selectedUpcoming.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 ml-1 flex items-center gap-2">
                   <Clock size={14} /> Upcoming Interviews
                </h4>
                <div className="space-y-3">
                  {selectedUpcoming.map(session => (
                    <div key={session.id} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4 hover:bg-amber-500/10 transition-colors">
                       <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                          <Building size={20} />
                       </div>
                       <div>
                         <div className="font-bold text-slate-200">{session.company}</div>
                         <div className="text-sm text-amber-300 mt-0.5">{session.role} ({session.type})</div>
                         <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 opacity-80">
                           <CalendarIcon size={12} /> Scheduled for {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Sessions */}
            {selectedPast && selectedPast.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 ml-1 flex items-center gap-2">
                   <CheckCircle2 size={14} /> Past Performance
                </h4>
                <div className="space-y-3">
                  {selectedPast.map(session => (
                    <div key={session.id} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start flex-col sm:flex-row gap-4 hover:bg-emerald-500/10 transition-colors group relative">
                       <div className="w-full flex items-start gap-4">
                           <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                              <Building size={20} />
                           </div>
                           <div className="flex-1">
                             <div className="flex justify-between items-start">
                               <div>
                                 <div className="font-bold text-slate-200">{session.company}</div>
                                 <div className="text-sm text-emerald-300 mt-0.5">{session.role}</div>
                               </div>
                               <div className="flex flex-col items-end">
                                 <div className="text-sm font-bold text-white bg-slate-800 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                                   <Target size={14} className="text-blue-400"/> {session.score}%
                                 </div>
                               </div>
                             </div>
                             
                             {session.overallSummary && (
                               <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed border-l-2 border-emerald-500/30 pl-2">
                                 {session.overallSummary}
                               </p>
                             )}
                           </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

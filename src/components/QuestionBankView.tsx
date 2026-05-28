import React, { useState } from 'react';
import { mockQuestions, COMPANIES, ROLES } from '../data';
import { Search, Filter, BookmarkPlus, PlayCircle, BookOpen } from 'lucide-react';

export function QuestionBankView({ onNavigate }: { onNavigate: (v: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  
  const filtered = mockQuestions.filter(q => {
    if (searchTerm && !q.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCompany && q.company !== filterCompany) return false;
    if (filterRole && q.role !== filterRole) return false;
    if (filterDiff && q.difficulty !== filterDiff) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-blue-500" />
            Interview Question Bank
          </h1>
          <p className="text-slate-400 mt-1">Browse, filter, and practice real interview questions.</p>
        </div>
      </div>

      {/* Filters and Search Search */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-lg space-y-4">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text"
                placeholder="Search questions (e.g. 'design', 'react', 'leadership')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="bg-slate-800 border-slate-700 text-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                <option value="">All Companies</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-slate-800 border-slate-700 text-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="bg-slate-800 border-slate-700 text-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
            <div className="flex items-center gap-2 text-slate-400 font-medium pl-2">
                <Filter size={18} />
                {filtered.length} questions
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(q => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col hover:border-slate-600 transition-colors group">
                  <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded border border-slate-700">{q.company}</span>
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded border border-slate-700">{q.category}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ml-auto ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>{q.difficulty}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-6 flex-1 group-hover:text-blue-400 transition-colors">{q.text}</h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-sm text-slate-500">{q.timesAsked} practices</div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors" title="Save for later">
                            <BookmarkPlus size={20} />
                        </button>
                        <button 
                            onClick={() => onNavigate('setup')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                        >
                            <PlayCircle size={18} />
                            Practice
                        </button>
                    </div>
                  </div>
              </div>
          ))}
          {filtered.length === 0 && (
              <div className="col-span-1 lg:col-span-2 py-12 text-center text-slate-500">
                  No questions match your filters. Try adjusting them.
              </div>
          )}
      </div>

    </div>
  );
}

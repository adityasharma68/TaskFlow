// src/components/StatsBar.jsx — Responsive stats with animated counters
import { isPast, parseISO, isToday } from 'date-fns';

const Stat = ({ label, value, accent, icon }) => (
  <div className="card px-4 py-3.5 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 group hover:border-slate-700/80 transition-colors">
    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${accent} bg-opacity-15 flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-display font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest truncate">{label}</p>
    </div>
  </div>
);

const StatsBar = ({ tasks }) => {
  const total     = tasks.length;
  const completed = tasks.filter(t=>t.status==='Completed').length;
  const pending   = tasks.filter(t=>t.status==='Pending').length;
  const overdue   = tasks.filter(t=>{
    if (!t.due_date||t.status==='Completed') return false;
    const d=parseISO(t.due_date);
    return isPast(d)&&!isToday(d);
  }).length;

  const stats = [
    { label:'Total Tasks', value:total, accent:'bg-slate-400',
      icon:<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg> },
    { label:'Completed', value:completed, accent:'bg-brand-400',
      icon:<svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg> },
    { label:'Pending', value:pending, accent:'bg-amber-400',
      icon:<svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg> },
    { label:'Overdue', value:overdue, accent:'bg-red-400',
      icon:<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {stats.map(s => <Stat key={s.label} {...s}/>)}
    </div>
  );
};

export default StatsBar;

// src/components/TaskTable.jsx — with AI Suggest button on pending tasks
import { useState } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';

const StatusBadge = ({ status }) =>
  status === 'Completed'
    ? <span className="badge-completed"><span className="w-1.5 h-1.5 rounded-full bg-brand-400"/>Completed</span>
    : <span className="badge-pending"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>Pending</span>;

const DueDate = ({ dateStr }) => {
  if (!dateStr) return <span className="text-slate-600">—</span>;
  const date = parseISO(dateStr);
  const overdue = isPast(date) && !isToday(date);
  return <span className={`font-mono text-xs ${overdue?'text-red-400':'text-slate-400'}`}>{overdue&&'⚠ '}{format(date,'dd MMM yyyy')}</span>;
};

const Avatar = ({ name }) => {
  const initials=(name||'S').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const colors=['bg-purple-500','bg-pink-500','bg-orange-500','bg-cyan-500','bg-lime-500'];
  return <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colors[(name||'').charCodeAt(0)%colors.length||0]} text-white text-xs font-bold flex-shrink-0`}>{initials}</span>;
};

// ── AI Sparkle Icon ──────────────────────────────────────────
const SparkleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"/>
  </svg>
);

// ── Action buttons ───────────────────────────────────────────
const ActionButtons = ({ task, onEdit, onDelete, onAI, deleting }) => (
  <div className="flex items-center gap-1">
    {task.status === 'Pending' && (
      <button onClick={() => onAI(task)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
        style={{ background:'rgba(20,184,166,0.1)', color:'#2dd4bf', border:'1px solid rgba(20,184,166,0.2)' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(20,184,166,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background='rgba(20,184,166,0.1)'}
        title="Get AI suggestions">
        <SparkleIcon /> AI
      </button>
    )}
    <button onClick={() => onEdit(task)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
      title="Edit">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
      </svg>
    </button>
    <button onClick={() => onDelete(task)} disabled={deleting}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="Delete">
      {deleting
        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
      }
    </button>
  </div>
);

const TaskTable = ({ tasks, loading, onEdit, onDelete, onAISuggest }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeletingId(task.id);
    try { await onDelete(task.id); } finally { setDeletingId(null); }
  };

  if (loading) return (
    <div className="card overflow-hidden">
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_,i)=>(
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/3"/>
            <div className="h-4 bg-slate-800 rounded w-1/4"/>
            <div className="h-4 bg-slate-800 rounded w-1/5"/>
            <div className="h-4 bg-slate-800 rounded w-1/6 ml-auto"/>
          </div>
        ))}
      </div>
    </div>
  );

  if (!tasks.length) return (
    <div className="card flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-fade-in px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2"/>
        </svg>
      </div>
      <p className="font-display font-semibold text-slate-400 text-lg">No tasks found</p>
      <p className="text-slate-600 text-sm mt-1">Create your first task or try a different search.</p>
    </div>
  );

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="card overflow-hidden animate-fade-in hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['#','Title','Status','Due Date','Created By','Updated','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest first:pl-6 last:pr-6 last:text-right whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.map((task, idx) => (
                <tr key={task.id} className="group hover:bg-slate-800/30 transition-colors duration-100">
                  <td className="pl-6 pr-4 py-4 font-mono text-xs text-slate-600 w-10">{String(idx+1).padStart(2,'0')}</td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <p className="font-semibold text-slate-100 truncate">{task.title}</p>
                    {task.description&&<p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{task.description}</p>}
                    {task.remarks&&<p className="text-slate-600 text-xs mt-0.5 italic line-clamp-1">↳ {task.remarks}</p>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={task.status}/></td>
                  <td className="px-4 py-4 whitespace-nowrap"><DueDate dateStr={task.due_date}/></td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar name={task.created_by}/>
                      <span className="text-slate-400 text-xs truncate max-w-[90px]">{task.created_by||'—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-600">
                      {task.updated_at?format(parseISO(task.updated_at),'dd MMM HH:mm'):'—'}
                    </span>
                  </td>
                  <td className="pl-4 pr-5 py-4 whitespace-nowrap text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButtons task={task} onEdit={onEdit} onDelete={handleDelete}
                        onAI={onAISuggest} deleting={deletingId===task.id}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-mono">{tasks.length} task(s)</span>
          <div className="flex items-center gap-3">
            {tasks.filter(t=>t.status==='Pending').length > 0 && (
              <span className="text-xs text-brand-400 font-mono flex items-center gap-1">
                <SparkleIcon/> Hover a pending task for AI suggestions
              </span>
            )}
            <span className="text-xs text-slate-700">
              {tasks.filter(t=>t.status==='Completed').length} completed · {tasks.filter(t=>t.status==='Pending').length} pending
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden space-y-3 animate-fade-in">
        {tasks.map((task) => (
          <div key={task.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 leading-tight">{task.title}</p>
                {task.description&&<p className="text-slate-500 text-xs mt-1 line-clamp-2">{task.description}</p>}
              </div>
              <StatusBadge status={task.status}/>
            </div>
            {task.remarks&&<p className="text-slate-600 text-xs italic border-l-2 border-slate-700 pl-2">{task.remarks}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <DueDate dateStr={task.due_date}/>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Avatar name={task.created_by}/>{task.created_by||'—'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
              {task.status === 'Pending' && (
                <button onClick={() => onAISuggest(task)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background:'rgba(20,184,166,0.12)', color:'#2dd4bf', border:'1px solid rgba(20,184,166,0.25)' }}>
                  <SparkleIcon /> Ask AI
                </button>
              )}
              <div className={task.status !== 'Pending' ? 'ml-auto' : ''}>
                <ActionButtons task={task} onEdit={onEdit} onDelete={handleDelete}
                  onAI={onAISuggest} deleting={deletingId===task.id}/>
              </div>
            </div>
          </div>
        ))}
        <p className="text-center text-xs text-slate-700 font-mono pt-1">{tasks.length} task(s)</p>
      </div>
    </>
  );
};

export default TaskTable;
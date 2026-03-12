// src/App.jsx — v2 with Auth guard, responsive layout, user menu
import { useEffect, useState, useCallback } from 'react';
import { useAuth }   from './context/AuthContext';
import AuthPage      from './pages/AuthPage';
import useTasks      from './hooks/useTasks';
import TaskTable     from './components/TaskTable';
import TaskForm      from './components/TaskForm';
import Modal         from './components/Modal';
import SearchBar     from './components/SearchBar';
import StatsBar      from './components/StatsBar';
import toast         from 'react-hot-toast';

// ── Icons ───────────────────────────────────────────────────
const PlusIcon  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>;
const LogoutIcon= () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>;
const RefreshIcon=({s})=> <svg className={`w-4 h-4 ${s?'animate-spin':''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>;
const MenuIcon  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>;

// ── User Avatar ─────────────────────────────────────────────
const UserAvatar = ({ user, size = 'md' }) => {
  const initials = (user?.name || 'U').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-slate-950 flex-shrink-0`}
      style={{ background: user?.avatar_color || '#14b8a6' }}>
      {initials}
    </div>
  );
};

// ── Dashboard (authenticated view) ─────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { tasks, loading, loadTasks, addTask, editTask, removeTask } = useTasks();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget,  setEditTarget] = useState(null);
  const [keyword,     setKeyword]   = useState('');
  const [userMenuOpen,setUserMenuOpen]=useState(false);
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSearch = useCallback((kw) => {
    setKeyword(kw);
    loadTasks(kw);
  }, [loadTasks]);

  const handleCreate = async (payload) => {
    try {
      await addTask({ ...payload, created_by: payload.created_by || user?.name || 'User' });
      setCreateOpen(false);
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = async (payload) => {
    try {
      await editTask(editTarget.id, {
        ...payload,
        updated_by: payload.updated_by || user?.name || 'User',
      });
      setEditTarget(null);
    } catch (err) { toast.error(err.message); }
  };

  const editInitial = editTarget
    ? { ...editTarget, due_date: editTarget.due_date?.slice(0,10) || '', updated_by: editTarget.updated_by || '' }
    : {};

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 0 14px rgba(20,184,166,0.4)' }}>
              <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9 2 2 4-4"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-slate-100 tracking-tight">
              Task<span className="text-brand-400">Flow</span>
            </span>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <button onClick={() => loadTasks(keyword)} className="btn-secondary px-3" title="Refresh">
              <RefreshIcon s={loading} />
            </button>
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <PlusIcon /> New Task
            </button>
          </div>

          {/* User menu */}
          <div className="relative hidden sm:block">
            <button onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                         hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
              <UserAvatar user={user} size="sm" />
              <span className="text-sm font-medium text-slate-300 max-w-[120px] truncate hidden md:block">{user?.name}</span>
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
              </svg>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl z-50 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="font-semibold text-slate-200 text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400
                               hover:bg-red-500/10 transition-colors">
                    <LogoutIcon /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(o=>!o)}>
            <MenuIcon />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3 space-y-2 animate-slide-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <UserAvatar user={user} />
              <div><p className="font-semibold text-slate-200 text-sm">{user?.name}</p>
                   <p className="text-xs text-slate-500">{user?.email}</p></div>
            </div>
            <button onClick={() => { setMobileMenuOpen(false); setCreateOpen(true); }} className="btn-primary w-full justify-center"><PlusIcon/>New Task</button>
            <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="btn-danger w-full justify-center"><LogoutIcon/>Sign out</button>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">

        {/* Page title */}
        <div className="animate-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Task Dashboard
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Welcome back, <span className="text-brand-400">{user?.name?.split(' ')[0]}</span>
            </p>
          </div>
          {/* Desktop date */}
          <p className="text-xs text-slate-600 font-mono hidden sm:block">
            {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
        </div>

        {/* Stats */}
        <div className="animate-slide-up" style={{animationDelay:'0.05s'}}>
          <StatsBar tasks={tasks} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-slide-up" style={{animationDelay:'0.1s'}}>
          <SearchBar onSearch={handleSearch} loading={loading} />
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => loadTasks(keyword)} className="btn-secondary px-3 sm:hidden" title="Refresh">
              <RefreshIcon s={loading} />
            </button>
            {keyword && (
              <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                {tasks.length} result(s)
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="animate-slide-up" style={{animationDelay:'0.15s'}}>
          <TaskTable tasks={tasks} loading={loading}
            onEdit={(t) => setEditTarget(t)}
            onDelete={removeTask} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/40 py-4 text-center">
        <p className="text-xs text-slate-700 font-mono">TaskFlow · React + Express + MySQL · MVC</p>
      </footer>

      {/* ── Modals ── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task">
        <TaskForm mode="create"
          initialData={{ created_by: user?.name || '' }}
          onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Task">
        <TaskForm mode="edit" initialData={editInitial}
          onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
      </Modal>
    </div>
  );
};

// ── Root: Auth guard ────────────────────────────────────────
export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <AuthPage />;
}

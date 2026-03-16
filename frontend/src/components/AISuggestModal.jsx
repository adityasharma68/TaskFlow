// src/components/AISuggestModal.jsx
// ============================================================
// AISuggestModal — Beautiful AI suggestion panel.
// Shows a loading state while Claude processes, then renders
// the markdown response with styled sections.
// ============================================================

import { useState, useEffect } from 'react';
import { getAISuggestion } from '../services/aiService';
import { format, parseISO } from 'date-fns';

// ── Sparkle / AI icon ───────────────────────────────────────
const SparkleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

// ── Simple markdown renderer ─────────────────────────────────
// Converts the Claude response into styled JSX
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Bold headings: **Heading**
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2,-2).includes('**')) {
      const heading = trimmed.slice(2, -2);
      elements.push(
        <div key={key++} className="flex items-center gap-2 mt-4 mb-2">
          <div className="w-1 h-4 rounded-full bg-brand-400 flex-shrink-0" />
          <p className="text-sm font-bold text-slate-100">{heading}</p>
        </div>
      );
      continue;
    }

    // Numbered list: 1. item
    if (/^\d+\.\s/.test(trimmed)) {
      const num  = trimmed.match(/^(\d+)\./)[1];
      const text = trimmed.replace(/^\d+\.\s/, '');
      const parsed = parseInline(text);
      elements.push(
        <div key={key++} className="flex gap-3 items-start py-1.5 px-3 rounded-lg bg-slate-800/40 mb-1.5">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400
                           text-xs font-bold flex items-center justify-center mt-0.5">
            {num}
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">{parsed}</p>
        </div>
      );
      continue;
    }

    // Bullet: - item or * item
    if (/^[-*]\s/.test(trimmed)) {
      const text   = trimmed.replace(/^[-*]\s/, '');
      const parsed = parseInline(text);
      elements.push(
        <div key={key++} className="flex gap-2 items-start py-1 pl-2">
          <span className="text-brand-400 mt-1 flex-shrink-0 text-xs">◆</span>
          <p className="text-sm text-slate-300 leading-relaxed">{parsed}</p>
        </div>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={key++} className="text-sm text-slate-300 leading-relaxed">{parseInline(trimmed)}</p>
    );
  }

  return elements;
};

// Parse inline bold **text** and italic *text*
const parseInline = (text) => {
  const parts = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const boldMatch  = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);

    let match = null;
    let isBold = false;

    if (boldMatch && (!italicMatch || boldMatch.index <= italicMatch.index)) {
      match  = boldMatch;
      isBold = true;
    } else if (italicMatch) {
      match = italicMatch;
    }

    if (!match) {
      parts.push(<span key={idx++}>{remaining}</span>);
      break;
    }

    if (match.index > 0) {
      parts.push(<span key={idx++}>{remaining.slice(0, match.index)}</span>);
    }

    parts.push(isBold
      ? <strong key={idx++} className="text-slate-100 font-semibold">{match[1]}</strong>
      : <em key={idx++} className="text-slate-400 not-italic">{match[1]}</em>
    );

    remaining = remaining.slice(match.index + match[0].length);
  }

  return parts;
};

// ── Typing dots animation ────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1.5 py-2">
    {[0, 1, 2].map((i) => (
      <div key={i}
        className="w-2 h-2 rounded-full bg-brand-400"
        style={{ animation: `bounce 1.2s infinite ${i * 0.2}s` }}
      />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }`}</style>
  </div>
);

// ── Main Component ───────────────────────────────────────────
const AISuggestModal = ({ task, onClose }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [tokensUsed, setTokensUsed] = useState(0);

  // Fetch suggestion on mount
  useEffect(() => {
    if (!task) return;
    setLoading(true);
    setError(null);

    getAISuggestion(task)
      .then((res) => {
        setSuggestion(res.data.suggestion);
        setTokensUsed(res.data.tokens_used || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [task?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #0f1a2e 0%, #0d1520 100%)',
          border: '1px solid rgba(20,184,166,0.2)',
          boxShadow: '0 0 0 1px rgba(20,184,166,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(20,184,166,0.06)',
        }}
      >

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800/60"
          style={{ background: 'linear-gradient(90deg, rgba(20,184,166,0.08) 0%, transparent 100%)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.05))', border: '1px solid rgba(20,184,166,0.3)' }}>
                <SparkleIcon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-100">AI Task Assistant</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: 'rgba(20,184,166,0.1)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.2)' }}>
                    Claude
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  Analysing: <span className="text-slate-400">{task.title}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                         hover:text-slate-300 hover:bg-slate-800 transition-colors text-xl flex-shrink-0">
              ×
            </button>
          </div>

          {/* Task info chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {task.due_date && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                📅 Due {format(parseISO(task.due_date), 'dd MMM yyyy')}
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full font-mono"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              ⏳ {task.status}
            </span>
            {task.description && (
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)' }}>
                Has description
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}>
                <SparkleIcon className="w-8 h-8 text-brand-400" />
              </div>
              <p className="text-slate-300 font-medium text-sm mb-1">Generating your plan…</p>
              <p className="text-slate-600 text-xs mb-4">Claude is analysing your task</p>
              <TypingDots />
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20
                              flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                </svg>
              </div>
              <p className="text-red-400 font-semibold text-sm mb-1">Failed to generate suggestion</p>
              <p className="text-slate-600 text-xs mb-4 max-w-xs">{error}</p>
              <button onClick={() => { setLoading(true); setError(null);
                  getAISuggestion(task).then(r => { setSuggestion(r.data.suggestion); setTokensUsed(r.data.tokens_used||0); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
                className="btn-primary text-xs px-4 py-2">
                Try Again
              </button>
            </div>
          )}

          {/* Suggestion content */}
          {suggestion && !loading && (
            <div className="space-y-1">
              {renderMarkdown(suggestion)}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {suggestion && !loading && (
          <div className="flex-shrink-0 px-6 py-3 border-t border-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <p className="text-xs text-slate-600 font-mono">
                Powered by Claude · {tokensUsed} tokens used
              </p>
            </div>
            <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestModal;

// src/components/SearchBar.jsx
// ============================================================
// SearchBar – Controlled input with debounced search trigger.
// ============================================================

import { useState, useEffect, useRef } from 'react';

const SearchBar = ({ onSearch, loading }) => {
  const [value, setValue]   = useState('');
  const debounceRef         = useRef(null);

  // Debounce: wait 400 ms after the user stops typing
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-md">
      {/* Search icon */}
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx={11} cy={11} r={8} />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search tasks by title or description…"
        className="form-input pl-10 pr-10"
        aria-label="Search tasks"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     w-5 h-5 flex items-center justify-center
                     text-slate-500 hover:text-slate-300 transition-colors rounded-full"
          aria-label="Clear search"
        >
          ×
        </button>
      )}

      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default SearchBar;

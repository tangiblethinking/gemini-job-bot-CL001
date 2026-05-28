"use client";
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function JobTitleChips({ onSearch }: { onSearch: () => void }) {
  const { searchTitles, setSearchTitles, appState } = useApp();
  const [input, setInput] = useState('');

  const addTitle = () => {
    const t = input.trim();
    if (t && !searchTitles.includes(t)) {
      setSearchTitles(prev => [...prev, t]);
    }
    setInput('');
  };

  const removeTitle = (t: string) => setSearchTitles(prev => prev.filter(x => x !== t));

  return (
    <div className="mb-6">
      <p className="text-slate-400 text-sm mb-3">Job titles to search:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {searchTitles.map(t => (
          <span key={t} className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-sm px-3 py-1 rounded-full">
            {t}
            <button onClick={() => removeTitle(t)} className="text-indigo-400 hover:text-white">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTitle()}
          placeholder="Add a title..."
          className="bg-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none flex-1"
        />
        <button onClick={addTitle} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Add</button>
        <button
          onClick={onSearch}
          disabled={appState === 'SEARCHING'}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-lg text-sm"
        >
          {appState === 'SEARCHING' ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>
    </div>
  );
}

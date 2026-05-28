"use client";
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

type KeyStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export default function ApiKeySidesheet() {
  const { geminiKey, serperKey, setApiKeys } = useApp();
  const [geminiInput, setGeminiInput] = useState(geminiKey);
  const [serperInput, setSerperInput] = useState(serperKey);
  const [open, setOpen] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<KeyStatus>('idle');
  const [serperStatus, setSerperStatus] = useState<KeyStatus>('idle');

  const handleSave = () => {
    setApiKeys(geminiInput.trim(), serperInput.trim());
    setGeminiStatus('idle');
    setSerperStatus('idle');
    setOpen(false);
  };

  const verifyKeys = async () => {
    setGeminiStatus('checking');
    setSerperStatus('checking');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiKey: geminiInput.trim(),
          serperKey: serperInput.trim()
        })
      });
      const data = await res.json();
      setGeminiStatus(data.gemini === 'valid' ? 'valid' : 'invalid');
      setSerperStatus(data.serper === 'valid' ? 'valid' : 'invalid');
    } catch {
      setGeminiStatus('invalid');
      setSerperStatus('invalid');
    }
  };

  const statusIcon = (status: KeyStatus) => {
    if (status === 'checking') return <span className="text-yellow-400 text-xs">Checking...</span>;
    if (status === 'valid') return <span className="text-green-400 text-xs">✓ Valid</span>;
    if (status === 'invalid') return <span className="text-red-400 text-xs">✗ Invalid</span>;
    return null;
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg border border-slate-700"
      >
        API Keys {geminiKey && serperKey ? '✓' : '⚠'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-slate-900 w-full max-w-sm h-full p-6 flex flex-col gap-6 border-l border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">API Keys</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-sm">Gemini API Key</label>
                {statusIcon(geminiStatus)}
              </div>
              <input
                type="password"
                value={geminiInput}
                onChange={e => setGeminiInput(e.target.value)}
                placeholder="AIza..."
                className="bg-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-sm">Serper API Key</label>
                {statusIcon(serperStatus)}
              </div>
              <input
                type="password"
                value={serperInput}
                onChange={e => setSerperInput(e.target.value)}
                placeholder="Enter Serper key..."
                className="bg-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none w-full"
              />
            </div>

            <button
              onClick={verifyKeys}
              disabled={geminiStatus === 'checking' || serperStatus === 'checking'}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg"
            >
              Verify Keys
            </button>

            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-sm mt-auto"
            >
              Save Keys
            </button>
          </div>
        </div>
      )}
    </>
  );
}

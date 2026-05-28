"use client";
import React from 'react';

export default function TopNav() {
  return (
    <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <span className="font-black text-white text-lg">
        Gemini<span className="text-indigo-500">JobBot</span>
      </span>
    </nav>
  );
}

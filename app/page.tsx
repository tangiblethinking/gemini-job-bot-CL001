"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import TopNav from '@/components/TopNav';
import ApiKeySidesheet from '@/components/ApiKeySidesheet';
import JobTitleChips from '@/components/JobTitleChips';
import JobList from '@/components/JobList';

export default function Page() {
  const {
    appState, setAppState,
    setRawResumeText, setSearchTitles,
    setContact, setEducation,
    geminiKey, serperKey, searchTitles
  } = useApp();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchError, setSearchError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'x-gemini-key': geminiKey },
        body: formData,
      });

      if (res.status === 422) {
        setUploadError('This PDF looks like a scanned image. Please upload a text-based PDF.');
        return;
      }

      const data = await res.json();
      if (data.error) {
        setUploadError('Resume extraction failed. Please try again.');
        return;
      }

      setRawResumeText(data.rawText || '');
      setSearchTitles(data.titles || []);
      setContact(data.contact || { name: '', email: '' });
      setEducation(data.education || []);
      setAppState('PARSED');
    } catch (err) {
      console.error('Extract failed:', err);
      setUploadError('Resume extraction failed. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchTitles.length) {
      setSearchError('Please add at least one job title before searching.');
      return;
    }
    setSearchError('');
    setAppState('SEARCHING');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-serper-key': serperKey,
        },
        body: JSON.stringify({ titles: searchTitles }),
      });
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
      setAppState('RESULTS');
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('Search request failed. Please try again.');
      setAppState('PARSED');
    }
  };

  return (
    <>
      <TopNav />
      <ApiKeySidesheet />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {appState === 'IDLE' && (
          <div className="text-center py-24">
            <h1 className="text-4xl font-black mb-4">Gemini<span className="text-indigo-500">JobBot</span></h1>
            <p className="text-slate-400 mb-8">Upload your resume to get started.</p>
            {uploadError && <p className="text-red-400 text-sm mb-4">{uploadError}</p>}
            <label className="cursor-pointer inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition">
              Upload Resume (PDF)
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
        {(appState === 'PARSED' || appState === 'SEARCHING' || appState === 'RESULTS') && (
          <>
            <JobTitleChips onSearch={handleSearch} />
            {searchError && <p className="text-red-400 mt-2 text-sm">{searchError}</p>}
          </>
        )}
        {appState === 'SEARCHING' && (
          <div className="text-center py-12 text-slate-400 animate-pulse">Searching for jobs...</div>
        )}
        {appState === 'RESULTS' && (
          <JobList jobs={jobs} />
        )}
      </main>
    </>
  );
}

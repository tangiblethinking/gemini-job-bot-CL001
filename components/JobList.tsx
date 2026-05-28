"use client";
import React from 'react';
import { useApp } from '@/context/AppContext';

interface Job {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export default function JobList({ jobs }: { jobs: Job[] }) {
  const { geminiKey, rawResumeText, atsProcessing, setAtsProcessing, markJobReady, contact, education } = useApp();

  const handleATS = async (job: Job) => {
    setAtsProcessing(job.link, true);
    try {
      const res = await fetch('/api/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-gemini-key': geminiKey },
        body: JSON.stringify({
          jobUrl: job.link,
          resumeText: rawResumeText,
          snippet: job.snippet,
          contact,
          education
        }),
      });
      const data = await res.json();
      if (data.html) {
        const win = window.open('', '_blank');
        win?.document.write(data.html);
        win?.document.close();
        markJobReady(job.link);
      }
    } catch (err) {
      console.error('ATS failed:', err);
    } finally {
      setAtsProcessing(job.link, false);
    }
  };

  if (!jobs.length) return (
    <div className="text-center py-12 text-slate-500">No matching jobs found on verified ATS boards.</div>
  );

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-700 transition">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">{job.title}</h3>
              <p className="text-indigo-400 text-sm mb-2">{job.source}</p>
              <p className="text-slate-400 text-sm">{job.snippet}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-center"
              >
                View Job
              </a>
              <button
                onClick={() => handleATS(job)}
                disabled={atsProcessing[job.link]}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg"
              >
                {atsProcessing[job.link] ? 'Processing...' : 'ATS Resume'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

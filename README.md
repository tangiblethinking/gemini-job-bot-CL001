# GeminiJobBot CL001

AI-powered job search and ATS resume optimizer.

## Stack
- Next.js 15, React 19, TypeScript, Tailwind CSS v3
- Gemini 2.5 Flash (extract + ATS rewrite)
- Serper API (job search)
- Jina Reader API (job page scraping)

## Setup
1. Deploy to Vercel linked to this repo
2. No environment variables needed — API keys entered in-app via the API Keys sidesheet

## Usage
1. Open app, click API Keys (top right), enter Gemini and Serper keys, verify, save
2. Upload a text-based PDF resume
3. Review extracted job titles, add or remove as needed
4. Click Search Jobs
5. Click ATS Resume on any result to generate an optimized resume for that posting

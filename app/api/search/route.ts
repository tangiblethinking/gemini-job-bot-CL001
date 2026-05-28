import { NextResponse } from 'next/server';

const VERIFIED_DOMAINS = ['greenhouse.io', 'lever.co', 'ashbyhq.com', 'workday.com', 'myworkdayjobs.com', 'icims.com', 'jobvite.com', 'smartrecruiters.com'];
const AGGREGATOR_DOMAINS = ['indeed.com', 'linkedin.com', 'glassdoor.com', 'ziprecruiter.com', 'google.com', 'monster.com', 'careerbuilder.com', 'lensa.com', 'jooble.org'];

export async function POST(req: Request) {
  try {
    const { titles } = await req.json();
    const serperKey = req.headers.get('x-serper-key');

    if (!serperKey || !titles?.length) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const query = titles.join(' OR ');

    // PRIMARY: Serper /jobs
    const jobsResponse = await fetch('https://google.serper.dev/jobs', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 20 })
    });

    const jobsData = await jobsResponse.json();
    console.log('Raw Serper /jobs Response:', JSON.stringify(jobsData, null, 2));

    let finalJobs = (jobsData.jobs || []).map((job: any) => {
      // Dual-signal match: check p.url contains ATS domain OR p.jobProvider name contains ATS name
      const directProvider = job.jobProviders?.find((p: any) =>
        VERIFIED_DOMAINS.some(domain =>
          p.url?.toLowerCase().includes(domain) ||
          p.jobProvider?.toLowerCase().includes(domain.split('.')[0])
        )
      );

      const isAggregator = AGGREGATOR_DOMAINS.some(domain =>
        job.link?.toLowerCase().includes(domain)
      ) && !directProvider;

      return {
        title: job.title,
        link: directProvider?.url || job.link,
        snippet: job.description || job.snippet || '',
        source: job.companyName || 'Direct Hire',
        isDirect: !!directProvider,
        isAggregator
      };
    }).filter((job: any) => !job.isAggregator);

    // FALLBACK: if fewer than 3 results, run /search with site: scoping and merge
    if (finalJobs.length < 3) {
      console.log(`Only ${finalJobs.length} results from /jobs. Running fallback /search...`);

      const siteScope = VERIFIED_DOMAINS.map(domain => `site:${domain}`).join(' OR ');
      const searchResponse = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `(${query}) (${siteScope})`, num: 20 })
      });

      const searchData = await searchResponse.json();
      const fallbackJobs = (searchData.organic || []).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        source: (() => { try { return new URL(result.link).hostname; } catch { return 'ATS Listing'; } })(),
        isDirect: true,
        isAggregator: false
      }));

      // Merge — deduplicate by link
      const existingLinks = new Set(finalJobs.map((j: any) => j.link));
      const merged = [...finalJobs, ...fallbackJobs.filter((j: any) => !existingLinks.has(j.link))];
      finalJobs = merged;
    }

    // Strip internal flags before returning
    return NextResponse.json(finalJobs.map(({ isDirect, isAggregator, ...job }: any) => job));

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

import { useMemo, useState } from 'react';
import CandidateCard from './CandidateCard';
import { motion } from 'framer-motion';

const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCrown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21 6l-2 11H5L3 6l4.094 3.164a1 1 0 0 0 1.516-.294z"/>
    <path d="M5 21h14"/>
  </svg>
);

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ResultsDashboard({ results, analysisId, apiBaseUrl, onBack }) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('score-desc');

  const visibleResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? results.filter((candidate) => [
          candidate.name,
          candidate.summary,
          ...(candidate.skills_match || []),
          ...(candidate.missing_skills || [])
        ].join(' ').toLowerCase().includes(q))
      : [...results];

    filtered.sort((a, b) => {
      if (sortMode === 'score-asc') return a.score - b.score;
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      return b.score - a.score;
    });

    return filtered;
  }, [query, results, sortMode]);

  const topCandidate = results.find(r => !r.error && r.score > 0);

  const exportCsv = () => {
    const rows = [
      ['Rank', 'Candidate Name', 'Score', 'Matched Skills', 'Missing Skills', 'Summary'],
      ...visibleResults.map((candidate) => [
        candidate.rank,
        candidate.name,
        candidate.score,
        (candidate.skills_match || []).join('; '),
        (candidate.missing_skills || []).join('; '),
        candidate.summary
      ])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    downloadFile(`recruitai-results-${analysisId || 'latest'}.csv`, csv, 'text/csv;charset=utf-8');
  };

  const exportExcel = () => {
    const rows = visibleResults.map((candidate) => `
      <tr>
        <td>${candidate.rank}</td>
        <td>${candidate.name}</td>
        <td>${candidate.score}</td>
        <td>${(candidate.skills_match || []).join(', ')}</td>
        <td>${(candidate.missing_skills || []).join(', ')}</td>
        <td>${candidate.summary}</td>
      </tr>
    `).join('');
    const html = `<table><thead><tr><th>Rank</th><th>Candidate Name</th><th>Score</th><th>Matched Skills</th><th>Missing Skills</th><th>Summary</th></tr></thead><tbody>${rows}</tbody></table>`;
    downloadFile(`recruitai-results-${analysisId || 'latest'}.xls`, html, 'application/vnd.ms-excel;charset=utf-8');
  };

  return (
    <div className="results-page">
      <div className="results-topbar">
        <button className="back-btn" onClick={onBack}>
          <IconChevronLeft />
          New Analysis
        </button>
        <div className="count-badge">
          <IconUsers />
          {results.length} Candidate{results.length !== 1 ? 's' : ''} Analyzed
        </div>
      </div>

      <div className="results-toolbar">
        <input
          className="results-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search candidates, skills, or summaries"
        />
        <select className="results-sort" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
          <option value="score-desc">Score: high to low</option>
          <option value="score-asc">Score: low to high</option>
          <option value="name">Name</option>
        </select>
        <button className="export-btn" onClick={exportCsv}>Export CSV</button>
        <button className="export-btn" onClick={exportExcel}>Export Excel</button>
      </div>

      {topCandidate && (
        <motion.div
          className="top-banner"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="top-banner-inner">
            <div className="top-banner-left">
              <div className="crown-icon-wrap">
                <IconCrown />
              </div>
              <div>
                <div className="top-label">Top Recommendation</div>
                <div className="top-name">{topCandidate.name}</div>
              </div>
            </div>
            <div className="top-score-block">
              <div className="top-score-label">Match Score</div>
              <div className="top-score-value">{topCandidate.score}</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="cards-list">
        {visibleResults.map((candidate, idx) => (
          <CandidateCard key={`${candidate.rank}-${candidate.name}`} candidate={candidate} index={idx} apiBaseUrl={apiBaseUrl} />
        ))}
      </div>
    </div>
  );
}

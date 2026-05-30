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

export default function ResultsDashboard({ results, onBack }) {
  const topCandidate = results.find(r => !r.error && r.score > 0);

  return (
    <div className="results-page">
      {/* Top bar */}
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

      {/* Top recommendation banner */}
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

      {/* Cards */}
      <div className="cards-list">
        {results.map((candidate, idx) => (
          <CandidateCard key={idx} candidate={candidate} index={idx} />
        ))}
      </div>
    </div>
  );
}

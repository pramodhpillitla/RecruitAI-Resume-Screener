import { motion } from 'framer-motion';

// Inline SVG icons
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const CIRCUMFERENCE = 2 * Math.PI * 26; // r=26

function ScoreRing({ score }) {
  let strokeColor = '#f87171'; // red
  if (score >= 70) strokeColor = '#4ade80';      // green
  else if (score >= 45) strokeColor = '#fbbf24'; // amber

  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" viewBox="0 0 64 64">
        <circle className="score-ring-track" cx="32" cy="32" r="26" />
        <motion.circle
          className="score-ring-fill"
          cx="32" cy="32" r="26"
          stroke={strokeColor}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="score-ring-value" style={{ color: strokeColor }}>
        {score}
      </div>
    </div>
  );
}

export default function CandidateCard({ candidate, index, apiBaseUrl }) {
  // Error state
  if (candidate.error) {
    return (
      <motion.div
        className="candidate-card error-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="error-card-inner">
          <div className="error-icon-wrap"><IconAlert /></div>
          <div>
            <div className="error-card-title">{candidate.name}</div>
            <div className="error-card-msg">{candidate.summary}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="candidate-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="card-header">
        <div className="card-left">
          <div className="avatar"><IconUser /></div>
          <div className="card-name-block">
            <h3 className="card-name">
              {candidate.name}
              {index === 0 && candidate.score > 0 && (
                <span className="top-tag">
                  <IconAward />
                  Top Match
                </span>
              )}
            </h3>
            <div className="card-rank">Rank #{candidate.rank}</div>
          </div>
        </div>
        <ScoreRing score={candidate.score} />
      </div>

      {candidate.previewUrl && (
        <a className="preview-link" href={`${apiBaseUrl}${candidate.previewUrl}`} target="_blank" rel="noreferrer">
          Preview resume
        </a>
      )}

      {/* Summary */}
      <div className="card-summary">{candidate.summary}</div>

      {/* Skills */}
      <div className="skills-grid">
        <div className="skills-section">
          <div className="skills-title match">
            <IconCheck />
            Matched ({candidate.skills_match.length})
          </div>
          <div className="skills-tags">
            {candidate.skills_match.length > 0
              ? candidate.skills_match.map((s, i) => (
                  <span key={i} className="skill-pill match">{s}</span>
                ))
              : <span className="skills-empty">No skills matched</span>
            }
          </div>
        </div>

        <div className="skills-section">
          <div className="skills-title missing">
            <IconX />
            Missing ({candidate.missing_skills.length})
          </div>
          <div className="skills-tags">
            {candidate.missing_skills.length > 0
              ? candidate.missing_skills.map((s, i) => (
                  <span key={i} className="skill-pill missing">{s}</span>
                ))
              : <span className="skills-empty">None - great fit!</span>
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
}

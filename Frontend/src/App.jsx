import { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import UploadSection from './components/UploadSection';
import ResultsDashboard from './components/ResultsDashboard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const pageFade = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, y: -16, transition: { duration: 0.28 } },
};

export default function App() {
  const [jd, setJd]           = useState('');
  const [jdFile, setJdFile]   = useState(null);
  const [files, setFiles]     = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [analysisId, setAnalysisId] = useState('');
  const [error, setError]     = useState('');

  const handleAnalyze = async () => {
    if (!jd.trim() && !jdFile) {
      setError('Paste a job description or upload a JD document before analyzing.');
      return;
    }

    if (files.length === 0) {
      setError('Upload at least one resume before analyzing.');
      return;
    }

    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('jd', jd);
    if (jdFile) fd.append('jdFile', jdFile);
    files.forEach(f => fd.append('resumes', f));
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, fd);
      setAnalysisId(res.data.analysisId || '');
      setResults(res.data.results || res.data);
    } catch (err) {
      const message = err.response?.data?.error
        || err.message
        || 'Failed to reach the server. Is the backend running?';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setAnalysisId('');
    setFiles([]);
    setJdFile(null);
    setError('');
  };

  return (
    <div className="app-wrapper">
      {/* Animated background */}
      <div className="scene-bg" aria-hidden="true">
        <div className="orb-mid" />
      </div>
      <div className="scene-grid" aria-hidden="true" />

      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-link" role="button" tabIndex={0} onClick={handleReset}>
            <div className="logo-icon">
              {/* Bot / brain SVG */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4Z"/>
                <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                <path d="M9.5 16.5s.8 1 2.5 1 2.5-1 2.5-1"/>
              </svg>
            </div>
            <div className="logo-text-block">
              <span className="logo-title">Recruit<span>AI</span></span>
              <span className="logo-sub">Smart Resume Screening</span>
            </div>
          </div>

          <div className="powered-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
            Powered by Groq AI
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div className="page-content">
          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="error-banner" role="alert">
                  <span>{error}</span>
                  <button className="error-close" onClick={() => setError('')} aria-label="Dismiss">x</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div key="upload" {...pageFade}>
                {/* Hero */}
                <section className="hero">
                  <motion.div
                    className="hero-badge"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    AI-Powered Hiring
                  </motion.div>

                  <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Find your{' '}
                    <span className="gradient-text">perfect hire</span>
                    <br />in seconds.
                  </motion.h1>

                  <motion.p
                    className="hero-sub"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Upload a job description and candidate resumes. Our AI analyzes,
                    scores, and ranks the best talent - instantly.
                  </motion.p>

                  <motion.div
                    className="hero-features"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44, duration: 0.45 }}
                  >
                    {[
                      { icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', label: 'Smart Scoring' },
                      { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Skill Gap Analysis' },
                      { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Instant Ranking' },
                    ].map(({ icon, label }) => (
                      <div key={label} className="feature-pill">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={icon} />
                        </svg>
                        {label}
                      </div>
                    ))}
                  </motion.div>
                </section>

                <UploadSection
                  jd={jd} setJd={setJd}
                  jdFile={jdFile} setJdFile={setJdFile}
                  files={files} setFiles={setFiles}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  setError={setError}
                />
              </motion.div>
            ) : (
              <motion.div key="results" {...pageFade}>
                <ResultsDashboard results={results} analysisId={analysisId} apiBaseUrl={API_BASE_URL} onBack={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        Built with care - RecruitAI {new Date().getFullYear()}
      </footer>
    </div>
  );
}

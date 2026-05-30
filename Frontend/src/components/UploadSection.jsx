import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
};

// Inline SVG icons to avoid lucide rendering issues
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/><path d="M12 12h.01"/>
  </svg>
);
const IconFiles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
  </svg>
);
const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

export default function UploadSection({ jd, setJd, jdFile, setJdFile, files, setFiles, onAnalyze, isLoading, setError }) {
  const onDrop = useCallback((accepted) => {
    setError('');
    setFiles(prev => [...prev, ...accepted].slice(0, MAX_FILES));
  }, [setError, setFiles]);

  const onDropRejected = useCallback((rejections) => {
    const firstError = rejections[0]?.errors?.[0]?.message;
    setError(firstError || 'Only PDF, DOC, and DOCX files up to 5 MB are supported.');
  }, [setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));
  const isReady = files.length > 0 && (jd.trim().length > 0 || jdFile) && !isLoading;

  const handleJdFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('JD file must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setError('');
    setJdFile(file);
  };

  return (
    <motion.div
      className="upload-grid"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Job Description */}
      <motion.div variants={fadeUp} className="panel">
        <div className="panel-header">
          <div className="panel-icon violet">
            <IconBriefcase />
          </div>
          <div>
            <div className="panel-title">Job Description</div>
            <div className="panel-subtitle">Paste the role requirements</div>
          </div>
        </div>

        <textarea
          className="jd-textarea"
          placeholder="e.g. We are looking for a Senior Full-Stack Engineer with 3+ years experience in React, Node.js, and PostgreSQL..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
        {jd.length > 0 && (
          <div className="char-count">{jd.length} characters</div>
        )}
        <div className="jd-file-row">
          <label className="jd-file-button">
            Upload JD document
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleJdFile}
            />
          </label>
          {jdFile && (
            <button className="jd-file-chip" type="button" onClick={() => setJdFile(null)}>
              {jdFile.name} x
            </button>
          )}
        </div>
      </motion.div>

      {/* Resume Upload */}
      <motion.div variants={fadeUp} className="panel">
        <div className="panel-header">
          <div className="panel-icon teal">
            <IconFiles />
          </div>
          <div>
            <div className="panel-title">Upload Resumes</div>
            <div className="panel-subtitle">Drop candidate files to analyze</div>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`drop-zone${isDragActive ? ' active' : ''}`}
        >
          <input {...getInputProps()} />
          <motion.div
            className="drop-zone-icon"
            animate={isDragActive ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <IconUpload />
          </motion.div>
          <p className="drop-zone-text">
            {isDragActive ? 'Drop your files here...' : 'Drag & drop resumes, or click to browse'}
          </p>
          <p className="drop-zone-hint">Supports PDF · DOC · DOCX, up to 5 MB each</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div>
            <div className="file-list-header">
              <span className="file-list-label">Selected - {files.length} file{files.length !== 1 ? 's' : ''}</span>
              <button className="file-list-clear" onClick={() => setFiles([])}>Clear all</button>
            </div>
            <ul className="file-list">
              {files.map((file, idx) => (
                <motion.li
                  key={idx}
                  className="file-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  <div className="file-item-left">
                    <IconFile />
                    <span className="file-item-name">{file.name}</span>
                    <span className="file-item-size">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button
                    className="file-item-remove"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <IconX />
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <button className="btn-analyze" onClick={onAnalyze} disabled={!isReady}>
          {isLoading ? (
            <>
              <div className="btn-spinner" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <IconSparkle />
              Analyze Resumes
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

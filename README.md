# RecruitAI — Smart Resume Screener

> AI-powered recruitment automation: screen dozens of resumes against a Job Description in seconds, not hours.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://recruit-ai-resume-screener.vercel.app)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2F%20Vite-61DAFB?logo=react)](https://react.dev)
[![AI Engine](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA--3.3--70B-blueviolet)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
  - [Scoring Algorithm](#scoring-algorithm)
  - [Fault Tolerance](#fault-tolerance)
- [API Reference](#api-reference)
- [Assumptions & Constraints](#assumptions--constraints)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**RecruitAI** is a full-stack, AI-driven resume screening application that eliminates the manual grunt-work in early-stage hiring. A recruiter pastes a Job Description, uploads one or more candidate resumes (PDF or DOCX), and the system returns a ranked shortlist complete with match scores, skill gap analysis, and a qualitative summary — all within seconds.

Key capabilities at a glance:

- Batch resume upload via drag-and-drop
- Semantic evaluation (not just keyword matching) via a 70B LLM
- Multi-dimensional scoring: skills match, experience relevance, education alignment
- Search, sort, and filter candidates in the results view
- One-click export to CSV / XLS
- Resilient storage: PostgreSQL primary with automatic local-JSON fallback

---

## Live Demo

**[https://recruit-ai-resume-screener.vercel.app](https://recruit-ai-resume-screener.vercel.app)**

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Browser / Client                     │
│              React 19 SPA  (Vite + Tailwind)             │
└──────────────────────┬───────────────────────────────────┘
                       │  REST API  (multipart/form-data)
┌──────────────────────▼───────────────────────────────────┐
│              API & Orchestration Layer                    │
│          Node.js + Express  (Multer for uploads)          │
│  ┌─────────────────┐   ┌───────────────────────────────┐ │
│  │  Document Parser│   │       Prompt Engineer         │ │
│  │  PDF-Parse      │   │  Builds JD + Resume payload   │ │
│  │  Mammoth (DOCX) │   │  + retry / backoff logic      │ │
│  └────────┬────────┘   └────────────┬──────────────────┘ │
└───────────┼─────────────────────────┼────────────────────┘
            │                         │
            │               ┌─────────▼──────────┐
            │               │   Groq AI  (HTTPS) │
            │               │ llama-3.3-70b-vers. │
            │               │ Structured JSON out │
            │               └─────────┬──────────┘
            │                         │
┌───────────▼─────────────────────────▼────────────────────┐
│                   Persistence Layer                       │
│   PostgreSQL (primary)  ──fallback──►  analyses.json +   │
│                                        local disk storage │
└──────────────────────────────────────────────────────────┘
```

The system is deliberately decoupled so each layer can be scaled, replaced, or tested independently.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, Framer Motion, React Dropzone |
| Backend | Node.js, Express.js |
| Document Parsing | pdf-parse (PDF), Mammoth (DOCX) |
| AI Engine | Groq API — `llama-3.3-70b-versatile` |
| Database | PostgreSQL |
| File Uploads | Multer |
| Export | CSV / XLS generation |

---

## Repository Structure

```
RecruitAI-Resume-Screener/
├── Backend/
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── services/        # AI orchestration, document parsing, scoring
│   │   ├── db/              # PostgreSQL connection & queries
│   │   └── utils/           # Retry logic, prompt builders, helpers
│   ├── analyses.json        # Local fallback storage (auto-generated)
│   ├── .env.example
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/      # UI components (upload, results, score ring, etc.)
    │   ├── pages/           # Route-level pages
    │   ├── hooks/           # Custom React hooks
    │   └── utils/           # API client, export helpers
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| PostgreSQL | ≥ 14 (optional — local fallback works without it) |
| Groq API Key | [Get one free at console.groq.com](https://console.groq.com) |

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/pramodhpillitla/RecruitAI-Resume-Screener.git
cd RecruitAI-Resume-Screener/Backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Groq API key and (optionally) database credentials

# 4. Start the development server
npm run dev
# Server runs on http://localhost:5000 by default
```

If PostgreSQL is not configured, the server automatically falls back to `analyses.json` for persistence — no additional setup required.

---

### Frontend Setup

```bash
cd ../Frontend

# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev
# App runs on http://localhost:5173 by default
```

Make sure the `VITE_API_BASE_URL` in the frontend `.env` points to your running backend.

---

## Environment Variables

### Backend (`Backend/.env`)

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional — PostgreSQL (system falls back to local JSON if omitted)
DATABASE_URL=postgresql://user:password@localhost:5432/recruitai

# Optional
PORT=5000
MAX_RETRIES=3          # Groq API retry attempts
RETRY_BASE_DELAY_MS=500
```

### Frontend (`Frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## How It Works

### End-to-End Flow

1. **Upload** — Recruiter pastes a Job Description and drops one or more PDF/DOCX resumes onto the UI.
2. **Parse** — The backend extracts plain text from each document using `pdf-parse` or `Mammoth`.
3. **Prompt Engineering** — For each candidate, a structured prompt is assembled containing the full JD and the candidate's resume text (truncated to fit the model's context window safely).
4. **LLM Evaluation** — The prompt is sent to Groq's `llama-3.3-70b-versatile`. The model is instructed to respond exclusively in a strict JSON schema — no prose, no hallucinated fields.
5. **Score Calculation** — The backend combines the LLM's `score_hint` with rule-based weights across skills, experience, and education to produce a final normalised score (0–100).
6. **Persist & Return** — Results are written to PostgreSQL (or the JSON fallback) and streamed back to the frontend.
7. **Ranked Results** — The UI renders candidates sorted by score with score rings, matched/missing skills chips, and a qualitative summary.

---

### Scoring Algorithm

The scoring is multi-dimensional and semantically driven:

```
Final Score = w₁ × Skills Match %
            + w₂ × Experience Relevance (from AI)
            + w₃ × Education Alignment (from AI)
            + w₄ × AI score_hint
```

Where the LLM evaluates:

- **Skills Match** — Overlapping competencies between the JD requirements and the resume (semantic, not just string equality).
- **Missing Skills** — Critical gaps identified relative to mandatory JD requirements.
- **Experience** — Years and domain relevance of prior roles.
- **Education** — Degree level and field alignment with the role.
- **score_hint** — The model's holistic, weighted assessment synthesising all dimensions.

Because evaluation is semantic rather than keyword-based, a candidate who lists "led microservices refactoring" will score positively for a JD requiring "distributed systems experience" even without that exact phrase.

---

### Fault Tolerance

| Failure Mode | Behaviour |
|---|---|
| Groq API rate limit or transient error | Exponential backoff with up to `MAX_RETRIES` attempts |
| Groq API unrecoverable after retries | Candidate marked as `parsing_failed`; rest of batch continues |
| PostgreSQL unreachable | Automatic fallback to `analyses.json` + local disk; zero downtime |
| Malformed LLM JSON response | Schema validation and safe default values applied before scoring |

---

## API Reference

### `POST /api/screen`

Screen one or more resumes against a Job Description.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `jobDescription` | `string` | ✅ | Full text of the Job Description |
| `resumes` | `file[]` | ✅ | One or more PDF or DOCX files |

**Response** — `application/json`

```json
{
  "candidates": [
    {
      "name": "Jane Smith",
      "score": 87,
      "matchingSkills": ["React", "Node.js", "PostgreSQL"],
      "missingSkills": ["Kubernetes"],
      "experience": "6 years",
      "education": "B.Tech Computer Science",
      "summary": "Strong full-stack candidate with relevant experience...",
      "status": "success"
    }
  ]
}
```

### `GET /api/analyses`

Retrieve all previously stored screening results.

### `DELETE /api/analyses/:id`

Delete a specific analysis record.

---

## Assumptions & Constraints

| # | Assumption |
|---|---|
| 1 | Resumes are in **text-extractable** PDF or DOCX format. Scanned/image-only PDFs require an OCR pre-processing step not currently included. |
| 2 | Both JDs and resumes are written primarily in **English**. |
| 3 | The Job Description is **comprehensive** — vague JDs will produce lower-confidence scores. |
| 4 | The Groq API is the inference provider; swapping to another OpenAI-compatible endpoint requires minimal changes to the service layer. |
| 5 | Extremely long resumes are **truncated** to fit the model's context window; information beyond the cutoff is not evaluated. |

---

## Roadmap

- [ ] OCR support for scanned PDF resumes (Tesseract / AWS Textract)
- [ ] Multi-language resume support
- [ ] Configurable scoring weight profiles per role type
- [ ] Webhook / email notifications on completion
- [ ] Role-based access control (Recruiter vs Hiring Manager views)
- [ ] Docker Compose setup for one-command local deployment
- [ ] CI/CD pipeline with GitHub Actions

---

## Contributing

Contributions are welcome. Please follow the standard GitHub flow:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit with a conventional commit message
git commit -m "feat: add OCR support for scanned PDFs"

# 4. Push and open a Pull Request against main
git push origin feature/your-feature-name
```

Please ensure new backend routes have corresponding unit tests and that the frontend builds without warnings before submitting a PR.

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

*Built with Node.js, React, and Groq AI.*
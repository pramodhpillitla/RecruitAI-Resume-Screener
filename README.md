# RecruitAI

RecruitAI is a full-stack resume screening and candidate ranking web application. It compares uploaded resumes against a job description, generates a match score from 0-100, and ranks candidates from highest to lowest fit.

## Features

- Upload up to 10 resumes at once.
- Supports PDF, DOC, and DOCX resume files.
- Enter a job description manually or upload a JD document.
- Extracts resume/JD text on the backend.
- Uses Groq LLM analysis to identify candidate name, matching skills, missing skills, experience, education, and summary.
- Scores candidates using skills match, experience relevance, education alignment, and AI score hints.
- Displays ranked candidates with score rings, rank, matching skills, missing skills, summary, and resume preview links.
- Search candidates by name, skills, missing skills, or summary.
- Sort results by score or candidate name.
- Export visible results as CSV or Excel-compatible `.xls`.
- Stores uploaded resumes and analysis metadata.
- Uses PostgreSQL when `DATABASE_URL` is configured, including durable resume file storage in the database.
- Falls back to local JSON metadata and disk file storage only for local demos.

## Architecture

```txt
React + Vite Frontend
        |
        | multipart/form-data
        v
Node.js + Express Backend
        |
        |-- Multer upload handling
        |-- pdf-parse / mammoth text extraction
        |-- Groq chat completions for structured resume analysis
        |-- Scoring service for final 0-100 score
        |-- PostgreSQL durable analysis/file storage
        |-- Local JSON/disk fallback for development
        |-- Stored resume preview endpoint
```

## Scoring Approach

The backend asks Groq to return structured JSON for each resume:

- candidate name
- matching skills
- missing skills
- years of experience
- education
- summary
- score hint

Final score is calculated in `Backend/services/scoringService.js`:

- Skills match contributes up to 50 points.
- Experience contributes up to 20 points.
- Education alignment contributes up to 10 points.
- Groq score hint contributes up to 20 points.

The final value is clamped between 0 and 100 and candidates are ranked by descending score.

## Setup

Install dependencies:

```bash
cd Backend
npm install
cd ../Frontend
npm install
```

Create backend environment:

```bash
cd Backend
copy .env.sample .env
```

Set your Groq credentials in `Backend/.env`:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
CORS_ORIGIN=http://localhost:5173,https://*.vercel.app
DATABASE_URL=
DATABASE_SSL=false
```

`DATABASE_URL` is optional for local demo mode. For production, use a PostgreSQL connection string. When `DATABASE_URL` is configured, both analysis metadata and uploaded resume file bytes are stored in PostgreSQL.

Create frontend environment:

```bash
cd Frontend
copy .env.sample .env
```

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Running Locally

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend:

```bash
cd Frontend
npm run dev
```

Backend endpoints:

- `GET /api/health`
- `POST /api/analyze`
- `GET /api/analyze/history`
- `GET /api/analyze/files/:storedName`

## Deployment

Suggested deployment:

- Frontend: Vercel or Netlify.
- Backend: Render, Railway, or any Node.js host.
- Database: Render PostgreSQL, Supabase, Railway PostgreSQL, Neon, or AWS RDS.

Set production environment variables:

```env
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
CORS_ORIGIN=https://your-frontend-domain.com,https://*.vercel.app
DATABASE_URL=postgresql://...
DATABASE_SSL=true
```

Set frontend `VITE_API_BASE_URL` to the deployed backend URL.

## Assumptions

- Resume/JD files are limited to 5 MB each.
- `.doc` support depends on parser compatibility; `.docx` and PDF are preferred.
- Production storage uses PostgreSQL for both analysis metadata and resume file bytes when `DATABASE_URL` is configured.
- Local development without `DATABASE_URL` uses backend disk storage for resume previews.
- Groq response quality depends on the selected model and quota availability.

## Deliverables

- Complete source code: this repository.
- README with setup, architecture, scoring, assumptions, and deployment notes.
- Deployed application URL: add your deployed frontend link here.
- GitHub repository link: add your repository link here.

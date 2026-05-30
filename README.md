# RecruitAI

RecruitAI ranks uploaded resumes against a job description using a React/Vite frontend, an Express backend, document parsers, and Groq.

## Setup

1. Install dependencies:

```bash
cd Backend
npm install
cd ../Frontend
npm install
```

2. Configure the backend:

```bash
cd Backend
copy .env.sample .env
```

Set your Groq credentials in `Backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

3. Optionally configure the frontend:

```bash
cd Frontend
copy .env.sample .env
```

`VITE_API_BASE_URL` should point at the backend, for example `http://localhost:5000`.

## Running locally

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

The backend exposes `GET /api/health` and `POST /api/analyze`. The health endpoint reports the active Groq model and whether the required key is configured.

## Upload limits

Resume uploads support PDF, DOC, and DOCX files up to 5 MB each, with a maximum of 10 files per analysis.

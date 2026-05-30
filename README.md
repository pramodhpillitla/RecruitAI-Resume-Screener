# RecruitAI - Smart Resume Screener

RecruitAI is an intelligent, automated resume screening application designed to optimize the recruitment workflow. By leveraging Large Language Models (LLMs), it analyzes candidate resumes against specific Job Descriptions (JDs), providing recruiters with instant, data-driven insights, skill gap analysis, and candidate scoring.

## 🚀 Brief Documentation

The application is split into a robust Node.js backend and a modern React frontend. It allows recruiters to paste a Job Description and upload multiple candidate resumes (PDF, DOCX). The system parses the documents, feeds the extracted text into an AI model, and returns a structured evaluation for each candidate.

### 📸 Screenshots
<div align="center">
  <img src="./demo/Screenshot%202026-05-30%20165429.png" width="400" alt="App Screenshot 1" />
  <img src="./demo/Screenshot%202026-05-30%20165435.png" width="400" alt="App Screenshot 2" />
  <br/>
  <img src="./demo/Screenshot%202026-05-30%20165539.png" width="400" alt="App Screenshot 3" />
  <img src="./demo/Screenshot%202026-05-30%20165546.png" width="400" alt="App Screenshot 4" />
</div>

### Key Features
- **AI-Powered Analysis**: Uses Groq LLM to identify candidate names, matching skills, missing skills, experience, education, and provide a qualitative summary.
- **Dynamic Scoring**: Automatically scores candidates using skills match, experience relevance, education alignment, and AI score hints.
- **Interactive UI**: View ranked candidates with score rings, rank, matching skills, missing skills, and summary.
- **Search & Sort**: Filter candidates by name, skills, or missing skills, and sort by score or name.
- **Export**: Export visible results as CSV or Excel-compatible `.xls`.

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, React Dropzone.
- **Backend**: Node.js, Express, PostgreSQL, Multer (file handling), PDF-Parse / Mammoth (document parsing).
- **AI Engine**: Groq API (powered by `llama-3.3-70b-versatile`).

---

## 🏗️ Architecture Overview

The system follows a decoupled client-server architecture:

1. **Client Layer (React/Vite)**: 
   - A responsive Single Page Application (SPA) providing a drag-and-drop interface for resume uploads.
   - Communicates with the backend via RESTful APIs.
2. **API & Orchestration Layer (Node.js/Express)**:
   - Handles incoming multipart form data (documents).
   - Extracts raw text from binary document formats (PDFs, DOCX).
   - Constructs engineered prompts combining the JD and the candidate's resume text.
3. **AI Processing Layer (Groq AI)**:
   - Utilizes `llama-3.3-70b-versatile` for high-speed, accurate Natural Language Processing.
   - Enforces structured JSON outputs to guarantee predictable data structures.
4. **Persistence Layer (PostgreSQL / Local File System)**:
   - Employs a resilient storage strategy: primarily attempts to store parsed files and AI results in a PostgreSQL database.
   - Implements an automatic, graceful fallback to local JSON (`analyses.json`) and disk storage if the database is unreachable, ensuring zero downtime.

---

## 🎯 Approach Used for Scoring Candidates

The candidate scoring mechanism relies on **Prompt Engineering** and **Structured LLM Outputs**:

- **Contextual Prompting**: The AI is instructed to adopt the persona of an expert HR recruiter. It is provided with both the complete Job Description and the parsed Resume text (truncated safely to fit context windows).
- **Multi-dimensional Evaluation**: Rather than simple keyword matching, the LLM semantically evaluates the candidate across several axes:
  - **Skills Match**: Identifying overlapping core competencies.
  - **Missing Skills**: Highlighting critical gaps based on the JD requirements.
  - **Experience & Education**: Extracting and validating the candidate's tenure and academic background.
- **Quantitative Scoring (`score_hint`)**: The LLM synthesizes these dimensions to calculate a normalized score from `0` to `100`. This score reflects the holistic fit of the candidate for the role, weighted by the presence of mandatory skills and relevant experience.
- **Fault Tolerance**: The AI interaction includes exponential backoff and retry logic to handle rate limits or transient API errors, ensuring reliable scoring.

---

## 📌 Assumptions

During the design and implementation of this system, the following technical and operational assumptions were made:

1. **Document Formats**: Candidate resumes are provided in standard, text-extractable formats (PDF or DOCX). Scanned documents requiring OCR (Optical Character Recognition) are outside the current scope.
2. **Language**: Both the Job Descriptions and Resumes are written primarily in English.
3. **JD Quality**: The provided Job Description is comprehensive and clearly outlines the required skills and experience, allowing the LLM to establish an accurate baseline for comparison.
4. **API Availability**: The Groq API is highly available. The system assumes that if the API fails after the maximum configured retries, the candidate analysis will degrade gracefully (returning a parsing failure status rather than crashing the server).
5. **Database Environment**: While PostgreSQL is the preferred storage engine, the system assumes it might be deployed in environments without immediate database access, hence the robust local-storage fallback mechanism.

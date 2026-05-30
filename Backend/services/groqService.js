const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_RETRIES = 2;

function cleanJSON(text) {
    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error) {
    const status = error?.status || error?.code || error?.response?.status;
    return [429, 500, 502, 503, 504].includes(Number(status));
}

export function getConfiguredProvider() {
    return {
        provider: "groq",
        configured: Boolean(process.env.GROQ_API_KEY),
        model: process.env.GROQ_MODEL || GROQ_MODEL
    };
}

function normalizeAnalysis(data) {
    return {
        candidate_name: String(data.candidate_name || "Unknown"),
        skills_match: Array.isArray(data.skills_match) ? data.skills_match.map(String) : [],
        missing_skills: Array.isArray(data.missing_skills) ? data.missing_skills.map(String) : [],
        experience_years: Number(data.experience_years) || 0,
        education: String(data.education || ""),
        summary: String(data.summary || ""),
        score_hint: Math.max(0, Math.min(100, Number(data.score_hint) || 50))
    };
}

function buildPrompt(resumeText, jdText) {
    return `
You are an AI resume screening assistant.

Return ONLY valid JSON:

{
  "candidate_name": "",
  "skills_match": [],
  "missing_skills": [],
  "experience_years": number,
  "education": "",
  "summary": "",
  "score_hint": number
}

Job Description:
${jdText}

Resume:
${resumeText.substring(0, 8000)}
`;
}

async function generateGroqAnalysis(prompt) {
    const response = await fetch(`${process.env.GROQ_BASE_URL || GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL || GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a resume screening assistant. Return only valid JSON that matches the requested schema."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        })
    });

    if (!response.ok) {
        const error = new Error(`Groq request failed with status ${response.status}`);
        error.status = response.status;
        error.body = await response.text();
        throw error;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

export async function analyzeResume(resumeText, jdText) {
    const config = getConfiguredProvider();

    if (!config.configured) {
        throw new Error("Groq API key is not configured");
    }

    const prompt = buildPrompt(resumeText, jdText);
    let text = "";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        try {
            text = await generateGroqAnalysis(prompt);
            const parsed = JSON.parse(cleanJSON(text));
            return normalizeAnalysis(parsed);
        } catch (err) {
            if (attempt < MAX_RETRIES && isRetryable(err)) {
                await wait(600 * 2 ** attempt);
                continue;
            }

            if (text) {
                console.error("Groq JSON parse failed:", text);
            } else {
                console.error("Groq request failed:", err);
            }

            return {
                candidate_name: "Unknown",
                skills_match: [],
                missing_skills: [],
                experience_years: 0,
                education: "",
                summary: text ? "Parsing failed" : "Groq analysis failed",
                score_hint: 0
            };
        }
    }
}

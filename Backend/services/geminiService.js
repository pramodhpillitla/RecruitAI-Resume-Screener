import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function cleanJSON(text) {
    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}

export async function analyzeResume(resumeText, jdText) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
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
${resumeText.substring(0, 4000)}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    try {
        return JSON.parse(cleanJSON(text));
    } catch (err) {
        console.error("JSON parse failed:", text);

        return {
            candidate_name: "Unknown",
            skills_match: [],
            missing_skills: [],
            experience_years: 0,
            education: "",
            summary: "Parsing failed",
            score_hint: 50
        };
    }
}
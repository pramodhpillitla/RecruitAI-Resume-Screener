import fs from "fs";

import { extractText } from "../utils/parser.js";
import { analyzeResume } from "../services/geminiService.js";
import { calculateScore } from "../services/scoringService.js";

export const analyzeResumes = async (req, res) => {
    try {
        const jdText = req.body.jd;

        if (!jdText) {
            return res.status(400).json({ error: "Job description is required" });
        }

        const results = await Promise.all(
            req.files.map(async (file) => {
                const text = await extractText(file.path, file.mimetype);

                const aiData = await analyzeResume(text, jdText);

                const score = calculateScore(aiData);

                fs.unlinkSync(file.path);

                return {
                    name: aiData.candidate_name || file.originalname,
                    score,
                    skills_match: aiData.skills_match || [],
                    missing_skills: aiData.missing_skills || [],
                    summary: aiData.summary || ""
                };
            })
        );

        results.sort((a, b) => b.score - a.score);
        results.forEach((r, i) => (r.rank = i + 1));

        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
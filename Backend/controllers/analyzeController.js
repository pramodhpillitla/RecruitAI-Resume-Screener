import fs from "fs";

import { extractText } from "../utils/parser.js";
import { analyzeResume, getConfiguredProvider } from "../services/groqService.js";
import { calculateScore } from "../services/scoringService.js";

const MAX_PARALLEL_AI_CALLS = 2;

async function runWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runNext() {
        const index = nextIndex;
        nextIndex += 1;

        if (index >= items.length) {
            return;
        }

        results[index] = await worker(items[index], index);
        await runNext();
    }

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        () => runNext()
    );

    await Promise.all(workers);
    return results;
}

export const analyzeResumes = async (req, res) => {
    try {
        const jdText = req.body.jd?.trim();

        if (!jdText) {
            return res.status(400).json({ error: "Job description is required" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No resumes uploaded" });
        }

        const aiConfig = getConfiguredProvider();
        if (!aiConfig.configured) {
            return res.status(500).json({ error: `${aiConfig.provider} API key is not configured` });
        }

        const results = await runWithConcurrency(
            req.files,
            MAX_PARALLEL_AI_CALLS,
            async (file) => {
                try {
                    const text = await extractText(file.path, file.mimetype);

                    if (!text) {
                        return {
                            name: file.originalname,
                            score: 0,
                            skills_match: [],
                            missing_skills: [],
                            summary: "Failed to extract text from file or file format not supported.",
                            error: true
                        };
                    }

                    const aiData = await analyzeResume(text, jdText);
                    const score = calculateScore(aiData);

                    return {
                        name: aiData.candidate_name || file.originalname,
                        score,
                        skills_match: aiData.skills_match || [],
                        missing_skills: aiData.missing_skills || [],
                        summary: aiData.summary || "",
                        error: aiData.summary === "Parsing failed"
                    };
                } catch (err) {
                    console.error(`Error processing file ${file.originalname}:`, err);
                    return {
                        name: file.originalname,
                        score: 0,
                        skills_match: [],
                        missing_skills: [],
                        summary: "An error occurred during analysis.",
                        error: true
                    };
                } finally {
                    try {
                        await fs.promises.unlink(file.path);
                    } catch (unlinkErr) {
                        console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
                    }
                }
            }
        );

        results.sort((a, b) => b.score - a.score);
        results.forEach((r, i) => (r.rank = i + 1));

        res.json(results);

    } catch (error) {
        console.error("Critical error in analyzeResumes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

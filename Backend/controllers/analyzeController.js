import fs from "fs";

import { extractText } from "../utils/parser.js";
import { analyzeResume, getConfiguredProvider } from "../services/groqService.js";
import { calculateScore } from "../services/scoringService.js";
import {
    createId,
    getStoredFile,
    listAnalyses,
    persistUpload,
    saveAnalysis
} from "../services/storageService.js";

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
        let jdText = req.body.jd?.trim() || "";
        const resumeFiles = req.files?.resumes || [];
        const jdFile = req.files?.jdFile?.[0];

        if (jdFile) {
            const extractedJd = await extractText(jdFile.path, jdFile.mimetype);
            jdText = [jdText, extractedJd].filter(Boolean).join("\n\n").trim();
            await fs.promises.unlink(jdFile.path).catch(() => {});
        }

        if (!jdText) {
            return res.status(400).json({ error: "Job description is required" });
        }

        if (resumeFiles.length === 0) {
            return res.status(400).json({ error: "No resumes uploaded" });
        }

        const aiConfig = getConfiguredProvider();
        if (!aiConfig.configured) {
            return res.status(500).json({ error: `${aiConfig.provider} API key is not configured` });
        }

        const results = await runWithConcurrency(
            resumeFiles,
            MAX_PARALLEL_AI_CALLS,
            async (file) => {
                let storedFile;
                try {
                    storedFile = await persistUpload(file);
                    const text = await extractText(storedFile.storedPath, storedFile.mimeType);

                    if (!text) {
                        return {
                            name: file.originalname,
                            originalName: file.originalname,
                            previewUrl: `/api/analyze/files/${storedFile.storedName}`,
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
                        originalName: file.originalname,
                        previewUrl: `/api/analyze/files/${storedFile.storedName}`,
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
                        originalName: file.originalname,
                        previewUrl: storedFile ? `/api/analyze/files/${storedFile.storedName}` : "",
                        score: 0,
                        skills_match: [],
                        missing_skills: [],
                        summary: "An error occurred during analysis.",
                        error: true
                    };
                }
            }
        );

        results.sort((a, b) => b.score - a.score);
        results.forEach((r, i) => (r.rank = i + 1));

        const analysisId = createId();
        await saveAnalysis({ id: analysisId, jdText, results });

        res.json({
            analysisId,
            results
        });

    } catch (error) {
        console.error("Critical error in analyzeResumes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAnalysisHistory = async (_req, res) => {
    try {
        const analyses = await listAnalyses();
        res.json(analyses);
    } catch (error) {
        console.error("Failed to load analysis history:", error);
        res.status(500).json({ error: "Failed to load analysis history" });
    }
};

export const previewResume = async (req, res) => {
    try {
        const filePath = await getStoredFile(req.params.storedName);
        res.sendFile(filePath);
    } catch {
        res.status(404).json({ error: "Resume file not found" });
    }
};

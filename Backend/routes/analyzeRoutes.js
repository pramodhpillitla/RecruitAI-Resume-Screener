import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
    analyzeResumes,
    getAnalysisHistory,
    previewResume
} from "../controllers/analyzeController.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "..", "uploads");

const allowedMimeTypes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword"
]);

const upload = multer({
    dest: uploadDir,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 11
    },
    fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error("Only PDF, DOC, and DOCX resumes are supported."));
    }
});

router.get("/history", getAnalysisHistory);
router.get("/files/:storedName", previewResume);

router.post("/", (req, res, next) => {
    upload.fields([
        { name: "resumes", maxCount: 10 },
        { name: "jdFile", maxCount: 1 }
    ])(req, res, (err) => {
        if (!err) {
            next();
            return;
        }

        const status = err instanceof multer.MulterError ? 400 : 415;
        res.status(status).json({ error: err.message });
    });
}, analyzeResumes);

export default router;

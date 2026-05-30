import express from "express";
import multer from "multer";

import { analyzeResumes } from "../controllers/analyzeController.js";

const router = express.Router();

const allowedMimeTypes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword"
]);

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    },
    fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error("Only PDF, DOC, and DOCX resumes are supported."));
    }
});

router.post("/", (req, res, next) => {
    upload.array("resumes")(req, res, (err) => {
        if (!err) {
            next();
            return;
        }

        const status = err instanceof multer.MulterError ? 400 : 415;
        res.status(status).json({ error: err.message });
    });
}, analyzeResumes);

export default router;

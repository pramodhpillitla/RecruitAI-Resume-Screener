import express from "express";
import multer from "multer";

import { analyzeResumes } from "../controllers/analyzeController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("resumes"), analyzeResumes);

export default router;
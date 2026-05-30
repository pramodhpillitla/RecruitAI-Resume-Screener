import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import analyzeRoutes from "./routes/analyzeRoutes.js";
import { getConfiguredProvider } from "./services/groqService.js";
import { ensureStorage } from "./services/storageService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

/* -------------------- CORS (FIXED) -------------------- */
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://recruit-ai-resume-screener.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);

/* -------------------- MIDDLEWARE -------------------- */
app.use(helmet());
app.use(express.json());

/* -------------------- RATE LIMIT -------------------- */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many requests, please try again later." }
});

/* -------------------- HEALTH ROUTE -------------------- */
app.get("/api/health", (_req, res) => {
    const aiConfig = getConfiguredProvider();

    res.json({
        ok: true,
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
        aiConfigured: aiConfig.configured,
        groqConfigured: Boolean(process.env.GROQ_API_KEY)
    });
});

/* -------------------- API ROUTES -------------------- */
app.use("/api/analyze", limiter, analyzeRoutes);

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);

    ensureStorage().catch((error) => {
        console.error("Failed to initialize storage:", error);
    });
});
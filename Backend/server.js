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

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return true;
    }

    return allowedOrigins.some((allowedOrigin) => {
        if (!allowedOrigin.includes("*")) {
            return false;
        }

        const pattern = new RegExp(`^${allowedOrigin.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`);
        return pattern.test(origin);
    });
}

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked origin: ${origin}`));
    }
}));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

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

app.use("/api/analyze", limiter, analyzeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize storage in the background so the server binds the port immediately
    ensureStorage().catch((error) => {
        console.error("Failed to initialize storage:", error);
    });
});

app.use(
    cors({
        origin: [
            "http://localhost:5173", // for local dev
            "https://recruit-ai-resume-screener.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);

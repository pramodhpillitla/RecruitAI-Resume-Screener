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
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
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

ensureStorage()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to initialize storage:", error);
        process.exit(1);
    });

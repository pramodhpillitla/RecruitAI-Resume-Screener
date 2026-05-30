import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const dataDir = path.join(backendRoot, "data");
const storedUploadsDir = path.join(backendRoot, "stored_uploads");
const jsonStorePath = path.join(dataDir, "analyses.json");

let pool;
let pgReady = false;

function getPool() {
    if (!process.env.DATABASE_URL) {
        return null;
    }

    if (!pool) {
        pool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_SSL === "true"
                ? { rejectUnauthorized: false }
                : undefined
        });
    }

    return pool;
}

async function ensureLocalStore() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(storedUploadsDir, { recursive: true });

    try {
        await fs.access(jsonStorePath);
    } catch {
        await fs.writeFile(jsonStorePath, "[]");
    }
}

async function ensurePostgres() {
    const db = getPool();
    if (!db || pgReady) {
        return Boolean(db);
    }

    await db.query(`
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            jd_text TEXT NOT NULL,
            results JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    pgReady = true;
    return true;
}

export async function ensureStorage() {
    await ensureLocalStore();
    await ensurePostgres();
}

export function createId() {
    return crypto.randomUUID();
}

export async function persistUpload(file) {
    await fs.mkdir(storedUploadsDir, { recursive: true });

    const ext = path.extname(file.originalname || "");
    const storedName = `${createId()}${ext}`;
    const storedPath = path.join(storedUploadsDir, storedName);

    await fs.rename(file.path, storedPath);

    return {
        originalName: file.originalname,
        storedName,
        storedPath,
        mimeType: file.mimetype,
        size: file.size
    };
}

async function readLocalAnalyses() {
    await ensureLocalStore();
    const raw = await fs.readFile(jsonStorePath, "utf8");
    return JSON.parse(raw || "[]");
}

async function writeLocalAnalyses(items) {
    await ensureLocalStore();
    await fs.writeFile(jsonStorePath, JSON.stringify(items, null, 2));
}

export async function saveAnalysis({ id, jdText, results }) {
    await ensureStorage();

    if (await ensurePostgres()) {
        await getPool().query(
            `INSERT INTO analyses (id, jd_text, results)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET jd_text = $2, results = $3`,
            [id, jdText, JSON.stringify(results)]
        );
        return;
    }

    const items = await readLocalAnalyses();
    items.unshift({
        id,
        jdText,
        results,
        createdAt: new Date().toISOString()
    });
    await writeLocalAnalyses(items);
}

export async function listAnalyses() {
    await ensureStorage();

    if (await ensurePostgres()) {
        const { rows } = await getPool().query(
            "SELECT id, jd_text, results, created_at FROM analyses ORDER BY created_at DESC LIMIT 50"
        );
        return rows.map((row) => ({
            id: row.id,
            jdText: row.jd_text,
            results: row.results,
            createdAt: row.created_at
        }));
    }

    return readLocalAnalyses();
}

export async function getStoredFile(storedName) {
    const safeName = path.basename(storedName);
    const filePath = path.join(storedUploadsDir, safeName);
    await fs.access(filePath);
    return filePath;
}

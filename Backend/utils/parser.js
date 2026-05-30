import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs/promises";

export async function extractText(filePath, mimeType) {
    try {
        if (mimeType === "application/pdf") {
            const buffer = await fs.readFile(filePath);
            const data = await pdfParse(buffer);
            return data.text;
        }

        if (
            mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            mimeType === "application/msword"
        ) {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }

        return "";
    } catch (err) {
        console.error("Parsing error:", err);
        return "";
    }
}

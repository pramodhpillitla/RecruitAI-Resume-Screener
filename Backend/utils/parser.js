import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";

export async function extractText(filePath, mimeType) {
    try {
        if (mimeType === "application/pdf") {
            const data = await pdfParse(fs.readFileSync(filePath));
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
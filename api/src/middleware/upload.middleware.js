/**
 * File upload middleware using multer.
 *
 * Files are saved to:
 *   uploads/<tenantId>/<documentId>-<timestamp><ext>
 *
 * The ML service reads files from this same path.
 * On the same machine this works directly.
 * In Docker: mount the uploads/ directory as a shared volume.
 *
 * Supported types: PDF, DOCX, TXT
 * Max file size: 10 MB
 */
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Save uploads relative to the api/ directory root.
const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        // Store under uploads/<tenantId>/
        const tenantId = req.params.tenantId || "unknown";
        const dir = path.join(UPLOADS_ROOT, tenantId);

        try {
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } catch (err) {
            cb(err);
        }
    },

    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        cb(null, `${unique}${ext}`);
    },
});

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
]);

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Unsupported file type: ${file.mimetype}. Allowed: PDF, DOCX, TXT`
            ),
            false
        );
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1,
    },
});

/**
 * Get the absolute path where a document will be stored.
 * Used by the controller to pass the path to the ML service.
 *
 * @param {string} tenantId
 * @param {string} filename - the generated filename from multer
 * @returns {string} absolute path
 */
export function getUploadPath(tenantId, filename) {
    return path.join(UPLOADS_ROOT, tenantId, filename);
}

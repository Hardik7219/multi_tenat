import multer from "multer";
import path from "path";
import fs from "fs";

const ALLOWED = new Set([
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const UPLOADS_ROOT = path.resolve(process.env.UPLOADS_ROOT || "uploads");

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const { tenantId } = req.params;
        if (!/^[a-f\d]{24}$/i.test(tenantId)) return cb(new Error("Invalid tenantId"));
        const dir = path.join(UPLOADS_ROOT, tenantId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
});

const fileFilter = (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF, DOCX and TXT files are allowed"));
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, 
});

export function uploadErrorHandler(err, _req, res, next) {
    if (err instanceof multer.MulterError || err?.message?.startsWith("Only PDF")) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
}
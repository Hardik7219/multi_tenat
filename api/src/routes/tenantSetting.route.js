
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

import {
    getTenantSettings,
    updateTenantSettings,
    getTenantDocuments,
    createTenantDocument,
    deleteTenantDocument,
} from "../controllers/tenantSetting.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/:tenantId", getTenantSettings);
router.patch("/:tenantId", updateTenantSettings);

router.get("/:tenantId/documents", getTenantDocuments);

// POST /:tenantId/documents — accepts either:
//   a) multipart/form-data with field "file" (direct upload)
//   b) application/json with metadata only (external storage)
router.post(
    "/:tenantId/documents",
    (req, res, next) => {
        // Only run multer when Content-Type is multipart.
        const contentType = req.headers["content-type"] || "";
        if (contentType.includes("multipart/form-data")) {
            return uploadMiddleware.single("file")(req, res, (err) => {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                next();
            });
        }
        next();
    },
    createTenantDocument
);

router.delete("/:tenantId/documents/:documentId", deleteTenantDocument);

export default router;

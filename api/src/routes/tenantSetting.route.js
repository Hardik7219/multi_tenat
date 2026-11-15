
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadMiddleware, uploadErrorHandler } from "../middleware/upload.middleware.js";

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
    /* your existing auth/permission middleware, */
    uploadMiddleware.single("file"),   // form field name = "file"
    createTenantDocument
);
router.use(uploadErrorHandler);

router.delete("/:tenantId/documents/:documentId", deleteTenantDocument);

export default router;

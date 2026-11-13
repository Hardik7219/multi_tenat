
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";

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
router.post("/:tenantId/documents", createTenantDocument);
router.delete(
    "/:tenantId/documents/:documentId",
    deleteTenantDocument
);

export default router;

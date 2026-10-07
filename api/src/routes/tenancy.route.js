import express from "express";

import {
    createTenancy,
    fetchTenancy,
    updateTenancy,
    deleteTenancy,
} from "../controllers/tenancy.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createTenancy);

router.get("/", authenticate, fetchTenancy);

router.patch("/", authenticate, updateTenancy);

router.delete("/", authenticate, deleteTenancy);

export default router;
import express from "express";

import {
    createTenancy,
    fetchTenancy,
    updateTenancy,
    deleteTenancy,
    fetchTenancies,
    fetchMyTenancies,
} from "../controllers/tenancy.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createTenancy);

router.get("/discover", authenticate, fetchTenancies);
router.get("/mine", authenticate,fetchMyTenancies);

router.get("/:id", authenticate, fetchTenancy);

router.patch("/", authenticate, updateTenancy);

router.delete("/", authenticate, deleteTenancy);

export default router;
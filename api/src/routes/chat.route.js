import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    sendMessage,
    fetchMessages,
    analyzeTicketHandler,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/:ticketId/messages", fetchMessages);

router.post("/:ticketId/messages", sendMessage);

router.get("/:ticketId/analyze", analyzeTicketHandler);

export default router;

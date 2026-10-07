import express from "express";

import {
    createTicket,
    fetchTicket,
    fetchAllTickets,
    deleteTicket,
    updateTicket,
} from "../controllers/ticket.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

//router.use(authenticate);

router.post("/", createTicket);

router.get("/", fetchAllTickets);

router.get("/:ticketId", fetchTicket);

router.patch("/:ticketId", updateTicket);

router.delete("/:ticketId", deleteTicket);

export default router;
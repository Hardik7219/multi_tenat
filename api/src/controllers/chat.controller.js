import mongoose from "mongoose";
import { Ticket } from "../models/ticket.model.js";
import { OrganizationMember } from "../models/OrganizationMember.model.js";
import {
    createMessage,
    getMessages,
    analyzeTicket,
} from "../services/chat.service.js";


async function resolveTicketAndAuth(ticketId, userId) {
    if (!mongoose.isValidObjectId(ticketId)) {
        return { error: { status: 400, message: "Invalid ticket ID" } };
    }

    const ticket = await Ticket.findById(ticketId).lean();
    if (!ticket) {
        return { error: { status: 404, message: "Ticket not found" } };
    }

    const membership = await OrganizationMember.findOne({
        userId,
        tenantId: ticket.tenantId,
        status: "active",
    }).lean();

    const isCreator = ticket.createdBy.toString() === userId;

    if (!membership && !isCreator) {
        return {
            error: {
                status: 403,
                message: "You do not have access to this ticket",
            },
        };
    }

    let senderType = "customer";
    if (membership) {
        const agentRoles = ["owner", "admin", "agent"];
        senderType = agentRoles.includes(membership.role) ? "agent" : "customer";
    }

    return { ticket, membership, senderType };
}


export async function sendMessage(req, res) {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;
        const { content, attachments } = req.body;

        if (!content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ message: "Message content is required" });
        }

        if (content.length > 10000) {
            return res
                .status(400)
                .json({ message: "Message too long (max 10 000 chars)" });
        }

        const resolved = await resolveTicketAndAuth(ticketId, userId);
        if (resolved.error) {
            return res
                .status(resolved.error.status)
                .json({ message: resolved.error.message });
        }

        const { ticket, senderType } = resolved;

        const message = await createMessage({
            tenantId: ticket.tenantId,
            ticketId: ticket._id,
            senderId: userId,
            senderType,
            content: content.trim(),
            attachments: Array.isArray(attachments) ? attachments : [],
        });

        // AI_HOOK: After saving human message, trigger AI analysis/response
        // The AI service would call createMessage with senderType "ai" and
        // emit it back via Socket.IO. Example:
        //
        // const aiResponse = await aiService.generateResponse({ ticket, message, context });
        // const aiMsg = await createMessage({ ..., senderType: "ai", content: aiResponse });
        // req.io.to(`ticket:${ticketId}`).emit("new_message", aiMsg);

        // Emit to Socket.IO room so all connected clients get real-time update
        if (req.io) {
            req.io.to(`ticket:${ticketId}`).emit("new_message", message);
        }

        return res.status(201).json({ message });
    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        return res.status(500).json({ message: "Failed to send message" });
    }
}


export async function fetchMessages(req, res) {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

        const resolved = await resolveTicketAndAuth(ticketId, userId);
        if (resolved.error) {
            return res
                .status(resolved.error.status)
                .json({ message: resolved.error.message });
        }

        const { ticket } = resolved;
        const result = await getMessages({
            ticketId: ticket._id,
            tenantId: ticket.tenantId,
            page,
            limit,
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("FETCH MESSAGES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch messages" });
    }
}


export async function analyzeTicketHandler(req, res) {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const resolved = await resolveTicketAndAuth(ticketId, userId);
        if (resolved.error) {
            return res
                .status(resolved.error.status)
                .json({ message: resolved.error.message });
        }

        const { ticket } = resolved;
        const analysis = await analyzeTicket(ticket._id, ticket.tenantId);

        return res.status(200).json({ analysis });
    } catch (error) {
        console.error("ANALYZE TICKET ERROR:", error);
        return res.status(500).json({ message: "Failed to analyze ticket" });
    }
}

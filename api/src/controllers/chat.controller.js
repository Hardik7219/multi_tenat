import mongoose from "mongoose";
import { Ticket } from "../models/ticket.model.js";
import { TicketMessage } from "../models/ticketMessage.model.js";
import { Tenancy } from "../models/tenancy.model.js";
import { TenantDocument } from "../models/tenantDocument.model.js";
import { OrganizationMember } from "../models/OrganizationMember.model.js";
import {
    createMessage,
    getMessages,
    analyzeTicket,
} from "../services/chat.service.js";
import { queryRAG } from "../services/rag.service.js";


// ---------------------------------------------------------------------------
// Internal helper: resolve ticket + check user access
// ---------------------------------------------------------------------------

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


// ---------------------------------------------------------------------------
// Internal helper: generate and persist AI response (runs in background)
// ---------------------------------------------------------------------------

/**
 * Generate an AI response for a customer message via the RAG pipeline.
 *
 * This function:
 *  1. Fetches tenant settings (kind="settings") from MongoDB.
 *  2. Checks if AI auto-respond is enabled for this tenant.
 *  3. Builds conversation history from the last 10 messages.
 *  4. Calls the RAG ML service (Ollama/OpenAI — whatever provider is configured).
 *  5. Saves the AI response as a TicketMessage with senderType="ai".
 *  6. Emits the AI message via Socket.IO for real-time delivery.
 *
 * Always call this WITHOUT await so the HTTP response is sent immediately.
 * Any errors here are logged but do not affect the user-facing response.
 *
 * @param {Object} ticket      - Mongoose lean Ticket document
 * @param {string} userMessage - The customer's message text
 * @param {Object} io          - Socket.IO server instance (from req.io)
 */
async function generateAIResponse({ ticket, userMessage, io }) {
    try {
        // 1. Fetch the tenant's settings from MongoDB.
        const [tenantSettings, tenancy] = await Promise.all([
            TenantDocument.findOne({
                tenantId: ticket.tenantId,
                kind: "settings",
            }).lean(),
            Tenancy.findById(ticket.tenantId).select("name").lean(),
        ]);

        // 2. Skip if AI is disabled or autoRespond is turned off.
        if (!tenantSettings) {
            console.log(`[RAG] No settings found for tenant ${ticket.tenantId} — skipping AI.`);
            return;
        }
        if (!tenantSettings.ai?.enabled) {
            console.log(`[RAG] AI disabled for tenant ${ticket.tenantId} — skipping.`);
            return;
        }
        if (!tenantSettings.ai?.autoRespond) {
            console.log(`[RAG] autoRespond=false for tenant ${ticket.tenantId} — skipping.`);
            return;
        }

        // 3. Build conversation history from recent messages (exclude the message just sent).
        const recentMessages = await TicketMessage.find({ ticketId: ticket._id })
            .sort({ createdAt: -1 })
            .limit(11) // 10 prior + 1 (the current message we just saved)
            .lean();

        // Reverse to chronological, drop the last (current) message.
        const history = recentMessages
            .reverse()
            .slice(0, -1)
            .map((m) => ({
                role: m.senderType === "customer" ? "user" : "assistant",
                content: m.content,
            }));

        // 4. Call RAG ML service.
        const tenantName = tenancy?.name || "this organization";
        let ragResult;
        try {
            ragResult = await queryRAG(
                ticket.tenantId.toString(),
                userMessage,
                tenantSettings,
                tenantName,
                history
            );
        } catch (ragErr) {
            console.error(`[RAG] Query failed for ticket ${ticket._id}:`, ragErr.message);
            return; // Fail silently — do not create a broken AI message.
        }

        const answer = ragResult?.answer;
        if (!answer || !answer.trim()) {
            console.warn(`[RAG] Empty answer returned for ticket ${ticket._id}`);
            return;
        }

        // 5. Save AI message to MongoDB.
        const aiMessage = await createMessage({
            tenantId: ticket.tenantId,
            ticketId: ticket._id,
            senderId: null,
            senderType: "ai",
            content: answer.trim(),
        });

        // 6. Emit via Socket.IO so connected browsers receive it in real time.
        if (io) {
            io.to(`ticket:${ticket._id}`).emit("new_message", aiMessage);
        }

        console.log(
            `[RAG] AI responded to ticket ${ticket._id} ` +
            `(${ragResult.has_context ? "with" : "without"} knowledge context, ` +
            `model: ${ragResult.model}, provider: ${ragResult.provider})`
        );
    } catch (err) {
        // Top-level safety net — never let AI errors propagate up.
        console.error(`[RAG] Unexpected error in generateAIResponse:`, err);
    }
}


// ---------------------------------------------------------------------------
// POST /api/chat/:ticketId/messages
// ---------------------------------------------------------------------------

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

        // Save the human message.
        const message = await createMessage({
            tenantId: ticket.tenantId,
            ticketId: ticket._id,
            senderId: userId,
            senderType,
            content: content.trim(),
            attachments: Array.isArray(attachments) ? attachments : [],
        });

        // Emit the human message via Socket.IO immediately.
        if (req.io) {
            req.io.to(`ticket:${ticketId}`).emit("new_message", message);
        }

        // Send HTTP 201 response right away — don't make the user wait for AI.
        res.status(201).json({ message });

        // Trigger AI response in the background ONLY for customer messages.
        // Agent messages (owner/admin/agent roles) do NOT get auto-responded.
        if (senderType === "customer") {
            generateAIResponse({
                ticket,
                userMessage: content.trim(),
                io: req.io,
            });
            // Note: intentionally not awaited.
        }

    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        return res.status(500).json({ message: "Failed to send message" });
    }
}


// ---------------------------------------------------------------------------
// GET /api/chat/:ticketId/messages
// ---------------------------------------------------------------------------

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


// ---------------------------------------------------------------------------
// GET /api/chat/:ticketId/analyze
// ---------------------------------------------------------------------------

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

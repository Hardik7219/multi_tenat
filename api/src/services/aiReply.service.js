
import { queryRAG } from "./rag.service.js";
import { TenantDocument } from "../models/tenantDocument.model.js";
import { TicketMessage } from "../models/ticketMessage.model.js";
import { Tenancy } from "../models/tenancy.model.js";

/**
 * @param {Object}   options
 * @param {Object}   options.ticket          - Lean Ticket document from MongoDB
 * @param {string}   options.userMessageId   - _id of the message just sent (to exclude from history)
 * @param {string}   options.userMessage     - The customer's message text
 * @param {Object}   options.io              - Socket.IO server instance
 * @param {Function} options.createMessage   - chat.service createMessage function
 */
export async function generateAIResponse({ ticket, userMessageId, userMessage, io, createMessage }) {
    const tenantId = String(ticket.tenantId?._id ?? ticket.tenantId);

    const [settings, tenancy] = await Promise.all([
        TenantDocument.findOne({ tenantId, kind: "settings" }).lean(),
        Tenancy.findById(tenantId).select("name").lean(),
    ]);

    if (!settings) {
        console.log(`[RAG] No settings found for tenant ${tenantId} — skipping AI.`);
        return;
    }
    if (!settings.ai?.enabled) {
        console.log(`[RAG] AI disabled for tenant ${tenantId} — skipping.`);
        return;
    }
    if (!settings.ai?.autoRespond) {
        console.log(`[RAG] autoRespond=false for tenant ${tenantId} — skipping.`);
        return;
    }

    const recent = await TicketMessage.find({
        ticketId: ticket._id,
        _id: { $ne: userMessageId },
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    const history = recent
        .reverse()
        .filter((m) => m.content?.trim())
        .map((m) => ({
            role: m.senderType === "customer" ? "user" : "assistant",
            content: m.content,
        }));

    const tenantName = tenancy?.name || "this organization";
    const tenantSettings = { ...settings, tenantName };

    let ragResult;
    try {
        ragResult = await queryRAG(tenantId, userMessage, tenantSettings, history);
    } catch (ragErr) {
        console.error(`[RAG] Query failed for ticket ${ticket._id}:`, ragErr.message);
        return; 
    }

    const answer = ragResult?.answer?.trim();
    if (!answer) {
        console.warn(`[RAG] Empty answer returned for ticket ${ticket._id}`);
        return;
    }

    const aiMessage = await createMessage({
        tenantId: ticket.tenantId,
        ticketId: ticket._id,
        senderId: null,
        senderType: "ai",
        content: answer,
    });

    if (io) {
        io.to(`ticket:${ticket._id}`).emit("new_message", aiMessage);
        console.log(
            `[RAG] ✓ AI reply sent for ticket ${ticket._id} ` +
            `(context: ${ragResult.has_context ? "yes" : "no"}, ` +
            `model: ${ragResult.model}, provider: ${ragResult.provider})`
        );
    } else {
        console.warn(`[RAG] io not available — AI message saved but NOT emitted via socket.`);
    }
}
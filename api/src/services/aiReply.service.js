// api/src/services/aiReply.service.js
// Kept out of chat.controller.js so the controller stays small.
import { queryRAG } from "./rag.service.js";
import { TenantDocument } from "../models/tenantDocument.model.js";
import { TicketMessage } from "../models/ticketMessage.model.js"; // TODO: adjust to your real path/export

/**
 * Generate and broadcast an AI reply for a customer message.
 * Attach .catch() at the call site (see chat.controller patch).
 */
export async function generateAIResponse({ ticket, userMessageId, userMessage, io, createMessage }) {
    const tenantId = String(ticket.tenantId?._id ?? ticket.tenantId);

    const settings = await TenantDocument.findOne({ tenantId, kind: "settings" }).lean();
    if (!settings?.ai?.enabled || !settings?.ai?.autoRespond) return;

    // History: last 10 messages, excluding the one we're answering (by id, not position).
    const recent = await TicketMessage.find({
        ticketId: ticket._id,
        _id: { $ne: userMessageId },
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    const history = recent
        .reverse()
        .filter((m) => m.content)
        .map((m) => ({
            role: m.senderType === "customer" ? "user" : "assistant",
            content: m.content,
        }));

    const tenantName =
        ticket.tenantId?.name || settings.profile?.name || settings.profile?.companyName || "this organization";

    const ragResult = await queryRAG(tenantId, userMessage, { ...settings, tenantName }, history);

    const answer = ragResult?.answer?.trim();
    if (!answer) return;

    const aiMessage = await createMessage({
        tenantId: ticket.tenantId,
        ticketId: ticket._id,
        senderId: null,
        senderType: "ai",
        content: answer,
    });

    io?.to(`ticket:${ticket._id}`).emit("new_message", aiMessage);
}
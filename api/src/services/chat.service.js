import { TicketMessage } from "../models/ticketMessage.model.js";
import { Ticket } from "../models/ticket.model.js";


const HIGH_PRIORITY_KEYWORDS = [
    "urgent", "critical", "down", "outage", "broken", "immediately",
    "emergency", "asap", "not working", "crash", "data loss", "security",
    "breach", "hack", "prod", "production", "blocker", "blocked",
    "cannot access", "cannot login", "system failure", "escalate",
];

const LOW_PRIORITY_KEYWORDS = [
    "question", "how to", "curious", "wondering", "general", "info",
    "feature request", "suggestion", "nice to have", "whenever",
];

/**
 * Compute a numeric priority score for a ticket.
 * @param {Object} ticket - Mongoose Ticket document
 * @param {Array}  messages - recent TicketMessage documents
 * @returns {{ score: number, suggestedPriority: string, signals: string[] }}
 */
export function computePriorityScore(ticket, messages = []) {
    let score = 50; // baseline
    const signals = [];

    const priorityWeights = { low: -15, medium: 0, high: 20, urgent: 35 };
    score += priorityWeights[ticket.priority] ?? 0;

    const textBlob = [
        ticket.title,
        ticket.description,
        ...messages.slice(-10).map((m) => m.content),
    ]
        .join(" ")
        .toLowerCase();

    for (const kw of HIGH_PRIORITY_KEYWORDS) {
        if (textBlob.includes(kw)) {
            score += 8;
            signals.push(`keyword:"${kw}"`);
        }
    }
    for (const kw of LOW_PRIORITY_KEYWORDS) {
        if (textBlob.includes(kw)) {
            score -= 5;
            signals.push(`low-signal:"${kw}"`);
        }
    }

    const ageHours =
        (Date.now() - new Date(ticket.createdAt).getTime()) / 36e5;
    if (ageHours > 24 && ticket.status === "open") {
        score += 10;
        signals.push("stale:>24h");
    }
    if (ageHours > 72 && ticket.status === "open") {
        score += 15;
        signals.push("stale:>72h");
    }

    if (messages.length > 10) {
        score += 8;
        signals.push(`msg_volume:${messages.length}`);
    }

    const latestThree = messages.slice(-3);
    if (
        latestThree.length === 3 &&
        latestThree.every((m) => m.senderType === "customer")
    ) {
        score += 12;
        signals.push("repeated_customer_messages");
    }

    score = Math.max(0, Math.min(100, score));

    let suggestedPriority = "low";
    if (score >= 85) suggestedPriority = "urgent";
    else if (score >= 65) suggestedPriority = "high";
    else if (score >= 40) suggestedPriority = "medium";

    return { score, suggestedPriority, signals };
}

/**
 * @param {Array} messages
 * @returns {{ isPending: boolean, reason: string }}
 */
export function computePendingStatus(messages = []) {
    if (messages.length === 0) {
        return { isPending: true, reason: "no_messages_yet" };
    }

    const lastMsg = messages[messages.length - 1];

    if (lastMsg.senderType === "customer") {
        return { isPending: true, reason: "awaiting_agent_response" };
    }

    if (lastMsg.senderType === "ai") {
        return { isPending: true, reason: "awaiting_human_agent_review" };
    }

    return { isPending: false, reason: "agent_responded" };
}



export async function createMessage({
    tenantId,
    ticketId,
    senderId,
    senderType,
    content,
    attachments = [],
}) {
    const message = await TicketMessage.create({
        tenantId,
        ticketId,
        senderId: senderType === "ai" ? null : senderId,
        senderType,
        content,
        attachments,
    });

    return message;
}

export async function getMessages({ ticketId, tenantId, page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        TicketMessage.find({ ticketId, tenantId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        TicketMessage.countDocuments({ ticketId, tenantId }),
    ]);

    return { messages, total, page, limit };
}


export async function analyzeTicket(ticketId, tenantId) {
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId }).lean();
    if (!ticket) throw new Error("Ticket not found");

    const messages = await TicketMessage.find({ ticketId, tenantId })
        .sort({ createdAt: 1 })
        .lean();

    const priorityResult = computePriorityScore(ticket, messages);
    const pendingResult = computePendingStatus(messages);

    if (priorityResult.suggestedPriority !== ticket.priority) {
        await Ticket.updateOne(
            { _id: ticketId, tenantId },
            { $set: { priority: priorityResult.suggestedPriority } }
        );
    }

    return {
        ticketId,
        priority: priorityResult,
        pending: pendingResult,
        messageCount: messages.length,
        aiAnalysis: null,
    };
}

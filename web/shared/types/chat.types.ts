// ─── Chat types ──────────────────────────────────────────────────────────────

export type MessageSenderType = "customer" | "agent" | "ai";

export interface TicketMessage {
    _id: string;
    tenantId: string;
    ticketId: string;
    senderType: MessageSenderType;
    senderId: string | null;
    content: string;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface FetchMessagesResult {
    messages: TicketMessage[];
    total: number;
    page: number;
    limit: number;
}

export interface SendMessagePayload {
    content: string;
    attachments?: string[];
}


export interface PriorityAnalysis {
    score: number;
    suggestedPriority: "low" | "medium" | "high" | "urgent";
    signals: string[];
}

export interface PendingAnalysis {
    isPending: boolean;
    reason: string;
}

export interface TicketAnalysis {
    ticketId: string;
    priority: PriorityAnalysis;
    pending: PendingAnalysis;
    messageCount: number;
    // AI_HOOK: will be populated by AI pipeline
    aiAnalysis: null | Record<string, unknown>;
}

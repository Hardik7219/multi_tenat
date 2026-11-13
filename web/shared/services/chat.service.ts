import type {
    FetchMessagesResult,
    SendMessagePayload,
    TicketMessage,
    TicketAnalysis,
} from "../types/chat.types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";

function authHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchMessages(
    ticketId: string,
    accessToken: string,
    page = 1,
    limit = 50
): Promise<FetchMessagesResult> {
    const res = await fetch(
        `${BASE_URL}/api/chat/${ticketId}/messages?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: authHeaders(accessToken),
            cache: "no-store",
        }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
    return data as FetchMessagesResult;
}

export async function sendMessage(
    ticketId: string,
    payload: SendMessagePayload,
    accessToken: string
): Promise<TicketMessage> {
    const res = await fetch(`${BASE_URL}/api/chat/${ticketId}/messages`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send message");
    return data.message as TicketMessage;
}

export async function analyzeTicket(
    ticketId: string,
    accessToken: string
): Promise<TicketAnalysis> {
    const res = await fetch(`${BASE_URL}/api/chat/${ticketId}/analyze`, {
        method: "GET",
        headers: authHeaders(accessToken),
        cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to analyze ticket");
    return data.analysis as TicketAnalysis;
}

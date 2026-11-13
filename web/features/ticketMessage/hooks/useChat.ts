"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io as createSocketIO, type Socket } from "socket.io-client";

import type { TicketMessage, TicketAnalysis } from "../../../shared/types/chat.types";
import {
    fetchMessages as apiFetchMessages,
    sendMessage as apiSendMessage,
    analyzeTicket as apiAnalyze,
} from "../../../shared/services/chat.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";

interface UseChatOptions {
    ticketId: string;
    autoAnalyze?: boolean;
}

export function useChat({ ticketId, autoAnalyze = true }: UseChatOptions) {
    const { data: session, status: sessionStatus } = useSession();
    const accessToken = session?.user?.accessToken as string | undefined;

    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [analysis, setAnalysis] = useState<TicketAnalysis | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    const socketRef = useRef<Socket | null>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadMessages = useCallback(async () => {
        if (sessionStatus === "loading" || !accessToken || !ticketId) return;

        try {
            setLoading(true);
            setError("");
            const result = await apiFetchMessages(ticketId, accessToken);
            setMessages(result.messages);

            if (autoAnalyze && result.messages.length >= 0) {
                const a = await apiAnalyze(ticketId, accessToken);
                setAnalysis(a);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load chat");
        } finally {
            setLoading(false);
        }
    }, [ticketId, accessToken, sessionStatus, autoAnalyze]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        if (!accessToken || !ticketId) return;

        const socket = createSocketIO(SOCKET_URL, {
            auth: { token: accessToken },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("join_ticket", { ticketId });
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("new_message", (msg: TicketMessage) => {
            setMessages((prev) => {
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        });

        socket.on(
            "user_typing",
            ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
                setTypingUsers((prev) => {
                    const next = new Set(prev);
                    if (isTyping) next.add(userId);
                    else next.delete(userId);
                    return next;
                });
            }
        );

        return () => {
            socket.emit("leave_ticket", { ticketId });
            socket.disconnect();
            socketRef.current = null;
        };
    }, [accessToken, ticketId]);

    const sendMessage = useCallback(
        async (content: string, attachments?: string[]) => {
            if (!accessToken || !ticketId || sending) return { success: false };

            try {
                setSending(true);
                setError("");

                const msg = await apiSendMessage(
                    ticketId,
                    { content, attachments },
                    accessToken
                );

                setMessages((prev) => {
                    if (prev.some((m) => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });

                return { success: true, message: msg };
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to send message";
                setError(message);
                return { success: false, error: message };
            } finally {
                setSending(false);
            }
        },
        [accessToken, ticketId, sending]
    );

    const emitTyping = useCallback(() => {
        if (!socketRef.current) return;
        socketRef.current.emit("typing", { ticketId, isTyping: true });

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            socketRef.current?.emit("typing", { ticketId, isTyping: false });
        }, 2000);
    }, [ticketId]);

    const refreshAnalysis = useCallback(async () => {
        if (!accessToken || !ticketId) return;
        try {
            const a = await apiAnalyze(ticketId, accessToken);
            setAnalysis(a);
        } catch {
        }
    }, [accessToken, ticketId]);

    return {
        messages,
        loading,
        sending,
        error,
        analysis,
        isConnected,
        typingUsers,
        sendMessage,
        emitTyping,
        refreshAnalysis,
        reload: loadMessages,
    };
}

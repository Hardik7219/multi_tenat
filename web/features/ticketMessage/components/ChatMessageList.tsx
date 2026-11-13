"use client";

import { useEffect, useRef } from "react";
import type { TicketMessage } from "../../../shared/types/chat.types";

interface MessageBubbleProps {
    message: TicketMessage;
    currentUserId?: string;
}

function senderLabel(senderType: TicketMessage["senderType"]) {
    switch (senderType) {
        case "ai":
            return "AI Assistant";
        case "agent":
            return "Support Agent";
        default:
            return "You";
    }
}

function bubbleStyle(senderType: TicketMessage["senderType"], isOwn: boolean) {
    if (senderType === "ai") {
        return "bg-purple-500/15 border border-purple-500/25 text-purple-100 mr-auto";
    }
    if (isOwn) {
        return "bg-blue-600/80 text-white ml-auto";
    }
    return "bg-white/8 border border-white/10 text-white/85 mr-auto";
}

function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
    const isOwn =
        message.senderType !== "ai" &&
        message.senderId === currentUserId;

    return (
        <div
            className={`flex flex-col max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${bubbleStyle(message.senderType, isOwn)}`}
        >
            <span
                className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                    message.senderType === "ai"
                        ? "text-purple-400"
                        : isOwn
                        ? "text-blue-200"
                        : "text-white/40"
                }`}
            >
                {senderLabel(message.senderType)}
            </span>

            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>

            <span
                className={`mt-1 text-[10px] ${
                    isOwn ? "text-blue-200/60 text-right" : "text-white/30"
                }`}
            >
                {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
        </div>
    );
}


function TypingDots() {
    return (
        <div className="mr-auto flex items-center gap-1 rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );
}


interface ChatMessageListProps {
    messages: TicketMessage[];
    typingUsers: Set<string>;
    currentUserId?: string;
}

export function ChatMessageList({
    messages,
    typingUsers,
    currentUserId,
}: ChatMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUsers]);

    if (messages.length === 0 && typingUsers.size === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="text-4xl">💬</div>
                <p className="text-sm font-medium text-white/60">
                    No messages yet
                </p>
                <p className="text-xs text-white/30">
                    Be the first to start the conversation.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg) => (
                <MessageBubble
                    key={msg._id}
                    message={msg}
                    currentUserId={currentUserId}
                />
            ))}

            {typingUsers.size > 0 && <TypingDots />}

            <div ref={bottomRef} />
        </div>
    );
}

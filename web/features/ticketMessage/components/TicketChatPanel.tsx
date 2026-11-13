"use client";

import { useSession } from "next-auth/react";
import { useChat } from "../hooks/useChat";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

interface TicketChatPanelProps {
    ticketId: string;
}

/**
 * Self-contained chat panel to drop into the ticket detail page.
 * Wire up:  <TicketChatPanel ticketId={ticket._id} />
 *
 * AI_HOOK: When an AI pipeline is added, the AI messages will arrive
 * via Socket.IO "new_message" events with senderType "ai".
 * No changes needed here — the hook and list already handle them.
 */
export function TicketChatPanel({ ticketId }: TicketChatPanelProps) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id as string | undefined;

    const {
        messages,
        loading,
        sending,
        error,
        analysis,
        isConnected,
        typingUsers,
        sendMessage,
        emitTyping,
    } = useChat({ ticketId, autoAnalyze: true });

    return (
        <div className="flex h-[600px] flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
            <ChatHeader isConnected={isConnected} analysis={analysis} />

            {/* Error banner */}
            {error && (
                <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <p className="text-xs text-white/40">Loading conversation…</p>
                    </div>
                </div>
            ) : (
                <ChatMessageList
                    messages={messages}
                    typingUsers={typingUsers}
                    currentUserId={currentUserId}
                />
            )}

            <ChatInput
                onSend={sendMessage}
                onTyping={emitTyping}
                disabled={!isConnected && messages.length === 0}
                sending={sending}
            />
        </div>
    );
}

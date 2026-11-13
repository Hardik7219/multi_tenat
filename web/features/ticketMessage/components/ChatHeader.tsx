"use client";

import { Wifi, WifiOff, Bot, AlertTriangle } from "lucide-react";
import type { TicketAnalysis } from "../../../shared/types/chat.types";

interface ChatHeaderProps {
    isConnected: boolean;
    analysis: TicketAnalysis | null;
}

const priorityColors: Record<string, string> = {
    low: "text-green-400 bg-green-500/10 border-green-500/20",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    urgent: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function ChatHeader({ isConnected, analysis }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Conversation</h2>

                <span className="flex items-center gap-1 rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400">
                    <Bot size={10} />
                    AI-ready
                </span>
            </div>

            <div className="flex items-center gap-2">
                {analysis && (
                    <span
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            priorityColors[analysis.priority.suggestedPriority] ??
                            "text-white/50 bg-white/5 border-white/10"
                        }`}
                    >
                        {analysis.pending.isPending && (
                            <AlertTriangle size={9} />
                        )}
                        {analysis.priority.suggestedPriority} · score{" "}
                        {analysis.priority.score}
                    </span>
                )}

                <span
                    className={`flex items-center gap-1 text-[10px] ${
                        isConnected ? "text-green-400" : "text-white/30"
                    }`}
                    title={isConnected ? "Real-time connected" : "Connecting…"}
                >
                    {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {isConnected ? "Live" : "Offline"}
                </span>
            </div>
        </div>
    );
}

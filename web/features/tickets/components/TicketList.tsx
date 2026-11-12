import React from "react";
import { Ticket } from "../../../shared/types";
import { Card } from "../../../shared/ui/Card";
import Link from "next/link";
interface TicketListProps {
    tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
    if (tickets.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-white/5 p-4">
                    <span className="text-2xl">🎫</span>
                </div>
                <h3 className="text-lg font-medium text-white">No tickets found</h3>
                <p className="mt-2 text-sm text-white/50">Try adjusting your search or filters to find what you're looking for.</p>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "in_progress": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "resolved": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "closed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "low": return "text-blue-400";
            case "medium": return "text-yellow-400";
            case "high": return "text-orange-400";
            case "urgent": return "text-red-400";
            default: return "text-white/70";
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {tickets.map((ticket) => (
                <Link
                    key={ticket._id}
                    href={`/tickets/${ticket._id}`}
                    className="block"
                >
                    <Card className="flex flex-col justify-between gap-4 transition hover:border-white/20 sm:flex-row sm:items-center">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-white/40">
                                    #{ticket._id.slice(-6)}
                                </span>

                                <span
                                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${getStatusColor(ticket.status)}`}
                                >
                                    {ticket.status.replace("_", " ")}
                                </span>
                            </div>

                            <h4 className="text-lg font-semibold text-white">
                                {ticket.title}
                            </h4>

                            <p className="line-clamp-2 text-sm text-white/60">
                                {ticket.description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:items-end">
                            <span
                                className={`text-xs font-medium uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}
                            >
                                {ticket.priority} Priority
                            </span>

                            <span className="text-xs text-white/30">
                                {new Date(ticket.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }
                                )}
                            </span>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

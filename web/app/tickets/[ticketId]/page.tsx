"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTicket } from "../../../features/tickets/hooks/useTicket";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { ArrowLeft, Calendar, User, Trash2 } from "lucide-react";
import Link from "next/link";
import { TicketPriority, TicketStatus } from "../../../shared/types";

export default function TicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.ticketId as string;
    
    const { ticket, loading, error, updateTicket, deleteTicket } = useTicket(ticketId);
    const [updating, setUpdating] = useState(false);

    if (loading) {
        return (
            <main className="flex-1 flex items-center justify-center p-6 text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/50 text-sm">Loading ticket details...</p>
                </div>
            </main>
        );
    }

    if (error || !ticket) {
        return (
            <main className="flex-1 flex items-center justify-center p-6 text-white">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
                    <p>{error || "Ticket not found."}</p>
                    <Link href="/tickets">
                        <Button variant="secondary" className="mt-4">Back to Tickets</Button>
                    </Link>
                </div>
            </main>
        );
    }

    const handleStatusChange = async (newStatus: TicketStatus) => {
        setUpdating(true);
        await updateTicket({ status: newStatus });
        setUpdating(false);
    };

    const handlePriorityChange = async (newPriority: TicketPriority) => {
        setUpdating(true);
        await updateTicket({ priority: newPriority });
        setUpdating(false);
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this ticket?");
        if (confirmed) {
            setUpdating(true);
            const res = await deleteTicket();
            if (res.success) {
                router.push("/tickets");
            }
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "in_progress": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "resolved": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "closed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    return (
        <main className="flex-1 text-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href="/tickets" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition">
                    <ArrowLeft size={16} className="mr-2" /> Back to Tickets
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-white/40">#{ticket._id}</span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace("_", " ")}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
                        <Card className="mt-4 bg-white/[0.01]">
                            <p className="whitespace-pre-wrap text-white/80 leading-relaxed">
                                {ticket.description}
                            </p>
                        </Card>
                    </div>

                    <div className="w-full md:w-80 space-y-6 shrink-0">
                        <Card className="flex flex-col gap-4 bg-white/[0.01]">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Details</h3>
                            
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/50">Status</label>
                                <select 
                                    value={ticket.status} 
                                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                                    disabled={updating}
                                    className="w-full appearance-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-white/40"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/50">Priority</label>
                                <select 
                                    value={ticket.priority} 
                                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                                    disabled={updating}
                                    className="w-full appearance-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-white/40"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="mt-2 space-y-3 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <User size={16} className="text-white/40" />
                                    <span>Created by: {ticket.createdBy}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <Calendar size={16} className="text-white/40" />
                                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>

                        <Button variant="danger" className="w-full" onClick={handleDelete} isLoading={updating}>
                            <Trash2 size={16} className="mr-2" /> Delete Ticket
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

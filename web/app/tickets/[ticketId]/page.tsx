
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
    ArrowLeft,
    Calendar,
    User,
    Trash2,
    Hash,
    Building2,
} from "lucide-react";

import { useTicket } from "../../../features/tickets/hooks/useTicket";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { TicketPriority, TicketStatus } from "../../../shared/types";

export default function TicketDetailsPage() {
    const params = useParams<{ ticketId: string }>();
    const router = useRouter();

    const ticketId = params.ticketId;

    const {
        ticket,
        loading,
        error,
        updateTicket,
        deleteTicket,
    } = useTicket(ticketId);

    const [updating, setUpdating] = useState(false);
    const [actionError, setActionError] = useState("");

    const handleStatusChange = async (status: TicketStatus) => {
        setUpdating(true);
        setActionError("");

        const result = await updateTicket({ status });

        if (!result.success) {
            setActionError(result.error || "Could not update status.");
        }

        setUpdating(false);
    };

    const handlePriorityChange = async (priority: TicketPriority) => {
        setUpdating(true);
        setActionError("");

        const result = await updateTicket({ priority });

        if (!result.success) {
            setActionError(result.error || "Could not update priority.");
        }

        setUpdating(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) {
            return;
        }

        setUpdating(true);
        setActionError("");

        const result = await deleteTicket();

        if (result.success) {
            router.push("/tickets");
        } else {
            setActionError(result.error || "Could not delete ticket.");
        }

        setUpdating(false);
    };

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case "open":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "in_progress":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "resolved":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "closed":
                return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default:
                return "bg-white/10 text-white border-white/20";
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <p className="text-sm text-white/50">
                        Loading ticket details...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !ticket) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center p-6 text-white">
                <Card className="max-w-md text-center">
                    <h2 className="text-lg font-semibold">
                        Unable to load ticket
                    </h2>

                    <p className="mt-2 text-sm text-red-400">
                        {error || "Ticket not found."}
                    </p>

                    <Link href="/tickets" className="mt-5 inline-block">
                        <Button variant="secondary">
                            Back to Tickets
                        </Button>
                    </Link>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex-1 p-6 text-white md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">

                <Link
                    href="/tickets"
                    className="inline-flex items-center text-sm text-white/50 transition hover:text-white"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Tickets
                </Link>

                {/* Ticket heading */}
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 font-mono text-sm text-white/40">
                            <Hash size={14} />
                            {ticket._id.slice(-8)}
                        </span>

                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${getStatusColor(ticket.status)}`}
                        >
                            {ticket.status.replace("_", " ")}
                        </span>

                        <span className="text-xs uppercase tracking-wider text-white/40">
                            {ticket.priority} priority
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        {ticket.title}
                    </h1>

                    <p className="text-sm text-white/40">
                        Ticket details and conversation
                    </p>
                </section>

                {actionError && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                    >
                        {actionError}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

                    {/* Main content */}
                    <div className="space-y-6">

                        <Card className="space-y-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                                Description
                            </h2>

                            <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
                                {ticket.description}
                            </p>
                        </Card>

                        {/* Conversation placeholder */}
                        <Card className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Conversation
                                </h2>

                                <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/40">
                                    Coming next
                                </span>
                            </div>

                            <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
                                <div className="mb-3 text-3xl">💬</div>

                                <h3 className="font-medium text-white/80">
                                    Start a conversation
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-white/40">
                                    Messages from customers, AI, and support
                                    agents will appear here.
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Ticket details */}
                    <aside className="space-y-6">
                        <Card className="space-y-5">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                                Ticket properties
                            </h2>

                            <div className="space-y-2">
                                <label className="text-xs text-white/50">
                                    Status
                                </label>

                                <select
                                    value={ticket.status}
                                    onChange={(e) =>
                                        handleStatusChange(
                                            e.target.value as TicketStatus
                                        )
                                    }
                                    disabled={updating}
                                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/40 disabled:opacity-50"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-white/50">
                                    Priority
                                </label>

                                <select
                                    value={ticket.priority}
                                    onChange={(e) =>
                                        handlePriorityChange(
                                            e.target.value as TicketPriority
                                        )
                                    }
                                    disabled={updating}
                                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/40 disabled:opacity-50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="space-y-4 border-t border-white/10 pt-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <User
                                        size={16}
                                        className="mt-0.5 text-white/40"
                                    />
                                    <div>
                                        <p className="text-xs text-white/40">
                                            Created by
                                        </p>
                                        <p className="mt-1 break-all text-white/80">
                                            {ticket.createdBy}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    <Building2
                                        size={16}
                                        className="mt-0.5 text-white/40"
                                    />
                                    <div>
                                        <p className="text-xs text-white/40">
                                            Organization ID
                                        </p>
                                        <p className="mt-1 break-all text-white/80">
                                            {ticket.tenantId}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar
                                        size={16}
                                        className="mt-0.5 text-white/40"
                                    />
                                    <div>
                                        <p className="text-xs text-white/40">
                                            Created
                                        </p>
                                        <p className="mt-1 text-white/80">
                                            {new Date(
                                                ticket.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Button
                            variant="danger"
                            className="w-full"
                            onClick={handleDelete}
                            isLoading={updating}
                        >
                            <Trash2 size={16} className="mr-2" />
                            Delete Ticket
                        </Button>
                    </aside>
                </div>
            </div>
        </main>
    );
}

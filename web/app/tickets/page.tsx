"use client";

import { useTickets } from "../../features/tickets/hooks/useTickets";
import { TicketList } from "../../features/tickets/components/TicketList";
import { DashboardMetrics } from "../../features/dashboard/components/DashboardMetrics";
import { Input } from "../../shared/ui/Input";
import { Search } from "lucide-react";
import { TicketStatus } from "../../shared/types";

export default function TicketsPage() {
    const {
        filteredTickets,
        stats,
        loading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
    } = useTickets();

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] p-6 text-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/50 text-sm">Loading tickets...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
                        <p className="text-white/50 mt-1">Manage and track your support tickets</p>
                    </div>
                </header>
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
                        {error}
                    </div>
                )}

                <DashboardMetrics stats={stats} />

                <div className="flex flex-col sm:flex-row gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <div className="flex-1">
                        <Input
                            placeholder="Search tickets by title or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search size={18} />}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
                        className="w-full sm:w-48 appearance-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <TicketList tickets={filteredTickets} />
            </div>
        </main>
    );
}

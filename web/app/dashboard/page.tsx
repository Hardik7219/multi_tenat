"use client";

import { useTickets } from "../../features/tickets/hooks/useTickets";
import { DashboardMetrics } from "../../features/dashboard/components/DashboardMetrics";
import { TicketList } from "../../features/tickets/components/TicketList";
import Link from "next/link";
import { Button } from "../../shared/ui/Button";

export default function DashboardPage() {
    const { tickets, stats, loading, error } = useTickets();

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] p-6 text-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/50 text-sm">Loading dashboard...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#050505] p-6 text-white flex items-center justify-center">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
                    <p>{error}</p>
                    <Button variant="danger" className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </main>
        );
    }

    const recentTickets = tickets.slice(0, 5);

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                        <p className="text-white/50 mt-1">Here is what is happening in your workspace today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/tenats">
                            <Button variant="secondary">Manage Workspace</Button>
                        </Link>
                        <Link href="/tickets">
                            <Button>View All Tickets</Button>
                        </Link>
                    </div>
                </header>

                <section>
                    <DashboardMetrics stats={stats} />
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Tickets</h2>
                        <Link href="/tickets" className="text-sm text-white/50 hover:text-white transition">
                            View All →
                        </Link>
                    </div>
                    <TicketList tickets={recentTickets} />
                </section>
            </div>
        </main>
    );
}

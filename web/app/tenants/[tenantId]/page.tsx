"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { useTenants } from "@/features/tenants/hooks/useTenants";
import InfoCard from "@/shared/ui/InfoCard";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { TicketForm } from "@/features/tickets/components/TicketForm";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { TicketList } from "@/features/tickets/components/TicketList";


function formatDate(date?: string) {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not available";
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
function TenantPage() {
    const params = useParams<{ tenantId: string }>();
    const id = params.tenantId;

    const { data: session } = useSession();

    const user = session?.user;    
    const { status: sessionStatus } = useSession();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { tenant, loadTenant, loading, error } = useTenants();
    const {
        filteredTickets,
        search,
        setSearch,
        statusFilter,
        createTicket,
        fetchTenantTickets,
        setStatusFilter,
    } = useTickets(id);
    useEffect(() => {
        if (sessionStatus === "authenticated" && id) {
            void loadTenant(id);
        }
    }, [id, loadTenant, sessionStatus]);

    if (sessionStatus === "loading") {
        return <PageState message="Checking authentication..." />;
    }

    if (sessionStatus === "unauthenticated") {
        return <PageState message="Please sign in to access this organization." />;
    }

    if (loading) {
        return <PageState message="Loading organization workspace..." loading />;
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                    <div className="text-red-400 text-4xl mb-4">!</div>

                    <h2 className="text-xl font-semibold mb-2">
                        Unable to load organization
                    </h2>

                    <p className="text-white/50 text-sm mb-6">{error}</p>

                    <button
                        onClick={() => void loadTenant(id)}
                        className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    if (!tenant) {
        return <PageState message="Organization not found or unavailable." />;
    }

    const stats = [
        {
            label: "Total Tickets",
            value: filteredTickets.length,
            description: "Awaiting statistics API",
            accent: "text-blue-400",
        },
        {
            label: "Open Tickets",
            value: filteredTickets.length,
            description: "Awaiting statistics API",
            accent: "text-yellow-400",
        },
        {
            label: "In Progress",
            value: "—",
            description: "Awaiting statistics API",
            accent: "text-purple-400",
        },
        {
            label: "Resolved",
            value: "—",
            description: "Awaiting statistics API",
            accent: "text-emerald-400",
        },
    ];

    const initial = tenant.name.trim().charAt(0).toUpperCase() || "O";

    const statusStyles = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        suspended: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        deleted: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const planStyles = {
        free: "text-blue-400",
        pro: "text-purple-400",
        enterprise: "text-amber-400",
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-2 text-sm text-white/40">
                    <Link href="/tenants" className="hover:text-white transition">
                        Organizations
                    </Link>

                    <span>/</span>

                    <span className="text-white">{tenant.name}</span>
                </div>

                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111827] via-[#0b0f19] to-[#080808] p-6 sm:p-8">
                    <div className="absolute -right-20 -top-24 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-3xl font-bold text-blue-400 shrink-0">
                                {initial}
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                        {tenant.name}
                                    </h1>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusStyles[tenant.status]
                                            }`}
                                    >
                                        {tenant.status}
                                    </span>
                                </div>

                                <p className="text-white/40 text-sm">@{tenant.slug}</p>

                                <p className="text-white/30 text-xs mt-2">
                                    Organization workspace
                                </p>
                            </div>
                        </div>
                        <div>
                            <Button onClick={() => setShowCreateModal(true)}>
                                Create Ticket
                            </Button>
                        </div>
                        <Modal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            title="Create New Ticket"
                        >
                            <TicketForm
                                tenantId={id}
                                onSubmit={async (data) => {
                                    const res = await createTicket(data);
                                    if (res.success) {
                                        setShowCreateModal(false);
                                    }
                                    return res;
                                }}
                                onCancel={() => setShowCreateModal(false)}
                            />
                        </Modal>
                    </div>

                    <div className="relative flex flex-wrap gap-3 mt-7 pt-6 border-t border-white/10">
                        <span
                            className={`text-sm font-medium capitalize ${planStyles[tenant.plan]}`}
                        >
                            {tenant.plan} Plan
                        </span>

                        <span className="text-white/20">•</span>

                        <span className="text-sm text-white/40">
                            Created {formatDate(tenant.createdAt)}
                        </span>
                    </div>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">Organization Information</h2>

                        <p className="text-sm text-white/40 mt-1">
                            Basic details about this organization.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard label="Organization Name" value={tenant.name} />

                        <InfoCard label="Organization Slug" value={tenant.slug} />


                        <InfoCard
                            label="Creator Name"
                            value={user?.name || "Not available"}
                            mono
                        />

                        <InfoCard
                            label="Subscription Plan"
                            value={tenant.plan.toUpperCase()}
                        />

                        <InfoCard
                            label="Last Updated"
                            value={formatDate(tenant.updatedAt)}
                        />
                    </div>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">Ticket Overview</h2>

                        <p className="text-sm text-white/40 mt-1">
                            Support activity within this organization.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/10 bg-[#0c0c0c] p-5 hover:border-white/20 transition"
                            >
                                <p className="text-sm text-white/50">{stat.label}</p>

                                <p className={`text-3xl font-bold mt-4 ${stat.accent}`}>
                                    {stat.value}
                                </p>

                                <p className="text-xs text-white/30 mt-2">{stat.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Recent Tickets</h2>

                            <p className="text-sm text-white/40 mt-1">
                                Latest support requests from this organization.
                            </p>
                        </div>

                        <Link
                            href={`/tenants/${id}/tickets`}
                            className="text-sm text-blue-400 hover:text-blue-300 transition"
                        >
                            View all tickets →
                        </Link>
                    </div>

                    <div>
                        <TicketList tickets={filteredTickets} />
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 pt-5 text-xs text-white/30 flex flex-wrap justify-between gap-3">
                    <span>Organization Workspace</span>
                    <span>Last updated: {formatDate(tenant.updatedAt)}</span>
                </footer>
            </div>
        </main>
    );
}

function PageState({
    message,
    loading = false,
}: {
    message: string;
    loading?: boolean;
}) {
    return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="text-center">
                {loading && (
                    <div className="h-9 w-9 mx-auto mb-5 rounded-full border-2 border-white/20 border-t-blue-500 animate-spin" />
                )}

                <p className="text-white/50 text-sm">{message}</p>
            </div>
        </main>
    );
}

export default TenantPage;

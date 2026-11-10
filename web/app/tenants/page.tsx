
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Building2,
    Search,
    Plus,
    Mail,
    CalendarDays,
    X,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import { useTenants } from "../../features/tenants/hooks/useTenants";
import { TenantForm } from "../../features/tenants/components/TenantForm";

import { CreateTenantData, Tenant } from "../../shared/types";
import TenantList from "@/features/tenants/components/TenantList";

export default function TenantsPage() {
    const router = useRouter();

    const {
        tenants,
        total,
        loading,
        error,
        createTenant,
        loadTenants,
    } = useTenants();

    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadTenants(search);
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, loadTenants]);

    const handleCreate = async (data: CreateTenantData) => {
        const result = await createTenant(data);

        if (result.success) {
            setShowForm(false);
            router.push("/dashboard");
        }

        return result;
    };

    const handleRetry = useCallback(() => {
        loadTenants(search);
    }, [loadTenants, search]);

    return (
        <main className="min-h-screen bg-[#050505] text-white px-6 py-12">

            <div className="mx-auto max-w-7xl">

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <div className="mb-3 flex items-center gap-2 text-sm text-white/40">
                            <Building2 size={16} />
                            <span>Organizations</span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight">
                            Discover Workspaces
                        </h1>

                        <p className="mt-2 text-sm text-white/50">
                            Explore organizations and find a workspace.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
                    >
                        <Plus size={18} />
                        Create Workspace
                    </button>

                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, slug or email..."
                            className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                        />

                    </div>

                    <p className="text-sm text-white/40">
                        {total} organizations found
                    </p>

                </div>

                {error && (
                    <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                        <div className="flex items-center gap-3">
                            <AlertCircle
                                size={18}
                                className="text-red-400"
                            />

                            <p className="text-sm text-red-300">
                                {error}
                            </p>
                        </div>

                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                        >
                            <RefreshCw size={15} />
                            Retry
                        </button>

                    </div>
                )}

                {loading && tenants.length === 0 && !error && (
                    <div className="mt-16 flex flex-col items-center justify-center text-white/40">
                        <RefreshCw
                            size={28}
                            className="animate-spin"
                        />

                        <p className="mt-4 text-sm">
                            Loading organizations...
                        </p>
                    </div>
                )}

                {!loading && !error && tenants.length > 0 && (

                    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {tenants.map((tenant) => (
                            <TenantList
                                key={tenant._id}
                                tenant={tenant}
                            />
                        ))}

                    </div>
                )}

                {!loading && !error && tenants.length === 0 && (

                    <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <Building2
                                size={28}
                                className="text-white/40"
                            />
                        </div>

                        <h2 className="mt-6 text-lg font-semibold">
                            {search
                                ? "No organizations found"
                                : "No organizations available"}
                        </h2>

                        <p className="mt-2 max-w-sm text-sm text-white/40">
                            {search
                                ? "Try searching with another organization name or slug."
                                : "There are currently no other organizations to discover. You can create your own workspace."}
                        </p>

                        {!search && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-6 flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/80"
                            >
                                <Plus size={17} />
                                Create Workspace
                            </button>
                        )}

                    </div>
                )}

                {showForm && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowForm(false);
                            }
                        }}
                    >

                        <div className="relative my-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">

                            <button
                                onClick={() => setShowForm(false)}
                                className="absolute right-5 top-5 rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                                aria-label="Close create workspace form"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                    <Building2 size={23} />
                                </div>

                                <h2 className="text-2xl font-bold">
                                    Create Workspace
                                </h2>

                                <p className="mt-2 text-sm text-white/40">
                                    Set up your organization to manage support tickets.
                                </p>
                            </div>

                            <TenantForm onSubmit={handleCreate} />

                        </div>

                    </div>
                )}

            </div>

        </main>
    );
}



"use client";

import { useTenants } from "@/features/tenants/hooks/useTenants";
import { useParams } from "next/navigation";
import { useEffect } from "react";

function TenantPage() {
    const params = useParams<{ tenantId: string }>();
    const id = params.tenantId;
    const {
        tenant,
        loadTenant,
        loading,
        error,
    } = useTenants();

    useEffect(() => {
        if (id) {
            loadTenant(id);
        }
    }, [id, loadTenant]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/50 text-sm">
                        Loading tenant...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <p className="text-red-400">{error}</p>
            </main>
        );
    }

    if (!tenant) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <p className="text-white/50">Tenant not found.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white p-6">
            <h1 className="text-3xl font-bold">
                {tenant.name}
            </h1>
        </main>
    );
}

export default TenantPage;

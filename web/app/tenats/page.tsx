"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { useTenants } from "../../features/tenants/hooks/useTenants";
import { TenantForm } from "../../features/tenants/components/TenantForm";
import { CreateTenantData } from "../../shared/types";

export default function TenantsPage() {
    const router = useRouter();
    const { createTenant } = useTenants();

    const handleCreate = async (data: CreateTenantData) => {
        const res = await createTenant(data);
        if (res.success) {
            router.push("/dashboard");
        }
        return res;
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Building2 size={28} className="text-white/80" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create Workspace
                    </h1>
                    <p className="mt-2 text-sm text-white/50">
                        Set up your organization to start managing support tickets.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <TenantForm onSubmit={handleCreate} />
                </div>

                <p className="mt-8 text-center text-xs text-white/30">
                    You will become the owner of this organization.
                </p>
            </div>
        </main>
    );
}
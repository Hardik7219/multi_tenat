'use client'
import { Tenant } from "@/shared/types";
import { Building2, CalendarDays, Mail } from "lucide-react";
import Link from "next/link";
import React from "react";

function TenantList({ tenant }: { tenant: Tenant }) {
    const statusStyles: Record<string, string> = {
        active: "bg-green-500/10 text-green-400 border-green-500/20",
        suspended: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        deleted: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <article className="group rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 transition duration-300 hover:border-white/25 hover:bg-[#0d0d0d]">
            {/* Card header */}
            <div className="flex items-start justify-between">
                <div className="flex justify-center items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition group-hover:bg-white/10">
                        <Building2 size={23} className="text-white/80" />
                    </div>
                    <div>
                        <Link href={`/tenants/${tenant._id}`}>OPEN</Link>
                    </div>
                </div>

                <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles[tenant.status] ||
                        "border-white/10 bg-white/5 text-white/50"
                        }`}
                >
                    {tenant.status}
                </span>
            </div>

            {/* Organization details */}
            <div className="mt-6">
                <h2 className="truncate text-lg font-semibold">{tenant.name}</h2>

                <p className="mt-1 text-sm text-white/40">@{tenant.slug}</p>
            </div>

            {/* Additional details */}
            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                {tenant.email && (
                    <div className="flex items-center gap-3 text-sm text-white/50">
                        <Mail size={16} className="shrink-0" />
                        <span className="truncate">{tenant.email}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Subscription</span>

                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs capitalize text-white/70">
                        {tenant.plan}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/40">
                    <CalendarDays size={16} />

                    <span>
                        Created{" "}
                        {new Date(tenant.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                </div>
            </div>
        </article>
    );
}

export default TenantList;

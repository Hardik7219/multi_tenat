"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";
import { Button } from "../shared/ui/Button";

export default function LandingPage() {
    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-[#050505] to-[#050505]"></div>
                
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Now generally available
                </div>

                <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
                    Manage support for all your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">tenants in one place.</span>
                </h1>

                <p className="mt-8 max-w-2xl text-lg text-white/50 sm:text-xl">
                    A multi-tenant workspace built for speed, scale, and seamless customer support experiences. No complex setups, just clean productivity.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/signup">
                        <Button size="lg" className="h-14 px-8 text-base shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            Start for free <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="ghost" size="lg" className="h-14 px-8 text-base">
                            Sign in to workspace
                        </Button>
                    </Link>
                </div>
            </section>

            <section className="border-y border-white/10 bg-white/[0.02] py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                <Zap className="text-yellow-400" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold">Lightning Fast</h3>
                            <p className="text-white/50">Engineered for speed with App Router. Optimistic updates and edge-caching come standard.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                <Shield className="text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold">Tenant Isolation</h3>
                            <p className="text-white/50">Strict data boundaries ensure your customer's data is never mixed or leaked across workspaces.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                <CheckCircle2 className="text-green-400" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold">Zero Configuration</h3>
                            <p className="text-white/50">Simply sign up, create an organization, and start receiving support tickets immediately.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="mt-auto border-t border-white/10 py-12">
                <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-center justify-between px-6 gap-6 text-sm text-white/40">
                    <p>© 2026 MultiTenant Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="hover:text-white transition">Privacy Policy</Link>
                        <Link href="/" className="hover:text-white transition">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

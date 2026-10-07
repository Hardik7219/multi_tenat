"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Ticket, Building2, Settings, Bot } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

    const navLinks = [
        { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Tickets", href: "/tickets", icon: <Ticket size={18} /> },
        { name: "Tenants", href: "/tenats", icon: <Building2 size={18} /> },
        { name: "AI Assistant", href: "/ai", icon: <Bot size={18} /> },
        { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
    ];

    if (isPublicPage) {
        return (
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-bold text-xl">
                            M
                        </div>
                        <span className="text-lg font-semibold text-white tracking-tight">MultiTenant</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition">
                            Log in
                        </Link>
                        <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90">
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-white font-bold text-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            M
                        </div>
                        <span className="text-lg font-semibold text-white tracking-tight hidden sm:block">Workspace</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                                            : "text-white/50 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/20"></div>
                </div>

                <button
                    className="md:hidden text-white/70 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden border-b border-white/10 bg-[#0a0a0a]">
                    <div className="flex flex-col space-y-1 px-4 py-4">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-white/10 text-white"
                                            : "text-white/50 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}

"use client";

import { useState } from "react";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Bot, Sparkles, Zap, MessageSquare } from "lucide-react";

export default function AIPage() {
    const [query, setQuery] = useState("");

    const handleAsk = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for future AI integration
        alert("AI Assistant is coming soon!");
        setQuery("");
    };

    return (
        <main className="flex-1 text-white p-6 md:p-10 bg-[#050505]">
            <div className="max-w-4xl mx-auto space-y-10">
                <header className="border-b border-white/10 pb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                        <p className="text-white/50 mt-1">Supercharge your workflow with intelligent insights and automation.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex flex-col items-center text-center gap-3 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="font-semibold">Auto-Triage</h3>
                        <p className="text-xs text-white/50">Automatically assign priority and tags to incoming tickets based on sentiment.</p>
                    </Card>

                    <Card className="flex flex-col items-center text-center gap-3 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-semibold">Smart Responses</h3>
                        <p className="text-xs text-white/50">Generate context-aware replies with one click to resolve issues faster.</p>
                    </Card>

                    <Card className="flex flex-col items-center text-center gap-3 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="font-semibold">Data Insights</h3>
                        <p className="text-xs text-white/50">Ask natural language questions about your ticket volume and agent performance.</p>
                    </Card>
                </div>

                <section className="mt-12">
                    <Card className="bg-white/[0.02] border-white/10 p-8">
                        <div className="max-w-2xl mx-auto text-center space-y-6">
                            <h2 className="text-xl font-semibold">Try the Beta</h2>
                            <p className="text-sm text-white/50">
                                We are rolling out AI features to select workspaces. Ask a question below to join the waitlist and test the capabilities.
                            </p>
                            <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3">
                                <Input 
                                    className="flex-1"
                                    placeholder="How can I reduce my ticket resolution time?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white border-none shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                                    Ask AI <Bot size={16} className="ml-2" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </section>
            </div>
        </main>
    );
}

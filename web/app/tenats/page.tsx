"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { createTenant } from "@/services/apiServices/tenat.service";

export default function TenantsPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleNameChange(value: string) {
        setName(value);

        // Automatically generate slug
        const generatedSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setSlug(generatedSlug);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("Organization name is required");
            return;
        }

        if (!slug.trim()) {
            setError("Organization slug is required");
            return;
        }

        try {
            setLoading(true);
            setError(name)
            const response = await createTenant({name,slug})

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">

            <div className="w-full max-w-md">

                <div className="text-center mb-8">

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
                        <Building2 size={26} />
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        Create your organization
                    </h1>

                    <p className="mt-2 text-sm text-white/50">
                        Set up your workspace to start managing support tickets.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Organization name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-white/80"
                            >
                                Organization name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="Acme Inc."
                                disabled={loading}
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
                            />
                        </div>


                        <div>
                            <label
                                htmlFor="slug"
                                className="mb-2 block text-sm font-medium text-white/80"
                            >
                                Organization slug
                            </label>

                            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 focus-within:border-white/30">

                                <span className="pl-4 text-sm text-white/30">
                                    /
                                </span>

                                <input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={(e) =>
                                        setSlug(
                                            e.target.value
                                                .toLowerCase()
                                                .replace(
                                                    /[^a-z0-9-]/g,
                                                    ""
                                                )
                                        )
                                    }
                                    placeholder="acme-inc"
                                    disabled={loading}
                                    className="w-full bg-transparent px-2 py-3 text-sm outline-none placeholder:text-white/25 disabled:opacity-50"
                                />

                            </div>

                            <p className="mt-2 text-xs text-white/30">
                                This will identify your organization.
                            </p>
                        </div>


                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}


                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create organization

                                    <ArrowRight size={18} />
                                </>
                            )}

                        </button>

                    </form>

                </div>


                <p className="mt-6 text-center text-xs text-white/30">
                    You will become the owner of this organization.
                </p>

            </div>

        </main>
    );
}
import React, { useState } from "react";
import { CreateTenantData } from "../../../shared/types";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";

interface TenantFormProps {
    onSubmit: (data: CreateTenantData) => Promise<{ success: boolean; error?: string }>;
}

export function TenantForm({ onSubmit }: TenantFormProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleNameChange = (val: string) => {
        setName(val);
        const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setSlug(generated);
    };

    const handleSlugChange = (val: string) => {
        setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Organization name is required");
            return;
        }
        if (!slug.trim()) {
            setError("Organization slug is required");
            return;
        }
        setLoading(true);
        setError("");
        const res = await onSubmit({ name: name.trim(), slug: slug.trim() });
        if (!res.success) {
            setError(res.error || "An unknown error occurred");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
                label="Organization Name"
                placeholder="Acme Corp."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
            />
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Organization Slug</label>
                <div className="flex items-center rounded-xl border border-white/10 bg-black/30 focus-within:border-white/40 transition-colors">
                    <span className="pl-4 text-sm font-medium text-white/30">/</span>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="acme-corp"
                        disabled={loading}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
                    />
                </div>
                <p className="text-xs text-white/30">This identifier will be used in your workspace URLs.</p>
            </div>
            {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">{error}</div>}
            <Button type="submit" isLoading={loading} className="w-full mt-2">
                Create Workspace
            </Button>
        </form>
    );
}

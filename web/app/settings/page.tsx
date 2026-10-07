"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenants } from "../../features/tenants/hooks/useTenants";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Card } from "../../shared/ui/Card";
import { ShieldAlert, Trash2 } from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();
    const { tenant, loading, error, loadTenant, updateTenant, deleteTenant } = useTenants();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        loadTenant();
    }, [loadTenant]);

    useEffect(() => {
        if (tenant) {
            setName(tenant.name);
            setSlug(tenant.slug);
        }
    }, [tenant]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError("");
        setSuccessMsg("");
        
        const res = await updateTenant({ name, slug });
        if (res.success) {
            setSuccessMsg("Workspace settings updated successfully.");
        } else {
            setUpdateError(res.error || "Failed to update settings");
        }
        setUpdateLoading(false);
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this workspace? This action cannot be undone.");
        if (!confirmed) return;
        
        const res = await deleteTenant();
        if (res.success) {
            router.push("/dashboard");
        } else {
            setUpdateError(res.error || "Failed to delete workspace");
        }
    };

    if (loading && !tenant) {
        return (
            <main className="flex-1 flex items-center justify-center p-6 text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/50 text-sm">Loading settings...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 text-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-10">
                <header className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
                    <p className="text-white/50 mt-1">Manage your organization details and dangerous actions.</p>
                </header>

                {(error || updateError) && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
                        {error || updateError}
                    </div>
                )}
                {successMsg && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-400">
                        {successMsg}
                    </div>
                )}

                <section>
                    <h2 className="text-xl font-semibold mb-4">General Settings</h2>
                    <Card>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                            <Input
                                label="Organization Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={updateLoading || !tenant}
                            />
                            <Input
                                label="Organization Slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                disabled={updateLoading || !tenant}
                            />
                            <div className="mt-2 flex justify-end">
                                <Button type="submit" isLoading={updateLoading} disabled={!tenant}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-red-500 flex items-center gap-2">
                        <ShieldAlert size={20} /> Danger Zone
                    </h2>
                    <Card className="border-red-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="font-medium text-white">Delete Workspace</h3>
                                <p className="text-sm text-white/50 mt-1">
                                    Permanently delete this workspace and all of its tickets. This action is irreversible.
                                </p>
                            </div>
                            <Button variant="danger" onClick={handleDelete} disabled={!tenant}>
                                <Trash2 size={16} className="mr-2" /> Delete Workspace
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>
        </main>
    );
}

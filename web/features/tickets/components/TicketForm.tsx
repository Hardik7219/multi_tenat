import React, { useState } from "react";
import { CreateTicketData, TicketPriority } from "../../../shared/types";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";

interface TicketFormProps {
    onSubmit: (data: CreateTicketData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    tenantId:string
}

export function TicketForm({ onSubmit, onCancel,tenantId }: TicketFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TicketPriority>("medium");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError("Title and description are required");
            return;
        }
        setLoading(true);
        setError("");
        const res = await onSubmit({ title: title.trim(), description: description.trim(), priority,tenantId });
        if (!res.success) {
            setError(res.error || "An unknown error occurred");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
                label="Ticket Title"
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
            />
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <textarea
                    placeholder="Detailed explanation of what happened..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/40 disabled:opacity-50"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Priority</label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    disabled={loading}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 disabled:opacity-50"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">{error}</div>}
            <div className="mt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                    Submit Ticket
                </Button>
            </div>
        </form>
    );
}

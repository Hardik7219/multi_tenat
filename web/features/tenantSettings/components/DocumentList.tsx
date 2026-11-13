
"use client";

import { FileText, Trash2 } from "lucide-react";

import type {
    TenantDocument,
} from "../../../shared/services/tenantSettings.service";

interface DocumentListProps {
    documents: TenantDocument[];
    onDelete: (id: string) => void;
}

export function DocumentList({
    documents,
    onDelete,
}: DocumentListProps) {
    if (!documents.length) {
        return (
            <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
                <FileText className="mx-auto text-white/30" size={28} />
                <p className="text-sm text-white/60 mt-3">
                    No knowledge documents yet.
                </p>
                <p className="text-xs text-white/40 mt-1">
                    Document uploads and AI processing will be connected next.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-white/10">
            {documents.map((item) => (
                <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 py-4"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="text-blue-400 shrink-0" size={20} />

                        <div className="min-w-0">
                            <p className="text-sm text-white truncate">
                                {item.document.originalName}
                            </p>

                            <p className="text-xs text-white/40 mt-1">
                                {item.document.processingStatus}
                                {" · "}
                                {(item.document.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onDelete(item._id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                        aria-label={`Delete ${item.document.originalName}`}
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            ))}
        </div>
    );
}

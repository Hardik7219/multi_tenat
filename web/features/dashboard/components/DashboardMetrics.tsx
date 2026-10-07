import React from "react";
import { Card } from "../../../shared/ui/Card";

interface DashboardMetricsProps {
    stats: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
    };
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
    const metrics = [
        { label: "Total Tickets", value: stats.total, color: "text-white" },
        { label: "Open", value: stats.open, color: "text-blue-400" },
        { label: "In Progress", value: stats.inProgress, color: "text-yellow-400" },
        { label: "Resolved", value: stats.resolved, color: "text-green-400" },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m, i) => (
                <Card key={i} className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white/50">{m.label}</span>
                    <span className={`text-4xl font-bold tracking-tight ${m.color}`}>
                        {m.value}
                    </span>
                </Card>
            ))}
        </div>
    );
}

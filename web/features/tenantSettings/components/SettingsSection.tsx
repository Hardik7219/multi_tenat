
import { createElement, type ReactNode } from "react";

interface SettingsSectionProps {
    title: string;
    description: string;
    children: ReactNode;
}

export function SettingsSection({
    title,
    description,
    children,
}: SettingsSectionProps) {
    return createElement(
        "div",
        { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-5" },
        createElement(
            "div",
            null,
            createElement("h2", { className: "text-lg font-semibold text-white" }, title),
            createElement("p", { className: "text-sm text-white/50 mt-1" }, description)
        ),
        createElement("div", { className: "space-y-4" }, children)
    );
}


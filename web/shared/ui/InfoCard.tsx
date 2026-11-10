import React from 'react'

function InfoCard({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-5 min-w-0">
            <p className="text-xs text-white/40 mb-3">
                {label}
            </p>

            <p
                title={value}
                className={`text-sm font-medium text-white/80 break-all ${
                    mono ? "font-mono text-xs" : ""
                }`}
            >
                {value}
            </p>
        </div>
    );
}

export default InfoCard

import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.04] ${
                onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-white/20" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
}

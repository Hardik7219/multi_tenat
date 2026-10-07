import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
}

export function Button({
    children,
    isLoading,
    variant = "primary",
    size = "md",
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none rounded-xl";
    const variants = {
        primary: "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
        danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
        ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

    return (
        <button className={combinedClassName} disabled={disabled || isLoading} {...props}>
            {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
            {children}
        </button>
    );
}

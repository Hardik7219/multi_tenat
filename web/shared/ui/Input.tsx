import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = "", ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-2">
                {label && (
                    <label className="text-sm font-medium text-white/80">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3 text-white/40">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`w-full rounded-xl border bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/40 disabled:opacity-50 ${
                            icon ? "pl-10" : ""
                        } ${error ? "border-red-500/50" : "border-white/10"} ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

"use client";

import { type FormEvent, useRef, useState } from "react";
import { SendHorizontal, Paperclip } from "lucide-react";

interface ChatInputProps {
    onSend: (content: string) => Promise<{ success: boolean; error?: string }>;
    onTyping?: () => void;
    disabled?: boolean;
    sending?: boolean;
}

export function ChatInput({ onSend, onTyping, disabled, sending }: ChatInputProps) {
    const [text, setText] = useState("");
    const [localError, setLocalError] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        onTyping?.();

        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }
    };

    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending || disabled) return;

        setLocalError("");
        const result = await onSend(trimmed);

        if (result.success) {
            setText("");
            if (textareaRef.current) textareaRef.current.style.height = "auto";
        } else {
            setLocalError(result.error || "Failed to send");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const isDisabled = disabled || sending;

    return (
        <div className="border-t border-white/8 bg-black/20 p-3">
            {localError && (
                <p className="mb-2 text-xs text-red-400">{localError}</p>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/25 transition-colors"
            >
                <button
                    type="button"
                    className="mb-1 shrink-0 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                    title="Attach file (coming soon)"
                    disabled
                >
                    <Paperclip size={16} />
                </button>

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isDisabled
                            ? "Connecting…"
                            : "Type a message… (Enter to send, Shift+Enter for newline)"
                    }
                    disabled={isDisabled}
                    className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/30 outline-none disabled:opacity-50"
                    style={{ maxHeight: "120px", overflowY: "auto" }}
                />

                <button
                    type="submit"
                    disabled={isDisabled || text.trim() === ""}
                    className="mb-1 shrink-0 rounded-lg bg-blue-600 p-1.5 text-white transition hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Send message"
                >
                    <SendHorizontal size={16} />
                </button>
            </form>

            <p className="mt-1.5 text-center text-[10px] text-white/20">
                Enter to send · Shift + Enter for new line
            </p>
        </div>
    );
}

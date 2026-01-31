"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            className="text-zinc-500 hover:text-white transition-colors p-2"
            onClick={onCopy}
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
    )
}

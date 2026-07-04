"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { runsLabels } from "../labels";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title={runsLabels.technical.copy}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}

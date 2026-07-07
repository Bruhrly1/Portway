"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setStatus("copied");
        } catch {
          setStatus("error");
        }
        setTimeout(() => setStatus("idle"), 2000);
      }}
      className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
    >
      {status === "copied" ? "Copied!" : status === "error" ? "Couldn't copy" : "Copy link"}
    </button>
  );
}

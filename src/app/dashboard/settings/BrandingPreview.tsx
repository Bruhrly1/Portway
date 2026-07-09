"use client";

import { useState } from "react";
import { getReadableTextColor } from "@/lib/color";

export function BrandingPreview({
  initialBusinessName,
  initialAccentColor,
  logoUrl,
}: {
  initialBusinessName: string;
  initialAccentColor: string;
  logoUrl: string | null;
}) {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [accentColor, setAccentColor] = useState(initialAccentColor);
  const accentText = getReadableTextColor(accentColor);

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-zinc-700">
            Business name
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="accent_color" className="block text-sm font-medium text-zinc-700">
            Accent color
          </label>
          <input
            id="accent_color"
            name="accent_color"
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="mt-1 h-10 w-16 rounded-md border border-zinc-300"
          />
        </div>
      </div>

      <div className="flex-1">
        <p className="mb-2 text-xs text-zinc-500">Preview — how clients will see it</p>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
          <div className="bg-zinc-50 p-4">
            <div className="flex items-center gap-2">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={businessName || "Logo"}
                  className="h-8 w-8 rounded-md border border-zinc-200 object-contain"
                />
              )}
              <span className="text-sm text-zinc-500">{businessName || "Your business"}</span>
            </div>
            <button
              type="button"
              disabled
              className="mt-3 cursor-default rounded-md px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: accentColor,
                color: accentText,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
              }}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { IndicioDisclaimer } from "@/components/IndicioDisclaimer";

export default function RadarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-2">
        <IndicioDisclaimer />
      </div>
    </div>
  );
}

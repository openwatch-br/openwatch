"use client";

import { Download } from "lucide-react";

/** Leaf client component — triggers the browser's print dialog (save-as-PDF). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="ow-btn ow-btn-secondary ow-btn-sm gap-1.5"
    >
      <Download className="h-3.5 w-3.5" />
      PDF
    </button>
  );
}

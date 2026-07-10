import { Scale } from "lucide-react";
import type { TypologyLegalBasis } from "@/lib/types";

interface TypologyEntry {
  code: string;
  name: string;
  description: string;
  sources: string[];
}

interface TypologyCatalogProps {
  entries: TypologyEntry[];
  legalByCode: Map<string, TypologyLegalBasis>;
}

/**
 * The 22-typology catalog rendered as a compact editorial list (one entry
 * per row) rather than a card grid, so it stays inside the 68ch reading
 * column instead of breaking out to a wide layout.
 */
export function TypologyCatalog({ entries, legalByCode }: TypologyCatalogProps) {
  return (
    <div className="flex flex-col gap-4">
      {entries.map((t) => {
        const legal = legalByCode.get(t.code);
        const firstArticle = legal?.law_articles?.[0];
        const legalText = firstArticle
          ? `${firstArticle.law_name} — ${firstArticle.article}`
          : legal?.description_legal ?? null;

        return (
          <div key={t.code} className="border-b border-[var(--color-border-subtle)] pb-4 last:border-0">
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="ow-chip text-mono-xs">{t.code}</span>
              <span className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
                {t.name}
              </span>
            </div>
            <p className="mb-1.5 text-[14px] leading-relaxed" style={{ color: "var(--color-text-2)" }}>
              {t.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {legalText && (
                <span className="inline-flex items-center gap-1.5 text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                  <Scale className="h-3 w-3 shrink-0" />
                  {legalText}
                </span>
              )}
              {t.sources.length > 0 && (
                <span className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                  {t.sources.join(" · ")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

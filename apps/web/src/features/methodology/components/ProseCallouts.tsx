import { Scale } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Typed callout family for long-form editorial pages (Metodologia,
 * Compliance) — visual hierarchy per the Nexo mockup: nota (teal, informal
 * aside), aviso jurídico (vinho/critical, ⚖ icon, tinted card), norma
 * (reference chips, reuses .ow-chip), fórmula (mono block). CSS lives in
 * globals.css under `.ow-callout*` / `.ow-formula-block` — new component-
 * layer classes added for this story since nothing reusable existed.
 */

export function NotaCallout({ children }: { children: ReactNode }) {
  return (
    <div className="ow-callout ow-callout-nota">
      <div className="ow-callout-label">◈ Nota</div>
      <p>{children}</p>
    </div>
  );
}

export function AvisoJuridicoCallout({ children }: { children: ReactNode }) {
  return (
    <div className="ow-callout ow-callout-aviso">
      <div className="ow-callout-label">
        <Scale className="h-3 w-3" aria-hidden />
        Aviso jurídico
      </div>
      <p>{children}</p>
    </div>
  );
}

export function NormaChips({ items }: { items: string[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="ow-chip text-mono-xs">
          {item}
        </span>
      ))}
    </div>
  );
}

export function FormulaBlock({
  label,
  formula,
  children,
}: {
  label: string;
  formula: string;
  children?: ReactNode;
}) {
  return (
    <div className="ow-formula-block">
      <div className="text-label mb-3" style={{ color: "var(--color-text-3)" }}>
        {label}
      </div>
      {children}
      <div className={children ? "ow-formula-rule" : undefined}>
        <pre>{formula}</pre>
      </div>
    </div>
  );
}

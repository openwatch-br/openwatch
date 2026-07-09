/**
 * Rail-sized indício disclaimer — every signal is a lead, not a verdict, and
 * auditable to its primary source. Compact variant for the home right rail.
 */
export function IndicioNote() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-dark-2)] px-3.5 py-3">
      <div className="flex items-start gap-2">
        <span className="text-[12px] leading-snug text-[var(--color-text-3)]">◈</span>
        <p className="text-[11.5px] leading-relaxed text-[var(--color-text-3)]">
          Todo sinal é um <strong className="text-[var(--color-text-2)]">indício</strong>, não uma
          condenação. Cada afirmação é auditável até a fonte primária pela cadeia de proveniência.
        </p>
      </div>
    </div>
  );
}

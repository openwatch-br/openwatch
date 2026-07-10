import type { TypologyLegalBasis } from "@/lib/types";

/** Per-typology legal basis table sourced from the live API (`fetchTipologiaList`). */
export function LegalBasisTable({ items }: { items: TypologyLegalBasis[] }) {
  if (items.length === 0) return null;
  return (
    <div className="ow-table-wrapper">
      <table className="ow-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tipo de corrupção</th>
            <th>Base legal</th>
            <th>Evidência</th>
          </tr>
        </thead>
        <tbody>
          {items.map((basis, i) => {
            const firstArticle = basis.law_articles[0];
            return (
              <tr key={`${basis.code}-${i}`}>
                <td>
                  <span className="ow-chip text-mono-xs">{basis.code}</span>
                </td>
                <td className="text-caption" style={{ color: "var(--color-text-2)" }}>
                  {basis.corruption_types.join(", ")}
                </td>
                <td className="text-mono-xs" style={{ color: "var(--color-text)" }}>
                  {firstArticle
                    ? `${firstArticle.law_name} — ${firstArticle.article}`
                    : basis.description_legal || "—"}
                </td>
                <td>
                  <span className="ow-badge ow-badge-neutral text-mono-xs">{basis.evidence_level}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

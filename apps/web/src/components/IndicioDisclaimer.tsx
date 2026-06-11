import Link from "next/link";

/**
 * Disclaimer legal obrigatório (LGPD / presunção de inocência): sinais são
 * indícios estatísticos que requerem apuração — nunca acusações.
 * Renderizar em toda superfície que exiba sinais ligados a entidades.
 */
export function IndicioDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] leading-relaxed text-muted">
        Sinais são <strong className="font-semibold">indícios estatísticos</strong> que
        requerem apuração pelos órgãos competentes — não constituem acusação,
        prova de irregularidade ou juízo de culpa.
      </p>
    );
  }
  return (
    <div
      role="note"
      className="rounded-xl border border-border bg-surface-card px-4 py-3 text-xs leading-relaxed text-muted"
    >
      <p>
        <strong className="font-semibold text-primary">
          Sinais não são acusações.
        </strong>{" "}
        Todo sinal exibido nesta plataforma é um{" "}
        <strong className="font-semibold">indício estatístico</strong> derivado do
        cruzamento de dados públicos, que <em>requer apuração</em> pelos órgãos
        competentes (MP, TCU, CGU). Nenhuma pessoa ou empresa aqui listada deve ser
        considerada culpada de qualquer irregularidade — vigora a presunção de
        inocência. Cada sinal cita fonte, data de coleta e versão da regra que o
        gerou.{" "}
        <Link href="/methodology" className="underline hover:text-primary">
          Entenda a metodologia
        </Link>
        .
      </p>
    </div>
  );
}

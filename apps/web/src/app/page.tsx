// apps/web/src/app/page.tsx
import Link from "next/link";
import { Section } from "@/components/watchdog";
import { StatHero } from "@/components/StatHero";
import { TYPOLOGY_LABELS, DATA_SOURCES } from "@/lib/constants";

// Static fallback stats — replace with API fetch when data layer is ready.
const STUB_FLAGGED_TODAY = 7;
const STUB_ANALYZED_24H = 128;

export default function HomePage() {
  const typologyCount = Object.keys(TYPOLOGY_LABELS).length;
  const sourceCount = DATA_SOURCES.length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="space-y-6">
        <p className="text-sm text-[var(--color-text-3)]">
          Dinheiro público, sob escrutínio.
        </p>

        <StatHero
          label="Casos sinalizados hoje"
          value={String(STUB_FLAGGED_TODAY)}
          subtitle="padrões de risco detectados em dados públicos federais"
          stats={[
            { value: String(STUB_ANALYZED_24H), label: "Analisados 24h", tone: "neutral" },
            { value: String(typologyCount), label: "Detectores", tone: "neutral" },
            { value: String(sourceCount), label: "Fontes", tone: "neutral" },
          ]}
        />

        {/* Primary action — one per screen */}
        <Link
          href="/radar"
          className="ow-btn ow-btn-amber ow-btn-md"
        >
          Ver casos sinalizados
        </Link>
      </header>

      {/* ── Mission ──────────────────────────────────────────────────── */}
      <Section title="O problema">
        <p className="text-sm text-[var(--color-text-3)] max-w-2xl leading-relaxed">
          O Brasil gasta mais de{" "}
          <strong className="text-[var(--color-text-2)]">R$ 1 trilhão por ano</strong>{" "}
          em compras e contratos públicos. Boa parte desse dinheiro é monitorada
          apenas por auditores que trabalham com amostras — e por denunciantes que
          dependem de sorte e coragem. A maioria dos desvios nunca é detectada.
        </p>
        <p className="text-sm text-[var(--color-text-3)] max-w-2xl leading-relaxed mt-3">
          OpenWatch existe para mudar isso. Ingerimos os dados públicos disponíveis,
          aplicamos um motor de detecção baseado em{" "}
          <strong className="text-[var(--color-text-2)]">{Object.keys(TYPOLOGY_LABELS).length} tipologias</strong>{" "}
          de risco e tornamos os resultados acessíveis para qualquer pessoa — jornalistas,
          pesquisadores, cidadãos, auditores.
        </p>
      </Section>

      {/* ── What we do ───────────────────────────────────────────────── */}
      <Section title="O que fazemos">
        <div className="grid sm:grid-cols-3 gap-4 mt-1">
          <div className="space-y-2">
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-brand)" }}
            >
              01 — Coleta
            </div>
            <p className="text-sm text-[var(--color-text-3)] leading-relaxed">
              Monitoramos{" "}
              <strong className="text-[var(--color-text-2)]">{DATA_SOURCES.length} fontes</strong>{" "}
              oficiais — PNCP, ComprasGov, TCU, CNJ e outros portais federais.
              Os dados são normalizados e cruzados automaticamente.
            </p>
          </div>
          <div className="space-y-2">
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-brand)" }}
            >
              02 — Detecção
            </div>
            <p className="text-sm text-[var(--color-text-3)] leading-relaxed">
              Um motor de tipologias analisa padrões como licitante único,
              fracionamento de contratos, concentração de fornecedor e vínculos
              entre entidades suspeitas. Cada sinal tem severidade e fundamentação.
            </p>
          </div>
          <div className="space-y-2">
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-brand)" }}
            >
              03 — Exposição
            </div>
            <p className="text-sm text-[var(--color-text-3)] leading-relaxed">
              Os achados são publicados aqui, abertos e consultáveis. Cada caso
              inclui dossiê completo: cronologia, rede de entidades, sinais
              detectados e hipóteses jurídicas aplicáveis.
            </p>
          </div>
        </div>
      </Section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <Section title="Como funciona">
        <p className="text-sm text-[var(--color-text-3)] max-w-xl">
          Analisamos dados federais públicos e destacamos padrões que podem
          indicar risco. Não acusamos — apontamos o que merece atenção.
        </p>

        <ol className="space-y-2 text-sm text-[var(--color-text-2)] list-decimal list-inside">
          <li>
            Coletamos dados de fontes governamentais oficiais (PNCP,
            ComprasGov, TCU)
          </li>
          <li>
            Detectamos padrões incomuns usando{" "}
            <strong>{typologyCount} tipologias</strong> pré-definidas
          </li>
          <li>
            Expomos os achados para escrutínio público —{" "}
            <strong>{sourceCount} fontes</strong> monitoradas
          </li>
        </ol>
      </Section>

      {/* ── Lacunas de cobertura ─────────────────────────────────────── */}
      <Section title="O que não conseguimos coletar — e por quê">
        <p className="text-sm text-[var(--color-text-3)] max-w-xl">
          Algumas fontes oficiais estão inacessíveis por barreiras técnicas ou
          de acesso que não dependem do OpenWatch. Documentamos aqui com
          transparência o que está fora do nosso radar e qual o impacto disso.
        </p>

        <div className="space-y-4 mt-2">

          {/* TCE-PE */}
          <div className="border border-[var(--color-border)] rounded-md p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-text)]">
                TCE-PE — Tribunal de Contas do Estado de Pernambuco
              </p>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--color-critical)] border border-[var(--color-critical)]/30 rounded px-1.5 py-0.5">
                Endpoint morto
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
              O domínio <code className="font-mono text-[var(--color-text-2)]">api.tce.pe.gov.br</code> não
              resolve via DNS — nem dentro dos containers, nem a partir do servidor host. O endpoint foi
              desativado sem substituto público identificado. Afeta 3 jobs:{" "}
              <code className="font-mono">tce_pe_contratos</code>,{" "}
              <code className="font-mono">tce_pe_licitacoes</code>,{" "}
              <code className="font-mono">tce_pe_despesas</code>.
            </p>
            <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
              <strong className="text-[var(--color-text-2)]">Impacto:</strong> Contratos, licitações e
              despesas municipais de Pernambuco (~185 municípios) ficam fora do radar. Cobertura geográfica
              falha para o Nordeste — o TCE-PE é o principal tribunal de contas da região.
            </p>
          </div>

          {/* STF */}
          <div className="border border-[var(--color-border)] rounded-md p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-text)]">
                STF — Supremo Tribunal Federal (jurisprudência)
              </p>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--color-warning)] border border-[var(--color-warning)]/30 rounded px-1.5 py-0.5">
                Bloqueio WAF
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
              A API de jurisprudência do STF (<code className="font-mono text-[var(--color-text-2)]">jurisprudencia.stf.jus.br/api</code>) é
              protegida por AWS WAF com bot-detection. Requisições automatizadas recebem HTTP 202 com
              challenge JavaScript — impossível de resolver sem um navegador real. O STF não está incluído
              no DataJud do CNJ. Afeta 2 jobs:{" "}
              <code className="font-mono">juris_stf_improbidade</code>,{" "}
              <code className="font-mono">juris_stf_licitacao</code>.
            </p>
            <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
              <strong className="text-[var(--color-text-2)]">Impacto:</strong> Acórdãos do STF sobre
              improbidade administrativa e licitações fraudulentas não entram no grafo de hipóteses
              jurídicas. O STF é a última instância — seus acórdãos têm o maior peso para fundamentar
              investigações. A base jurídica exibida cobre CNJ e TCU, mas não o STF.
            </p>
          </div>

          {/* Portal Transparência */}
          <div className="border border-[var(--color-border)] rounded-md p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Portal da Transparência — execução orçamentária e servidores
              </p>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-3)] border border-[var(--color-border)] rounded px-1.5 py-0.5">
                Acesso restrito
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
              Dois endpoints da API CGU estão inacessíveis:{" "}
              <code className="font-mono text-[var(--color-text-2)]">/despesas/execucao</code> retorna 403
              Forbidden no plano gratuito (requer plano pago);{" "}
              <code className="font-mono text-[var(--color-text-2)]">/servidores/por-orgao</code> exige
              filtro obrigatório por órgão SIAPE, impossibilitando dump em massa.
            </p>
            <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
              <strong className="text-[var(--color-text-2)]">Impacto:</strong>{" "}
              Pagamentos efetivos (empenho → liquidação → pagamento) e remuneração de servidores públicos
              federais ficam fora da análise. Isso limita a detecção de conflitos de interesse entre
              servidores e fornecedores, e impede cruzar o que foi contratado com o que foi realmente pago.
            </p>
          </div>

        </div>
      </Section>

      {/* Disclaimer — raw section intentional, no title needed */}
      <section className="text-xs text-[var(--color-text-3)] border-t border-[var(--color-border)] pt-6 max-w-xl">
        OpenWatch não acusa irregularidades. Destacamos padrões para que
        possam ser investigados. Os dados são extraídos de fontes oficiais do
        governo federal brasileiro.
      </section>
    </div>
  );
}

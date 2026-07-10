import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TYPOLOGY_LABELS, DATA_SOURCES } from "@/lib/constants";
import { fetchTipologiaList } from "@/lib/api";
import type { TypologyLegalBasis } from "@/lib/types";
import { ArticleReadingShell, type ArticleTocEntry } from "@/features/methodology/components/ArticleReadingShell";
import { NotaCallout, AvisoJuridicoCallout, NormaChips, FormulaBlock } from "@/features/methodology/components/ProseCallouts";
import { ConfidenceThresholdTable } from "@/features/methodology/components/ConfidenceThresholdTable";
import { ConfidenceScale } from "@/features/methodology/components/ConfidenceScale";
import { TypologyCatalog } from "@/features/methodology/components/TypologyCatalog";
import { LegalBasisTable } from "@/features/methodology/components/LegalBasisTable";
import { PrintButton } from "@/features/methodology/components/PrintButton";

// ── Local reference data ──────────────────────────────────────────────────
// (Kept here rather than lib/constants.ts — editorial copy specific to this
// document, not shared app-wide state.)

const TYPOLOGY_DESCRIPTIONS: Record<string, string> = {
  T01: "Órgão direciona parcela desproporcional do gasto a um único fornecedor ao longo do período analisado.",
  T02: "Licitações com número de participantes abaixo do esperado para o segmento e faixa de valor.",
  T03: "Despesas particionadas sistematicamente abaixo de limiares legais de modalidade licitatória.",
  T04: "Aditivos contratuais com valor ou extensão fora do intervalo histórico para o tipo de contrato.",
  T05: "Preço unitário contratado desvia significativamente da mediana de mercado para o mesmo item/serviço.",
  T06: "Empresa apresenta indicadores associados a sociedade de fachada: capital mínimo, CNAE inconsistente, endereço compartilhado.",
  T07: "Conjunto de empresas apresenta padrão de propostas coordenadas compatível com cartel em múltiplas licitações.",
  T08: "Fornecedor com contrato ativo consta em cadastro de sancionados (CEIS, CNEP, CEPIM) vigente.",
  T09: "Servidores com vínculo ativo não localizáveis na folha de pagamento do período ou com remuneração inconsistente.",
  T10: "Contratação terceirizada paralela a quadro próprio com sobreposição de função e órgão.",
  T11: "Itens com preço unitário inflado seguidos de aumento de quantidade via aditivo — padrão clássico de jogo de planilha em obras públicas.",
  T12: "Edital com exigências técnicas, geográficas ou de qualificação direcionadas a fornecedor específico, restringindo a competitividade.",
  T13: "Agente público responsável pela contratação compartilha vínculo familiar, societário ou financeiro com o fornecedor vencedor.",
  T14: "Fornecedor acumula múltiplos sinais de favorecimento (concentração, baixa competição, aditivo outlier, preço outlier) de forma persistente e composta.",
  T15: "Contratação declarada inexigível quando existem fornecedores alternativos habilitados no mesmo segmento de mercado.",
  T16: "Emendas parlamentares ou transferências especiais sem plano de trabalho registrado ou com valor desproporcional à capacidade administrativa do ente.",
  T17: "Fluxo financeiro circular entre empresas interligadas societariamente após contrato público, indicador de lavagem por camadas.",
  T18: "Servidor com vínculo ativo em dois órgãos simultaneamente ou expulso da administração atuando como sócio em empresa contratada.",
  T19: "Mesmo conjunto restrito de fornecedores vence contratos alternadamente em licitações do mesmo órgão — padrão indicativo de rodízio combinado para aparentar competitividade.",
  T20: "Empresa vencedora não localizável em registros comerciais ativos, com CNPJ cancelado/suspenso ou endereço fantasma confirmado na Receita Federal.",
  T21: "Grupo de empresas formalmente distintas apresenta comportamento licitatório homogêneo (preços, datas, documentos) sugerindo controle comum oculto.",
  T22: "Contratações concentradas em períodos eleitorais ou cujo beneficiário apresenta vínculo com agente político responsável pela autorização.",
};

const TYPOLOGY_SOURCES: Record<string, string[]> = {
  T01: ["PNCP", "Compras.gov.br"],
  T02: ["PNCP", "Compras.gov.br"],
  T03: ["PNCP", "ComprasNet Contratos"],
  T04: ["PNCP", "ComprasNet Contratos"],
  T05: ["PNCP", "Compras.gov.br"],
  T06: ["Receita Federal (CNPJ)"],
  T07: ["PNCP", "Compras.gov.br", "ComprasNet Contratos"],
  T08: ["Portal da Transparência", "PNCP"],
  T09: ["Portal da Transparência"],
  T10: ["Portal da Transparência", "Compras.gov.br"],
  T11: ["PNCP", "ComprasNet Contratos"],
  T12: ["PNCP", "Compras.gov.br"],
  T13: ["Receita Federal (CNPJ)", "Portal da Transparência"],
  T14: ["PNCP", "Portal da Transparência"],
  T15: ["PNCP", "Compras.gov.br"],
  T16: ["Portal da Transparência", "Transfere.gov"],
  T17: ["Receita Federal (CNPJ)"],
  T18: ["Portal da Transparência"],
  T19: ["PNCP", "ComprasNet Contratos"],
  T20: ["Receita Federal (CNPJ)", "PNCP"],
  T21: ["PNCP", "Receita Federal (CNPJ)", "Compras.gov.br"],
  T22: ["Portal da Transparência", "PNCP"],
};

const NORMAS = [
  "Lei 14.133/2021 · Licitações",
  "Lei 8.429/1992 · Improbidade",
  "Lei 12.846/2013 · Anticorrupção",
  "LGPD · dados pessoais",
];

const ENTITY_EVIDENCE_TIERS = [
  { code: "CNPJ_EXACT", label: "CNPJ exato" },
  { code: "CPF_EXACT", label: "CPF exato (hash)" },
  { code: "CNPJ_BRANCH", label: "Mesma raiz de CNPJ (filial)" },
  { code: "CPF_PARTIAL_NAME", label: "CPF parcial + nome" },
  { code: "NAME_MUNICIPALITY", label: "Nome + município" },
  { code: "NAME_CO_PARTICIPATION", label: "Nome + coparticipação" },
  { code: "NAME_FUZZY", label: "Nome aproximado (fuzzy)" },
];

const TOC: ArticleTocEntry[] = [
  { num: "01", id: "sec-principio", label: "Indício, nunca veredito" },
  { num: "02", id: "sec-confianca", label: "A escala de confiança" },
  { num: "03", id: "sec-normas", label: "Referências normativas" },
  { num: "04", id: "sec-entidades", label: "Resolução de entidades" },
  { num: "05", id: "sec-tipologias", label: "Catálogo de tipologias" },
  { num: "06", id: "sec-correcao", label: "Correção e proveniência" },
];

export default async function MethodologyPage() {
  const legalBasisList: TypologyLegalBasis[] = await fetchTipologiaList().catch(() => []);
  const legalByCode = new Map<string, TypologyLegalBasis>(legalBasisList.map((b) => [b.code, b]));

  const typologyEntries = Object.entries(TYPOLOGY_LABELS).map(([code, name]) => ({
    code,
    name,
    description: TYPOLOGY_DESCRIPTIONS[code] ?? "",
    sources: TYPOLOGY_SOURCES[code] ?? [],
  }));

  return (
    <div className="ow-mode-editorial ow-content">
      {/* ── masthead ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1180px] px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
        <div className="flex items-start justify-between gap-6">
          <p className="text-mono-xs uppercase tracking-[0.14em]" style={{ color: "var(--color-brand-text)" }}>
            Compliance &amp; Metodologia
          </p>
          <PrintButton />
        </div>

        <h1
          className="mt-4 max-w-[16ch]"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.04,
            color: "var(--color-text)",
          }}
        >
          Como o OpenWatch gera indícios
        </h1>
        <p
          className="mt-5 max-w-[58ch]"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(1.05rem, 1.6vw, 1.3125rem)",
            lineHeight: 1.5,
            color: "var(--color-text-2)",
          }}
        >
          O que os sinais significam, como são calculados e — sobretudo — o que eles deliberadamente não afirmam.
        </p>

        <div
          className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2 border-t pt-4"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          {[
            { label: "Versão", value: "v2.4" },
            { label: "Revisão", value: "04 jul 2026" },
            { label: "Tipologias", value: String(typologyEntries.length) },
            { label: "Fontes públicas", value: String(DATA_SOURCES.length) },
          ].map((meta) => (
            <div key={meta.label} className="flex items-baseline gap-1.5">
              <span className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                {meta.label}
              </span>
              <span className="text-mono-xs tabular-nums" style={{ color: "var(--color-text-2)" }}>
                {meta.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ArticleReadingShell eyebrow="Documento vivo" docVersion="v2.4" docRevisedAt="04 jul 2026" toc={TOC}>
        <p className="text-label mb-2" style={{ color: "var(--color-brand-text)" }}>
          Princípio
        </p>
        <h2 id="sec-principio" style={{ marginTop: 0 }}>
          Indício, nunca veredito
        </h2>
        <p>
          Todo resultado do OpenWatch é um <strong>indício</strong> — um padrão estatístico ou documental que merece
          atenção humana. Não é acusação, prova ou condenação. A plataforma não julga; ela aponta onde investigar, e
          expõe integralmente como chegou ali. Severidade alta indica prioridade de análise, nunca culpabilidade.
        </p>
        <AvisoJuridicoCallout>
          A presunção de inocência é inegociável. Nomes de pessoas e empresas aparecem porque constam em dados
          públicos — não porque a plataforma lhes atribui culpa. Qualquer sinal pode ser auditado até sua fonte
          primária (seção 6).
        </AvisoJuridicoCallout>

        <p className="text-label mb-2 mt-14" style={{ color: "var(--color-brand-text)" }}>
          Método
        </p>
        <h2 id="sec-confianca" style={{ marginTop: 0 }}>
          A escala de confiança
        </h2>
        <p>
          Cada sinal carrega um <em>score de confiança</em> de 0 a 100. O score define o rótulo exibido — e mede
          confiança na detecção, não gravidade do achado:
        </p>
        <ConfidenceScale />
        <p className="text-caption mb-3" style={{ color: "var(--color-text-3)" }}>
          Como o rótulo aparece em cada sinal:
        </p>
        <ConfidenceThresholdTable />
        <FormulaBlock
          label="Fórmula do score"
          formula={"score = 0,40 · confiança_ER\n      + 0,25 · frescor_dos_dados\n      + 0,20 · cobertura_de_fontes\n      + 0,15 · evidência_da_tipologia"}
        />
        <NotaCallout>
          O score mede <em>confiança na detecção</em>, não gravidade. Um sinal pode ser <strong>confirmado</strong>{" "}
          (temos certeza do que os dados mostram) e ainda assim de severidade baixa.
        </NotaCallout>

        <p className="text-label mb-2 mt-14" style={{ color: "var(--color-brand-text)" }}>
          Base legal
        </p>
        <h2 id="sec-normas" style={{ marginTop: 0 }}>
          Referências normativas
        </h2>
        <p>As tipologias citam dispositivos legais como <em>apoio à apuração</em>, jamais como enquadramento automático:</p>
        <NormaChips items={NORMAS} />
        <LegalBasisTable items={legalBasisList} />

        <p className="text-label mb-2 mt-14" style={{ color: "var(--color-brand-text)" }}>
          Identidade
        </p>
        <h2 id="sec-entidades" style={{ marginTop: 0 }}>
          Resolução de entidades
        </h2>
        <p>
          Antes de qualquer tipologia rodar, registros de fontes distintas que descrevem a mesma pessoa ou empresa
          precisam ser unificados. A resolução de entidades (ER) compara pares de registros por uma hierarquia de
          evidências — da mais forte (identificador exato) à mais fraca (nome aproximado) — e só funde o par quando a
          confiança combinada atinge o limiar mínimo de <strong>60</strong>:
        </p>
        <NormaChips items={ENTITY_EVIDENCE_TIERS.map((t) => `${t.code} · ${t.label}`)} />
        <NotaCallout>
          CPFs nunca são persistidos em claro: são hasheados (SHA-256 + salt) na ingestão, antes de qualquer
          comparação de identidade (LGPD art. 12).
        </NotaCallout>

        <p className="text-label mb-2 mt-14" style={{ color: "var(--color-brand-text)" }}>
          Catálogo
        </p>
        <h2 id="sec-tipologias" style={{ marginTop: 0 }}>
          Catálogo de tipologias
        </h2>
        <p>
          O motor aplica {typologyEntries.length} tipologias com thresholds específicos por contexto e baseline
          histórico. Cada entrada abaixo indica a fonte pública e a base legal usada como apoio à apuração.
        </p>
        <TypologyCatalog entries={typologyEntries} legalByCode={legalByCode} />

        <p className="text-label mb-2 mt-14" style={{ color: "var(--color-brand-text)" }}>
          Governança
        </p>
        <h2 id="sec-correcao" style={{ marginTop: 0 }}>
          Correção e proveniência
        </h2>
        <p>
          O OpenWatch aponta indícios — não formula acusações, e por isso não existe um sinal a ser &ldquo;contestado&rdquo;.
          O que existe é uma trilha auditável: todo sinal é rastreável até seu evento de origem na fonte pública que o
          gerou, e qualquer pessoa pode seguir esse caminho para conferir os dados por conta própria.
        </p>
        <p>
          Quando um dado de origem muda ou um erro é identificado — na fonte pública, na resolução de entidades ou no
          cálculo do score — o registro subjacente é reingerido e recalculado, e a correção se propaga para o
          histórico do caso. A proveniência anterior não é apagada: fica registrado o que mudou, quando e por quê.
        </p>
        <NotaCallout>
          Auditar um sinal não depende de abrir um chamado: os IDs de origem (edital, contrato, CNPJ) ficam expostos
          no próprio sinal, prontos para conferência direta na fonte.
        </NotaCallout>

        <div className="ow-divider my-9" />

        <p className="text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
          Fontes de dados
        </p>
        <div className="mb-5 flex flex-wrap gap-2">
          {DATA_SOURCES.map((src) => (
            <span key={src} className="ow-badge ow-badge-neutral">
              {src}
            </span>
          ))}
        </div>

        <div className="ow-card p-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-caption" style={{ color: "var(--color-text-2)" }}>
            Veja o documento técnico-jurídico completo com respaldo legal detalhado.
          </p>
          <Link
            href="/compliance"
            className="inline-flex items-center gap-1 text-caption font-medium shrink-0 hover:underline"
            style={{ color: "var(--color-brand-text)" }}
          >
            Compliance completo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="mt-6 text-mono-xs" style={{ color: "var(--color-text-3)" }}>
          A metodologia evolui conforme expansão de cobertura nacional e melhoria de evidência por UF/município.
          Ajustes de threshold, score e tipologias são versionados para rastreabilidade técnica.
        </p>
      </ArticleReadingShell>
    </div>
  );
}

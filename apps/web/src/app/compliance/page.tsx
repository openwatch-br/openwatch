import Link from "next/link";
import { Code, Scale, Globe, CheckCircle2, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { ArticleReadingShell, type ArticleTocEntry } from "@/features/methodology/components/ArticleReadingShell";
import { NotaCallout, AvisoJuridicoCallout } from "@/features/methodology/components/ProseCallouts";
import { PrintButton } from "@/features/methodology/components/PrintButton";

const PILLARS = [
  {
    icon: Code,
    title: "Tecnologicamente robusto",
    items: [
      "Whitelist de domínios governamentais (.gov.br, .leg.br, .jus.br, .mil.br, .mp.br, .def.br) aplicada em nível de HTTP — domínios fora da lista são bloqueados automaticamente.",
      "Score de veracidade por fonte (5 critérios: domínio governamental, autoridade legal, disponibilidade pública, API documentada, rastreabilidade de metadados).",
      "Código-fonte aberto sob licença AGPL-3.0 — qualquer técnico pode auditar a lógica de detecção.",
      "Cadeia de proveniência completa: RiskSignal → SignalEvent → Event → RawSource (JSON bruto), exposta via GET /signal/{id}/provenance.",
    ],
  },
  {
    icon: FileText,
    title: "Metodologicamente defensável",
    items: [
      "22 tipologias com base legal explícita (Lei 14.133/2021, CF/88, Lei 9.613/98, Lei 12.529/2011, Código Penal, Lei de Improbidade).",
      "Scoring determinístico e reproduzível — nenhuma IA participa da geração de scores ou classificação de risco.",
      "Thresholds baseados em distribuições históricas dos próprios dados públicos, não em critérios subjetivos.",
      "IA generativa usada exclusivamente para explicações em linguagem natural (decorator @explanatory_only — TypeError se retornar algo além de texto).",
    ],
  },
  {
    icon: Scale,
    title: "Juridicamente responsável",
    items: [
      "Opera sobre transparência ativa obrigatória — dados que órgãos públicos são legalmente obrigados a publicar (LAI art. 8º).",
      "CPFs são hasheados via SHA-256 + salt imediatamente na ingestão — nunca persistidos em claro (LGPD art. 12).",
      "Cada sinal carrega aviso obrigatório: indicador estatístico, não acusação.",
      "A plataforma não constitui processo judicial ou administrativo — contestação via POST /contestation.",
    ],
  },
  {
    icon: Globe,
    title: "Publicamente auditável",
    items: [
      "GET /public/sources: expõe scores de veracidade, status de compliance e whitelist de domínios em tempo real.",
      "GET /signal/{id}/provenance: cadeia completa do dado bruto ao sinal final.",
      "Compliance automatizado toda segunda-feira 06:00 UTC: validação de domínios, probe de disponibilidade, alerta de exceções.",
      "Código aberto (AGPL-3.0): qualquer pessoa pode verificar, reproduzir ou contestar qualquer cálculo.",
    ],
  },
];

const LEGAL_BASIS: { norm: string; scope: string; application: string; url: string }[] = [
  { norm: "CF/88, art. 5º, XXXIII", scope: "Direito de qualquer cidadão obter informações de órgãos públicos", application: "Base constitucional para acesso aos dados analisados", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
  { norm: "CF/88, art. 37, caput", scope: "Princípio da Publicidade da Administração Pública", application: "Impõe que atos administrativos sejam acessíveis ao público", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
  { norm: "CF/88, art. 74, §1º", scope: "Qualquer cidadão tem legitimidade para denunciar ao TCU", application: "Plataforma fornece insumos para exercício desse direito", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
  { norm: "Lei 12.527/2011 (LAI)", scope: "Obriga divulgação ativa de contratos, despesas e servidores", application: "Todos os dados coletados são de publicação obrigatória", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm" },
  { norm: "Decreto 7.724/2012", scope: "Regulamenta a LAI; define dados de transparência ativa", application: "Define exatamente quais dados os órgãos devem publicar", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/decreto/d7724.htm" },
  { norm: "LGPD art. 7º, VI", scope: "Permite tratamento para exercício regular de direitos", application: "Base legal para análise de dados e suporte a denúncias", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" },
  { norm: "LGPD art. 12", scope: "Dados anonimizados não são dados pessoais", application: "CPFs hasheados (SHA-256 + salt) — não são dados pessoais", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" },
  { norm: "Lei 12.846/2013 (Anticorrupção)", scope: "Responsabilização de empresas por atos contra a administração", application: "Fundamenta a detecção de irregularidades na plataforma", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12846.htm" },
  { norm: "Lei 8.429/1992 (Improbidade)", scope: "Define peculato, enriquecimento ilícito e fraude", application: "Base normativa das tipologias T09, T13, T17 e T18", url: "https://www.planalto.gov.br/ccivil_03/leis/l8429.htm" },
  { norm: "Lei 14.133/2021 (Licitações)", scope: "Nova Lei de Licitações e Contratos Administrativos", application: "Fundamenta T01–T08 (concentração, conluio, fracionamento)", url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm" },
  { norm: "STF — RE 652.777", scope: "Legitimidade da publicação de remuneração de servidores", application: "Consolida a legalidade de exibir dados de servidores públicos", url: "https://portal.stf.jus.br/jurisprudencia/sumariosumula.asp?base=acordaos&docid=RE%20652777" },
];

const WHAT_WE_DONT = [
  { label: "Acusar pessoas ou empresas", detail: "Sinais são hipóteses estatísticas para triagem, não provas." },
  { label: "Armazenar CPFs em texto claro", detail: "Hash SHA-256 + salt imediato na ingestão (LGPD art. 12)." },
  { label: "Acessar dados sigilosos ou restritos", detail: "Apenas transparência ativa obrigatória por lei." },
  { label: "Usar IA para scoring ou acusações", detail: "LLM é exclusivamente explicativo — decorator @explanatory_only." },
  { label: "Concluir culpabilidade", detail: "Sinais de risco para investigação, não julgamento." },
  { label: "Coletar de fontes não autorizadas", detail: "Domain guard bloqueia domínios fora da whitelist no nível HTTP." },
];

const TOC: ArticleTocEntry[] = [
  { num: "01", id: "sec-pilares", label: "Os quatro pilares" },
  { num: "02", id: "sec-legal", label: "Respaldo legal completo" },
  { num: "03", id: "sec-nao-faz", label: "O que a plataforma não faz" },
  { num: "04", id: "sec-auditoria", label: "Auditoria contínua" },
];

export default function CompliancePage() {
  return (
    <div className="ow-mode-editorial ow-content">
      <div className="mx-auto flex max-w-[1180px] items-center justify-end px-5 pt-2 sm:px-8">
        <PrintButton />
      </div>

      <ArticleReadingShell eyebrow="Documento vivo" docVersion="v1.3" docRevisedAt="04 jul 2026" toc={TOC}>
        <p className="text-mono-xs uppercase tracking-[0.14em]" style={{ color: "var(--color-brand-text)" }}>
          Compliance
        </p>
        <h1>Plataforma juridicamente responsável</h1>
        <p className="ow-prose-dek">
          O OpenWatch opera exclusivamente sobre dados de transparência ativa obrigatória, com base legal explícita,
          metodologia auditável e compliance automatizado.
        </p>

        <div className="ow-divider my-9" />

        <h2 id="sec-pilares">1 · Os quatro pilares</h2>
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="mb-6">
            <div className="mb-1.5 flex items-center gap-2">
              <pillar.icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-brand-text)" }} />
              <span className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>{pillar.title}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {pillar.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-low-text)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h2 id="sec-legal">2 · Respaldo legal completo</h2>
        <p>Cada tipo de norma abaixo mapeia diretamente para uma decisão de arquitetura ou de produto:</p>
        <div className="ow-table-wrapper">
          <table className="ow-table">
            <thead>
              <tr>
                <th>Norma / artigo</th>
                <th>Conteúdo</th>
                <th>Aplicação ao projeto</th>
              </tr>
            </thead>
            <tbody>
              {LEGAL_BASIS.map((row) => (
                <tr key={row.norm}>
                  <td>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-mono-xs font-medium hover:underline"
                      style={{ color: "var(--color-brand-text)" }}
                    >
                      {row.norm}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </td>
                  <td className="text-caption" style={{ color: "var(--color-text-3)" }}>{row.scope}</td>
                  <td className="text-caption" style={{ color: "var(--color-text-2)" }}>{row.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="sec-nao-faz">3 · O que a plataforma não faz</h2>
        <div className="flex flex-col gap-3">
          {WHAT_WE_DONT.map((item) => (
            <div key={item.label} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "var(--color-critical-bg)", color: "var(--color-critical-text)" }}
              >
                ✕
              </span>
              <p className="m-0 text-[14px] leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                <strong style={{ color: "var(--color-text)" }}>{item.label}.</strong> {item.detail}
              </p>
            </div>
          ))}
        </div>

        <h2 id="sec-auditoria">4 · Auditoria contínua</h2>
        <p>
          Toda segunda-feira às 06:00 UTC, a tarefa <code className="ow-chip text-mono-xs">check_source_compliance</code>{" "}
          valida domínios contra a whitelist, alerta 30 dias antes de exceções expirarem, faz HTTP HEAD em cada fonte
          e atualiza o <code className="ow-chip text-mono-xs">coverage_registry</code> com status{" "}
          <code>ok</code> / <code>warning</code> / <code>violation</code>.
        </p>
        <NotaCallout>
          A plataforma produz <strong>sinais</strong>, nunca <strong>provas</strong>. Provas são produzidas por
          autoridades competentes (CGU, TCU, MPF).
        </NotaCallout>
        <AvisoJuridicoCallout>
          &ldquo;Este resultado representa um indicador estatístico para triagem e controle social. Não configura
          acusação, prova definitiva ou juízo de culpa.&rdquo; — aviso obrigatório carregado por todo sinal.
        </AvisoJuridicoCallout>

        <div className="ow-divider my-9" />

        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/methodology"
            className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium hover:underline"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
          >
            <FileText className="h-3.5 w-3.5" />
            Metodologia técnica
            <ArrowRight className="h-3 w-3" />
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/public/sources`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium hover:underline"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
          >
            <Globe className="h-3.5 w-3.5" />
            GET /public/sources
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://github.com/claudioemmanuel/openwatch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium hover:underline"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
          >
            <Code className="h-3.5 w-3.5" />
            Código-fonte (AGPL-3.0)
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
          Esta página documenta o posicionamento institucional e a base legal da plataforma para fins de
          transparência e controle social. Não constitui aconselhamento jurídico. Documento técnico-jurídico
          completo:{" "}
          <a
            href="https://github.com/claudioemmanuel/openwatch/blob/main/docs/COMPLIANCE.md"
            className="hover:underline"
            style={{ color: "var(--color-brand-text)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/COMPLIANCE.md
          </a>
          .
        </p>
      </ArticleReadingShell>
    </div>
  );
}

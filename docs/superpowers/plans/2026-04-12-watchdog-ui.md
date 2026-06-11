# OpenWatch Watchdog UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic SaaS home page and establish forensic-investigative personality across OpenWatch's design system and components.

**Architecture:** Patch `globals.css` to strip decorative gradients and add `.data`/`.label` utilities; create `components/watchdog/` barrel with `CaseCard`, `SignalTag`, `Section`; rewrite `app/page.tsx` with watchdog-tone copy, data-first layout, and one dominant CTA.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4 (tokens via `@theme` in globals.css, no tailwind.config.ts)

---

## Design Principles Enforced

| Rule | Implementation |
|------|---------------|
| No gradient as identity | Remove `radial-gradient` + `linear-gradient` from `body` |
| No glassmorphism/glow | No new glow divs or shadow-glow in components |
| No symmetric equal sections | Home: header → single CTA → cases (2-col) → how-it-works → disclaimer |
| One dominant action | Only one `bg-[var(--color-brand)]` button per screen |
| Color = semantic only | `--color-critical` for risk level, `--color-brand` for interaction |
| Monospace for data | `.data` class + `font-mono` on CNPJ/amounts |
| Watchdog copy | Direct Portuguese, no SaaS metaphors |

---

## File Map

**Create:**
- `apps/web/src/components/watchdog/SignalTag.tsx`
- `apps/web/src/components/watchdog/Section.tsx`
- `apps/web/src/components/watchdog/CaseCard.tsx`
- `apps/web/src/components/watchdog/index.ts`

**Modify:**
- `apps/web/src/app/globals.css` — body gradient → solid color; add `.data` utility
- `apps/web/src/app/page.tsx` — full rewrite

**No test runner configured** — `pnpm typecheck` is the verification gate after every task.

---

## Task 1: Patch globals.css — remove decorative gradient, add `.data` utility

**Files:**
- Modify: `apps/web/src/app/globals.css:176-185` (body block)
- Modify: `apps/web/src/app/globals.css:232-236` (after `.text-mono-xs`)

- [ ] **Step 1: Remove the decorative body gradient**

In `apps/web/src/app/globals.css`, find the `body` block (lines ~176–185) and replace:

```css
body {
  background:
    radial-gradient(circle at top center, rgba(20, 184, 166, 0.12), transparent 0 34%),
    linear-gradient(180deg, #0b1220 0%, #0d1628 52%, #0a1323 100%);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  overflow-x: hidden;
}
```

with:

```css
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  overflow-x: hidden;
}
```

- [ ] **Step 2: Add `.data` and `.label` utilities**

In `apps/web/src/app/globals.css`, inside `@layer utilities`, after the `.text-mono-xs` line (line ~235), add:

```css
  /* Watchdog utilities — data blocks and field labels */
  .data  { font-family: var(--font-mono); font-size: 0.875rem; line-height: 1.5; }
  .label { font-size: 0.6875rem; line-height: 1.4; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-3); }
```

Note: `.text-label` already exists with the same visual intent but lacks the `color` assignment. `.label` is the new canonical class for field labels inside watchdog components.

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "style: remove decorative body gradient; add .data and .label utilities"
```

---

## Task 2: SignalTag component

Factual tag for investigative signals. No color variation — muted border, monospace text. Color is deliberately neutral: the content is the signal.

**Files:**
- Create: `apps/web/src/components/watchdog/SignalTag.tsx`

- [ ] **Step 1: Create the file**

```tsx
// apps/web/src/components/watchdog/SignalTag.tsx

export interface SignalTagProps {
  label: string;
}

export function SignalTag({ label }: SignalTagProps) {
  return (
    <span className="text-xs font-mono border border-[var(--color-border)] px-2 py-0.5 rounded-md text-[var(--color-text-2)]">
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/watchdog/SignalTag.tsx
git commit -m "feat: add SignalTag — factual, no color variation"
```

---

## Task 3: Section wrapper component

Reusable section heading + optional inline action link. Keeps visual consistency without enforcing identical card grids.

**Files:**
- Create: `apps/web/src/components/watchdog/Section.tsx`

- [ ] **Step 1: Create the file**

```tsx
// apps/web/src/components/watchdog/Section.tsx

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({ title, children, action }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-medium text-[var(--color-text)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/watchdog/Section.tsx
git commit -m "feat: add Section wrapper — heading + optional action slot"
```

---

## Task 4: CaseCard component

The core investigative unit. Every field answers a question: What? Who? Why does it matter? Structure is fixed — no variants, no generic "card with title + description".

**Files:**
- Create: `apps/web/src/components/watchdog/CaseCard.tsx`

- [ ] **Step 1: Create the file**

```tsx
// apps/web/src/components/watchdog/CaseCard.tsx

import Link from "next/link";
import { SignalTag } from "./SignalTag";

export type RiskLevel = "CRÍTICO" | "ALTO" | "MÉDIO" | "BAIXO";

const RISK_COLORS: Record<RiskLevel, string> = {
  "CRÍTICO": "var(--color-critical)",
  "ALTO":    "var(--color-high)",
  "MÉDIO":   "var(--color-medium)",
  "BAIXO":   "var(--color-low)",
};

export interface CaseCardProps {
  id: string;
  riskLevel: RiskLevel;
  title: string;
  company: string;
  agency: string;
  signals: string[];
  explanation: string;
  flaggedAt: string;
}

export function CaseCard({
  id,
  riskLevel,
  title,
  company,
  agency,
  signals,
  explanation,
  flaggedAt,
}: CaseCardProps) {
  const riskColor = RISK_COLORS[riskLevel];

  return (
    <article className="border border-[var(--color-border)] rounded-lg p-5 space-y-4 bg-[var(--color-surface)]">
      {/* Risk level + timestamp */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: riskColor }}
        >
          {riskLevel}
        </span>
        <span className="text-xs text-[var(--color-text-3)]">{flaggedAt}</span>
      </div>

      {/* Finding title */}
      <h3 className="text-base font-medium leading-snug text-[var(--color-text)]">
        {title}
      </h3>

      {/* Meta — monospace company ID, plain agency name */}
      <div className="space-y-2 text-sm">
        <div>
          <span className="label">Empresa</span>
          <br />
          <span className="data text-[var(--color-text-2)]">{company}</span>
        </div>
        <div>
          <span className="label">Órgão</span>
          <br />
          <span className="text-[var(--color-text-2)]">{agency}</span>
        </div>
      </div>

      {/* Signal tags */}
      <div className="flex flex-wrap gap-2">
        {signals.map((signal) => (
          <SignalTag key={signal} label={signal} />
        ))}
      </div>

      {/* Explanation — why this matters */}
      <p className="text-sm text-[var(--color-text-3)]">{explanation}</p>

      {/* Action */}
      <Link
        href={`/case/${id}`}
        className="text-sm font-medium text-[var(--color-brand-light)] hover:underline"
      >
        Ver detalhes →
      </Link>
    </article>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/watchdog/CaseCard.tsx
git commit -m "feat: add CaseCard — forensic investigative structure, risk-semantic colors"
```

---

## Task 5: Barrel export

**Files:**
- Create: `apps/web/src/components/watchdog/index.ts`

- [ ] **Step 1: Create the barrel**

```ts
// apps/web/src/components/watchdog/index.ts
export { CaseCard } from "./CaseCard";
export type { CaseCardProps, RiskLevel } from "./CaseCard";
export { SignalTag } from "./SignalTag";
export type { SignalTagProps } from "./SignalTag";
export { Section } from "./Section";
export type { SectionProps } from "./Section";
```

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/watchdog/index.ts
git commit -m "feat: barrel export for watchdog components"
```

---

## Task 6: Rewrite home page

Full replacement of `apps/web/src/app/page.tsx`. Removes: decorative grid div, amber glow div, symmetric 3-card nav section, "Pillars" section, amber CTA strip. Adds: data-first header with today's stats, single primary CTA, live cases grid (asymmetric-friendly), numbered how-it-works, disclaimer.

**Files:**
- Modify: `apps/web/src/app/page.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire file**

```tsx
// apps/web/src/app/page.tsx
import Link from "next/link";
import { CaseCard, Section } from "@/components/watchdog";
import type { CaseCardProps } from "@/components/watchdog";
import { TYPOLOGY_LABELS, DATA_SOURCES } from "@/lib/constants";

// Static placeholder cases — replace with API fetch when data layer is ready.
// These represent the "what we found today" feed on the home page.
const SAMPLE_CASES: CaseCardProps[] = [
  {
    id: "caso-001",
    riskLevel: "ALTO",
    title: "Contrato de R$ 12,4M com licitante único",
    company: "FORNECEDORA ÚNICA LTDA",
    agency: "Ministério da Gestão e da Inovação",
    signals: ["Licitante único", "Vencedor recorrente"],
    explanation:
      "Apenas uma empresa participou da licitação, reduzindo a competição e elevando o risco de sobrepreço.",
    flaggedAt: "há 2 horas",
  },
  {
    id: "caso-002",
    riskLevel: "CRÍTICO",
    title: "Fornecedor venceu 9 contratos do mesmo órgão em 90 dias",
    company: "PRESTADORA GERAL S/A",
    agency: "Secretaria de Infraestrutura do Estado",
    signals: ["Concentração de fornecedor", "Dispensa suspeita"],
    explanation:
      "O mesmo fornecedor ganhou contratos consecutivos do mesmo órgão sem alternância de concorrentes.",
    flaggedAt: "há 5 horas",
  },
];

export default function HomePage() {
  const typologyCount = Object.keys(TYPOLOGY_LABELS).length;
  const sourceCount = DATA_SOURCES.length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          OpenWatch
        </h1>
        <p className="text-sm text-[var(--color-text-3)]">
          Dinheiro público, sob escrutínio.
        </p>

        <div className="flex gap-6 text-sm text-[var(--color-text-2)]">
          <span>
            <strong
              className="tabular-nums"
              style={{ color: "var(--color-critical)" }}
            >
              7
            </strong>{" "}
            casos sinalizados hoje
          </span>
          <span>
            <strong className="tabular-nums">128</strong> analisados nas
            últimas 24h
          </span>
        </div>
      </header>

      {/* ── Primary action — one per screen ──────────────────────────── */}
      <div>
        <Link
          href="/radar"
          className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-[var(--color-bg)] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[var(--color-brand-light)] transition-colors"
        >
          Ver casos sinalizados
        </Link>
      </div>

      {/* ── Live cases ───────────────────────────────────────────────── */}
      <Section
        title="O que encontramos hoje"
        action={
          <Link
            href="/radar"
            className="text-xs text-[var(--color-text-3)] hover:text-[var(--color-brand-light)] transition-colors"
          >
            Ver todos →
          </Link>
        }
      >
        {/* Intentionally 2 cards, not 3 — avoids perfect symmetry */}
        <div className="grid md:grid-cols-2 gap-5">
          {SAMPLE_CASES.map((c) => (
            <CaseCard key={c.id} {...c} />
          ))}
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

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <section className="text-xs text-[var(--color-text-3)] border-t border-[var(--color-border)] pt-6 max-w-xl">
        OpenWatch não acusa irregularidades. Destacamos padrões para que
        possam ser investigados. Os dados são extraídos de fontes oficiais do
        governo federal brasileiro.
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Run lint**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch/apps/web && pnpm lint
```

Expected: 0 errors or warnings

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat: rewrite home page — watchdog tone, data-first, single CTA, no decorative symmetry"
```

---

## Task 7: Verify full build

- [ ] **Step 1: Full typecheck across workspace**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch && pnpm typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 2: Production build**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch && pnpm build
```

Expected: Build completes without errors. Page `/` compiles successfully.

- [ ] **Step 3: Commit if any incidental fixes were needed**

If build required fixes:
```bash
git add -p
git commit -m "fix: resolve build issues from watchdog UI refactor"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Covered by |
|-----------------|-----------|
| No gradient as identity | Task 1 — body solid color |
| No glowing borders / glassmorphism | Not present in any new component |
| No symmetric identical cards | Task 6 — 2 cards, not 3; sections vary in layout |
| One dominant action per screen | Task 6 — single teal button |
| `.data` utility class | Task 1 |
| `.label` utility class | Task 1 |
| Monospace for data values | CaseCard uses `.data` on company field |
| Color = semantic (risk levels) | CaseCard uses `--color-critical/high/medium/low` |
| CaseCard component with explanation block | Task 4 |
| SignalTag — neutral, factual | Task 2 |
| Section wrapper | Task 3 |
| Watchdog copy (Portuguese) | Task 6 home page |
| Disclaimer block | Task 6 footer section |
| "How it works" — 3 numbered steps | Task 6 |
| No "Explore / Learn / Try / Contact" CTAs | Home page removed all such CTAs |

### Out of scope (not in this plan)

- **Case detail page** (`/case/[id]/`) — existing page is functional and complex; copy rewrite is a follow-up.
- **JetBrains Mono** as primary font — Geist Mono is already in `--font-mono` fallback stack; swapping primary font in `layout.tsx` is a 1-line change but orthogonal to this plan.

### Placeholder scan

No TBDs, "TODO", or "implement later" strings in any code block.

### Type consistency

- `RiskLevel` defined in `CaseCard.tsx`, re-exported from `index.ts`, used as literal type in `SAMPLE_CASES` array in `page.tsx`.
- `SignalTag` imported inside `CaseCard.tsx` — not via barrel to avoid circular import.
- `Section` and `CaseCard` imported in `page.tsx` via `@/components/watchdog` barrel.
- `CaseCardProps` imported explicitly in `page.tsx` for the `SAMPLE_CASES` type annotation.

# Watchdog UI — Full Audit Correction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir todas as violações confirmadas das 7 regras watchdog após auditoria completa de todas as páginas e componentes do projeto.

**Architecture:** Auditoria completa identificou 6 violações reais em 4 arquivos. Tudo o mais já está em conformidade (incluindo `ow-card-glass` corrigido via CSS, `EntityDetailPage` que usa `.ow-id` que já é font-mono, e CoverageSummaryStrip que mostra dados funcionais distintos).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4

---

## Violations Map

| # | Regra | Arquivo | Linha | Violação |
|---|-------|---------|-------|----------|
| 1 | R7 | `apps/web/src/app/compliance/page.tsx` | 151 | Título "Plataforma Juridicamente Responsável" — "Plataforma" proibido |
| 2 | R7 | `apps/web/src/app/compliance/page.tsx` | 19 | Pillar "Tecnologicamente Robusto" — "Robusto" = SaaS |
| 3 | R7 | `apps/web/src/app/compliance/page.tsx` | 50 | "a plataforma não constitui..." — "plataforma" no body copy |
| 4 | R3 | `apps/web/src/app/compliance/page.tsx` | 177 | 4 cards idênticos 2×2, todos com exatamente 4 bullets |
| 5 | R2 | `apps/web/src/components/Topbar.tsx` | 68 | `backdrop-blur-sm` no overlay do menu mobile |
| 6 | R6 | `apps/web/src/components/radar/RadarDetailPanel.tsx` | 280,371,411 | `formatBRL()`, `formatDate()`, ratio sem font-mono |
| 7 | R6 | `apps/web/src/components/radar/RadarPreviewDrawer.tsx` | 258,364,408 | Mesma situação que RadarDetailPanel |

## File Map

| Arquivo | Mudança |
|---------|---------|
| `apps/web/src/app/compliance/page.tsx` | R7: título + pillar copy; R3: quebrar simetria do grid |
| `apps/web/src/components/Topbar.tsx` | R2: remover backdrop-blur-sm do overlay mobile |
| `apps/web/src/components/radar/RadarDetailPanel.tsx` | R6: adicionar font-mono em formatBRL/formatDate/ratio |
| `apps/web/src/components/radar/RadarPreviewDrawer.tsx` | R6: mesma correção |

---

### Task 1: Fix compliance/page.tsx — R7 (copy) + R3 (simetria)

**Files:**
- Modify: `apps/web/src/app/compliance/page.tsx`

**Context:** Três problemas neste arquivo:
1. Título da página usa "Plataforma" — termo SaaS
2. Primeiro pillar usa "Robusto" — adjetivo SaaS
3. Body copy de um dos items usa "plataforma"
4. Grid 2×2 com 4 cards idênticos (R3)

**Watchdog rules:** Sem termos SaaS. Sem simetria perfeita — um item deve ser dominante ou a estrutura deve variar.

- [ ] **Step 1: Ler o arquivo atual**

Ler `apps/web/src/app/compliance/page.tsx` linhas 1–210 para confirmar o conteúdo exato.

- [ ] **Step 2: Corrigir o título da página (R7)**

No `PageHeader`, linha 151, mudar:

```tsx
title="Plataforma Juridicamente Responsável"
```

Para:

```tsx
title="Como o OpenWatch opera"
```

- [ ] **Step 3: Corrigir o título do primeiro pillar (R7)**

Na constante `PILLARS`, linha 19, mudar:

```ts
title: "Tecnologicamente Robusto",
```

Para:

```ts
title: "Fundação Técnica",
```

- [ ] **Step 4: Corrigir "plataforma" no body copy (R7)**

No item do pillar "Juridicamente Responsável", linha 50, mudar:

```ts
"Aviso de que a plataforma não constitui processo judicial ou administrativo — contestação via POST /contestation",
```

Para:

```ts
"Aviso de que o OpenWatch não constitui processo judicial ou administrativo — contestação via POST /contestation",
```

- [ ] **Step 5: Quebrar simetria do grid (R3)**

Na linha 177, mudar o grid para que o primeiro pillar seja destaque (col-span-full) e os outros 3 fiquem em linha:

Substituir:

```tsx
        <section>
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Os Quatro Pilares
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="relative border border-border bg-surface-card p-5"
              >
```

Com:

```tsx
        <section>
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Os Quatro Pilares
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className={`relative border border-border bg-surface-card p-5${i === 0 ? " sm:col-span-2 lg:col-span-1" : ""}`}
              >
```

Isso faz o primeiro pillar (Fundação Técnica) ocupar a linha inteira em telas médias, quebrando a simetria perfeita 2×2. Em desktop (lg) volta ao grid 3+1 natural.

- [ ] **Step 6: Corrigir description (R7 — manter watchdog tone)**

No `PageHeader`, linha 152, a description atual é:

```
"O OpenWatch opera exclusivamente sobre dados de transparência ativa obrigatória, com base legal explícita, metodologia auditável e compliance automatizado."
```

Está OK — não tem termos SaaS. **Não alterar.**

- [ ] **Step 7: Typecheck**

```bash
pnpm typecheck
```

Esperado: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/app/compliance/page.tsx
git commit -m "style(compliance): fix watchdog rule violations R7+R3

R7: rename page title from 'Plataforma Juridicamente Responsável' to
'Como o OpenWatch opera'. Rename pillar 'Tecnologicamente Robusto' to
'Fundação Técnica'. Remove 'plataforma' from body copy.
R3: switch from uniform 2x2 grid to 3-col with first pillar spanning
full row on md — breaks perfect card symmetry."
```

---

### Task 2: Fix Topbar.tsx — R2 (glassmorphism no overlay mobile)

**Files:**
- Modify: `apps/web/src/components/Topbar.tsx`

**Context:** O overlay de fundo do menu mobile (linha 68) usa `backdrop-blur-sm`. Isso é glassmorphism — embaça o conteúdo de fundo quando o menu abre. Substituir por opacidade simples.

Código atual:
```tsx
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
```

- [ ] **Step 1: Ler o arquivo**

Ler `apps/web/src/components/Topbar.tsx` linhas 64–75 para confirmar.

- [ ] **Step 2: Remover backdrop-blur-sm**

Substituir:

```tsx
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
```

Por:

```tsx
            className="fixed inset-0 z-40 bg-black/70 sm:hidden"
```

Ajuste: `bg-black/60 → bg-black/70` para compensar a ausência do blur (a opacidade maior mantém o fundo adequadamente escurecido sem efeito decorativo).

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Esperado: 0 erros.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Topbar.tsx
git commit -m "style(topbar): remove backdrop-blur-sm from mobile overlay

Replace glassmorphism overlay with flat bg-black/70. Slightly higher
opacity compensates for removed blur without decorative effect."
```

---

### Task 3: Fix RadarDetailPanel.tsx — R6 (monospace em dados numéricos)

**Files:**
- Modify: `apps/web/src/components/radar/RadarDetailPanel.tsx`

**Context:** `formatBRL()` (valor monetário em BRL) e `formatDate()` (datas) e ratio `toLocaleString()` são exibidos sem wrapper `font-mono`. Dados devem usar monospace — é o que diferencia um painel investigativo de um painel SaaS.

Violações confirmadas:
- Linha 243-246: ratio `toLocaleString()` em `<span className="font-semibold text-primary">`
- Linha 280-283: `formatDate()` em `<p className="text-sm text-primary">`
- Linha 366: `formatDate()` em `<span>` sem mono
- Linha 371: `formatBRL()` em `<span className="font-semibold text-primary">`
- Linha 411: `formatBRL()` em `<span className="font-semibold text-primary text-[10px]">`

- [ ] **Step 1: Ler o arquivo — trecho dos dados**

Ler `apps/web/src/components/radar/RadarDetailPanel.tsx` linhas 240–415.

- [ ] **Step 2: Adicionar font-mono no ratio (linha ~243)**

Encontrar:
```tsx
                        <span className="font-semibold text-primary">
                          {signal.signal.investigation_summary.ratio_over_threshold != null
                            ? `${Number(signal.signal.investigation_summary.ratio_over_threshold).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}×`
                            : "—"}
                        </span>
```

Substituir por:
```tsx
                        <span className="font-mono font-semibold text-primary tabular-nums">
                          {signal.signal.investigation_summary.ratio_over_threshold != null
                            ? `${Number(signal.signal.investigation_summary.ratio_over_threshold).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}×`
                            : "—"}
                        </span>
```

- [ ] **Step 3: Adicionar font-mono nas datas do pattern_story (linha ~280)**

Encontrar:
```tsx
                  <p className="text-sm text-primary">
                    {signal.graph.pattern_story.started_at
                      ? formatDate(signal.graph.pattern_story.started_at)
                      : "—"}
                    {signal.graph.pattern_story.ended_at &&
                      signal.graph.pattern_story.ended_at !== signal.graph.pattern_story.started_at && (
                        <> → {formatDate(signal.graph.pattern_story.ended_at)}</>
                      )}
                  </p>
```

Substituir por:
```tsx
                  <p className="font-mono text-sm text-primary tabular-nums">
                    {signal.graph.pattern_story.started_at
                      ? formatDate(signal.graph.pattern_story.started_at)
                      : "—"}
                    {signal.graph.pattern_story.ended_at &&
                      signal.graph.pattern_story.ended_at !== signal.graph.pattern_story.started_at && (
                        <> → {formatDate(signal.graph.pattern_story.ended_at)}</>
                      )}
                  </p>
```

- [ ] **Step 4: Adicionar font-mono nas datas e valores dos eventos (linha ~364–412)**

Encontrar o bloco de data/valor dos eventos (linha ~364):
```tsx
                            <span>
                              <span className="text-muted">Data </span>
                              {item.occurred_at ? formatDate(item.occurred_at) : "—"}
                            </span>
                            {typeof item.value_brl === "number" && (
                              <span>
                                <span className="text-muted">Valor </span>
                                <span className="font-semibold text-primary">{formatBRL(item.value_brl)}</span>
                              </span>
                            )}
```

Substituir por:
```tsx
                            <span className="font-mono tabular-nums">
                              <span className="text-muted not-italic">Data </span>
                              {item.occurred_at ? formatDate(item.occurred_at) : "—"}
                            </span>
                            {typeof item.value_brl === "number" && (
                              <span className="font-mono tabular-nums">
                                <span className="text-muted not-italic">Valor </span>
                                <span className="font-semibold text-primary">{formatBRL(item.value_brl)}</span>
                              </span>
                            )}
```

Encontrar o valor BRL dos eventos do grafo (linha ~409):
```tsx
                              <span className="font-semibold text-primary text-[10px]">
                                {formatBRL(ev.value_brl)}
                              </span>
```

Substituir por:
```tsx
                              <span className="font-mono font-semibold text-primary text-[10px] tabular-nums">
                                {formatBRL(ev.value_brl)}
                              </span>
```

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Esperado: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/radar/RadarDetailPanel.tsx
git commit -m "style(radar): add font-mono to monetary and date data in RadarDetailPanel

Wrap formatBRL(), formatDate(), and ratio toLocaleString() outputs in
font-mono + tabular-nums per watchdog R6 rule: all numeric/monetary/
date data must render in monospace for forensic readability."
```

---

### Task 4: Fix RadarPreviewDrawer.tsx — R6 (monospace em dados numéricos)

**Files:**
- Modify: `apps/web/src/components/radar/RadarPreviewDrawer.tsx`

**Context:** Mesmo padrão de violação que RadarDetailPanel. `formatBRL()`, `formatDate()` e ratio sem font-mono.

Violações confirmadas (via grep):
- Linha ~215-219: ratio `toLocaleString()` em `<span className="text-xs text-primary font-medium">`
- Linha ~258-262: `formatDate()` em `<span className="text-primary">`
- Linha ~267-270: `formatDate()` em `<span className="text-primary">`
- Linha ~359: `formatDate()` em linha sem wrapper mono
- Linha ~364: `formatBRL()` em `<span className="text-primary font-medium">`
- Linha ~408-410: `formatBRL()` em `<span className="text-primary font-semibold">`

- [ ] **Step 1: Ler o arquivo — trechos dos dados**

Ler `apps/web/src/components/radar/RadarPreviewDrawer.tsx` linhas 210–415.

- [ ] **Step 2: Adicionar font-mono no ratio (linha ~215)**

Encontrar:
```tsx
                      <span className="text-xs text-primary font-medium">
                        {signal.signal.investigation_summary.ratio_over_threshold != null
                          ? `${Number(signal.signal.investigation_summary.ratio_over_threshold).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}×`
                          : "—"}
                      </span>
```

Substituir por:
```tsx
                      <span className="font-mono text-xs text-primary font-medium tabular-nums">
                        {signal.signal.investigation_summary.ratio_over_threshold != null
                          ? `${Number(signal.signal.investigation_summary.ratio_over_threshold).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}×`
                          : "—"}
                      </span>
```

- [ ] **Step 3: Adicionar font-mono nas datas do pattern_story (linhas ~258–270)**

Encontrar:
```tsx
                  <span className="text-primary">
                    {signal.graph.pattern_story.started_at
                      ? formatDate(signal.graph.pattern_story.started_at)
                      : "—"}
                  </span>
```

E logo depois:
```tsx
                        <span className="text-primary">
                          {formatDate(signal.graph.pattern_story.ended_at)}
                        </span>
```

Substituir ambas as ocorrências adicionando `font-mono tabular-nums`:
```tsx
                  <span className="font-mono text-primary tabular-nums">
                    {signal.graph.pattern_story.started_at
                      ? formatDate(signal.graph.pattern_story.started_at)
                      : "—"}
                  </span>
```

```tsx
                        <span className="font-mono text-primary tabular-nums">
                          {formatDate(signal.graph.pattern_story.ended_at)}
                        </span>
```

- [ ] **Step 4: Adicionar font-mono nos eventos (linhas ~357–411)**

Ler as linhas exatas em runtime e aplicar o mesmo padrão da Task 3 Step 4: adicionar `font-mono tabular-nums` nos wrappers de `formatDate()` e `formatBRL()`.

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Esperado: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/radar/RadarPreviewDrawer.tsx
git commit -m "style(radar): add font-mono to monetary and date data in RadarPreviewDrawer

Mirror of RadarDetailPanel fix. Wrap formatBRL(), formatDate(), and
ratio outputs in font-mono + tabular-nums per watchdog R6."
```

---

### Task 5: Build verification

- [ ] **Step 1: Typecheck**

```bash
pnpm typecheck
```

Esperado: 0 erros.

- [ ] **Step 2: Build**

```bash
pnpm build
```

Esperado: exits 0.

- [ ] **Step 3: Commit se necessário**

Se houver fixups do build:
```bash
git add -p
git commit -m "fix: watchdog full-audit build fixups"
```

---

## Self-Review

**Cobertura completa das 7 regras:**
- ✅ R1 — Sem gradientes decorativos → já corrigido em sessão anterior (globals.css)
- ✅ R2 — Sem glassmorphism → Topbar mobile overlay corrigido (Task 2). `ow-card-glass` já corrigido via CSS
- ✅ R3 — Sem simetria perfeita → compliance 2×2 grid quebrado (Task 1)
- ✅ R4 — Uma ação dominante → confirmado em todos os arquivos (nenhuma violação encontrada)
- ✅ R5 — Cor semântica → confirmado em todos os arquivos (badges de tipo de entidade são semânticos)
- ✅ R6 — Monospace em dados → RadarDetailPanel + RadarPreviewDrawer corrigidos (Tasks 3-4). `EntityDetailPage` já usa `.ow-id` (font-mono)
- ✅ R7 — Copy direto → compliance page title + pillar corrigidos (Task 1)

**Não alterado (falsos positivos confirmados):**
- `api-health/page.tsx` — título "Status da API" está OK
- `CoverageSummaryStrip` — 5 cards mostram 5 métricas distintas (dados funcionais)
- `EntityDetailPage` — identificadores já usam `.ow-id` que é `font-mono` no CSS
- `InvestigationSidebar` emerald colors — badges semânticos de tipo de entidade
- `RadarDetailPanel` getRoleBadgeStyle rgba() — cores de papel semânticas (buyer/supplier/winner)

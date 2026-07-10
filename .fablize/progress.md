# OpenWatch — Nexo rebrand round 2 (14 change requests)

## Brief
User (AFK, full autonomy) sent 14 concrete UI/UX + backend fixes on the
already-rebranded frontend. Orchestrator = Opus. Dev stack running
(web :3000, gateway :8000, core :8001, workers). Verify each in real browser
(isolated context "fablize-verify" — a 2nd MCP client shares the browser).

## Scope (14 items → clusters)

### Cluster 1 — Shell & deletions (no backend)
- **#12 Topbar**: remove global search bar + ⌘K hint + mobile search; remove
  light theme ENTIRELY (ThemeToggle/ThemeProvider/data-theme/light CSS vars →
  dark only); nav items inline on the SAME row as the logo (merge TabNav into
  Topbar; drop the second nav row).
- **#1/#3/#11 Remove ALL graph**: delete components/graph/**, EntityEgoGraph,
  Case{Network,Ego,Chronologic}Graph, graphStyle, SigmaGraph, dashedEdgeProgram,
  useEgoExpansion, mapCaseGraph, useCaseGraph{,Enriched}, SignalGraphPage,
  EntityNetworkPage, NetworkSection, PathFinder, SignalFlowInline, "Grafo do
  caso" section in dossiê, "Rede societária" TOC entry, ?tab=rede dossiê tab,
  /radar/rede/** routes, /signal/[id]/graph route, entity/org ego-graph
  sections, Rede nav item. Drop sigma/graphology/@react-sigma deps. Pages that
  merely EMBED a graph (EntityDetailPage, dossiê) keep the page, lose the graph
  block. Backend graph endpoints left in place (dead, harmless) — flagged.
- **#4 Contestation**: remove ContestationForm + "Contestar este sinal" +
  "Contestar" header buttons everywhere ("apontamos, não acusamos" → nada a
  contestar).

### Cluster 2 — Cases list / Radar (#6 fe, #7, #13, #14)
- **#13**: remove the Casos/Sinais/Registro-bruto view toggle (this screen = só
  casos).
- **#14**: move Severidade/Tipologia/Confiança filters ABOVE the list (was a
  left sidebar) → horizontal filter bar over the table.
- **#6 (fe)**: add a **Confiança** column to the cases table (was only
  Severidade); band from avg signal_confidence_score.
- **#7**: applying a filter has no loading feedback → add skeleton/spinner +
  disabled/dimmed state while refetching.

### Cluster 3 — Backend value/confidence (#6 be)
- **Root cause found**: cases-list contract (`RadarV2CaseListItemOut`) has NO
  value/confidence fields → table shows R$ 0,00 + "—". Case `attrs.total_value_brl`
  is 0.0 even when the dossiê sums real event values (R$ 48.766,32). Fix:
  in `get_radar_v2_cases` query, compute `total_value_brl` by summing event
  values referenced by the case's signals (dossiê-consistent) + `avg_confidence`
  from `signal_confidence_score`. Add both to core schema + gateway response
  model + frontend types. Rebuild core-api + gateway.

### Cluster 4 — Dossiê accordion + signal merge (#2, #5)
- **#2**: dossiê content items → accordions; ALL collapsed except the FIRST
  (open with its explanation). Applies to chapters/signals (+ event timeline).
- **#5**: merge the standalone /sinal/[signalId] content (o achado + 3-field
  inference panel + evidence + score) INLINE into the dossiê accordions.
  **ASSUMPTION (evidence-based, recorded)**: #2 + #5 = one design — the dossiê
  becomes the single destination; each signal is an accordion whose expanded
  body carries the full laudo (achado, inference fields, evidence, score); no
  separate sinal page navigation (old /sinal + /signal routes redirect to the
  dossiê anchor). First accordion open, rest collapsed.

### Cluster 5 — Page redesigns (#8, #9, #10) — "está amadora"
- **#8** /methodology, **#9** /api-health, **#10** /coverage — quality passes
  to the Nexo bar. Independent file surfaces (candidates for delegation).

## Order & durability
Commit per cluster. Verify each in browser before commit. Backend rebuilds are
slow (~30–60s) — kick early. 30-min ceiling → hand off with restart prompt.

## Status
- [x] C1 shell & deletions — committed (frontend r2 commit). Topbar one-row nav,
      no search/theme/Rede, dark-only; all graph deleted (21 files, deps gone).
- [x] C2 cases list — committed. Filters above list, confidence column, no view
      toggle, refetch progress hairline. Verified in browser.
- [x] C3 backend value/confidence — committed (core + gateway, rebuilt). Verified:
      conf=81, value=48766.32 (matches dossiê) instead of —/R$0.
- [x] C4 dossiê accordion+merge + contestation removal — committed. Verified:
      2-signal case shows aria-expanded [true,false] (first open, rest collapsed);
      no "Contestar"; /sinal/[id] redirects to /radar/dossie/[id]#sig-[id].
- [~] C5 redesigns — 3 Sonnet agents running (methodology #8, api-health #9,
      coverage #10), typecheck-only gate, disjoint surfaces. Orchestrator runs
      the single build + browser verification after they land.
      Methodology brief also folds in the contestation copy fix (#4): rename
      "Contestação e correção" → "Correção e proveniência".

## Dev server note
`pnpm dev` under run_in_background gets killed at the runner timeout (exit 124).
Run it detached instead: `nohup pnpm dev > /tmp/ow-nextdev.log 2>&1 & disown`.
Backends: core-api + gateway already rebuilt with C3. Second chrome-devtools MCP
client shares the browser; screenshots are flaky — DOM assertions used as proof.

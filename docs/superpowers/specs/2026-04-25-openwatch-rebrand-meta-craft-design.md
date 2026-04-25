# OpenWatch Rebrand — Meta-Craft Identity & Token System

**Status:** Design (awaiting user review before implementation plan)
**Date:** 2026-04-25
**Owner:** echoclaudio
**Approach:** (C) Investigative Modern — Meta Store craft principles applied to a distinct OpenWatch identity

---

## 1. Problem & Goal

OpenWatch (`apps/web`, Next.js 15 + Tailwind v4) currently ships the **Signal Lens v3** design system: dark-first, teal-accented (`#14b8a6`), forensic/investigative tone. Recent commits (`b057e7a`, `47c6af9`, `1e96de8`) deliberately reinforced "watchdog tone, data-first, no decorative symmetry."

The user has decided on a hard pivot to a Meta-Store-inspired visual face:

- Keep the name **OpenWatch**.
- Replace identity end-to-end: new logo, new wordmark, new voice, new palette.
- Refresh visual face — palette, typography, components — using Meta Store craft principles (light-first, pill CTAs, generous whitespace, single-accent rule, system discipline).
- Apply across the entire app, but **preserve information density** on data-dense screens (radar/dossie/signal/investigation/coverage/entity/org).

This spec defines the new identity, the token system that backs it, the component language, the data-density preservation rules, and the refactor strategy.

---

## 2. Brand Identity

**Name:** OpenWatch (kept).

**Positioning:** *Public-interest infrastructure for watching power.* Where Meta Store sells consumer hardware, OpenWatch surfaces evidence — bid manipulation, sanctioned suppliers, hidden ownership, anomalous payments. The brand reads as: **neutral, accurate, citable.** Not partisan, not editorial, not a startup pitch.

**Voice:**
- Factual — verbs over adjectives. "Awarded R$ 2.4M to a sanctioned supplier" not "Suspicious award discovered."
- Citable — every claim has a source link, every number has a date.
- Restrained — no exclamations, no marketing language, no "AI-powered."
- Plain Portuguese & English — short sentences, active voice, terms a journalist or auditor already knows.

**Logo:** **L1 Aperture** — concentric thin rings forming a camera-aperture / iris symbol. Reads as "lens on power." Geometric, Meta-craft-precise, court-navy on white. Avoids the surveillance imagery of an open-eye glyph.

**Wordmark:** "OpenWatch" set in **Geist Display Medium (500)**, tracking `-0.02em`, color Court Navy `#1B2B5C`.

**Short mark:** `[ow]` (bracketed lowercase) — for favicons, sidebar collapse, small-format use.

**Signature color:** Court Navy `#1B2B5C` — single decorative accent. Severity colors are functional only and never used as branding.

---

## 3. Color System / Tokens

Light-first. Mapped to Tailwind v4 `@theme` so the entire `--color-*` namespace lights up across the codebase.

### 3.1 Surfaces

```
--color-canvas:        #FFFFFF        /* page bg */
--color-surface:       #F7F8FA        /* card bg, raised */
--color-surface-2:     #F1F4F7        /* section bg, subtle */
--color-surface-3:     #E8EDF7        /* navy tint, accent surface */
--color-surface-dark:  #0A1129        /* inverted sections, masthead */
--color-surface-dark-2:#1B2B5C        /* court navy block */
```

### 3.2 Borders

```
--color-border:        #E4E7EC
--color-border-strong: #CBD2D9
--color-border-focus:  #1B2B5C
```

### 3.3 Text

```
--color-text:          #0A1129        /* near-black, warm navy */
--color-text-2:        #4B5563
--color-text-3:        #6B7280
--color-text-inv:      #FFFFFF
```

### 3.4 Brand — Court Navy (sole decorative accent)

```
--color-brand:         #1B2B5C        /* signature */
--color-brand-hover:   #152348
--color-brand-pressed: #0F1A37
--color-brand-light:   #5B7BD0        /* on dark surfaces */
--color-brand-tint:    #E8EDF7        /* subtle bg */
--color-brand-text:    #FFFFFF        /* text on brand bg */
```

### 3.5 Severity (functional — preserved, retoned for light)

```
--color-critical:      #B42318
--color-critical-bg:   #FEF3F2
--color-critical-text: #7A1612
--color-critical-border:#FECDCA

--color-high:          #DC6803
--color-high-bg:       #FFFAEB
--color-high-text:     #B54708
--color-high-border:   #FEDF89

--color-medium:        #CA8A04
--color-medium-bg:     #FEFCE8
--color-medium-text:   #854A0E
--color-medium-border: #FDE68A

--color-low:           #067647
--color-low-bg:        #ECFDF3
--color-low-text:      #085D3A
--color-low-border:    #ABEFC6
```

### 3.6 Semantic

```
--color-info:          #175CD3
--color-info-bg:       #EFF8FF
--color-success:       #067647
--color-trust:         #0E7C86         /* verification chips, sparingly */
```

### 3.7 Entity / Event / Edge palette (graph viz — preserved functionally, retoned)

```
--color-entity-person:  #6941C6
--color-entity-company: #1B2B5C
--color-entity-org:     #175CD3
--color-entity-unknown: #6B7280

--color-event-licitacao:    #175CD3
--color-event-contrato:     #6941C6
--color-event-sancao:       #B42318
--color-event-transferencia:#0E7C86
--color-event-emenda:       #067647

/* Edge tokens follow same retoning pattern; full mapping in implementation */
```

### 3.8 Radii

```
--radius-xs:   2px
--radius-sm:   4px
--radius-md:   6px       /* soft-rect buttons, dense inputs */
--radius-lg:  10px       /* working cards */
--radius-xl:  14px
--radius-2xl: 20px       /* editorial cards */
--radius-full: 9999px    /* pill buttons, badges */
```

### 3.9 Shadows (light-theme dual-layer)

```
--shadow-xs:  0 1px 2px 0 rgba(16,24,40,0.05)
--shadow-sm:  0 1px 3px 0 rgba(16,24,40,0.10), 0 1px 2px -1px rgba(16,24,40,0.06)
--shadow-md:  0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06)
--shadow-lg:  0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)
--shadow-card:0 1px 3px 0 rgba(16,24,40,0.06), 0 1px 2px 0 rgba(16,24,40,0.04)
```

### 3.10 Color rules

- **Court Navy is the only decorative accent.** No teal, amber, or gradient logos.
- **Severity tones are functional only** — never used as decorative branding.
- **Inverted sections** (masthead, hero) use `--color-surface-dark` with white text + `--color-brand-light` for accent.
- **Old Signal Lens tokens become legacy aliases** mapped to new tokens during refactor — no broken pages mid-migration. Aliases removed only after full audit.

---

## 4. Typography

Three faces — all already in repo, all free, all geometric humanist (Optimistic-class voice).

```
--font-display: 'Geist', 'Inter Tight', system-ui, sans-serif
--font-sans:    'Inter', -apple-system, BlinkMacSystemFont, sans-serif
--font-mono:    'Geist Mono', 'JetBrains Mono', monospace
```

### 4.1 Type scale

| Role | Size | Weight | Line | Tracking | Notes |
|---|---|---|---|---|---|
| display-2xl (hero) | 48px | 500 | 1.1 | -0.02em | clamp(36px, 5vw, 48px); editorial only |
| display-xl | 36px | 500 | 1.15 | -0.02em | section heroes, editorial |
| display-lg | 28px | 500 | 1.2 | -0.015em | working-page titles cap |
| display-md | 22px | 600 | 1.25 | -0.01em | card titles, callouts |
| heading | 18px | 600 | 1.4 | — | sub-section heads |
| body-lg | 16px | 400 | 1.55 | — | editorial body |
| body | 14px | 400 | 1.55 | — | working body, default |
| body-sm | 13px | 400 | 1.5 | — | dense rows |
| caption | 12px | 500 | 1.4 | 0.02em | metadata, timestamps |
| label | 11px | 600 | 1.3 | 0.06em UPPERCASE | section labels, table headers |
| data (mono) | 13px | 400 | 1.5 | — | values, IDs, hashes |

### 4.2 Type rules

- Hero **never exceeds 48px** (Meta retail uses 64; OpenWatch is a working tool, not a showcase).
- Body type **never exceeds 14px on working pages**.
- Display type **never exceeds 28px on working pages**.
- Weight 300 not used at any size (too thin for legibility on white).

---

## 5. Component Language

### 5.1 Buttons

Two shape vocabularies, used by context.

| Variant | Shape | Radius | Use |
|---|---|---|---|
| Primary pill | pill | 100px | Page CTAs, hero, primary toolbar |
| Secondary pill | pill | 100px | Page-level secondary |
| Ghost pill | pill | 100px | Tertiary page-level |
| Soft-rect | rect | 6px | In-table, in-row, filter chips, dense toolbars |
| Soft-rect ghost | rect | 6px | Icon-only utility |
| Destructive | pill or rect | both | Match parent context |

Sizes: `sm` 8/16 13px · `md` 10/22 14px · `lg` 12/28 16px. Icon-only: 36px desktop / 44px mobile (touch target).

Primary pill: navy bg, white text, 14px/500. Hover → `--color-brand-hover`. Pressed → `--color-brand-pressed` + `scale(0.98)`. Focus → 3px `--color-brand-tint` ring.

Secondary pill: transparent bg, navy text, 1.5px solid `--color-border-strong`. Hover → `--color-surface-3` bg.

Ghost pill: transparent, navy text, no border. Hover → `--color-surface-2`.

### 5.2 Cards

Three densities.

| Density | Use | Bg | Radius | Pad | Shadow |
|---|---|---|---|---|---|
| Editorial | home, methodology | white | 20px | 24-32px | sm → md hover |
| Working | signal-card, case-card, dossier section | white | 16px | 16-20px | none, 1px border |
| Inline data | table row, list cell | surface-2 | 12px | 12px | none, no border |

### 5.3 Inputs

8px radius, 1px `--color-border-strong`, white bg, 14px font, padding 10/14. Focus: navy border + 3px brand-tint ring. Error: critical border + critical-bg fill. Same treatment for `select` and `textarea`.

### 5.4 Badges

11px label/600/uppercase, 999px radius, padding 2/8, severity-coded:
`critical · high · medium · low · info · neutral · trust`.

### 5.5 Status dots

8px circle, severity color. Tokens: `ok · warning · error · pending · stale`.

### 5.6 Sidebar

White bg, 220px width (kept), navy text. Items 14px/500, 8px radius hover (`--color-surface-2`). Active: `--color-brand-tint` bg + navy text + 2px `--color-brand` left-border. Section labels: 11px label-style.

### 5.7 Topbar

White frosted (`rgba(247,248,250,0.85)` + `backdrop-filter: blur(12px)`), **56px tall** (changed from current 48px — Meta-aligned), 1px border-bottom. Aperture mark + "OpenWatch" wordmark left. Domain switcher rebuilt as pill segment. Right actions: ghost icon-buttons (rect 6px).

**Migration note:** `--topbar-height` token bumps from `48px` → `56px`. Sidebar `top` and content `padding-top` follow the token, so no per-page edits needed; visual QA should still verify the radar/dossier shells and any sticky in-page subnav.

### 5.8 Tables

`--color-surface-2` header bg, 11px uppercase label headers, 13px body cells, `--color-surface-2` row hover, only horizontal divider lines (no vertical grid).

### 5.9 Page header / Masthead

| Mode | Title | Body | Section pad |
|---|---|---|---|
| Editorial | 48px display / 500 | 16px body | 64-80px V |
| Working | 28px display / 500 | 14px body | 24-32px V |

Working masthead retains optional 4px severity-color top accent strip (preserves `ow-masthead` semantic from current investigation/dossier pages).

---

## 6. Data-Density Preservation

Two layout modes per page type.

| Mode | Pages | Container | Section pad | Hero type | Card density |
|---|---|---|---|---|---|
| **Editorial** | home, methodology, compliance, marketing | 1200px max, centered, 32px H pad | 64-80px V | 48px / 500 | 24-32px pad, 20px radius |
| **Working** | radar, dossie, signal, investigation, coverage, entity, org, case | full minus sidebar, 24px H pad | 24-32px V | 28px / 500 | 16-20px pad, 16px radius |

### 6.1 Inviolable rules

- Body type never exceeds 14px on working pages.
- Display type never exceeds 28px on working pages.
- Pill buttons reserved for page-level CTAs; in-row actions use soft-rect.
- Tables/graphs/timelines keep current information density — no Meta gallery whitespace inside them.
- Graph canvases (`@xyflow/react`, `react-force-graph-2d`) keep dark backgrounds — visualizations need contrast for graph readability. Light chrome surrounds them.

### 6.2 Mode classes

```
.ow-mode-editorial   /* container max-width 1200px, --section-pad-y: 64px */
.ow-mode-working     /* container full minus sidebar, --section-pad-y: 24px */
```

Applied at the page-component root.

---

## 7. Refactor Strategy

Each step is independently shippable and visually verifiable.

1. **Token swap** — rewrite `apps/web/src/app/globals.css` `@theme` block to new light-first palette. Old `--color-*` tokens become aliases pointing to new values where the meaning maps. Pages render light immediately; old `.ow-*` classes still work because they reference tokens.
2. **Type scale** — replace typography utilities and Geist/Inter loading; verify `@font-face` setup in `apps/web/src/app/layout.tsx`.
3. **Component layer rewrite** — rewrite `.ow-*` classes in `globals.css` against new tokens (buttons → pill+rect dual vocab, cards → 3 densities, sidebar/topbar light treatment, badges, inputs, tables). Same class names — no component file edits needed for the visual flip.
4. **Logo + wordmark** — replace `apps/web/src/components/OpenWatchLogo.tsx` with new Aperture mark + Geist wordmark. Add favicon set in `apps/web/public/`.
5. **Mode classes** — add `.ow-mode-editorial` and `.ow-mode-working` body/page classes that switch container max-width and section padding tokens.
6. **Page-by-page audit** — walk all routes under `apps/web/src/app/` and all 17 page components in `apps/web/src/components/pages/`, classify each as editorial or working, apply the correct mode class. Fix any inline `bg-[#0b1220]` or hardcoded dark hex left over from the dark-first era.
7. **Decorative debt sweep** — remove gradients in `.ow-card`, `.ow-page-header-hero`, `.ow-graph-panel`, `.ow-disclaimer` (decorative only — partially removed in commit `1e96de8`).
8. **Backward-compat aliases retained** through entire refactor. Removed only after full audit + visual QA.

### 7.1 What does NOT change

- Class API (`.ow-btn`, `.ow-card`, `.ow-badge`, etc.) — same names, new visuals.
- Component file structure — no rename or move.
- Severity semantic system — colors retoned, meaning preserved.
- Graph/network visualization rendering layer.

### 7.2 File touchpoints (preliminary)

- `apps/web/src/app/globals.css` — full rewrite of `@theme` block + `@layer components`.
- `apps/web/src/app/layout.tsx` — font loading + body classes.
- `apps/web/src/components/OpenWatchLogo.tsx` — new mark.
- `apps/web/public/` — favicon set, optional brand assets.
- ~17 page components in `apps/web/src/components/pages/` — mode-class classification + inline-hex audit.
- ~50 components in `apps/web/src/components/` — only those with hardcoded hex / inline dark styling.

---

## 8. Acceptance Criteria

- All routes render in the new light theme without unstyled regions or dark legacy bleed.
- Existing severity coloring on signals/cases/coverage continues to communicate severity correctly.
- Existing graph views (`@xyflow/react`, `react-force-graph-2d`) render readably with dark canvases inside light page chrome.
- Working pages remain dense — body 14px, display ≤ 28px, no Meta-retail-scale whitespace inside tables/lists.
- Editorial pages (home, methodology) breathe with 64-80px section padding and 48px hero type.
- Old `.ow-*` class API is unbroken; alias layer keeps pre-refactor pages rendering correctly mid-migration.
- New OpenWatch wordmark + Aperture mark live in `OpenWatchLogo.tsx` and the favicon set.
- No teal, amber, or gradient brand decoration remains. Court Navy is the sole decorative accent.

---

## 9. Out of Scope

- Backend, API, pipeline changes.
- Pages or features not currently shipped (no new screens introduced).
- Photography production (the Meta Store relies on hero product photos; OpenWatch will use abstract / data-viz heroes — production of those assets is downstream work).
- Internationalization beyond what already exists.
- Marketing site separate from `apps/web` (none exists).

---

## 10. Open Questions

- **Favicon set** — produce as part of this refactor or as a follow-up? (Default: include in Step 4.)
- **Public-page hero imagery** — abstract data-viz hero on the home page, or stay text-first as the current `b057e7a` rewrite established? (Default: stay text-first; revisit after first visual pass.)
- **Tailwind utility classes that hardcode dark colors** (e.g. `bg-slate-900`, `text-white`) inside individual components — full sweep, or only fix on visual regression? (Default: full sweep in Step 6.)

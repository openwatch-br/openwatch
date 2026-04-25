# OpenWatch Rebrand — Meta-Craft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace OpenWatch's dark Signal Lens v3 design system with a light, Meta-Store-craft visual face — new tokens, type, components, logo — keeping the name and class API intact via legacy aliases throughout migration.

**Architecture:** Single-file token + component-layer rewrite in `apps/web/src/app/globals.css` (Tailwind v4 CSS-first `@theme`). Old `--color-*` token names become aliases of new values, so existing `.ow-*` class consumers render under the new system without changes. Two layout modes (`.ow-mode-editorial`, `.ow-mode-working`) preserve information density on data-dense pages while editorial pages adopt Meta-style whitespace. New `OpenWatchLogo` component (Aperture mark + Geist wordmark). Page-by-page audit applies mode classes and sweeps 28 hardcoded dark Tailwind classes in components.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind v4 (CSS-first `@theme` block), TypeScript strict, `next/font/google` for Geist + Geist_Mono + Inter (already wired in `apps/web/src/app/layout.tsx`).

**Spec:** `docs/superpowers/specs/2026-04-25-openwatch-rebrand-meta-craft-design.md` (committed `e147dec`).

**Note on testing:** Repo has no CSS unit tests. Verification per task is `pnpm typecheck` + `pnpm build` (clean) + manual visual sanity via `pnpm dev` on the affected route. Commits are frequent so any visual regression is bisectable.

---

## Task 1: Pre-flight baseline

**Files:**
- Verify only — no edits.

- [ ] **Step 1: Confirm working tree state**

```bash
cd /Users/claudioemmanuel/Documents/GitHub/openwatch/openwatch
git status --short
```

Expected: 8 modified files (page.tsx, radar/dossie/[caseId]/layout.tsx, radar/page.tsx, AppSidebar.tsx, Topbar.tsx, DossieJuridicoPage.tsx, RadarDossierPage.tsx, SinalPage.tsx) + untracked `package-lock.json` + `docs/superpowers/`. Spec `e147dec` already on `main`. **Do not stash or revert these — they are existing in-progress work, unrelated to this plan.**

- [ ] **Step 2: Install + baseline build**

```bash
pnpm install
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web build
```

Expected: typecheck PASS, build SUCCESS. If either fails, stop and report — do not proceed with the rebrand on a broken baseline.

- [ ] **Step 3: Smoke-check dev server**

```bash
pnpm --filter ./apps/web dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
kill %1 2>/dev/null
```

Expected: `200`. If non-200, stop.

- [ ] **Step 4: No commit — verification only.**

---

## Task 2: Token swap — full `@theme` block (light-first)

**Files:**
- Modify: `apps/web/src/app/globals.css` (replace `@theme` block, lines ~7-161)

The old `@theme` is dark-first with teal brand. We replace it with the light-first navy palette from spec §3, and keep every old token name as a **legacy alias** so existing `.ow-*` classes render under new values without breaking.

- [ ] **Step 1: Replace the `@theme` block**

Open `apps/web/src/app/globals.css`. Replace lines 1-161 (everything from `@import "tailwindcss";` through the closing `}` of `@theme`) with:

```css
@import "tailwindcss";

/* ═══════════════════════════════════════════════════════════════════
   OPENWATCH — Meta-Craft Identity v1
   Light-first. Court Navy signature. Investigative discipline.
   Severity tones functional only.
   ═══════════════════════════════════════════════════════════════════ */

@theme {
  /* ── Typography ─────────────────────────────────────────────────── */
  --font-display: 'Geist', 'Inter Tight', system-ui, sans-serif;
  --font-sans:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;

  /* ── Surfaces (light-first) ─────────────────────────────────────── */
  --color-canvas:        #FFFFFF;
  --color-surface:       #F7F8FA;
  --color-surface-2:     #F1F4F7;
  --color-surface-3:     #E8EDF7;
  --color-surface-dark:  #0A1129;
  --color-surface-dark-2:#1B2B5C;

  /* ── Borders ────────────────────────────────────────────────────── */
  --color-border:        #E4E7EC;
  --color-border-strong: #CBD2D9;
  --color-border-focus:  #1B2B5C;

  /* ── Text ───────────────────────────────────────────────────────── */
  --color-text:          #0A1129;
  --color-text-2:        #4B5563;
  --color-text-3:        #6B7280;
  --color-text-inv:      #FFFFFF;

  /* ── Brand — Court Navy (sole decorative accent) ────────────────── */
  --color-brand:         #1B2B5C;
  --color-brand-hover:   #152348;
  --color-brand-pressed: #0F1A37;
  --color-brand-light:   #5B7BD0;
  --color-brand-tint:    #E8EDF7;
  --color-brand-text:    #FFFFFF;
  --color-brand-dim:     #E8EDF7;
  --color-brand-border:  #5B7BD0;

  /* ── Severity (functional, light-retoned) ───────────────────────── */
  --color-critical:        #B42318;
  --color-critical-bg:     #FEF3F2;
  --color-critical-text:   #7A1612;
  --color-critical-border: #FECDCA;

  --color-high:            #DC6803;
  --color-high-bg:         #FFFAEB;
  --color-high-text:       #B54708;
  --color-high-border:     #FEDF89;

  --color-medium:          #CA8A04;
  --color-medium-bg:       #FEFCE8;
  --color-medium-text:     #854A0E;
  --color-medium-border:   #FDE68A;

  --color-low:             #067647;
  --color-low-bg:          #ECFDF3;
  --color-low-text:        #085D3A;
  --color-low-border:      #ABEFC6;

  /* ── Semantic ───────────────────────────────────────────────────── */
  --color-info:          #175CD3;
  --color-info-bg:       #EFF8FF;
  --color-info-text:     #175CD3;
  --color-trust:         #0E7C86;
  --color-success:       #067647;

  /* ── Legacy aliases — old names kept rendering during migration ──
     Old: --color-bg, --color-amber*, --color-primary*, etc.
     Maps each pre-rebrand name to the closest new value. Removal
     happens only after the full visual audit passes (Task 17). */
  --color-bg:             var(--color-canvas);
  --color-surface-4:      var(--color-surface-3);
  --color-amber:          var(--color-brand);
  --color-amber-light:    var(--color-brand-light);
  --color-amber-dim:      var(--color-brand-tint);
  --color-amber-text:     var(--color-text);
  --color-amber-border:   var(--color-brand-border);
  --color-primary:        var(--color-text);
  --color-primary-dark:   var(--color-text-inv);
  --color-secondary:      var(--color-text-2);
  --color-muted:          var(--color-text-3);
  --color-accent:         var(--color-brand);
  --color-accent-alert:   var(--color-critical);
  --color-accent-trust:   var(--color-trust);
  --color-accent-dim:     var(--color-brand-tint);
  --color-accent-subtle:  var(--color-brand-tint);
  --color-error:          var(--color-critical);
  --color-surface-base:   var(--color-canvas);
  --color-surface-card:   var(--color-surface);
  --color-surface-subtle: var(--color-surface-2);
  --color-newsprint:      var(--color-canvas);
  --color-newsprint-subtle: var(--color-surface);
  --color-surface-hover:  var(--color-surface-2);
  --color-surface-active: var(--color-surface-3);
  --color-text-primary:   var(--color-text);
  --color-text-secondary: var(--color-text-2);
  --color-text-muted:     var(--color-text-3);
  --color-text-inverse:   var(--color-text-inv);
  --color-border-light:   var(--color-border);
  --color-border-medium:  var(--color-border-strong);
  --color-focus:          var(--color-brand);
  --color-sidebar-text:        var(--color-text-2);
  --color-sidebar-hover:       var(--color-surface-2);
  --color-sidebar-text-active: var(--color-brand);
  --color-warning:             var(--color-medium);
  --color-destructive:         var(--color-critical);

  /* ── Entity / Graph Colors (retoned for light) ──────────────────── */
  --color-entity-person:      #6941C6;
  --color-entity-company:     #1B2B5C;
  --color-entity-org:         #175CD3;
  --color-entity-unknown:     #6B7280;

  /* ── Event Type Colors ───────────────────────────────────────────── */
  --color-event-licitacao:     #175CD3;
  --color-event-contrato:      #6941C6;
  --color-event-sancao:        #B42318;
  --color-event-transferencia: #0E7C86;
  --color-event-emenda:        #067647;

  /* ── Edge Colors ─────────────────────────────────────────────────── */
  --color-edge-compra:         #175CD3;
  --color-edge-favorecido:     #B42318;
  --color-edge-copart:         #6941C6;
  --color-edge-copartsup:      #8B5CF6;
  --color-edge-coparorg:       #7C3AED;
  --color-edge-socio:          #067647;
  --color-edge-same-socio:     #0E7C86;
  --color-edge-address:        #6B7280;
  --color-edge-phone:          #6B7280;
  --color-edge-acct:           #6B7280;
  --color-edge-subsidiary:     #6941C6;
  --color-edge-default:        #CBD2D9;

  /* ── Role Badge Colors ───────────────────────────────────────────── */
  --color-role-buyer:          #175CD3;
  --color-role-supplier:       #1B2B5C;
  --color-role-winner:         #067647;
  --color-role-sanctioned:     #B42318;
  --color-role-beneficiary:    #6941C6;

  /* ── Radii ──────────────────────────────────────────────────────── */
  --radius-xs:   2px;
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:  10px;
  --radius-xl:  14px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* ── Shadows (light-theme dual-layer) ───────────────────────────── */
  --shadow-xs:   0 1px 2px 0 rgba(16,24,40,0.05);
  --shadow-sm:   0 1px 3px 0 rgba(16,24,40,0.10), 0 1px 2px -1px rgba(16,24,40,0.06);
  --shadow-md:   0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06);
  --shadow-lg:   0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03);
  --shadow-xl:   0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03);
  --shadow-card: 0 1px 3px 0 rgba(16,24,40,0.06), 0 1px 2px 0 rgba(16,24,40,0.04);
  --shadow-brand: 0 0 0 1px rgba(27,43,92,0.10), 0 8px 24px rgba(27,43,92,0.08);
  --shadow-amber: var(--shadow-brand);
  --shadow-glow:  0 0 24px rgba(27,43,92,0.10);

  /* ── Layout ──────────────────────────────────────────────────────── */
  --sidebar-width: 220px;
  --topbar-height: 56px;
  --header-height: var(--topbar-height);

  /* ── Mode tokens (set per page via .ow-mode-* class — see Task 12) ─ */
  --section-pad-y:  24px;
  --container-max:  100%;
  --content-pad-x:  24px;
}
```

- [ ] **Step 2: Verify build still succeeds**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web build
```

Expected: both clean. (Site will look broken at this point — body is still `dark` in `layout.tsx`, components still reference dark-era CSS — but the build must compile.)

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(design): swap @theme to light-first Court Navy palette

Replace Signal Lens v3 dark/teal token block with Meta-craft
light/navy palette (spec §3). Old token names retained as legacy
aliases so existing .ow-* classes still render mid-migration."
```

---

## Task 3: Verify font loading + flip html `dark` flag

**Files:**
- Modify: `apps/web/src/app/layout.tsx` (lines 57-64 — html `className`, meta `color-scheme`)

`next/font/google` already loads Geist, Geist_Mono, Inter and binds them to `--font-display`, `--font-mono`, `--font-sans` (layout.tsx:10-26). No change needed there. We only flip the html `dark` flag and `color-scheme` meta.

- [ ] **Step 1: Edit `apps/web/src/app/layout.tsx`**

Find:

```tsx
    <html
      lang="pt-BR"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
```

Replace with:

```tsx
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
```

- [ ] **Step 2: Also fix the skip-to-content link's hardcoded `--color-amber` ref to use `--color-brand`**

Find (layout.tsx line 71):

```tsx
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:inline-flex focus:items-center focus:gap-2 focus:rounded focus:bg-[var(--color-amber)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-text-inv)] focus:outline-none"
```

Replace with:

```tsx
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:inline-flex focus:items-center focus:gap-2 focus:rounded focus:bg-[var(--color-brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-text-inv)] focus:outline-none"
```

(`--color-amber` would still resolve via the legacy alias, but we eliminate the alias dependency proactively where the file is already being touched.)

- [ ] **Step 3: Verify**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "chore(layout): drop dark html flag, set color-scheme: light"
```

---

## Task 4: Component layer — base reset + body + selection + scrollbar

**Files:**
- Modify: `apps/web/src/app/globals.css` (lines ~163-269 of original — the base reset, `html`, `body`, focus, scrollbar, selection blocks)

- [ ] **Step 1: Replace the base/reset blocks**

Find this sequence in `globals.css` (between the `@theme` close-brace and the `@layer utilities` opening):

```css
/* ─── Base Reset ─────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html {
  color-scheme: dark;
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  overflow-x: hidden;
}
```

Replace with:

```css
/* ─── Base Reset ─────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html {
  color-scheme: light;
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  overflow-x: hidden;
}
```

- [ ] **Step 2: Replace scrollbar + selection blocks**

Find:

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-3); }

::selection {
  background: rgba(245, 158, 11, 0.25);
  color: var(--color-text);
}
```

Replace with:

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-3); }

::selection {
  background: rgba(27, 43, 92, 0.18);
  color: var(--color-text);
}
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter ./apps/web build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(design): light-mode base reset, body bg, scrollbar, selection"
```

---

## Task 5: Component layer — buttons (pill + soft-rect dual vocabulary)

**Files:**
- Modify: `apps/web/src/app/globals.css` (the `.ow-btn` block and all `.ow-btn-*` variants in `@layer components`)

- [ ] **Step 1: Replace the `.ow-btn` base + size + variant blocks**

Find the entire button section in `globals.css` (starts at `/* ── Button ────…` and ends just before `/* ── Badge ──…`). Replace with:

```css
  /* ── Button ────────────────────────────────────────────────────── */
  .ow-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: var(--radius-full);  /* pill is the default */
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.01em;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease, transform 120ms ease;
    white-space: nowrap;
    text-decoration: none;
    flex-shrink: 0;
  }
  .ow-btn:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
  .ow-btn:active   { transform: scale(0.98); }

  /* Sizes */
  .ow-btn-sm { padding: 8px 16px; font-size: 0.8125rem; }
  .ow-btn-md { padding: 10px 22px; }
  .ow-btn-lg { padding: 12px 28px; font-size: 1rem; }

  /* Soft-rect modifier — for in-row, in-table, dense-toolbar use */
  .ow-btn-rect           { border-radius: var(--radius-md); }
  .ow-btn-rect.ow-btn-sm { padding: 6px 12px; }
  .ow-btn-rect.ow-btn-md { padding: 7px 14px; }
  .ow-btn-rect.ow-btn-lg { padding: 9px 18px; }

  /* Icon-only */
  .ow-btn-icon                       { padding: 9px; border-radius: var(--radius-full); }
  .ow-btn-icon.ow-btn-sm             { padding: 7px; }
  .ow-btn-icon.ow-btn-lg             { padding: 11px; }
  .ow-btn-icon.ow-btn-rect           { border-radius: var(--radius-md); padding: 7px; }
  .ow-btn-icon.ow-btn-rect.ow-btn-sm { padding: 6px; }
  .ow-btn-icon.ow-btn-rect.ow-btn-lg { padding: 9px; }

  /* Primary — Court Navy */
  .ow-btn-primary {
    background: var(--color-brand);
    color: var(--color-brand-text);
    border-color: var(--color-brand);
  }
  .ow-btn-primary:hover  { background: var(--color-brand-hover);  border-color: var(--color-brand-hover); }
  .ow-btn-primary:active { background: var(--color-brand-pressed); border-color: var(--color-brand-pressed); }

  /* Secondary — outlined navy */
  .ow-btn-secondary {
    background: var(--color-canvas);
    color: var(--color-text);
    border-color: var(--color-border-strong);
  }
  .ow-btn-secondary:hover { background: var(--color-surface-2); border-color: var(--color-text-3); }

  /* Ghost — bare */
  .ow-btn-ghost {
    background: transparent;
    color: var(--color-text-2);
    border-color: transparent;
  }
  .ow-btn-ghost:hover { background: var(--color-surface-2); color: var(--color-text); }

  /* Outline — alias for secondary, kept for compat */
  .ow-btn-outline {
    background: transparent;
    color: var(--color-text);
    border-color: var(--color-border-strong);
  }
  .ow-btn-outline:hover { background: var(--color-surface-2); border-color: var(--color-text-3); }

  /* Destructive */
  .ow-btn-destructive {
    background: var(--color-critical-bg);
    color: var(--color-critical-text);
    border-color: var(--color-critical-border);
  }
  .ow-btn-destructive:hover { background: #FECDCA; border-color: var(--color-critical); }

  /* Legacy aliases — amber/signal map to brand */
  .ow-btn-amber  { background: var(--color-brand); color: var(--color-brand-text); border-color: var(--color-brand); }
  .ow-btn-amber:hover  { background: var(--color-brand-hover); border-color: var(--color-brand-hover); }
  .ow-btn-signal { background: var(--color-brand-tint); color: var(--color-brand); border-color: var(--color-brand-light); }
  .ow-btn-signal:hover { background: #DCE3F4; border-color: var(--color-brand); }
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter ./apps/web build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(design): button vocab — pill default, soft-rect modifier, navy primary"
```

---

## Task 6: Component layer — cards (3 densities)

**Files:**
- Modify: `apps/web/src/app/globals.css` (the `.ow-card*` block)

- [ ] **Step 1: Replace the card section**

Find the section starting `/* ── Card ────…` through the `.ow-card-section + .ow-card-section` rule. Replace with:

```css
  /* ── Card ──────────────────────────────────────────────────────── */
  .ow-card {
    background: var(--color-canvas);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);          /* working density default = 10px */
    overflow: hidden;
  }

  /* Editorial density — home, methodology, marketing surfaces */
  .ow-card-editorial {
    border-radius: var(--radius-2xl);         /* 20px */
    border: none;
    background: var(--color-canvas);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 200ms ease, transform 200ms ease;
  }
  .ow-card-editorial.ow-card-hover:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  /* Inline data — table-row card, list cell */
  .ow-card-inline {
    background: var(--color-surface-2);
    border: none;
    border-radius: var(--radius-md);
    padding: 12px;
  }

  /* Glass — for overlays only */
  .ow-card-glass {
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(12px);
    border: 1px solid var(--color-border);
  }

  /* Signal-tinted card */
  .ow-card-signal {
    border-color: var(--color-brand-light);
    background: var(--color-brand-tint);
  }

  /* Hover lift (working density) */
  .ow-card-hover {
    transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    cursor: pointer;
  }
  .ow-card-hover:hover {
    background: var(--color-surface-2);
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-card);
    transform: translateY(-1px);
  }

  /* Legacy amber-card alias */
  .ow-card-amber {
    border-color: var(--color-brand-light);
    background: var(--color-brand-tint);
  }

  .ow-card-section { padding: 16px 20px; }
  .ow-card-section + .ow-card-section { border-top: 1px solid var(--color-border); }
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter ./apps/web build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(design): card densities — working/editorial/inline + glass overlay"
```

---

## Task 7: Component layer — sidebar + topbar (light, topbar 48→56px)

**Files:**
- Modify: `apps/web/src/app/globals.css` (the `.ow-sidebar*`, `.ow-header`, `.ow-topbar*`, `.ow-domain-*`, `.ow-sidebar-*-badge` blocks)

`--topbar-height` was bumped to `56px` in Task 2's `@theme`. Sidebar `top` and `layout.tsx` content `paddingTop` already reference the token — no per-page edits needed.

- [ ] **Step 1: Replace sidebar + topbar styles**

Find the section starting `/* ── Sidebar ─…` through (and including) `/* ── Dossier breadcrumb chip (in sidebar context) ─…` and its three `.ow-sidebar-domain-badge.*` rules. Replace with:

```css
  /* ── Sidebar ───────────────────────────────────────────────────── */
  .ow-sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
    background: var(--color-canvas);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: var(--topbar-height);
    height: calc(100dvh - var(--topbar-height));
    overflow-y: auto;
  }

  .ow-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 16px 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .ow-sidebar-logo-mark,
  .ow-brand-mark {
    width: 28px;
    height: 28px;
    background: var(--color-brand);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-brand-text);
  }

  .ow-sidebar-wordmark {
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .ow-sidebar-nav { padding: 12px 8px; flex: 1; }
  .ow-sidebar-section { margin-bottom: 20px; }

  .ow-sidebar-section-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--color-text-3);
    padding: 0 8px;
    margin-bottom: 4px;
  }

  .ow-nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-2);
    text-decoration: none;
    transition: color 120ms, background 120ms;
    cursor: pointer;
    width: 100%;
    border: none;
    background: none;
    text-align: left;
  }
  .ow-nav-item:hover { color: var(--color-text); background: var(--color-surface-2); }
  .ow-nav-item.active {
    color: var(--color-brand);
    background: var(--color-brand-tint);
    box-shadow: inset 2px 0 0 var(--color-brand);
  }
  .ow-nav-item.active .ow-nav-icon { color: var(--color-brand); }

  .ow-nav-icon { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.7; }
  .ow-nav-item:hover .ow-nav-icon,
  .ow-nav-item.active .ow-nav-icon { opacity: 1; }

  .ow-nav-badge {
    margin-left: auto;
    font-size: 0.6875rem;
    font-weight: 600;
    background: var(--color-surface-2);
    color: var(--color-text-3);
    padding: 1px 6px;
    border-radius: var(--radius-full);
    font-family: var(--font-mono);
  }
  .ow-nav-item.active .ow-nav-badge { background: var(--color-brand); color: var(--color-brand-text); }

  /* ── Mobile Header (legacy) ────────────────────────────────────── */
  .ow-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    height: var(--topbar-height);
    background: var(--color-canvas);
    border-bottom: 1px solid var(--color-border);
    display: flex; align-items: center; padding: 0 16px; gap: 12px;
  }

  /* ── Topbar (global) ───────────────────────────────────────────── */
  .ow-topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    height: var(--topbar-height);
    background: rgba(247, 248, 250, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
    display: flex; align-items: center; gap: 0; padding-right: 8px;
  }

  .ow-topbar-logo {
    display: flex; align-items: center; gap: 8px;
    padding: 0 14px 0 12px; height: 100%;
    width: var(--sidebar-width);
    border-right: 1px solid var(--color-border);
    flex-shrink: 0; text-decoration: none;
  }

  .ow-topbar-divider {
    width: 1px; height: 20px;
    background: var(--color-border);
    flex-shrink: 0; margin: 0 4px;
  }

  .ow-topbar-action {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px;
    border-radius: var(--radius-md);
    border: none; background: none;
    color: var(--color-text-2); cursor: pointer;
    transition: color 120ms, background 120ms;
    font-size: 0.875rem;
  }
  .ow-topbar-action:hover { color: var(--color-text); background: var(--color-surface-2); }

  /* ── Domain Switcher ────────────────────────────────────────────── */
  .ow-domain-switcher {
    display: flex; align-items: center;
    background: var(--color-surface-2);
    border-radius: var(--radius-full);
    padding: 3px; gap: 2px; margin: 0 12px;
  }

  .ow-domain-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 14px;
    border-radius: var(--radius-full);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-2);
    text-decoration: none;
    transition: all 150ms;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }
  .ow-domain-tab:hover { color: var(--color-text); background: var(--color-canvas); }
  .ow-domain-tab.active {
    background: var(--color-brand);
    color: var(--color-brand-text);
  }
  .ow-domain-tab.active svg { opacity: 1; }

  /* ── Dossier breadcrumb chip (sidebar context) ──────────────────── */
  .ow-sidebar-back {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 8px 10px;
    font-size: 0.8125rem;
    color: var(--color-text-3);
    text-decoration: none;
    transition: color 120ms;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 8px;
  }
  .ow-sidebar-back:hover { color: var(--color-text-2); }

  .ow-sidebar-domain-badge {
    font-size: 0.625rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    margin: 0 8px 8px;
    display: flex; align-items: center; gap: 5px;
    border: 1px solid;
  }
  .ow-sidebar-domain-badge.radar    { background: var(--color-brand-tint); color: var(--color-brand);   border-color: var(--color-brand-light); }
  .ow-sidebar-domain-badge.signal   { background: #F4EFFE;                  color: #6941C6;              border-color: #C4B5FD; }
  .ow-sidebar-domain-badge.dossier  { background: var(--color-info-bg);     color: var(--color-info);    border-color: #B2DDFF; }
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter ./apps/web build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(design): sidebar + topbar light-mode (white frosted, 56px topbar)"
```

---

## Task 8: Component layer — badges, status dots, inputs, forms

**Files:**
- Modify: `apps/web/src/app/globals.css` (the `.ow-badge*`, `.ow-status-*`, `.ow-input*`, `.ow-select`, `.ow-label`, `.ow-field` blocks)

- [ ] **Step 1: Replace badge + status-dot section**

Find `/* ── Badge ────…` through the last `.ow-status-*` rule. Replace with:

```css
  /* ── Badge ─────────────────────────────────────────────────────── */
  .ow-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid transparent;
    white-space: nowrap;
    line-height: 1.5;
  }

  .ow-badge-critical { background: var(--color-critical-bg); color: var(--color-critical-text); border-color: var(--color-critical-border); }
  .ow-badge-high     { background: var(--color-high-bg);     color: var(--color-high-text);     border-color: var(--color-high-border); }
  .ow-badge-medium   { background: var(--color-medium-bg);   color: var(--color-medium-text);   border-color: var(--color-medium-border); }
  .ow-badge-low      { background: var(--color-low-bg);      color: var(--color-low-text);      border-color: var(--color-low-border); }
  .ow-badge-info     { background: var(--color-info-bg);     color: var(--color-info-text);     border-color: #B2DDFF; }
  .ow-badge-neutral  { background: var(--color-surface-2);   color: var(--color-text-2);        border-color: var(--color-border); }
  .ow-badge-amber    { background: var(--color-brand-tint);  color: var(--color-brand);         border-color: var(--color-brand-light); }
  .ow-badge-signal   { background: var(--color-brand-tint);  color: var(--color-brand);         border-color: var(--color-brand-light); }
  .ow-badge-trust    { background: #ECFDFD;                  color: var(--color-trust);         border-color: #A5E5E8; }

  /* Status dots */
  .ow-status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    display: inline-block; flex-shrink: 0;
  }
  .ow-status-ok      { background: var(--color-low); }
  .ow-status-warning { background: var(--color-medium); }
  .ow-status-error   { background: var(--color-critical); }
  .ow-status-pending { background: var(--color-text-3); }
  .ow-status-stale   { background: var(--color-high); }
```

- [ ] **Step 2: Replace input/form section**

Find `/* ── Input / Form ────…` through `.ow-field { … }`. Replace with:

```css
  /* ── Input / Form ──────────────────────────────────────────────── */
  .ow-input {
    width: 100%;
    background: var(--color-canvas);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    padding: 9px 12px;
    transition: border-color 120ms, box-shadow 120ms;
    outline: none;
  }
  .ow-input::placeholder { color: var(--color-text-3); }
  .ow-input:focus {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px var(--color-brand-tint);
  }
  .ow-input-icon-left { padding-left: 36px; }

  .ow-select {
    width: 100%;
    background: var(--color-canvas);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    padding: 9px 32px 9px 12px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    outline: none; cursor: pointer;
    transition: border-color 120ms;
  }
  .ow-select:focus {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px var(--color-brand-tint);
  }

  .ow-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-2);
    margin-bottom: 5px;
    letter-spacing: 0.01em;
  }

  .ow-field { display: flex; flex-direction: column; gap: 4px; }
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm --filter ./apps/web build
git add apps/web/src/app/globals.css
git commit -m "feat(design): badges, status dots, inputs/forms — light retoned"
```

---

## Task 9: Component layer — tables + tabs + breadcrumb + pagination + filter-bar

**Files:**
- Modify: `apps/web/src/app/globals.css` (the `.ow-table*`, `.ow-tab*`, `.ow-breadcrumb*`, `.ow-pagination*`, `.ow-filter-bar` blocks)

- [ ] **Step 1: Replace the table block**

Find `/* ── Table ────…` through the row-link rule. Replace with:

```css
  /* ── Table ─────────────────────────────────────────────────────── */
  .ow-table-wrapper {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-canvas);
  }

  .ow-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

  .ow-table th {
    background: var(--color-surface-2);
    color: var(--color-text-3);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  .ow-table td {
    padding: 11px 14px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    vertical-align: middle;
  }
  .ow-table tr:last-child td { border-bottom: none; }
  .ow-table tr:hover td { background: var(--color-surface-2); }
  .ow-table-row-link { cursor: pointer; }
```

- [ ] **Step 2: Replace tabs**

Find `/* ── Tabs ────…` through the `.ow-tab.active .ow-tab-count` rule. Replace with:

```css
  /* ── Tabs ──────────────────────────────────────────────────────── */
  .ow-tabs {
    display: flex; gap: 0;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 20px;
  }

  .ow-tab {
    padding: 10px 16px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-3);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    transition: color 120ms, border-color 120ms;
    background: none;
    border-top: none; border-left: none; border-right: none;
    white-space: nowrap;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .ow-tab:hover { color: var(--color-text-2); }
  .ow-tab.active {
    color: var(--color-brand);
    border-bottom-color: var(--color-brand);
  }

  .ow-tab-count {
    font-size: 0.6875rem;
    font-family: var(--font-mono);
    background: var(--color-surface-2);
    color: var(--color-text-3);
    padding: 1px 6px;
    border-radius: var(--radius-full);
  }
  .ow-tab.active .ow-tab-count {
    background: var(--color-brand-tint);
    color: var(--color-brand);
  }
```

- [ ] **Step 3: Replace breadcrumb + pagination + filter-bar**

Find `/* ── Breadcrumb ────…` through the end of `.ow-pagination-info`. Replace with:

```css
  /* ── Breadcrumb ────────────────────────────────────────────────── */
  .ow-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.8125rem;
    color: var(--color-text-3);
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .ow-breadcrumb a {
    color: var(--color-text-3);
    text-decoration: none;
    transition: color 100ms;
  }
  .ow-breadcrumb a:hover { color: var(--color-text); }
  .ow-breadcrumb-sep { color: var(--color-border-strong); }
  .ow-breadcrumb-current { color: var(--color-text); font-weight: 500; }

  /* ── Filter Bar ────────────────────────────────────────────────── */
  .ow-filter-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  /* ── Pagination ────────────────────────────────────────────────── */
  .ow-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0;
    border-top: 1px solid var(--color-border);
    font-size: 0.8125rem;
    color: var(--color-text-3);
  }
  .ow-pagination-info { font-family: var(--font-mono); font-size: 0.75rem; }
```

- [ ] **Step 4: Verify + commit**

```bash
pnpm --filter ./apps/web build
git add apps/web/src/app/globals.css
git commit -m "feat(design): tables, tabs, breadcrumb, pagination, filter-bar — light"
```

---

## Task 10: Component layer — page header + masthead (editorial vs working modes)

**Files:**
- Modify: `apps/web/src/app/globals.css` (the `.ow-page-header*` blocks AND the `.ow-masthead*` blocks)

The current `.ow-page-header` carries decorative gradients (lines ~593-727) and `.ow-masthead` (lines ~1576-1637) was built dark. Replace both with light-first equivalents that respect the editorial/working mode switch.

- [ ] **Step 1: Replace `.ow-page-header*` block**

Find `/* ── Page Header ────…` through the last `.ow-page-header-stat-sub` rule. Replace with:

```css
  /* ── Page Header ───────────────────────────────────────────────── */
  .ow-page-header {
    position: relative;
    padding: 24px 0 20px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 24px;
  }

  /* Editorial-mode hero variant (used by home / methodology) */
  .ow-page-header-hero {
    padding: 32px 32px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2xl);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  /* Removed: ::after accent bar — decorative, replaced by clean border */

  .ow-page-header-icon {
    width: 44px; height: 44px;
    flex-shrink: 0;
    border-radius: var(--radius-lg);
    display: flex; align-items: center; justify-content: center;
    background: var(--color-brand-tint);
    border: 1px solid var(--color-brand-light);
    color: var(--color-brand);
  }

  .ow-page-header-icon-hero {
    width: 48px; height: 48px;
    background: var(--color-brand);
    border: none;
    color: var(--color-brand-text);
  }

  .ow-page-header-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand);
    margin-bottom: 6px;
  }

  .ow-page-header-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 6px;
  }

  /* Editorial hero gets the full Meta-scale clamp */
  .ow-page-header-hero .ow-page-header-title {
    font-size: clamp(1.75rem, 3vw, 3rem);   /* up to 48px display-2xl */
  }

  .ow-page-header-desc {
    font-size: 1rem;
    color: var(--color-text-2);
    line-height: 1.55;
    max-width: 72ch;
  }

  .ow-page-header-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .ow-page-header-stat {
    display: flex; flex-direction: column; gap: 2px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-canvas);
  }
  .ow-page-header-stat[data-tone="brand"]   { border-color: var(--color-brand-light); background: var(--color-brand-tint); }
  .ow-page-header-stat[data-tone="success"] { border-color: var(--color-low-border);  background: var(--color-low-bg); }
  .ow-page-header-stat[data-tone="warning"] { border-color: var(--color-medium-border); background: var(--color-medium-bg); }
  .ow-page-header-stat[data-tone="danger"]  { border-color: var(--color-critical-border); background: var(--color-critical-bg); }

  .ow-page-header-stat-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-3);
  }
  .ow-page-header-stat-value {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
  }
  .ow-page-header-stat-sub {
    font-size: 0.6875rem;
    color: var(--color-text-3);
    line-height: 1.35;
  }
```

- [ ] **Step 2: Replace `.ow-masthead*` block**

Find `/* ── Investigation Design System ─…` (line ~1530) and replace **the masthead subsection only** (`.ow-masthead`, `.ow-masthead-severity-bar`, `.ow-masthead-eyebrow`, `.ow-masthead-title`, `.ow-masthead-meta`, `.ow-masthead-meta-item`, `.ow-masthead-meta-label`, `.ow-masthead-meta-value`) with:

```css
  /* ── Masthead (working-mode page header for radar/dossie/etc) ──── */
  .ow-masthead {
    position: relative;
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 24px 28px 22px;
  }
  .ow-masthead-severity-bar {
    position: absolute; top: 0; left: 0; right: 0;
    height: 4px;
    background: var(--severity-color, var(--color-brand));
  }
  .ow-masthead-eyebrow {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 12px;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-3);
  }
  .ow-masthead-title {
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 3vw, 1.75rem);     /* working cap = 28px */
    font-weight: 500;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: var(--color-text);
    margin-bottom: 8px;
  }
  .ow-masthead-meta {
    display: flex; flex-wrap: wrap; gap: 20px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }
  .ow-masthead-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .ow-masthead-meta-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-3);
  }
  .ow-masthead-meta-value {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text);
  }
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm --filter ./apps/web build
git add apps/web/src/app/globals.css
git commit -m "feat(design): page-header + masthead — light, mode-aware sizes"
```

---

## Task 11: Component layer — remaining `.ow-*` classes

**Files:**
- Modify: `apps/web/src/app/globals.css` (skeleton, empty, alert, code, id, score-bar, graph-panel, disclaimer, tooltip, signal-card, command-palette, brief-section, rail-card, timeline, score-dial, entity-chip)

- [ ] **Step 1: Replace skeleton + empty + alert + code + id + score-bar blocks**

Find `/* ── Skeleton ────…` through the closing `}` of the last alert variant. Replace with:

```css
  /* ── Skeleton ──────────────────────────────────────────────────── */
  .ow-skeleton {
    background: linear-gradient(
      90deg,
      var(--color-surface-2) 25%,
      var(--color-surface) 50%,
      var(--color-surface-2) 75%
    );
    background-size: 200% 100%;
    animation: ow-shimmer 1.6s infinite;
    border-radius: var(--radius-md);
  }

  @keyframes ow-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Empty State ───────────────────────────────────────────────── */
  .ow-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; padding: 56px 24px; text-align: center;
  }
  .ow-empty-icon { width: 40px; height: 40px; color: var(--color-text-3); margin-bottom: 4px; }
  .ow-empty-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-text); }
  .ow-empty-desc { font-size: 0.8125rem; color: var(--color-text-3); max-width: 360px; line-height: 1.5; }

  /* ── Alert / Banner ────────────────────────────────────────────── */
  .ow-alert {
    display: flex; gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius-lg);
    border: 1px solid;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .ow-alert-warning { background: var(--color-medium-bg);  border-color: var(--color-medium-border);  color: var(--color-medium-text); }
  .ow-alert-error   { background: var(--color-critical-bg); border-color: var(--color-critical-border); color: var(--color-critical-text); }
  .ow-alert-info    { background: var(--color-info-bg);    border-color: #B2DDFF;                        color: var(--color-info); }
  .ow-alert-success { background: var(--color-low-bg);     border-color: var(--color-low-border);       color: var(--color-low-text); }

  /* ── Code / Mono Inline ────────────────────────────────────────── */
  .ow-code {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    background: var(--color-surface-2);
    color: var(--color-text);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  /* ── ID / Hash Display ─────────────────────────────────────────── */
  .ow-id {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-3);
    letter-spacing: 0.01em;
  }

  /* ── Severity bar ──────────────────────────────────────────────── */
  .ow-score-bar-track {
    height: 4px;
    background: var(--color-surface-2);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .ow-score-bar-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
```

- [ ] **Step 2: Replace graph-panel + disclaimer + tooltip + signal-card blocks**

Find `/* ── Graph Panel ────…` through the `.ow-signal-card-low` rule. Replace with:

```css
  /* ── Graph Panel ───────────────────────────────────────────────── */
  /* Graph canvas keeps a dark surface for visualization contrast — */
  /* light chrome surrounds it via the page-level surface.          */
  .ow-graph-panel {
    background: var(--color-surface-dark);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    min-height: 400px;
    position: relative;
  }

  /* ── Legal Disclaimer ──────────────────────────────────────────── */
  .ow-disclaimer {
    background: var(--color-brand-tint);
    border: 1px solid var(--color-brand-light);
    border-radius: var(--radius-lg);
    padding: 12px 16px;
    font-size: 0.75rem;
    color: var(--color-text-2);
    line-height: 1.6;
  }

  /* ── Tooltip ───────────────────────────────────────────────────── */
  .ow-tooltip {
    background: var(--color-surface-dark);
    border: 1px solid var(--color-surface-dark-2);
    border-radius: var(--radius-md);
    padding: 6px 10px;
    font-size: 0.75rem;
    color: var(--color-text-inv);
    box-shadow: var(--shadow-lg);
    pointer-events: none;
    max-width: 280px;
  }

  /* ── Signal Card (list item) ───────────────────────────────────── */
  .ow-signal-card {
    background: var(--color-canvas);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 14px 16px;
    transition: border-color 120ms, background 120ms, box-shadow 120ms, transform 120ms;
    cursor: pointer;
    text-decoration: none;
    display: block;
  }
  .ow-signal-card:hover {
    border-color: var(--color-border-strong);
    background: var(--color-surface-2);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
  .ow-signal-card-critical { border-left: 3px solid var(--color-critical); }
  .ow-signal-card-high     { border-left: 3px solid var(--color-high); }
  .ow-signal-card-medium   { border-left: 3px solid var(--color-medium); }
  .ow-signal-card-low      { border-left: 3px solid var(--color-low); }
```

- [ ] **Step 3: Replace command palette block**

Find `/* ── Command Palette ────…` through `.ow-cmd-item.selected` rule. Replace with:

```css
  /* ── Command Palette ───────────────────────────────────────────── */
  .ow-cmd-overlay {
    position: fixed; inset: 0;
    background: rgba(10, 17, 41, 0.45);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 15vh;
  }
  .ow-cmd-box {
    width: 100%; max-width: 560px;
    background: var(--color-canvas);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
  }
  .ow-cmd-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    padding: 14px 16px;
    outline: none;
  }
  .ow-cmd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    font-size: 0.875rem;
    color: var(--color-text);
    cursor: pointer;
    transition: background 80ms;
  }
  .ow-cmd-item:hover,
  .ow-cmd-item.selected {
    background: var(--color-surface-2);
    color: var(--color-text);
  }
```

- [ ] **Step 4: Replace investigation-system blocks (brief-section, rail-card, timeline, score-dial, entity-chip)**

Find the section starting `/* ── Investigation Design System ────…` and ending at the closing `}` of `.ow-entity-chip-name`. Replace **everything except the masthead block already replaced in Task 10** with:

```css
  /* ── Investigation Design System ─────────────────────────────────── */

  .ow-brief-section {
    display: flex; align-items: baseline; gap: 10px;
    padding: 0 0 12px 0;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 20px;
  }
  .ow-brief-section-num {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--color-brand);
    letter-spacing: 0.08em;
  }
  .ow-brief-section-title {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .ow-rail-card {
    position: relative;
    background: var(--color-canvas);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .ow-rail-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--rail-color, var(--color-brand));
  }
  .ow-rail-card-body { padding: 16px 16px 16px 20px; }

  .ow-timeline {
    position: relative;
    padding-left: 24px;
  }
  .ow-timeline::before {
    content: '';
    position: absolute;
    left: 7px; top: 8px; bottom: 8px;
    width: 2px;
    background: linear-gradient(180deg, var(--color-border) 0%, transparent 100%);
  }
  .ow-timeline-event {
    position: relative;
    padding: 0 0 20px 20px;
  }
  .ow-timeline-event::before {
    content: '';
    position: absolute;
    left: -17px; top: 7px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--event-color, var(--color-border-strong));
    border: 2px solid var(--color-canvas);
    box-shadow: 0 0 0 1px var(--event-color, var(--color-border-strong));
  }
  .ow-timeline-event-type {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--event-color, var(--color-text-3));
  }
  .ow-timeline-event-body {
    background: var(--color-canvas);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--event-color, var(--color-border-strong));
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    padding: 12px 14px;
    margin-top: 6px;
  }

  .ow-score-dial { display: flex; align-items: center; gap: 12px; }
  .ow-score-dial-value {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--color-text);
    min-width: 3ch;
  }
  .ow-score-dial-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-3);
  }

  .ow-entity-chip {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 10px 5px 5px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: border-color 120ms, background 120ms;
    text-decoration: none;
  }
  .ow-entity-chip:hover {
    border-color: var(--color-brand-light);
    background: var(--color-brand-tint);
  }
  .ow-entity-chip-avatar {
    width: 22px; height: 22px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ow-entity-chip-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
```

- [ ] **Step 5: Verify + commit**

```bash
pnpm --filter ./apps/web build
git add apps/web/src/app/globals.css
git commit -m "feat(design): light retoning for skeleton/alert/signal-card/timeline/etc"
```

---

## Task 12: Mode classes (`.ow-mode-editorial`, `.ow-mode-working`) + container utilities

**Files:**
- Modify: `apps/web/src/app/globals.css` (insert before the `.ow-page` rule in `@layer components`)

The mode classes set CSS custom properties that drive section padding and container max-width. Pages opt in by adding the appropriate class at their root.

- [ ] **Step 1: Add the mode classes**

Find the `.ow-page` rule near the start of `@layer components`. Insert this block immediately before it:

```css
  /* ── Layout Modes ──────────────────────────────────────────────── */
  /* Editorial — home, methodology, marketing surfaces.
     Generous whitespace, max 1200px container. */
  .ow-mode-editorial {
    --section-pad-y: 80px;
    --container-max: 1200px;
    --content-pad-x: 32px;
  }
  @media (max-width: 1024px) {
    .ow-mode-editorial { --section-pad-y: 64px; }
  }
  @media (max-width: 768px) {
    .ow-mode-editorial { --section-pad-y: 48px; --content-pad-x: 20px; }
  }

  /* Working — radar/dossie/signal/investigation/coverage/entity/org/case.
     Information density preserved. Full content width minus sidebar. */
  .ow-mode-working {
    --section-pad-y: 24px;
    --container-max: 100%;
    --content-pad-x: 24px;
  }

  /* Section + container utilities driven by mode tokens */
  .ow-section { padding-top: var(--section-pad-y); padding-bottom: var(--section-pad-y); }
  .ow-container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding-left: var(--content-pad-x);
    padding-right: var(--content-pad-x);
    width: 100%;
  }
```

- [ ] **Step 2: Update the `.ow-content` rule to use the container tokens**

Find:

```css
  .ow-content {
    flex: 1;
    padding: 24px 24px 48px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
  }
```

Replace with:

```css
  .ow-content {
    flex: 1;
    padding: 24px var(--content-pad-x) 48px;
    max-width: var(--container-max);
    width: 100%;
    margin: 0 auto;
  }
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm --filter ./apps/web build
git add apps/web/src/app/globals.css
git commit -m "feat(design): mode classes (editorial/working) + container utilities"
```

---

## Task 13: New `OpenWatchLogo` component — Aperture mark + Geist wordmark

**Files:**
- Modify: `apps/web/src/components/OpenWatchLogo.tsx` (full rewrite)

The current logo is a compass/map composite from the dark/teal era. Replace with an Aperture mark (concentric thin rings forming a camera-iris symbol) per spec §2.

- [ ] **Step 1: Replace the file**

Overwrite `apps/web/src/components/OpenWatchLogo.tsx` with:

```tsx
import { clsx } from "clsx";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, number> = {
  sm: 24,
  md: 28,
  lg: 36,
};

interface OpenWatchLogoMarkProps {
  size?: LogoSize;
  className?: string;
  /**
   * Render variant. "default" uses --color-brand on a transparent ground.
   * "inverse" uses white on --color-brand (for dark surfaces).
   */
  variant?: "default" | "inverse";
}

/**
 * Aperture mark — concentric thin rings forming a camera-iris symbol.
 * Reads as "lens on power." Pure geometry, no decorative fill.
 */
export function OpenWatchLogoMark({
  size = "md",
  className,
  variant = "default",
}: OpenWatchLogoMarkProps) {
  const px = sizeMap[size];
  const stroke = variant === "inverse" ? "var(--color-brand-text)" : "var(--color-brand)";

  return (
    <span
      className={clsx("inline-flex items-center justify-center ow-brand-mark", className)}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        width={px}
        height={px}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="16" cy="16" r="13" stroke={stroke} strokeWidth="1.5" />
        {/* Mid ring */}
        <circle cx="16" cy="16" r="9" stroke={stroke} strokeWidth="1.5" opacity="0.65" />
        {/* Inner pupil — solid */}
        <circle cx="16" cy="16" r="3.2" fill={stroke} />
        {/* Aperture blades — three short tangent strokes (geometric, not literal) */}
        <path d="M16 3 L16 7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27.26 22.5 L23.79 20.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4.74 22.5 L8.21 20.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

interface OpenWatchLogoProps {
  size?: LogoSize;
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "inverse";
}

export function OpenWatchLogo({
  size = "md",
  className,
  showWordmark = true,
  variant = "default",
}: OpenWatchLogoProps) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <OpenWatchLogoMark size={size} variant={variant} />
      {showWordmark && <span className="ow-sidebar-wordmark">OpenWatch</span>}
    </span>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web build
```

Expected: clean. The new mark renders via `--color-brand` (court navy) without any extra wiring.

- [ ] **Step 3: Manual visual check (dev server)**

```bash
pnpm --filter ./apps/web dev &
sleep 6
open http://localhost:3000/
```

Confirm: topbar shows new aperture mark + "OpenWatch" wordmark in navy on white. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/OpenWatchLogo.tsx
git commit -m "feat(brand): replace compass logo with Aperture mark + Geist wordmark"
```

---

## Task 14: Favicon set

**Files:**
- Create: `apps/web/public/favicon.svg`
- Create: `apps/web/public/icon.svg` (Next.js convention — auto-served at `/icon`)
- Modify: `apps/web/src/app/layout.tsx` (add `icons` to metadata)

Next.js 15 auto-discovers `app/icon.svg` and `app/apple-icon.png` in the app directory, but for a global favicon at the public root we add `favicon.svg`. We'll provide both so legacy browsers and Next.js's auto-icon feature both work.

- [ ] **Step 1: Create `apps/web/public/favicon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1B2B5C"/>
  <circle cx="16" cy="16" r="10" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>
  <circle cx="16" cy="16" r="6.5" stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity="0.65"/>
  <circle cx="16" cy="16" r="2.4" fill="#FFFFFF"/>
  <path d="M16 5 L16 8.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M25.5 21 L22.5 19.3" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M6.5 21 L9.5 19.3" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Add `apps/web/src/app/icon.svg`** (same content as favicon.svg — Next.js will serve it at `/icon` automatically)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1B2B5C"/>
  <circle cx="16" cy="16" r="10" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>
  <circle cx="16" cy="16" r="6.5" stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity="0.65"/>
  <circle cx="16" cy="16" r="2.4" fill="#FFFFFF"/>
  <path d="M16 5 L16 8.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M25.5 21 L22.5 19.3" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M6.5 21 L9.5 19.3" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Add explicit `icons` field to `metadata` in `apps/web/src/app/layout.tsx`**

Find the `metadata` export (line 28-49). Add an `icons` field after `description`:

```tsx
  description:
    "Plataforma pública e open-source de auditoria cidadã sobre dados do governo federal brasileiro. Sinais de risco, evidências e investigações baseadas em dados abertos.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  keywords: [
```

- [ ] **Step 4: Verify**

```bash
pnpm --filter ./apps/web build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/public/favicon.svg apps/web/src/app/icon.svg apps/web/src/app/layout.tsx
git commit -m "feat(brand): aperture favicon set + icon metadata"
```

---

## Task 15: Page audit — apply mode classes

**Files (route page.tsx):**
- Modify: `apps/web/src/app/page.tsx` → editorial
- Modify: `apps/web/src/app/methodology/page.tsx` → editorial
- Modify: `apps/web/src/app/compliance/page.tsx` → editorial (verify)
- Modify: `apps/web/src/app/api-health/page.tsx` → working
- Modify: `apps/web/src/app/case/[id]/page.tsx` → working
- Modify: `apps/web/src/app/compare/page.tsx` → working
- Modify: `apps/web/src/app/coverage/page.tsx` → working
- Modify: `apps/web/src/app/entity/[id]/page.tsx` → working
- Modify: `apps/web/src/app/investigation/[caseId]/page.tsx` → working
- Modify: `apps/web/src/app/org/[id]/page.tsx` → working
- Modify: `apps/web/src/app/radar/page.tsx` → working (already in M state from in-progress work — coordinate)
- Modify: `apps/web/src/app/radar/juridico/page.tsx` → working
- Modify: `apps/web/src/app/radar/rede/page.tsx` → working
- Modify: `apps/web/src/app/signal/page.tsx` → working
- Modify: `apps/web/src/app/signal/[id]/page.tsx` → working

**Important:** The repo already has 8 modified-but-uncommitted files from prior work (see Task 1). Several overlap with this audit list (`page.tsx`, `radar/page.tsx`, `radar/dossie/[caseId]/layout.tsx`). For overlapping files, **inspect the existing modifications first**, then add the mode class without disturbing the in-progress work. If an overlapping change is incompatible (e.g. it sets a conflicting wrapper class), pause and ask before modifying.

- [ ] **Step 1: Audit overlap with in-progress changes**

```bash
git diff --name-only -- apps/web/src/app
git diff --name-only -- apps/web/src/components/pages
```

Read each overlapping file and confirm the existing edits do not already introduce a conflicting wrapper. If they do, stop and ask.

- [ ] **Step 2: For each route file, ensure the top-level returned element has the appropriate mode class**

Pattern — find the outermost JSX element returned by the page component and add the class to it:

```tsx
// Editorial example (apps/web/src/app/methodology/page.tsx)
return (
  <div className="ow-mode-editorial">
    {/* existing content */}
  </div>
);

// Working example (apps/web/src/app/coverage/page.tsx)
return (
  <div className="ow-mode-working">
    {/* existing content */}
  </div>
);
```

If the page returns a Fragment (`<>…</>`), wrap it in a `<div>` with the mode class. If it returns an existing top-level `div`, add the mode class to its `className` (use `clsx` if multiple classes).

- [ ] **Step 3: Verify after each batch of 3-5 pages**

```bash
pnpm --filter ./apps/web typecheck
```

- [ ] **Step 4: Manual smoke-test**

```bash
pnpm --filter ./apps/web dev &
sleep 6
for path in / /methodology /coverage /radar /signal /compliance; do
  curl -s -o /dev/null -w "$path → %{http_code}\n" "http://localhost:3000$path"
done
kill %1 2>/dev/null
```

Expected: all routes 200.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app
git commit -m "feat(layout): apply mode classes (editorial/working) to all routes"
```

---

## Task 16: Decorative-debt sweep — gradients + hardcoded dark Tailwind classes

**Files:**
- Sweep across `apps/web/src/components/**/*.tsx` and `apps/web/src/components/pages/**/*.tsx` for inline dark hex / dark-Tailwind classes.
- Audit baseline: 28 occurrences in components (per pre-flight grep).

- [ ] **Step 1: Identify the targets**

```bash
grep -rEn "bg-(slate|zinc|gray|neutral|stone)-[789]00|bg-black|bg-\[#0|text-white" \
  apps/web/src/components --include="*.tsx" > /tmp/ow-darksweep.txt
wc -l /tmp/ow-darksweep.txt
cat /tmp/ow-darksweep.txt
```

Expected: ~28 lines. Group by file.

- [ ] **Step 2: Remap each occurrence**

| Found | Replace with |
|---|---|
| `bg-black/60`, `bg-black/45`, `bg-black/30` | `bg-[rgba(10,17,41,0.45)]` (overlay tone) |
| `bg-slate-900`, `bg-zinc-900`, `bg-gray-900` | `bg-[var(--color-canvas)]` if surface, `bg-[var(--color-surface)]` if raised, `bg-[var(--color-surface-dark)]` if intentionally dark |
| `bg-slate-800`, etc. | `bg-[var(--color-surface)]` |
| `text-white` (on dark bg context) | keep if context is genuinely dark (graph panel, masthead inverse); otherwise `text-[var(--color-text)]` |
| `bg-error text-white`, `bg-warning text-white`, `bg-amber-500 text-white`, `bg-info text-white` (in `SignalCard.tsx`) | use `ow-badge-*` classes instead — `<span className="ow-badge ow-badge-critical">…` |
| `bg-severity-critical text-white`, etc. (in `RadarCaseCard.tsx`) | use `ow-badge-*` pattern, or keep as semantic class if Tailwind v4 theme defines it |
| `bg-accent text-white` (filter chips) | `bg-[var(--color-brand)] text-[var(--color-brand-text)]` |
| `bg-[var(--color-secondary)] text-white …` (`InvestigationSidebar.tsx:189`) | `ow-btn ow-btn-primary ow-btn-md` |

For the `SignalCard.tsx` and `RadarCaseCard.tsx` cases (severity flags), prefer migrating the JSX to use `ow-badge` semantic classes rather than inlining color tokens — those are exactly the components the design system was built for.

Edit one file at a time. After each file, re-run `pnpm --filter ./apps/web typecheck`.

- [ ] **Step 3: Re-grep — should be near zero**

```bash
grep -rEn "bg-(slate|zinc|gray|neutral|stone)-[789]00|bg-black|bg-\[#0" \
  apps/web/src/components --include="*.tsx" | wc -l
```

Expected: 0 (or only intentionally-dark occurrences in graph/tooltip contexts — confirm each one is intentional). `text-white` may legitimately remain inside a dark surface (graph panel, masthead) — those are OK; document each remaining occurrence in the commit message.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components
git commit -m "chore(design): sweep hardcoded dark hex / dark-Tailwind classes

Remap to design tokens. Severity flags in SignalCard/RadarCaseCard now
use ow-badge-* classes. text-white preserved only where the parent
surface is intentionally dark (graph panel, masthead inverse)."
```

---

## Task 17: Final verification + dev-server walkthrough

**Files:** none — verification only.

- [ ] **Step 1: Full type/lint/build cycle**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web build
```

All three must be clean. If lint flags new warnings, fix them inline (do not suppress).

- [ ] **Step 2: Dev-server walkthrough — every major route**

```bash
pnpm --filter ./apps/web dev &
sleep 8
for path in / /methodology /coverage /radar /radar/juridico /radar/rede /signal /compliance /api-health; do
  curl -s -o /dev/null -w "$path → %{http_code}\n" "http://localhost:3000$path"
done
```

Expected: all 200. Then open the dev URL in a browser and confirm visually:
- Topbar: white frosted, 56px tall, new Aperture mark + "OpenWatch" wordmark in navy.
- Sidebar: white, navy active state with left-border accent.
- Home (`/`): editorial mode — generous spacing, larger hero type.
- Coverage / Radar / Signal: working mode — dense tables, 14px body, 28px page titles.
- Severity badges/chips render in retoned light tones.
- Graph view (if reachable from /radar/rede): dark canvas inside light page chrome.
- No teal anywhere except severity-low (which is now `#067647` green).
- Selection color is navy-tinted.
- Focus rings are navy-tinted.

```bash
kill %1 2>/dev/null
```

- [ ] **Step 3: Confirm git log**

```bash
git log --oneline e147dec..HEAD
```

Expected: 16 commits since the spec commit (one per Task 2-16 — Task 1 has no commit, Task 17 is verification only). Each commit message starts with `feat(design):` / `feat(brand):` / `feat(layout):` / `chore(design):` / `chore(layout):`.

- [ ] **Step 4: Optional follow-up — alias cleanup**

(Spec §7 step 8: backward-compat aliases retained through entire refactor; removed only after full audit + visual QA.) Once the visual walkthrough above is clean and the team is comfortable, file a follow-up plan to delete the legacy alias block in `globals.css` (`--color-amber*`, `--color-primary*`, `--color-newsprint*`, etc.) and any remaining consumers. **Do not perform alias cleanup as part of this plan** — it deserves its own audit pass.

- [ ] **Step 5: No final commit needed unless lint/typecheck fixes happened above.**

---

## Self-review checklist (already performed by author; included for executor reference)

- **Spec coverage:** §2 brand → Task 13 (logo) + Task 14 (favicon). §3 tokens → Task 2. §4 typography → Task 2 (`@theme` font tokens) + Task 3 (font loading verified). §5 components → Tasks 5-11. §6 mode preservation → Task 12 + Task 15. §7 refactor strategy → Tasks 1-17 (8 spec steps mapped to bite-sized tasks). §8 acceptance criteria → Task 17 walkthrough.
- **Topbar height bump (48→56):** spec §5.7 migration note covered in Task 2 `@theme` token + Task 7 component layer.
- **Backward-compat aliases:** preserved in Task 2 `@theme` (legacy alias block) and called out for follow-up cleanup in Task 17 step 4.
- **In-progress uncommitted work:** flagged in Task 1 + Task 15 step 1 (overlap audit).
- **Graph canvas dark preservation:** Task 11 step 2 — `.ow-graph-panel` keeps `--color-surface-dark` background per spec §6.1.

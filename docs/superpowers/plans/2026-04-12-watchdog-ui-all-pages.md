# Watchdog UI — All Pages Refactoring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip all remaining "AI-made UI" decorative patterns (gradients, glassmorphism, glow) from every route under `/radar/*`, `/coverage/*`, `/methodology/*`, `/compliance/*`, `/api-health/*`, and shared UI primitives.

**Architecture:** All route page files are already watchdog-compliant (exploration confirmed). Violations live in two places: (1) shared CSS utility classes in `globals.css` that bleed into every page via design-system components, (2) three specific header/stat components that use `.ow-card-glass` (glassmorphism), and (3) the 404 page's decorative icon container. Fixing the CSS utilities fixes the route pages automatically.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4 (`@theme` tokens in `globals.css`, no `tailwind.config.ts`), design system classes (`.ow-card`, `.ow-card-glass`, `.ow-page-header-hero`)

---

## Violations Map

| Violation | File | Lines | Affects |
|-----------|------|-------|---------|
| `.ow-page-header-hero` radial+linear gradient bg + box-shadow | `globals.css` | 593–601 | radar, coverage, methodology, compliance, api-health, case, signal pages |
| `.ow-page-header::after` gradient accent line | `globals.css` | 603–612 | same as above |
| `.ow-page-header-icon-hero` radial+linear gradient icon bg | `globals.css` | 632–638 | same as above |
| `.ow-card` subtle `linear-gradient` background | `globals.css` | 730–731 | every card in the app |
| `.ow-card-glass` glassmorphism (`backdrop-filter: blur`) + gradient bg | `globals.css` | 737–740 | RadarHeader, CoverageHeader, CoverageSummaryStrip |
| Decorative icon glow ring | `not-found.tsx` | 8–17 | 404 page |

## File Map

| File | Change |
|------|--------|
| `apps/web/src/app/globals.css` | Fix `.ow-page-header-hero`, `.ow-page-header::after`, `.ow-page-header-icon-hero`, `.ow-card`, `.ow-card-glass` |
| `apps/web/src/app/not-found.tsx` | Remove decorative circular glow container around Search icon |

**Unchanged (confirmed clean):**
- All route page.tsx files (radar/, coverage/, methodology/, compliance/, api-health/ and their sub-routes) — no inline violations
- `error.tsx` files — `--color-critical-bg` is semantic error state, not decoration
- `RadarHeader.tsx`, `CoverageHeader.tsx`, `CoverageSummaryStrip.tsx` — JSX is fine, violations are in the CSS classes they consume

---

### Task 1: Fix `.ow-page-header-hero` and related hero CSS

**Files:**
- Modify: `apps/web/src/app/globals.css:593–638`

**Context:** `.ow-page-header-hero` is used by `<PageHeader variant="hero" />` across radar, coverage, methodology, compliance, api-health, case detail, and signal detail pages. Current state has:
- `radial-gradient + linear-gradient` as background (decorative "glow" on the hero header container)
- `box-shadow: 0 10px 30px rgba(2, 8, 23, 0.12)` (decorative depth)
- `.ow-page-header::after` gradient bar (teal gradient accent line under the header)
- `.ow-page-header-icon-hero` radial + linear gradient (decorative icon background)

Structural styles (padding, border, border-radius, position) stay. Only decorative effects are stripped.

- [ ] **Step 1: Replace `.ow-page-header-hero` — strip gradients + shadow**

In `apps/web/src/app/globals.css`, find and replace:

```css
  .ow-page-header-hero {
    padding: 20px 22px;
    border: 1px solid color-mix(in srgb, var(--color-brand) 24%, var(--color-border));
    border-radius: calc(var(--radius-lg) + 4px);
    background:
      radial-gradient(circle at top left, rgba(45, 212, 191, 0.12), transparent 42%),
      linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 94%, white 6%), color-mix(in srgb, var(--color-surface-2) 96%, var(--color-brand-dim) 4%));
    box-shadow: 0 10px 30px rgba(2, 8, 23, 0.12);
  }
```

With:

```css
  .ow-page-header-hero {
    padding: 20px 22px;
    border: 1px solid color-mix(in srgb, var(--color-brand) 24%, var(--color-border));
    border-radius: calc(var(--radius-lg) + 4px);
    background: var(--color-surface);
  }
```

- [ ] **Step 2: Replace `.ow-page-header::after` — strip gradient accent line**

Find and replace:

```css
  .ow-page-header::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 88px;
    height: 2px;
    background: linear-gradient(90deg, var(--color-brand), var(--color-brand-light));
    border-radius: 999px;
  }
```

With:

```css
  .ow-page-header::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 88px;
    height: 2px;
    background: var(--color-brand);
    border-radius: 999px;
  }
```

- [ ] **Step 3: Replace `.ow-page-header-icon-hero` — strip gradient icon background**

Find and replace:

```css
  .ow-page-header-icon-hero {
    width: 48px;
    height: 48px;
    background:
      radial-gradient(circle at 30% 30%, rgba(45, 212, 191, 0.24), transparent 65%),
      linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(8, 39, 43, 0.96));
  }
```

With:

```css
  .ow-page-header-icon-hero {
    width: 48px;
    height: 48px;
    background: var(--color-brand-dim);
  }
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "style: strip decorative gradients and shadow from ow-page-header-hero

Remove radial+linear gradient backgrounds, box-shadow, and gradient
accent line from .ow-page-header-hero, .ow-page-header::after, and
.ow-page-header-icon-hero. Replace with flat semantic colors.

Fixes all pages using PageHeader variant='hero': radar, coverage,
methodology, compliance, api-health, case detail, signal detail."
```

---

### Task 2: Fix `.ow-card` and `.ow-card-glass` — strip glassmorphism

**Files:**
- Modify: `apps/web/src/app/globals.css:730–740`

**Context:**

`.ow-card` (line 730): uses `linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 96%, white 4%), var(--color-surface))` — subtle gradient (4% white). Per watchdog rules, cards should have flat backgrounds.

`.ow-card-glass` (line 737): glassmorphism — `backdrop-filter: blur(12px)` + `linear-gradient(180deg, rgba(17, 24, 39, 0.78), rgba(15, 23, 42, 0.84))`. This is the most egregious violation. Used in:
- `RadarHeader.tsx:7` — `ow-card ow-card-glass ow-card-signal`
- `CoverageHeader.tsx:12` — `ow-card ow-card-glass ow-card-signal`
- `CoverageSummaryStrip.tsx:41,51,62,75` — `ow-card ow-card-glass` on stat cards

Fix `.ow-card` to flat background. Fix `.ow-card-glass` to flat darker surface (keeps the "glass/overlay" visual intent without the blur and gradient).

- [ ] **Step 1: Replace `.ow-card` background — remove subtle gradient**

Find and replace:

```css
  .ow-card {
    background: linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 96%, white 4%), var(--color-surface));
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
```

With:

```css
  .ow-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
```

- [ ] **Step 2: Replace `.ow-card-glass` — strip glassmorphism and gradient**

Find and replace:

```css
  .ow-card-glass {
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.78), rgba(15, 23, 42, 0.84));
    backdrop-filter: blur(12px);
  }
```

With:

```css
  .ow-card-glass {
    background: var(--color-surface-2);
  }
```

This keeps the card visually distinct (slightly darker than `.ow-card`) without blur or gradient. `RadarHeader`, `CoverageHeader`, `CoverageSummaryStrip` stats will inherit the fix automatically — no JSX changes needed.

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "style: strip glassmorphism and gradient from ow-card and ow-card-glass

Replace ow-card gradient bg with flat --color-surface.
Replace ow-card-glass backdrop-filter+gradient with flat --color-surface-2.
Fixes RadarHeader, CoverageHeader, and CoverageSummaryStrip stat cards
which consumed the glassmorphism class."
```

---

### Task 3: Remove decorative icon container from `not-found.tsx`

**Files:**
- Modify: `apps/web/src/app/not-found.tsx:8–17`

**Context:** The 404 page wraps a Search icon in a decorative circular div with `background: rgba(220,38,38,0.08)` + `border: 2px solid rgba(220,38,38,0.20)` — a red glow aura ring. The icon itself is semantic. The circular container is not.

- [ ] **Step 1: Remove the decorative wrapper div, keep the icon**

In `apps/web/src/app/not-found.tsx`, replace:

```tsx
      {/* Icon */}
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: "rgba(220,38,38,0.08)",
          border: "2px solid rgba(220,38,38,0.20)",
        }}
        aria-hidden="true"
      >
        <Search className="h-9 w-9 text-[var(--color-error)]" />
      </div>
```

With:

```tsx
      {/* Icon */}
      <Search
        className="mb-6 h-9 w-9 text-[var(--color-critical)]"
        aria-hidden="true"
      />
```

Note: `--color-error` is not a defined token. Use `--color-critical` which is the canonical red token (`#ef4444`) throughout this codebase.

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/not-found.tsx
git commit -m "style: remove decorative glow ring from 404 icon

Replace rgba circular container (red aura) around Search icon with
the bare icon. Also corrects --color-error to --color-critical which
is the defined token for red in this design system."
```

---

### Task 4: Build verification

**Files:** None modified — verification only.

- [ ] **Step 1: Run full build**

```bash
pnpm build
```

Expected: exits 0.

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Spot-check visually in dev**

```bash
pnpm dev
```

Open browser and verify:
- `/radar` — PageHeader hero: flat surface bg, no glow. RadarHeader card: no blur, flat bg.
- `/coverage` — CoverageHeader: no blur. Stat strip cards: flat bg, readable.
- `/methodology` — PageHeader hero: flat.
- `/compliance` — PageHeader hero: flat.
- Any 404 URL — Search icon shows without red glow ring.

---

## Self-Review

**Spec coverage:**
- ✅ No gradients as identity → `.ow-page-header-hero`, `.ow-card`, `.ow-card-glass` all fixed
- ✅ No glassmorphism → `.ow-card-glass` `backdrop-filter: blur(12px)` removed
- ✅ No glowing icon containers → `not-found.tsx` rgba ring removed
- ✅ All pages under /radar/*, /coverage/*, /methodology/*, /compliance/*, /api-health/* covered by CSS fixes
- ✅ No JSX changes needed in route page files (confirmed clean)
- ✅ `error.tsx` files untouched — `--color-critical-bg` is semantic

**What's NOT changed (intentional):**
- `.ow-card-signal` box-shadow — `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(20,184,166,0.06)` — extremely subtle inset highlight + 6% brand ring. Structural, not decorative identity.
- `.ow-card-hover` hover state box-shadow — interactive feedback, not identity
- `.ow-sidebar-logo-mark` gradient — this is the product logo mark, a single 28×28px icon. Not a page-level pattern.
- `--shadow-brand` on small icon containers in RadarHeader/CoverageHeader — small icon badge accent, not a surface-level pattern
- `.ow-page-header-stat` `color-mix` background — structural (distinguishes stat cells from card bg), not decorative gradient

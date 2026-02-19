# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Sing Buri Adventist Center
**Generated:** 2026-02-19
**Updated:** 2026-02-19 (Typography override: Lexend + Source Sans 3)
**Category:** Church Community Platform

---

## Global Rules

### Color Palette

| Role       | Hex       | CSS Variable         |
| ---------- | --------- | -------------------- |
| Primary    | `#1E40AF` | `--color-primary`    |
| Secondary  | `#3B82F6` | `--color-secondary`  |
| CTA/Accent | `#F59E0B` | `--color-cta`        |
| Background | `#F8FAFC` | `--color-background` |
| Text       | `#1E3A8A` | `--color-text`       |
| Success    | `#16A34A` | `--color-success`    |
| Warning    | `#D97706` | `--color-warning`    |
| Error      | `#DC2626` | `--color-error`      |
| Muted      | `#64748B` | `--color-muted`      |

**Color Notes:** Blue trust + amber CTA highlights. Warm and welcoming for a church community app.

### Typography

- **Heading Font:** Lexend
- **Body Font:** Source Sans 3
- **Mono Font:** Fira Code (code blocks, tabular numbers)
- **Mood:** warm, welcoming, community, spiritual, approachable, readable
- **Google Fonts:** [Lexend + Source Sans 3](https://fonts.google.com/share?selection.family=Lexend:wght@300;400;500;600;700|Source+Sans+3:wght@300;400;500;600;700)

**CSS Import:**

```css
@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap");
```

**Tailwind Config (already configured):**

```js
fontFamily: {
  heading: ['Lexend', 'system-ui', 'sans-serif'],
  body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
  mono: ['Fira Code', 'ui-monospace', 'monospace'],
}
```

### Spacing Variables

| Token         | Value             | Usage                     |
| ------------- | ----------------- | ------------------------- |
| `--space-xs`  | `4px` / `0.25rem` | Tight gaps                |
| `--space-sm`  | `8px` / `0.5rem`  | Icon gaps, inline spacing |
| `--space-md`  | `16px` / `1rem`   | Standard padding          |
| `--space-lg`  | `24px` / `1.5rem` | Section padding           |
| `--space-xl`  | `32px` / `2rem`   | Large gaps                |
| `--space-2xl` | `48px` / `3rem`   | Section margins           |
| `--space-3xl` | `64px` / `4rem`   | Hero padding              |

### Shadow Depths

| Level         | Value                          | Usage                       |
| ------------- | ------------------------------ | --------------------------- |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)`   | Subtle lift                 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)`    | Cards, buttons              |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)`  | Modals, dropdowns           |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #f59e0b;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition:
    background-color 200ms ease,
    transform 200ms ease,
    box-shadow 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: #d97706;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #1e40af;
  border: 2px solid #1e40af;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition:
    background-color 200ms ease,
    border-color 200ms ease,
    color 200ms ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #1e40af;
  color: white;
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition:
    box-shadow 200ms ease,
    transform 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.input:focus {
  border-color: #1e40af;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.12);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Warm Community Platform with Data-Dense Admin

**Keywords:** Welcoming, community-focused, spiritual, clean layout, accessible, warm colors with blue trust anchors, amber CTAs

**Best For:** Church management, community engagement, event coordination, member directory, spiritual content

**Key Effects:** Smooth scroll reveal, gentle fade-in animations, warm hover transitions, card lift effects, CTA glow pulse, loading spinners with brand colors

### Page Pattern

**Pattern Name:** Community/Forum Landing

- **Conversion Strategy:** Show active community (member count, posts today). Highlight benefits. Preview content. Easy onboarding.
- **CTA Placement:** Join button prominent + After member showcase
- **Section Order:** 1. Hero (community value prop), 2. Popular topics/categories, 3. Active members showcase, 4. Join CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Ornate design
- ❌ No filtering
- ❌ `transition: all` — always list properties explicitly

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

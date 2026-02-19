# Auth Page Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Updated:** 2026-02-19
> **Page Type:** Authentication (Login, MFA, Password Reset)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Login:** Split-panel — left 50% hero image (hidden mobile), right 50% centered form. Max card width 448px.
- **MFA / Password Reset:** Single centered card, max 448–512px, `min-h-screen` vertical center.
- **Mobile:** Full-width form only; hero panel collapses. Show logo + church name above card.

### Spacing Overrides

- Card inner padding: `p-6` (sm: `p-8`)
- Form field gap: `space-y-4`
- Card to page edge: `px-4 py-12`

### Typography Overrides

- Card title: `text-2xl font-bold tracking-tight` (Lexend), center-aligned
- Card description: `text-muted-foreground text-center`
- Form labels: `text-sm font-medium text-foreground`

### Color Overrides

- Hero gradient: `from-blue-900/80 via-blue-800/70 to-slate-900/80`
- Feature icons in hero: `text-amber-300` on `bg-white/10`
- Error alerts: `variant="destructive"` (shadcn default)

### Component Overrides

- Email inputs: `spellCheck={false}`, `autoCapitalize="none"`, `autoComplete="email"`
- Password inputs: `autoComplete="current-password"` (login) or `autoComplete="new-password"` (reset)
- MFA code input: `inputMode="numeric"`, `pattern="[0-9]*"`, `maxLength={6}`, `text-center text-2xl tracking-widest`
- Loading text: Use `…` (U+2026) not `...`
- Hero images: Include `width`, `height`, `fetchPriority="high"`, `loading="eager"`

---

## Page-Specific Components

- `BackupCodesDisplay` — Shows MFA backup codes after enrollment
- Split-panel hero — Reusable left-panel with gradient overlay pattern

---

## Recommendations

- Effects: Badge hover effects, metric pulse animations, certificate carousel, smooth stat reveal
- CTA Placement: Register CTA sticky + After speakers + Bottom

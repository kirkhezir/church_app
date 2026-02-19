# Members Page Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Generated:** 2026-02-19
> **Page Type:** Member Directory / Profiles

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px
- **Layout:** Grid of member cards + search/filter bar at top
- **Grid:** Responsive: 1 col mobile, 2 col tablet, 3 col desktop, 4 col wide
- **Sections:** 1. Search bar with role filter, 2. Member count, 3. Member cards grid

### Spacing Overrides

- **Card gap:** `--space-md` (16px) — tighter grid for directory
- **Search bar:** Sticky top with blur backdrop

### Typography Overrides

- **Member names:** `font-heading` (Lexend), `font-weight: 500`
- **Role badges:** `text-xs`, `font-weight: 600`, `uppercase`
- **Member count:** `font-variant-numeric: tabular-nums`

### Color Overrides

- **Role badges:**
  - Admin: `#DC2626` bg with white text
  - Staff: `#1E40AF` bg with white text
  - Member: `#E2E8F0` bg with `#475569` text
- **Online indicator:** Green dot `#16A34A` with subtle pulse animation
- **Avatar placeholder:** Initials on `#1E40AF` background with white text

### Component Overrides

- **MemberCard:** Compact card — avatar, name, role badge, join date
- **Search:** Instant search (debounced 300ms), highlight matching text

---

## Page-Specific Components

### MemberCard

- Avatar: 48px circle, `loading="lazy"`, fallback to initials
- Name: Single line, truncate with `text-ellipsis`
- Role badge: Inline pill next to name
- Click: Navigate to member profile page
- Hover: Subtle lift + shadow

### MemberSearch

- Search icon prefix, clear button when active
- Role dropdown filter (All, Admin, Staff, Member)
- Results count: "Showing X of Y members"

### MemberProfile (detail page)

- Large avatar (96px), full name, role, join date
- Contact info (if privacy allows), ministry involvement
- Activity summary: events attended, messages sent

---

## Recommendations

- Performance: Virtualize list if >50 members (`content-visibility: auto` on cards)
- Effects: Card entrance stagger (30ms per card), search results fade-in
- Accessibility: `role="search"` on search form, `aria-label` on member cards with full name
- Privacy: Respect member privacy settings — show/hide email, phone based on preferences
- Empty state: "No members found" with suggestion to adjust filters

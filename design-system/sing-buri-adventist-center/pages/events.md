# Events Page Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Generated:** 2026-02-19
> **Page Type:** Events Calendar / RSVP

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px
- **Layout:** Calendar grid view (default) + List view toggle
- **Grid:** Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- **Sections:** 1. Page header with filters, 2. View toggle (calendar/list), 3. Event cards grid, 4. Pagination

### Spacing Overrides

- **Card gap:** `--space-lg` (24px) between event cards
- **Filter bar:** Sticky top with `--space-md` padding, `backdrop-filter: blur(8px)`

### Typography Overrides

- **Event dates:** Use `font-variant-numeric: tabular-nums` for alignment
- **Category badges:** `font-weight: 600`, `text-transform: uppercase`, `font-size: 0.75rem`

### Color Overrides

- **Category badges:** Use distinct colors per category:
  - Worship: `#1E40AF` (primary blue)
  - Social: `#F59E0B` (amber)
  - Education: `#16A34A` (green)
  - Community: `#7C3AED` (purple)
  - Youth: `#EC4899` (pink)
- **RSVP button states:**
  - Available: CTA amber `#F59E0B`
  - Going: Success green `#16A34A`
  - Full: Muted `#94A3B8`
- **Past events:** Reduce opacity to 0.6

### Component Overrides

- **EventCard:** Must show: title, date/time, location, category badge, RSVP count, RSVP button
- **RSVP button:** Inline within card, not in a modal
- **Empty state:** Show illustration with "No upcoming events" + CTA to suggest an event

---

## Page-Specific Components

### EventCard

- Aspect ratio: 16:9 hero image (if available) with `loading="lazy"`
- Date overlay: Absolute-positioned date badge on image (day number large, month small)
- Hover: `translateY(-2px)` + shadow lift
- Click: Navigate to event detail

### EventFilters

- Category dropdown, date range picker, search input
- Active filters shown as removable chips/badges

### RSVPButton

- Three states: "RSVP" → "Going ✓" → "Cancel RSVP"
- Animate state transitions with color + icon swap (200ms)
- Show attendee count next to button

---

## Recommendations

- Effects: Card entrance stagger animation (50ms delay per card), smooth filter transitions, RSVP button micro-animation (scale bounce on click)
- Performance: Paginate at 12 events per page; lazy-load images
- Accessibility: `aria-label` on RSVP buttons with event name context, `role="list"` on event grid
- Empty states: Friendly illustration + "No events match your filters" with clear-filters link

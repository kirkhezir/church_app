# Announcements Page Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Generated:** 2026-02-19
> **Page Type:** Announcements / Bulletin Board

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 900px (reading-optimized)
- **Layout:** Single column, chronological feed
- **Sections:** 1. Page header with priority filter, 2. Pinned announcements, 3. Recent announcements feed, 4. Load more

### Spacing Overrides

- **Between announcements:** `--space-lg` (24px)
- **Announcement body:** Line-height 1.6 for readability

### Typography Overrides

- **Announcement titles:** `font-heading` (Lexend), `font-weight: 600`, `text-wrap: balance`
- **Body text:** `font-body` (Source Sans 3), 16px minimum
- **Timestamps:** `font-variant-numeric: tabular-nums`, muted color

### Color Overrides

- **Priority indicators:**
  - Urgent: `#DC2626` (red) left border + badge
  - High: `#F59E0B` (amber) left border + badge
  - Normal: `#3B82F6` (blue) left border
  - Low: `#64748B` (muted) left border
- **Pinned announcements:** Subtle amber background `#FFFBEB`
- **Unread indicator:** Blue dot `#3B82F6` on unread items

### Component Overrides

- **AnnouncementCard:** Left color border (4px) by priority + expand/collapse for long content
- **Read/unread state:** Unread items have slightly bolder title + blue dot indicator

---

## Page-Specific Components

### AnnouncementCard

- Left border colored by priority (4px solid)
- Title + author + timestamp header row
- Body with `line-clamp-3` (expandable on click)
- "Mark as read" implicit on view (no button needed)
- Priority badge: small pill in top-right

### PinnedSection

- Separated from main feed with subtle divider
- Max 3 pinned items visible, pin icon indicator

---

## Recommendations

- Effects: New announcement slide-in from top, priority badge pulse on urgent items, smooth expand/collapse for long content
- Accessibility: `aria-live="polite"` region for new announcements, semantic article elements, priority conveyed via text not just color
- Empty state: "No announcements yet" with peaceful illustration

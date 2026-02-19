# Messages Page Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Generated:** 2026-02-19
> **Page Type:** Internal Messaging / Inbox

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1000px
- **Layout:** Inbox list (default view) → Message detail (on click)
- **Mobile:** Full-width list, push to detail on tap
- **Desktop:** Can use split-pane (list left, detail right) if space allows

### Spacing Overrides

- **Between messages:** No gap — use horizontal dividers (`border-b`)
- **Message body:** `--space-md` padding, line-height 1.6

### Typography Overrides

- **Sender name:** `font-heading`, `font-weight: 600`
- **Subject line:** `font-weight: 500` (unread) / `font-weight: 400` (read)
- **Timestamp:** `font-variant-numeric: tabular-nums`, muted, right-aligned
- **Message body:** `font-body`, 16px, `white-space: pre-wrap`

### Color Overrides

- **Unread messages:** White background with blue left border (2px `#3B82F6`)
- **Read messages:** Subtle gray background `#F8FAFC`
- **Selected message:** Light blue background `#EFF6FF`
- **Compose button:** CTA amber `#F59E0B`

### Component Overrides

- **MessageRow:** Compact list item — avatar, sender, subject, preview, timestamp
- **Compose:** Full-screen modal on mobile, inline panel on desktop

---

## Page-Specific Components

### MessageRow

- Avatar: 40px circle, left-aligned
- Content: Sender name (bold if unread), subject, body preview (1 line, truncated)
- Timestamp: Right-aligned, relative format ("2h ago", "Yesterday")
- Click: Navigate to message detail
- Hover: Background color shift

### ComposeMessage

- Recipient: Autocomplete member search
- Subject: Single-line input
- Body: Multi-line textarea with min-height 200px
- Send button: Primary CTA style
- Cancel: Secondary/ghost button

### MessageDetail

- Full message with sender info, timestamp, body
- Reply button at bottom
- Delete with confirmation dialog
- Back button (mobile) or breadcrumb (desktop)

---

## Recommendations

- Performance: Paginate inbox at 20 messages; lazy-load older messages on scroll
- Effects: Message row slide-in on new message, smooth transition to detail view
- Accessibility: `aria-label` on message rows ("Message from [name]: [subject]"), `role="listbox"` on inbox
- Real-time: WebSocket integration for new message notifications (blue badge count)
- Empty state: "Your inbox is empty" with illustration + "Start a conversation" CTA

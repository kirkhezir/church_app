# Settings Page Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Generated:** 2026-02-19
> **Page Type:** User Settings / Preferences

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 800px (narrow, form-focused)
- **Layout:** Single column with section cards
- **Sections:** 1. Profile, 2. Privacy, 3. Notifications, 4. Security (MFA), 5. Danger Zone

### Spacing Overrides

- **Between sections:** `--space-2xl` (48px)
- **Within sections:** `--space-md` (16px) between form groups

### Typography Overrides

- **Section headings:** `font-heading`, `text-lg`, `font-weight: 600`
- **Field labels:** `font-body`, `font-weight: 500`, `text-sm`, muted color
- **Help text:** `text-xs`, `color: var(--color-muted)`

### Color Overrides

- **Danger zone:** Red border `#DC2626`, red background `#FEF2F2`
- **Success feedback:** Green toast/badge `#16A34A`
- **Section cards:** White background with subtle border

### Component Overrides

- **Form sections:** Grouped in cards with section heading
- **Save buttons:** Per-section (not global save), primary CTA style
- **Toggle switches:** For boolean settings (notifications, privacy)

---

## Page-Specific Components

### SettingsSection

- Card container with heading + description
- Form fields within
- Save button at bottom-right of section
- Success indicator: Brief green checkmark after save

### DangerZone

- Red-bordered card at page bottom
- "Delete Account" with double-confirmation (type name + confirm dialog)
- Separated visually from other sections

### NotificationPreferences

- Toggle switches for: email, push, in-app
- Per-category controls: announcements, events, messages
- Test notification button

---

## Recommendations

- Effects: Save button loading spinner, success checkmark fade-in, toggle switch animation
- Forms: `autocomplete` attributes on all inputs, `spellCheck={false}` on email/username
- Accessibility: `aria-describedby` linking help text to inputs, fieldset/legend for grouped options
- UX: Warn before navigation with unsaved changes (`beforeunload`)
- Validation: Inline errors next to fields, focus first error on submit

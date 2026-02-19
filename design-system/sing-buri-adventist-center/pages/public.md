# Public Sub-Pages Overrides

> **PROJECT:** Sing Buri Adventist Center
> **Generated:** 2026-02-19
> **Page Type:** Public / Marketing (About, Visit, Sermons, Blog, Gallery, Ministries, etc.)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px for all public pages
- **Layout:** Full-width hero + centered content sections
- **Consistent structure:** PublicNavigationHeader → Page Content → PublicFooter
- **Above-fold:** Each page has a hero section with heading + subtitle + optional CTA

### Spacing Overrides

- **Section spacing:** `--space-3xl` (64px) between major sections
- **Content padding:** `--space-lg` horizontal on mobile, `--space-xl` on desktop

### Typography Overrides

- **Page titles:** `text-3xl md:text-4xl`, `font-heading`, `text-wrap: balance`
- **Section headings:** `text-2xl`, `font-heading`, `font-weight: 600`
- **Body paragraphs:** `text-base md:text-lg`, `leading-relaxed`, max-width `65ch` for readability
- **Breadcrumbs:** `text-sm`, muted color, separator `>`

### Color Overrides

- **Hero backgrounds:** Gradient from `#1E40AF` to `#3B82F6` with white text
- **Alternating sections:** White → `#F8FAFC` → White pattern for visual rhythm
- **CTAs:** Always amber `#F59E0B` on white/light backgrounds

### Component Overrides

- **Hero:** Full-width, min-height 300px, centered content, optional background image with overlay
- **Images:** All below-fold images: `loading="lazy"`, explicit `width`/`height`
- **Above-fold images:** `fetchpriority="high"` or `priority`

---

## Per-Page Notes

### About Page

- Church history timeline, mission/vision cards, leadership team grid
- Staff photos: 80px circles, name + title beneath

### Visit Page

- Service times prominent, location map (already has LocationMapSection), parking info
- CTA: "Plan Your Visit" button

### Sermons Page

- Grid of sermon cards: title, date, speaker, duration
- Audio/video player integration
- Search + filter by speaker/topic/date

### Blog Page

- Card grid: featured image, title, excerpt, author, date
- Featured post: larger card at top

### Gallery Page

- Masonry or grid layout for photos
- Lightbox on click
- Lazy-load all images

### Ministries Page

- Grid of ministry cards: icon, name, description, "Learn More" link
- Each with distinct icon from Lucide set

### Give Page

- Clean, trust-focused design
- Secure payment integration info
- Giving options: one-time, recurring

### Prayer Page

- Submission form: name (optional), prayer request text
- Warm, contemplative color palette (softer blues)

---

## Recommendations

- Performance: Lazy-load all images below fold, preconnect to CDN domains
- SEO: Proper heading hierarchy (one `h1` per page), meta descriptions, Open Graph tags
- Accessibility: Skip link to main content, landmark regions (`main`, `nav`, `footer`), alt text on all images
- Effects: Gentle scroll reveal on section entry, hero parallax (subtle), card hover lift
- Mobile: Touch-friendly tap targets (44x44px minimum), no horizontal scroll

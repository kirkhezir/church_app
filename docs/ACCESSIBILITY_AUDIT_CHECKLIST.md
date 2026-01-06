# Accessibility (a11y) Audit Checklist

## WCAG 2.1 AA Compliance Audit

### Audit Information

- **Date**: ******\_******
- **Auditor**: ******\_******
- **Tools Used**:
  - [ ] axe DevTools
  - [ ] Lighthouse
  - [ ] WAVE
  - [ ] Screen Reader (NVDA/VoiceOver)
  - [ ] Keyboard Testing

---

## 1. Perceivable

### 1.1 Text Alternatives

- [ ] All images have `alt` attributes
- [ ] Decorative images have empty `alt=""`
- [ ] Complex images have detailed descriptions
- [ ] Icon buttons have accessible names
- [ ] SVG icons have `aria-label` or `<title>`

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 1.2 Time-Based Media

- [ ] N/A (no video/audio content currently)

### 1.3 Adaptable

- [ ] Information structure conveyed through markup
- [ ] Reading sequence preserved when linearized
- [ ] Instructions don't rely solely on sensory characteristics
- [ ] Content reflows at 400% zoom without horizontal scroll
- [ ] Form fields have visible labels

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 1.4 Distinguishable

- [ ] Color is not the only means of conveying information
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text, 18pt+)
- [ ] Non-text contrast ratio ≥ 3:1 (UI components)
- [ ] Text can be resized to 200% without loss
- [ ] Text spacing adjustable without loss
- [ ] Content on hover/focus can be dismissed

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

---

## 2. Operable

### 2.1 Keyboard Accessible

- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Skip navigation link provided
- [ ] Focus order is logical
- [ ] Focus visible on all interactive elements
- [ ] Custom widgets have appropriate keyboard interaction

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 2.2 Enough Time

- [ ] Session timeout warnings (if applicable)
- [ ] User can extend/disable timeouts
- [ ] Moving content can be paused

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 2.3 Seizures & Physical Reactions

- [ ] No content flashes more than 3 times/second

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 2.4 Navigable

- [ ] Pages have descriptive titles
- [ ] Focus order matches visual order
- [ ] Link purpose clear from link text
- [ ] Multiple ways to find pages (menu, search, sitemap)
- [ ] Headings describe topic/purpose
- [ ] Focus visible indicator meets contrast requirements

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 2.5 Input Modalities

- [ ] Touch targets are at least 44x44 CSS pixels
- [ ] Drag operations have alternatives
- [ ] Motion-activated features have alternatives

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

---

## 3. Understandable

### 3.1 Readable

- [ ] Page language specified (`lang="en"`)
- [ ] Language of parts specified when different

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 3.2 Predictable

- [ ] Focus doesn't trigger unexpected context changes
- [ ] Changing settings doesn't cause unexpected changes
- [ ] Navigation is consistent across pages
- [ ] Components are identified consistently

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

### 3.3 Input Assistance

- [ ] Error identification describes error clearly
- [ ] Labels/instructions provided for user input
- [ ] Error suggestions provided when possible
- [ ] Error prevention for legal/financial/data (review before submit)
- [ ] Forms can be reviewed and corrected before submission

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

---

## 4. Robust

### 4.1 Compatible

- [ ] HTML validates (no major parsing errors)
- [ ] ARIA used correctly
- [ ] Custom components have proper roles
- [ ] Status messages announced to screen readers

**Status**: ☐ Pass ☐ Fail ☐ Partial
**Notes**:

---

## Component-Specific Checks

### Navigation

- [ ] Main navigation is in `<nav>` element
- [ ] Current page indicated (aria-current)
- [ ] Mobile menu is keyboard accessible
- [ ] Menu can be closed with Escape key

### Forms

- [ ] All inputs have associated labels
- [ ] Required fields indicated visually and programmatically
- [ ] Error messages associated with inputs (aria-describedby)
- [ ] Form validation messages announced
- [ ] Submit buttons are clearly identifiable

### Tables

- [ ] Tables have `<caption>` or aria-label
- [ ] Table headers use `<th>` with scope
- [ ] Complex tables have headers associated

### Modals/Dialogs

- [ ] Focus trapped within modal
- [ ] Focus returns to trigger on close
- [ ] Can be closed with Escape key
- [ ] Background content is inert
- [ ] Has role="dialog" or role="alertdialog"

### Buttons

- [ ] Buttons use `<button>` element or role="button"
- [ ] Icon-only buttons have accessible names
- [ ] Toggle buttons indicate state (aria-pressed)

### Links

- [ ] Links use `<a>` element with href
- [ ] External links indicated (optional)
- [ ] Link text is descriptive (not "click here")

### Loading States

- [ ] Loading indicators announced (aria-live)
- [ ] Loading state indicates purpose

### Toasts/Notifications

- [ ] Announced to screen readers (aria-live="polite")
- [ ] Can be dismissed
- [ ] Don't disappear too quickly

---

## Screen Reader Testing

### Test with NVDA (Windows)

- [ ] Navigation landmarks work
- [ ] Headings hierarchy correct
- [ ] Form labels announced
- [ ] Buttons announce correctly
- [ ] Error messages announced
- [ ] Dynamic content updates announced

### Test with VoiceOver (Mac/iOS)

- [ ] All content accessible
- [ ] Custom components work
- [ ] Touch exploration works (iOS)

### Common Issues Found:

1.
2.
3.

---

## Automated Testing Results

### axe DevTools

| Issue Type | Count |
| ---------- | ----- |
| Critical   |       |
| Serious    |       |
| Moderate   |       |
| Minor      |       |

### Lighthouse Accessibility Score: \_\_\_ / 100

### Key Findings:

1.
2.
3.

---

## Color Contrast Check

### Text Elements

| Element     | Foreground | Background | Ratio | Pass? |
| ----------- | ---------- | ---------- | ----- | ----- |
| Body text   |            |            |       |       |
| Headings    |            |            |       |       |
| Links       |            |            |       |       |
| Buttons     |            |            |       |       |
| Error text  |            |            |       |       |
| Placeholder |            |            |       |       |

### UI Components

| Element       | Foreground | Background | Ratio | Pass? |
| ------------- | ---------- | ---------- | ----- | ----- |
| Input borders |            |            |       |       |
| Focus rings   |            |            |       |       |
| Icon buttons  |            |            |       |       |
| Badges        |            |            |       |       |

---

## Mobile Accessibility

### Touch Targets

- [ ] All touch targets ≥ 44x44 CSS pixels
- [ ] Adequate spacing between targets
- [ ] Bottom navigation targets adequate

### Zoom

- [ ] Content readable at 200% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Text resizing works

### Orientation

- [ ] Works in both portrait and landscape
- [ ] Content adapts appropriately

---

## Remediation Priority

### Critical (Must Fix)

1.
2.
3.

### High Priority

1.
2.
3.

### Medium Priority

1.
2.
3.

### Low Priority

1.
2.
3.

---

## Summary

| Category       | Pass | Fail | Partial |
| -------------- | ---- | ---- | ------- |
| Perceivable    |      |      |         |
| Operable       |      |      |         |
| Understandable |      |      |         |
| Robust         |      |      |         |
| **TOTAL**      |      |      |         |

## Overall WCAG 2.1 AA Compliance: ☐ Pass ☐ Fail

## Sign-off

**Auditor**: ********\_******** **Date**: ******\_******

**Reviewed By**: ********\_******** **Date**: ******\_******

---

_Template Version: 1.0 | Last Updated: January 2026_

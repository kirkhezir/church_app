## 🏛️ Sing Buri Adventist Center Landing Page - Enhancement Plan

### 📊 Current State Summary

The landing page is **professionally built** with good accessibility, responsive design, and engagement features. However, it's missing several **critical church-specific elements** that would transform it from a generic landing page into an effective "digital front door."

---

## 🔴 High Priority Improvements

### 1. **Add Sermon/Media Section** (Critical Missing Feature)

Churches universally prioritize sermon content. Visitors want to "sample" the teaching before visiting.

**Recommendation:**

```
- Add "Latest Sermon" section after Worship Times
- Embed YouTube/audio player for most recent message
- Link to full sermon archive
- Include series navigation (if applicable)
```

### 2. **Add Online Giving Button** (Essential for Churches)

| Location   | Implementation                   |
| ---------- | -------------------------------- |
| Hero CTAs  | "Give Online" button (secondary) |
| Navigation | Small "Give" link in header      |
| Footer     | Dedicated giving section         |

### 3. **Add "Plan Your Visit" Section**

First-time visitors need dedicated guidance. Add a section between Hero and Worship Times:

| Content                     | Purpose                 |
| --------------------------- | ----------------------- |
| "What to expect" checklist  | Reduce anxiety          |
| Parking map/instructions    | Practical info          |
| Children's ministry info    | Parents care about this |
| "What to wear" note         | Common question         |
| "We'll save you a seat" CTA | Actionable              |

### 4. **Replace All Stock Photos** (Authenticity)

Current state: All gallery photos are Unsplash stock images.

**Impact:** Visitors can tell these aren't real church photos, which reduces trust.

| Section         | Replacement Needed                       |
| --------------- | ---------------------------------------- |
| Hero background | Actual church building or congregation   |
| Pastor avatar   | Real pastor photo with name              |
| Gallery         | Real church events, baptisms, fellowship |
| Ministry cards  | Real ministry activity photos            |

### 5. **Add Thai Language Support** (Critical for Thailand)

The site is entirely in English for a church in Thailand.

**Minimum Implementation:**

- Language toggle (TH/EN) in header
- Key sections in Thai: Hero, About, Worship Times
- Thai testimonials (currently Thai names but English quotes)

---

## 🟡 Medium Priority Improvements

### 6. **Add LINE Official Contact** (Essential for Thailand)

LINE is the dominant messaging app in Thailand. Add:

- LINE QR code in Contact section
- LINE button alongside phone/email
- LINE add friend link in footer

### 7. **Add Prayer Request Feature**

Churches often feature this prominently:

```
- Simple form: Name, email, prayer request
- Option for private vs. share with prayer team
- "We pray for every request" messaging
```

### 8. **Improve Announcement Banner**

Current: Auto-rotates every 5 seconds without pause control.

**Issues:**

- No pause button (accessibility concern)
- Can't dismiss announcements
- May disorient users

**Fixes:**

- Add pause/play control
- Add dismiss (X) button
- Reduce rotation speed to 8 seconds

### 9. **Add Leadership/Staff Page Link**

The About section has a placeholder pastor avatar "P".

**Add:**

- Real pastor photo and name
- "Meet Our Team" link
- Elder/leadership team photos
- Pastoral welcome video (optional)

### 10. **Add Volunteer/Serve Section**

Before FAQ, add a "Get Involved" call-to-action:

- Ministry volunteer opportunities
- "Find your place" messaging
- Connect with ministry leader CTA

---

## 🟢 Polish & Enhancement Improvements

### 11. **Improve Hero Section**

| Current                | Enhancement                                             |
| ---------------------- | ------------------------------------------------------- |
| Generic countdown      | Show "Service Starting Now!" when it's Saturday morning |
| Two CTAs               | Add third: "Watch Live" or "Plan Your Visit"            |
| Stats: "500+ Sabbaths" | Clarify: "10+ Years Serving Sing Buri"                  |

### 12. **Add Sticky CTA Bar**

After scrolling past hero, show a slim sticky bar:

```
[Plan Your Visit] [Watch Live] [Give]
```

### 13. **Enhance Events Section**

- Show "X people attending" badge
- Add recurring events (weekly AY, prayer meeting)
- "Subscribe to Calendar" button

### 14. **Add Social Proof Numbers**

Current stats are vague. Make them impactful:

```
Before: "15+ Families"
After:  "150+ Members" or "30+ Children in Sabbath School"
```

### 15. **Add Footer Enhancements**

| Missing        | Add                |
| -------------- | ------------------ |
| Privacy Policy | Legal compliance   |
| Site Map       | SEO + navigation   |
| LINE Official  | Thai audience      |
| Office Hours   | "Mon-Fri: 9AM-5PM" |

---

## ⚡ Performance Optimizations

### 16. **Lazy Load Google Maps**

The embedded iframe blocks initial render. Solutions:

- Show static map image first
- Load iframe on user interaction
- Use IntersectionObserver for lazy loading

### 17. **Optimize Images**

- Convert to WebP/AVIF formats
- Add proper `srcset` for responsive images
- Preload hero image
- Use Cloudinary or similar CDN

### 18. **Code Split Sections**

Lazy load below-fold components:

```tsx
const PhotoGallery = lazy(() => import("./PhotoGallerySection"));
const Testimonials = lazy(() => import("./TestimonialsSection"));
```

---

## ♿ Accessibility Improvements

### 19. **Fix Color Contrast**

- Verify amber text on white meets WCAG AA (4.5:1)
- Check light gray text readability
- Run Lighthouse accessibility audit

### 20. **Add Visible Form Labels**

Newsletter input uses placeholder only. Add:

```tsx
<label htmlFor="email" className="sr-only">Email address</label>
<input id="email" placeholder="Your email" />
```

### 21. **Improve Image Alt Text**

- Hero: Add descriptive alt for background
- Gallery: Use specific descriptions ("Youth group fellowship dinner")
- Icons: Ensure decorative icons have `aria-hidden="true"`

---

## 📱 Mobile Experience Improvements

### 22. **Add Mobile Backdrop Overlay**

When hamburger menu opens, add dark overlay behind it.

### 23. **Reduce Fixed Header Stack**

Announcement + Navigation takes ~90px. On mobile:

- Collapse announcement to single line
- Or hide announcement on scroll

### 24. **Truncate Long Email**

Footer email may overflow on small screens:

```tsx
<span className="truncate max-w-[200px]">singburiadventist...@gmail.com</span>
```

---

## 🗂️ Recommended Page Flow (Reordered)

**Current:**

```
Hero → About → Worship → Testimonials → Events → Ministries → Gallery → FAQ → Contact
```

**Recommended:**

```
Hero → [NEW: Plan Your Visit] → Worship → [NEW: Latest Sermon] → About → Events → Ministries → Testimonials → [NEW: Get Involved] → Gallery → FAQ → Contact
```

**Rationale:**

1. **Plan Your Visit** immediately addresses first-time visitors
2. **Sermon** lets visitors sample the teaching early
3. **Testimonials** moved later as social proof before action
4. **Get Involved** creates clear volunteer pathway

---

## 📋 Implementation Priority Matrix

| Priority | Feature                     | Effort | Impact |
| -------- | --------------------------- | ------ | ------ |
| 🔴 P0    | Replace stock photos        | Medium | High   |
| 🔴 P0    | Add Thai language toggle    | High   | High   |
| 🔴 P0    | Add real pastor photo/name  | Low    | High   |
| 🔴 P1    | Add Sermon section          | Medium | High   |
| 🔴 P1    | Add Online Giving button    | Low    | High   |
| 🔴 P1    | Add LINE Official contact   | Low    | High   |
| 🟡 P2    | Add Plan Your Visit section | Medium | Medium |
| 🟡 P2    | Add Prayer Request form     | Medium | Medium |
| 🟡 P2    | Fix announcement carousel   | Low    | Medium |
| 🟢 P3    | Add Get Involved section    | Medium | Medium |
| 🟢 P3    | Lazy load Google Maps       | Low    | Low    |
| 🟢 P3    | Add sticky CTA bar          | Medium | Medium |

---

## 🎯 Quick Wins (Can Implement Immediately)

1. **Add pastor's real name** to About section welcome message
2. **Add LINE QR code** to Contact section
3. **Add "Give" link** to navigation
4. **Add Privacy Policy** link to footer
5. **Update hero stat** from "500+ Sabbaths" to clearer metric
6. **Add office hours** to Contact section
7. **Fix announcement pause** accessibility

---

💡 Suggestions for Further Improvements

# Sections That Could Become Separate Pages:

Section Suggestion Reason
Gallery /gallery Users often want full-screen slideshows, album organization
Ministries /ministries Detailed info per ministry (Youth, Women's, Pathfinders, etc.)
Events /events Calendar view, past events archive, registration
Prayer Request /prayer Private form, prayer wall, prayer updates
Give /give Multiple giving options, recurring donations, statement history
FAQ Move to footer link Less prominent but accessible

# New Pages to Consider:

1. /ministries/:slug - Individual ministry pages with:

Ministry description
Leadership team
Upcoming events for that ministry
Photo gallery
How to get involved

2. /events/:id - Event detail pages with:

Full description
Location map
RSVP functionality
Add to calendar button

3. /blog or /news - Church blog with:

Announcements
Mission stories
Member testimonies

4. /resources - Digital resources:

Bible study guides
Sermon notes
Sabbath School lessons (links)

# UX/UI Improvements:

1. Sticky Section Navigation - Add a mini-nav that appears when scrolling showing current section
2. Search Functionality - Global search for sermons, events, people
3. Dark Mode - Already partially supported, could expand
4. Contact Form Improvements - Add prayer request option, department routing
5. Social Proof - Add live visitor counter or "X families visited last month"

# Technical Improvements:

1. SEO - Add meta tags, OpenGraph for each page
2. Performance - Lazy load images, compress assets
3. PWA - Enhance offline experience for sermons
4. Analytics - Track page views, button clicks
5. A/B Testing - Test different CTAs for visitor conversion

# Content Suggestions:

1. Localize all section content - Not just nav, but section headers, descriptions
2. Add testimonials in Thai - More relatable to local visitors
3. Video welcome from pastor - Personal touch on About page
4. Live service indicator - Show when streaming is active

########## Additional Features to Consider:

User: #codebase analyze my codebase for what's next to do. thoroughly analyze it and provide relevant and useful thing for the current codebase. I have already landing pages with many features. I also have a church management app with role base access and etc for managing a church, scan through all this for what's needed for next steps. use necessary tools or resources for more information. analyze entirely the codebase.

GitHub Copilot:

I'll conduct a comprehensive analysis of your codebase to identify what's implemented and what's needed next. Let me start by researching the entire project structure and current feature set.

Search complete: Analyze entire codebase

Searched for files matching `**/*`, 200 matches

Read [](file:///d%3A/VSCode_projects/church_app/README.md#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/package.json)

Read [](file:///d%3A/VSCode_projects/church_app/PROGRESS_REPORT.md#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/PRODUCTION_CHECKLIST.md#1-1), lines 1 to 150

Read [](file:///d%3A/VSCode_projects/church_app/PHASE11_COMPLETE.md#1-1), lines 1 to 100

Searched for regex `Status|COMPLETE|FAILED|TODO|ISSUE|BUG|INCOMPLETE` (`**/*COMPLETE*.md`), 200 results

Searched for files matching `**/*.test.ts`, 28 matches

Searched for files matching `**/*.spec.ts`, 20 matches

Read [](file:///d%3A/VSCode_projects/church_app/vercel.json)

Let me gather detailed context across multiple areas of the codebase:

Read [](file:///d%3A/VSCode_projects/church_app/README.md#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/specs/001-full-stack-web/tasks.md#1-1), lines 1 to 150

Read [](file:///d%3A/VSCode_projects/church_app/PROGRESS_REPORT.md#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/backend/src)

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src)

Read [](file:///d%3A/VSCode_projects/church_app/specs/001-full-stack-web/tasks.md#200-200), lines 200 to 900

Searched for regex `phase 10|phase 11|Phase 10|Phase 11|next steps|TODO|FIXME`, 30 results

Read [](file:///d%3A/VSCode_projects/church_app/backend/src/application)

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/pages)

Read [](file:///d%3A/VSCode_projects/church_app/PHASE9_COMPLETE.md#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/PHASE11_COMPLETE.md#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/specs/001-full-stack-web)

Searched for text `Phase 10 Phase 11 ongoing discussion deferred optional enhancement future`, no results

Read [](file:///d%3A/VSCode_projects/church_app/PHASE11_COMPLETE.md#100-100), lines 100 to 150

Searched for regex `deferred|pending|TODO|FIXME|optional|enhancement|future work|phase 12|not implemented` (`**/*.md`), 25 results

Searched codebase for "what features are not implemented, what's left to do, remaining gaps, future enhancements", 24 results

Now let me check for current errors or test coverage to complete my analysis:

Checked workspace, no problems found

Searched for text `test coverage summary passing failing` (`**/backend/tests/**/*.test.ts`), no results

Perfect! I've completed a thorough analysis of your codebase. Let me clarify your priorities before presenting the comprehensive plan.

Asked 3 questions (Next Focus, Features, Deployment)

Excellent! Based on your input, here's my comprehensive analysis and recommendations:

## Plan: Complete & Deploy Church Management App

**TL;DR**: Your app is 85% complete through Phase 11. To reach production-ready, you need to: (1) **finish incomplete Phase 1-11 features** (announcement enhancements, event calendar, deferred tests), (2) **stabilize & optimize** existing features, (3) **validate deployment** configs, and (4) **execute Phase 12** (new major features). This breaks into 4 workstreams that can run **mostly parallel**. Estimated effort: 4-6 weeks for all production deployment + new features.

---

## Current State Assessment

### ✅ What's **COMPLETE** (Phases 1-11)

- **Backend**: 138+ tests passing; all core APIs implemented (auth, events, announcements, members, messaging, admin, MFA)
- **Frontend**: All pages, components, routing implemented; responsive design working
- **Infrastructure**: Security hardened, rate limiting, monitoring (Sentry, health checks), push notifications, PDF reports, backups
- **Deployment**: Docker configured, K8s manifests drafted, Vercel/Render configs created
- **Architecture**: Clean Architecture (domain/app/infra/presentation) properly followed

### ⚠️ What's **DEFERRED or INCOMPLETE** (Phase 1-11)

| Item                             | Status       | Impact         | Effort    |
| -------------------------------- | ------------ | -------------- | --------- |
| **Announcement enhancements**    | 70% done     | Medium         | 20-30 hrs |
| Event calendar view              | Deferred     | Low            | 15 hrs    |
| Rich text editor (Tiptap)        | Not done     | Medium         | 12 hrs    |
| Date range picker UI             | Backend done | Low            | 5 hrs     |
| Announcement draft system        | Not done     | Low            | 8 hrs     |
| Auth unit tests                  | Deferred     | Technical debt | 10 hrs    |
| Component tests (LoginPage)      | Deferred     | Technical debt | 8 hrs     |
| Load tests (auth, announcements) | Deferred     | Validation     | 10 hrs    |

### 🚀 What's **READY BUT UNTESTED** (Production Deployment)

- Docker Compose production configs
- K8s manifests for deployed
- GitHub Actions CI/CD pipeline (needs final tuning)
- Email service (SMTP configured)
- Push notifications (service worker ready)
- PDF report generation

---

## Recommended Roadmap (Prioritized)

### **Phase 12: Complete Deferred Features** (3-4 weeks)

**Workstream 1: Announcement System Polish** (20-25 hours)

- [x] Add Tiptap rich text editor to AnnouncementForm
- [ ] Implement draft system (save-before-publish toggle)
- [ ] Add date range picker UI to AnnouncementForm
- [ ] Add unarchive button to AdminAnnouncementsPage
- [ ] Write missing component tests for AnnouncementForm
- [ ] Load test announcement endpoints (T216)

**Workstream 2: Event Management Enhancement** (12-15 hours)

- [ ] Create EventCalendarView component (alongside list view)
- [ ] Integrate calendar with existing event service
- [ ] Add calendar picker to EventFilters
- [ ] Write E2E tests for calendar view

**Workstream 3: Test Coverage Completion** (25-30 hours)

- [ ] Write unit tests for AuthenticateUser use case (T068)
- [ ] Write Member entity tests (T069)
- [ ] Write integration tests for auth/lockout (T070-T071)
- [ ] Write LoginPage component tests (T072)
- [ ] Write Dashboard widget tests (T073)
- [ ] Auth performance load test (T112)

**Workstream 4: Deployment Validation** (10-15 hours)

- [ ] Test full Docker build & deployment locally
- [ ] Validate K8s manifests with dry-run
- [ ] Test CI/CD pipeline end-to-end
- [ ] Setup staging environment on Render
- [ ] Validation checklist completion

---

### **Phase 13: New Major Features** (4-6 weeks) - _Recommended Next_

Based on your features, high-impact additions to consider:

**Option A: Sermon/Content Management** (25-30 hours)

- Create Sermon entity & repository
- Build sermon upload/management API
- Add sermon player to landing page & dashboard
- Implement sermon archive/search

**Option B: Newsletter/Email Campaign System** (30-35 hours)

- Create Newsletter entity (workflows, templates)
- Build campaign builder UI
- Implement scheduled sending
- Add subscription management for members

**Option C: Learning Management System (LMS)** (40-50 hours)

- Create Course/Lesson entities
- Build course management pages
- Progress tracking & completion metrics
- Student dashboard

**Option D: Enhanced Analytics Dashboard** (20-25 hours)

- Growth metrics (membership trends)
- Engagement analytics (event attendance, message activity)
- Retention analysis
- Demographic breakdowns

_Recommendation: Start with **Option A (Sermon Management)** as it integrates naturally with your existing landing page and requires least new infrastructure._

---

### **Phase 14: Stabilization & Production Ops** (2-3 weeks)

- [ ] Performance optimization audit (database queries, frontend bundle)
- [ ] Accessibility audit (WCAG 2.1 Level AA)
- [ ] Security penetration testing
- [ ] Backup/restore procedure validation
- [ ] Monitoring & alerting setup (Sentry, health checks)
- [ ] Runbook documentation (ops procedures)
- [ ] Capacity planning & scaling strategy

---

## Key Decisions & Tradeoffs

**Decision 1: Event Calendar View**

- **Keep**: List view is sufficient for MVP; calendar adds 15+ hours
- **Recommend**: Defer to Phase 13 unless calendar is critical feature request

**Decision 2: Rich Text Editor for Announcements**

- **Keep**: Markdown support exists; Tiptap adds 12+ hours but massively improves UX
- **Recommend**: Implement now (12 hours) while you're in announcement features

**Decision 3: Deployment Strategy**

- **Current config**: Vercel (frontend) + Render.com (backend) + Neon (database)
- **Status**: Production-ready, but untested in real deployment
- **Recommend**: Do staging deployment first (Phase 12) before production

**Decision 4: Test Coverage vs. New Features**

- **Current**: 138+ tests passing, but some areas deferred (auth, components)
- **Coverage target**: 85%+ (very good; 90%+ requires extra 30-40 hours)
- **Recommend**: Complete deferred tests in Phase 12, reach production-ready threshold

---

## Verification Steps

**Before declaring production-ready:**

1. ✅ All deferred tests passing (Phase 12, Workstream 3)
2. ✅ Docker build succeeds end-to-end
3. ✅ Full manual E2E flow works (landing → login → dashboard → events → messages → admin)
4. ✅ Staging deployment succeeds on Render
5. ✅ Health checks pass on staging
6. ✅ Backup/restore tested
7. ✅ Performance baseline established (P95 latency, throughput)

---

## Files to Prioritize for Review

1. tasks.md - Deferred task list
2. ANNOUNCEMENT_IMPLEMENTATION_COMPLETE.md - Known gaps
3. PHASE11_COMPLETE.md - Latest deployment status
4. PHASE9_COMPLETE.md - Security & ops readiness
5. render.yaml + docker-compose.yml - Deployment configs

---

## Next Actions (In Order)

1. **Choose Phase 12 priority** - Which workstream to start first?
2. **Clarify Phase 13 feature** - Which new feature aligns with church goals?
3. **Set deployment timeline** - When does staging → production need to launch?
4. **Resource planning** - Solo dev or team support for implementation?

Would you like me to **dive deeper into any specific phase** or create **detailed task breakdowns** for Phase 12 implementation?

User: dive deeper into any specific phase and create detailed task breakdowns

GitHub Copilot: I'll dive deeper into Phase 12 with detailed task breakdowns. Since you selected announcement enhancements and production deployment as priorities, let me analyze those two workstreams in detail.

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/components/features/announcements/AnnouncementForm.tsx#1-1), lines 1 to 100

Read [](file:///d%3A/VSCode_projects/church_app/backend/src/application/useCases/createAnnouncement.ts#1-1), lines 1 to 80

Read [](file:///d%3A/VSCode_projects/church_app/backend/prisma/schema.prisma#1-1), lines 1 to 150

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/pages/announcements)

Searched for files matching `**/frontend/src/pages/**/Announcement*.tsx`, 5 matches

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/components/features/announcements/AnnouncementForm.tsx#50-50), lines 50 to 100

Searched for text `isDraft publishedScheduledFor scheduledPublishAt`, no results

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/components/features/announcements/AnnouncementForm.tsx#100-100), lines 100 to 215

Searched for files matching `**/frontend/src/components/**/SimpleTextEditor.tsx`, 1 match

Read [](file:///d%3A/VSCode_projects/church_app/backend/src/application/useCases/updateAnnouncement.ts#1-1), lines 1 to 50

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/pages/app/announcements)

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/components/editor/SimpleTextEditor.tsx)

Read [](file:///d%3A/VSCode_projects/church_app/backend/package.json#1-1), lines 1 to 50

Read [](file:///d%3A/VSCode_projects/church_app/frontend/package.json#1-1), lines 1 to 50

Searched for text `scheduledFor publishAt scheduled` (`**/backend/prisma/schema.prisma`), no results

Read [](file:///d%3A/VSCode_projects/church_app/frontend/src/pages/app/announcements/AnnouncementsPage.tsx#1-1), lines 1 to 100

Perfect! Now I have a clear picture. Let me create comprehensive task breakdowns for the two most critical workstreams in Phase 12.

---

# Phase 12: Detailed Task Breakdowns

## Workstream 1: Announcement System Polish (20-25 hours)

This workstream completes announcement features to production-ready status. All backend support exists; frontend needs enhancement.

### Prerequisites

- Tiptap already installed in package.json ✅
- Draft system already in database schema ✅
- AnnouncementForm component exists ✅

---

### **Task 12.1.1: Replace SimpleTextEditor with Tiptap Rich Text Editor** (6–8 hours)

**Objective**: Replace plain textarea with Tiptap editor to enable formatting (bold, italic, lists, links, etc.)

**Why**: Users need formatting options for professional announcements; Tiptap is already installed and is industry-standard.

**Current State**:

- SimpleTextEditor.tsx is a basic textarea
- AnnouncementForm imports SimpleTextEditor
- No formatting support currently

**Implementation Steps**:

1. **Create new RichTextEditor component** (2 hours)
   - **File**: RichTextEditor.tsx (NEW)
   - Replace SimpleTextEditor with Tiptap-based editor
   - Use `@tiptap/react` + `@tiptap/starter-kit`
   - Configure extensions: paragraph, heading, bold, italic, bullet list, ordered list, code block, blockquote, link
   - Add placeholder text
   - Support character counter (5000 max)
   - Output as HTML (not markdown)
   - Accept `disabled` prop

   **Code pattern**:

   ```tsx
   import { useEditor, EditorContent } from "@tiptap/react";
   import StarterKit from "@tiptap/starter-kit";
   import Link from "@tiptap/extension-link";
   import Placeholder from "@tiptap/extension-placeholder";

   export function RichTextEditor({ content, onChange, ... }) {
     const editor = useEditor({
       extensions: [
         StarterKit,
         Link,
         Placeholder.configure({ placeholder: "..." })
       ],
       content,
       onUpdate: ({ editor }) => onChange(editor.getHTML()),
       editable: !disabled
     });

     return <EditorContent editor={editor} className="..."/>;
   }
   ```

2. **Update AnnouncementForm to use RichTextEditor** (1 hour)
   - **File**: AnnouncementForm.tsx
   - Change import from SimpleTextEditor to RichTextEditor
   - Add toolbar buttons above editor (Optional: bold, italic, link buttons — Tiptap has built-in, just style them)
   - Update character counter to count from HTML text content (use `DOMParser` to strip tags)
   - Update placeholder text
   - Add help text: "You can use **bold**, _italic_, links, and lists"

3. **Add styling for rich text editor** (1 hour)
   - **File**: RichTextEditor.tsx
   - Style `.ProseMirror` container (Tiptap's editor div class)
   - Add border, padding, rounded corners matching shadcn/ui
   - Style nested elements (lists, blockquotes, code blocks)
   - Add focus states
   - Ensure dark mode compatible

4. **Update API types for announcement content** (0.5 hours)
   - **File**: api.ts
   - Ensure Announcement type allows HTML content (already should)
   - Document that content can now be HTML

5. **Migrate existing plain text announcements** (0.5 hours)
   - **File**: createAnnouncement.ts
   - No change needed — backend accepts any string content
   - Plain text announcements automatically work with RTE

**Files Modified**:

- ✏️ SimpleTextEditor.tsx — Deprecate (keep for 1 phase for safety)
- ✏️ AnnouncementForm.tsx
- 📝 RichTextEditor.tsx — NEW

**Testing**:

- [ ] RichTextEditor renders without errors
- [ ] Content persists when typing
- [ ] Formatting buttons work (bold, italic, links, lists)
- [ ] Character counter works accurately
- [ ] HTML output is valid and sanitized on backend (existing middleware)
- [ ] Editor works in create and edit modes
- [ ] Disabled state works (admin approval pending)
- [ ] Paste plain text into editor works

**Effort**: 6–8 hours

---

### **Task 12.1.2: Implement Draft System (Save-Before-Publish Toggle)** (4–5 hours)

**Objective**: Ensure draft announcements can be saved, edited, and later published without changing any other code.

**Current State**:

- Database schema has `isDraft` field ✅
- Backend use cases support `isDraft` parameter ✅
- AnnouncementForm has draft toggle ✅
- Frontend service has draft parameter ✅
- **Gap**: UI doesn't distinguish drafts from published; no "publish draft" action

**Implementation Steps**:

1. **Update AnnouncementsPage to show drafts section** (1.5 hours)
   - **File**: AnnouncementsPage.tsx
   - Add filter tabs: "Active" | "Archived" | "Drafts" (admin only)
   - Query API with `isDraft=true` filter for draft section
   - Display drafts with visual badge ("Draft" label in top-right of AnnouncementCard)
   - Only show "Drafts" tab if user is ADMIN/STAFF

   **API call pattern**:

   ```ts
   const { announcements } = useAnnouncements(
     archived: boolean,
     isDraft: boolean,  // NEW parameter
     page, limit
   );
   ```

2. **Update useAnnouncements hook to support draft filtering** (0.5 hours)
   - **File**: useAnnouncements.ts
   - Add `isDraft` parameter to query
   - Pass to API endpoint: `/announcements?isDraft=true&archived=false`

3. **Update AnnouncementCard to show draft badge** (0.5 hours)
   - **File**: AnnouncementCard.tsx
   - Accept optional `isDraft?: boolean` prop
   - Add badge if `isDraft === true`: "Draft" label with gray background
   - Display in top-right corner below/next to priority badge

4. **Add "Publish Draft" action in edit mode** (1 hour)
   - **File**: AnnouncementEditPage.tsx
   - If viewing a draft, show button: "Publish This Draft" (in addition to "Save Draft")
   - Clicking "Publish" sets `isDraft: false` and submits
   - Redirect to published announcement detail page
   - Show success toast: "Announcement published!"

5. **Backend: Ensure GET /announcements filters correctly** (0.5 hours)
   - **File**: announcementController.ts
   - Verify query parameter `isDraft` is supported in getAnnouncements()
   - Should already exist from Phase 6 (check line ~50-80)

6. **Update AnnouncementForm submit logic** (1 hour)
   - **File**: AnnouncementForm.tsx
   - When isDraft toggle is ON:
     - Button label: "Save Draft" (not "Create Announcement")
     - Show message: "This will save as draft — not published yet"
   - When isDraft toggle is OFF:
     - Button label: "Publish Announcement"
     - If priority is URGENT, show: "Email notifications will be sent to all members"

**Files Modified**:

- ✏️ AnnouncementsPage.tsx
- ✏️ useAnnouncements.ts
- ✏️ AnnouncementCard.tsx
- ✏️ AnnouncementEditPage.tsx
- ✏️ AnnouncementForm.tsx

**Testing**:

- [ ] Save announcement as draft → redirect to drafts
- [ ] View draft in "Drafts" tab → shows "Draft" badge
- [ ] Edit draft → can toggle to publish
- [ ] Publish draft → removed from drafts, appears in active announcements
- [ ] Published announcements never show draft badge
- [ ] Draft toggle button shows correct hint text
- [ ] Drafts don't send emails even if URGENT

**Effort**: 4–5 hours

---

### **Task 12.1.3: Add Date Picker UI for Announcement Form** (3–4 hours)

**Objective**: Frontend UI to support date range filtering (backend already supports this).

**Current State**:

- Backend supports date range queries (based on phase 6 notes)
- Frontend doesn't expose date range picker in UI
- AnnouncementForm only has title, content, priority, draft toggle

**Decision**: This is **OPTIONAL** because:

- Date range filtering is a convenience feature, not core functionality
- Most churches don't need it (announcements are time-insensitive)
- Effort: 3-4 hours vs. other high-value items

**Recommendation**: **DEFER TO PHASE 13** unless you specifically need to filter announcements by date range. If you want it now, here's the plan:

1. **Add date-range inputs to AnnouncementsPage filter section** (1.5 hours)
   - Use shadcn/ui `<Input type="date">` or install a date picker library
   - "From" date and "To" date inputs
   - Pass to useAnnouncements hook

2. **Update useAnnouncements to accept date filters** (1 hour)
   - Query: `/announcements?from=2025-02-01&to=2025-02-28`
   - Parse and validate dates before sending

3. **Backend verification** (0.5 hours)
   - Confirm GET /announcements accepts `from` and `to` query params
   - If not, add them to controller

**Defer or Implement?** → **DEFER FOR NOW** (not critical for MVP)

---

### **Task 12.1.4: Add Unarchive Button to AdminAnnouncementsPage** (2–3 hours)

**Objective**: Allow admins to restore archived announcements (reverse the archive action).

**Current State**:

- AdminAnnouncementsPage exists with archive toggle
- Archive logic exists
- **Gap**: Unarchive button not visible in UI

**Implementation Steps**:

1. **Update AdminAnnouncementsPage archived view** (1 hour)
   - **File**: frontend/src/pages/admin/AdminAnnouncementsPage.tsx (or similar)
   - Show "Archived Announcements" tab/section
   - Add "Unarchive" button alongside delete button
   - Button click calls `announcementService.unarchiveAnnouncement(id)`

2. **Implement unarchiveAnnouncement API method** (0.5 hours)
   - **File**: announcementService.ts
   - Add method:
     ```ts
     async unarchiveAnnouncement(id: string): Promise<Announcement> {
       return apiClient.patch(`/announcements/${id}/unarchive`, {});
     }
     ```

3. **Implement backend PATCH /announcements/:id/unarchive endpoint** (0.5 hours)
   - **File**: announcementController.ts
   - Add method: `unarchiveAnnouncement()`
   - Set `archivedAt` to null
   - Require ADMIN/STAFF role

4. **Update announcementRoutes** (0.5 hours)
   - **File**: announcementRoutes.ts
   - Add route: `PATCH /api/v1/announcements/:id/unarchive` → unarchiveAnnouncement controller

5. **Update backend use case** (Optional, already may exist)
   - **File**: backend/src/application/useCases/unarchiveAnnouncement.ts — If doesn't exist, create it

**Files Modified**:

- ✏️ frontend/src/pages/admin/AdminAnnouncementsPage.tsx
- ✏️ announcementService.ts
- ✏️ announcementController.ts
- ✏️ announcementRoutes.ts
- 📝 backend/src/application/useCases/unarchiveAnnouncement.ts — If needed

**Testing**:

- [ ] Admin can see archived announcements in separate view
- [ ] Unarchive button appears for archived items
- [ ] Clicking unarchive restores to active announcements
- [ ] Restored announcement appears in "Active" tab
- [ ] Non-admin users cannot unarchive (403 error)

**Effort**: 2–3 hours

---

### **Task 12.1.5: Write Missing AnnouncementForm Component Tests** (3–4 hours)

**Objective**: Complete test suite for AnnouncementForm component (Phase 6 tests had ResizeObserver issues).

**Current State**:

- AnnouncementForm tests exist but have ResizeObserver mock issues
- Rich text editor tests needed

**Implementation Steps**:

1. **Fix ResizeObserver mock in test setup** (0.5 hours)
   - **File**: setup.ts (global setup) or frontend/tests/unit/components/announcements/AnnouncementForm.test.tsx
   - Add to setup or test file:
     ```ts
     global.ResizeObserver = jest.fn().mockImplementation(() => ({
       observe: jest.fn(),
       unobserve: jest.fn(),
       disconnect: jest.fn(),
     }));
     ```

2. **Write AnnouncementForm component tests** (2.5 hours)
   - **File**: frontend/tests/unit/components/announcements/AnnouncementForm.test.tsx
   - Test cases:
     - Renders with initial data
     - Renders empty with no initial data
     - Title validation: min/max length feedback
     - Content validation: required field
     - Priority options: NORMAL and URGENT radio buttons
     - Draft toggle: changes button label
     - Submit with valid data
     - Submit with invalid data shows error
     - Error alert displays server errors
     - Cancel button calls onCancel prop
     - Disabled state shows spinner
     - Character counter updates
   - Test all state combinations

3. **Write RichTextEditor unit tests** (1 hour)
   - **File**: frontend/tests/unit/components/editor/RichTextEditor.test.tsx — NEW
   - Test cases:
     - Renders editor
     - Content change triggers onChange
     - Bold/italic/link formatting works
     - Disabled state works
     - Character counter

**Files Created/Modified**:

- 📝 frontend/tests/unit/components/editor/RichTextEditor.test.tsx — NEW
- ✏️ frontend/tests/unit/components/announcements/AnnouncementForm.test.tsx
- ✏️ setup.ts — Add ResizeObserver mock if not present

**Testing Command**:

```bash
cd frontend
npm test -- AnnouncementForm.test.tsx --no-coverage
```

**Verify**: All tests pass (target: 15+ tests, 100% pass rate)

**Effort**: 3–4 hours

---

### **Task 12.1.6: Load Test Announcement Endpoints (T216)** (2–3 hours)

**Objective**: Verify announcement system can handle concurrent create, read, update operations under load.

**Current State**:

- Phase 5 load tests exist for events
- Announcement load tests deferred in tasks.md
- System should handle 100+ concurrent users

**Implementation Steps**:

1. **Create load test file** (1.5 hours)
   - **File**: backend/tests/performance/announcementLoad.test.ts — NEW
   - Use autocannon library (already used in Phase 3)
   - Test scenarios:
     - **Scenario 1**: 50 concurrent users browsing announcements (GET /api/v1/announcements)
       - Success rate: 100%, P95 < 100ms
     - **Scenario 2**: 20 concurrent users creating announcements (POST /api/v1/announcements)
       - Success rate: 100%, response < 200ms
     - **Scenario 3**: 30s sustained load with mixed operations
       - GET (60%), POST draft (20%), PATCH (20%)
     - **Scenario 4**: Urgent announcements (triggers email)
       - 5 concurrent URGENT creates
       - Email notifications don't block response

   **Code pattern**:

   ```ts
   import autocannon from "autocannon";

   test("Announcement browsing load test", async () => {
     const result = await autocannon({
       url: "http://localhost:3000/api/v1/announcements",
       connections: 50,
       duration: 10,
       headers: { Authorization: `Bearer ${token}` },
     });
     expect(result.errors).toBe(0);
     expect(result.throughput.average).toBeGreaterThan(100);
   });
   ```

2. **Run load tests** (0.5 hours)
   - Execute: `npm run test:performance -- announcementLoad.test.ts`
   - Document baseline metrics in PERFORMANCE.md
   - Record: throughput, latency, error rate

3. **Analyze and document results** (1 hour)
   - Update PERFORMANCE.md with announcement metrics
   - Compare to Phase 5 event benchmarks
   - Identify any bottlenecks (should be minimal)
   - Document scale limits

**Files Created/Modified**:

- 📝 backend/tests/performance/announcementLoad.test.ts — NEW
- ✏️ PERFORMANCE.md — Add announcement metrics

**Success Criteria**:

- [ ] All load tests pass
- [ ] P95 latency < 150ms
- [ ] Error rate 0%
- [ ] Metrics documented

**Effort**: 2–3 hours

---

## Summary: Workstream 1

| Task                     | Hours     | Priority | Difficulty |
| ------------------------ | --------- | -------- | ---------- |
| 12.1.1: Rich text editor | 6-8       | HIGH     | Medium     |
| 12.1.2: Draft system     | 4-5       | HIGH     | Medium     |
| 12.1.3: Date picker UI   | 3-4       | LOW      | Easy       |
| 12.1.4: Unarchive button | 2-3       | MEDIUM   | Easy       |
| 12.1.5: Component tests  | 3-4       | MEDIUM   | Medium     |
| 12.1.6: Load tests       | 2-3       | MEDIUM   | Easy       |
| **TOTAL**                | **20-27** |          |            |

**Recommended Execution Order**:

1. Task 12.1.1 (Rich text editor) — enables Task 12.1.2
2. Task 12.1.2 (Draft system) — high value, unblock publishing features
3. Task 12.1.4 (Unarchive button) — quick win
4. Task 12.1.5 (Tests) — ensure quality
5. Task 12.1.6 (Load test) — validation
6. Task 12.1.3 (Date picker) — LOW priority, defer if time-constrained

---

## Workstream 4: Deployment Validation (10–15 hours)

Moving directly to the production deployment validation since that's your other priority.

### **Task 12.4.1: Test Local Docker Build & Deployment** (3–4 hours)

**Objective**: Verify Docker images build successfully and containers run end-to-end.

**Current State**:

- Docker Compose files exist (docker-compose.yml, docker-compose.prod.yml)
- Backend and frontend Dockerfiles exist
- Never been tested in production scenario

**Prerequisites**:

- Docker Desktop installed and running
- PostgreSQL installed locally (for .env setup)
- .env files configured with real values

**Implementation Steps**:

1. **Create production .env file** (0.5 hours)
   - **File**: `backend/.env.production` (or use existing template)
   - Copy from .env.example
   - Set real values for:
     - `DATABASE_URL=postgresql://user:pass@localhost:5432/church_app_prod`
     - `JWT_SECRET=<generate from generate-secrets.sh>`
     - `REFRESH_TOKEN_SECRET=<generate>`
     - `SMTP_*=<your email service>`
     - All other required vars
   - **Do NOT commit** `.env.production` file

2. **Build backend Docker image** (1 hour)
   - **File**: Dockerfile
   - Run: `docker build -t church-app-backend:latest -f backend/Dockerfile .`
   - Verify: `docker images | grep church-app-backend`
   - Test image runs: `docker run --rm church-app-backend:latest npm --version` (should show version)

3. **Build frontend Docker image** (1 hour)
   - **File**: Dockerfile
   - Run: `docker build -t church-app-frontend:latest -f frontend/Dockerfile .`
   - Verify: `docker images | grep church-app-frontend`
   - Test image: `docker run --rm -p 8080:80 church-app-frontend:latest` → should serve on port 8080

4. **Test docker-compose.yml locally** (1–1.5 hours)
   - **File**: docker-compose.yml
   - Set `ENVIRONMENT=production` in compose file (temporary for testing)
   - Run: `docker-compose -f docker-compose.yml up -d`
   - Wait 30 seconds for services to start
   - Verify services:
     ```bash
     docker-compose ps  # Should show: backend, frontend, postgres, redis all running
     ```
   - Test connectivity:
     - Backend health: `curl http://localhost:3000/health`
     - Frontend: `curl http://localhost:80` → should return HTML
     - API endpoint: `curl http://localhost:3000/api/v1/announcements` → should return JSON (may be 401 if auth required)
   - Check logs: `docker-compose logs backend` (look for errors)
   - Cleanup: `docker-compose down -v`

**Files Modified**:

- ✏️ docker-compose.yml — Verify all services configured
- ✏️ `backend/.env.production` — NEW (gitignored)
- 📄 Dockerfile — Verify exists and correct
- 📄 Dockerfile — Verify exists and correct

**Success Criteria**:

- [ ] Backend Docker image builds without errors
- [ ] Frontend Docker image builds without errors
- [ ] docker-compose up runs all services
- [ ] Health check returns 200 OK
- [ ] Frontend responds on port 80
- [ ] No critical errors in logs

**Effort**: 3–4 hours

---

### **Task 12.4.2: Validate Kubernetes Manifests** (2–3 hours)

**Objective**: Verify K8s configs are syntactically correct and deployable.

**Current State**:

- K8s manifests exist in deployment.yaml
- Never been tested with kubectl

**Prerequisites**:

- minikube or local Kubernetes cluster running (or just validate syntax)
- kubectl CLI installed

**Implementation Steps**:

1. **Validate K8s YAML syntax** (0.5 hours)
   - Run: `kubectl apply -f k8s/ --dry-run=client -o yaml`
   - Fix any YAML validation errors
   - Verify all manifests parse correctly

2. **Review deployment manifests** (1 hour)
   - **File**: deployment.yaml
   - Checklist:
     - [ ] Backend deployment uses correct image: `church-app-backend:latest`
     - [ ] Frontend deployment uses correct image: `church-app-frontend:nginx`
     - [ ] Resources requests/limits are reasonable (CPU: 100m-500m, Memory: 128Mi-512Mi)
     - [ ] Health checks configured (liveness & readiness probes)
     - [ ] Environment variables match .env
     - [ ] Service ports exposed (backend: 3000, frontend: 80)
     - [ ] Ingress configured if needed (optional)
     - [ ] ConfigMap/Secrets referenced correctly

3. **Test dry-run deployment** (0.5 hours)
   - If minikube available: `kubectl apply -f k8s/ --dry-run=client`
   - If not available: Just validate YAML structure

4. **Document deployment commands** (0.5 hours)
   - **File**: DEPLOYMENT.md or docs/KUBERNETES.md — NEW
   - Add: Step-by-step kubectl commands to deploy
   - Add: How to check logs, scale, rollback
   - Add: Monitoring URLs

**Files Modified/Created**:

- ✏️ deployment.yaml — Fix any issues found
- 📝 docs/KUBERNETES.md — NEW deployment guide

**Success Criteria**:

- [ ] YAML validates without errors
- [ ] All images referenced correctly
- [ ] Resources configured
- [ ] Health checks in place
- [ ] Deployment docs complete

**Effort**: 2–3 hours

---

### **Task 12.4.3: Test GitHub Actions CI/CD Pipeline** (2–3 hours)

**Objective**: Verify workflow runs successfully, builds images, and would deploy.

**Current State**:

- CI/CD pipeline defined in ci-cd.yml
- Never been executed in real GitHub environment (or untested recently)

**Implementation Steps**:

1. **Review GitHub Actions workflow** (0.5 hours)
   - **File**: ci-cd.yml
   - Check steps:
     - [ ] Checkout code
     - [ ] Setup Node.js
     - [ ] Install dependencies (backend + frontend)
     - [ ] Run linting
     - [ ] Run tests
     - [ ] Build Docker images
     - [ ] Push to registry (DockerHub or GitHub Container Registry)
     - [ ] Deploy to staging/production (if configured)

2. **Set up GitHub secrets (if needed)** (0.5 hours)
   - Go to repository Settings → Secrets and variables → Actions
   - Add secrets (if not already present):
     - `DOCKER_USERNAME` — DockerHub username
     - `DOCKER_PASSWORD` — DockerHub token
     - `RENDER_API_KEY` — For Render.com deployment
     - `DATABASE_URL` — Production database URL
     - Others as needed per workflow

3. **Trigger workflow manually** (1 hour)
   - Push code to a branch (or use GitHub UI to trigger)
   - Watch workflow run in Actions tab
   - Check for errors/warnings
   - Record execution time (target: < 15 minutes)
   - Download logs if failures occur

4. **Fix workflow issues** (0.5 hours)
   - Common issues:
     - Missing secrets → add to GitHub Secrets
     - Node version mismatch → update `node-version` in workflow
     - Test failures → fix failing tests before CI
     - Image build errors → check Dockerfile syntax
   - Re-trigger workflow after fixes

5. **Document CI/CD process** (0.5 hours)
   - **File**: docs/CI-CD.md — NEW or update README.md
   - Add: How to trigger deployments
   - Add: How to rollback
   - Add: Secrets required
   - Add: Monitoring deployment status

**Files Modified/Created**:

- ✏️ ci-cd.yml — Fix if needed
- 📝 docs/CI-CD.md — NEW documentation
- 🔐 GitHub Secrets configured

**Success Criteria**:

- [ ] Workflow executes without errors
- [ ] All tests pass in CI
- [ ] Docker images build successfully
- [ ] Pipeline execution < 15 minutes
- [ ] Ready for deployment step

**Effort**: 2–3 hours

---

### **Task 12.4.4: Set Up Staging Deployment on Render.com** (3–4 hours)

**Objective**: Deploy to staging environment on Render to validate production config before going live.

**Current State**:

- Render.com has been configured (render.yaml exists)
- Staging environment not yet deployed
- Production not yet deployed

**Prerequisites**:

- Render.com account created
- GitHub repo connected to Render
- render.yaml configured

**Implementation Steps**:

1. **Create Render services** (1.5 hours)
   - Go to Render Dashboard
   - Create **Web Service** for backend:
     - Name: `church-app-backend-staging`
     - Source: GitHub repo
     - Branch: `main` (for staging)
     - Build command: `npm install && npm run build`
     - Start command: `npm start`
     - Environment: PostgreSQL (Neon), Redis, etc. — use Render blueprint or manual setup
   - Create **Web Service** for frontend:
     - Name: `church-app-frontend-staging`
     - Name: Same as above
     - Build command: `npm install && npm run build`
     - Start command: Serve `dist/` folder with nginx
   - Create **PostgreSQL** database:
     - Name: `church-app-staging-db`
     - Keep default settings
   - Create **Redis** instance (if used):
     - Name: `church-app-staging-redis`

2. **Configure environment variables in Render** (1 hour)
   - For backend service:
     - Go to Service → Environment
     - Add all secrets from .env.example
     - CRITICAL: Use Render PostgreSQL URL, not local
     - Set `NODE_ENV=staging`
     - Set `CORS_ORIGINS=https://<frontend-staging-url>`
   - For frontend service:
     - Add: `VITE_API_URL=https://<backend-staging-url>/api/v1`
     - Set `NODE_ENV=staging`

3. **Run database migrations on staging** (0.5 hours)
   - Once backend service is up, run migrations:
     ```bash
     # Via Render dashboard "Jobs" tab, or SSH:
     npx prisma migrate deploy
     npx prisma db seed
     ```
   - Verify database has tables: Check Render PostgreSQL connection

4. **Validate staging deployment** (1 hour)
   - Frontend URL: `https://<app-name>.onrender.com`
     - [ ] Page loads without errors
     - [ ] Navigation works
     - [ ] Styling loads correctly
   - Backend URL: `https://<app-name>.onrender.com/api/v1`
     - [ ] Health check: `GET /health` → 200 OK
     - [ ] API accessible: `GET /announcements` → returns data (may be 401)
   - Database connectivity:
     - [ ] Backend database logs show successful connections
     - [ ] Migrations applied successfully
   - Logs:
     - [ ] Check Render dashboard logs for errors
     - [ ] Check Sentry for exceptions (if configured)

5. **Document staging access** (0.5 hours)
   - **File**: docs/STAGING.md — NEW
   - Add: Staging URLs
   - Add: How to deploy to staging (git push or GitHub Actions trigger)
   - Add: How to monitor staging
   - Add: How to rollback

**Files Modified/Created**:

- ✏️ render.yaml — Update if needed for staging blueprint
- 📝 docs/STAGING.md — NEW
- 🔐 Render environment variables configured

**Success Criteria**:

- [ ] Backend service running on Render
- [ ] Frontend service running on Render
- [ ] Health check passes
- [ ] Database migrations applied
- [ ] Frontend loads CSS/JS correctly
- [ ] No critical errors in logs

**Effort**: 3–4 hours

---

### **Task 12.4.5: Execute Validation Checklist** (1–2 hours)

**Objective**: Perform manual end-to-end testing on staging to validate full user flows work.

**Current State**:

- All features implemented in Phase 1-11
- Never tested in production-like environment

**Manual Testing Flows** (Execute on staging):

| #   | Flow                           | Steps                                                            | Expected Result                                       |
| --- | ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | **Landing Page**               | Visit `/` → view page → scroll → see all sections                | Page loads, images load, responsive                   |
| 2   | **Register Member**            | Go to `/` → click register → fill form → submit                  | Account created, redirect to login                    |
| 3   | **Login**                      | Login with test credentials                                      | Token received, redirected to `/app/dashboard`        |
| 4   | **Dashboard**                  | View `/app/dashboard` → see widgets                              | Stats, upcoming events, announcements display         |
| 5   | **View Events**                | Go to `/app/events` → list loads → click event → detail shows    | Event data displays, RSVP button works                |
| 6   | **RSVP to Event**              | Click RSVP button → confirm → verify list updates                | Attendance count increases, confirm notification      |
| 7   | **View Announcements**         | Go to `/app/announcements` → see list → click one → detail loads | Announcement displays, priority badge shows           |
| 8   | **Send Message**               | Go to `/app/messages` → compose → send to another member         | Message appears in recipient inbox, notification sent |
| 9   | **Admin: Create Event**        | As admin, go `/app/admin/events` → create → publish              | Event appears in public calendar                      |
| 10  | **Admin: Create Announcement** | As admin, create urgent announcement → verify email sent         | Members receive email, appears on dashboard           |
| 11  | **Admin: Manage Members**      | Go `/app/admin/members` → view list → create new → delete test   | CRUD operations work, invitations sent                |
| 12  | **MFA Enrollment**             | As admin, enable MFA → scan QR → verify code → login with MFA    | Successful login with TOTP                            |
| 13  | **Mobile Responsive**          | View all pages on mobile (360px, 768px, 1024px width)            | Layout adapts, no horizontal scroll                   |
| 14  | **Error Handling**             | Try error scenarios: invalid login, expired token, 404 page      | Graceful error messages, redirects work               |
| 15  | **Performance**                | Use DevTools → measure page load, LCP, FCP                       | Load < 3s, LCP < 2.5s on 3G                           |

**Testing Procedure**:

1. **Create test script** (0.5 hours)
   - **File**: tests/STAGING_VALIDATION.md — NEW
   - List all flows above with pass/fail checkboxes
   - Add screenshots/notes column

2. **Execute testing** (0.5–1 hour)
   - Go through each flow
   - Record pass/fail
   - Screenshot any failures
   - Note: Will find real issues that automation misses

3. **Document results** (0.5 hours)
   - **File**: STAGING_TEST_RESULTS.md — NEW
   - Record date, tester, findings
   - Identify blockers (must fix before production)
   - Identify nice-to-haves (can fix later)

**Success Criteria**:

- [ ] All 15 flows pass
- [ ] No critical blockers
- [ ] Performance acceptable
- [ ] Mobile experience good

**Effort**: 1–2 hours

---

## Summary: Workstream 4

| Task                       | Hours     | Prereq             | Blocker if fails |
| -------------------------- | --------- | ------------------ | ---------------- |
| 12.4.1: Docker build       | 3-4       | Docker Desktop     | YES              |
| 12.4.2: K8s validation     | 2-3       | kubectl (optional) | NO               |
| 12.4.3: CI/CD pipeline     | 2-3       | GitHub Actions     | YES              |
| 12.4.4: Staging deploy     | 3-4       | Render account     | YES              |
| 12.4.5: Validation testing | 1-2       | Staging live       | YES              |
| **TOTAL**                  | **11-16** |                    |                  |

**Execution Order** (Sequential — each depends on previous):

1. Task 12.4.1 (Docker) ← Must pass first
2. Task 12.4.3 (CI/CD) ← Automates Docker builds
3. Task 12.4.2 (K8s) ← Optional, can run parallel
4. Task 12.4.4 (Staging) ← Deploys Docker images
5. Task 12.4.5 (Validation) ← Tests staging

---

## Overall Phase 12 Timeline

**Total Effort**: 31–43 hours of work

**Recommended Schedule** (Assuming 8 hours/day):

- **Week 1** (Mon-Wed): Workstream 1 → Rich text + Draft system (12-15 hours)
- **Week 1** (Thu-Fri) + **Week 2** (Mon-Tue): Workstream 4 → Docker + Staging (11-16 hours)
- **Week 2** (Wed-Fri): Workstream 1 → Polish + Tests (8-12 hours) + **Workstream 4** Validation (2 hours)

**Parallel Work Possible**:

- Workstream 1 tasks are independent (can do in any order)
- Workstream 4 tasks are dependent (must be sequential)
- Can work on WS1 while WS4 stages deploy (e.g., deploy runs, write tests while waiting)

---

## Key Decisions Before Starting

1. **Rich Text Editor**: Implement now or defer?
   - **Recommend**: NOW (6-8 hours, massive UX improvement)

2. **Date Picker UI**: Include or defer?
   - **Recommend**: DEFER (backend ready, UI can wait)

3. **Staging on Render vs. Self-hosted?**
   - **Current decision**: Render (easiest, already configured)
   - **Alternative**: Docker Compose on own server (requires more ops)

4. **Test coverage target**: 90% or 85%?
   - **Recommend**: 85% (good enough, tests in Workstream 1 should get there)

5. **Timeline**: When must production be live?
   - **If < 4 weeks**: Do Workstream 4 FIRST (deployment), then Workstream 1 (features)
   - **If > 4 weeks**: Do Workstream 1 FIRST (quality), then Workstream 4

Would you like me to create detailed task breakdowns for **Phase 13 New Features** (Sermon Management, Newsletter, LMS) next, or dive deeper into any of the Phase 12 tasks?

##### New Plan for next development from Opus 4.6

Plan: Production Hardening & Next Features
Your app is impressively complete — all 11 phases done, 363/382 tasks, and already deployed. After a thorough analysis of every layer (backend, frontend, tests, infra, specs), here's what I found and recommend tackling in two waves.

TL;DR: The codebase has 9 TODO stubs returning dummy data, a dead /register placeholder visible to users, an orphaned user_sessions table, several Clean Architecture violations (analytics/push/contact bypass use cases), an outdated OpenAPI spec, and 32/39 use cases lacking unit tests. Fix these to harden the production app, then layer on a calendar view, proper email templates, and real session tracking as new capabilities.

Wave 1 — Production Hardening (fix what's live)
Step 1: Remove the /register placeholder
The route at /register in App.tsx still renders a "Phase 4 coming soon" stub visible to real users. Since registration is admin-only, remove the route entirely or redirect to /login with a "Contact your administrator" message. Also remove the inline RegisterPage component.

Step 2: Fix dashboard dummy data (3 TODOs)
getMemberDashboard.ts returns hardcoded values at lines 94, 107, and 128:

rsvpStatus: undefined — wire up actual RSVP lookup via IEventRSVPRepository
isRead: false — wire up announcement view tracking via the member_announcement_views table
myRsvpCount: 0 — query actual RSVP count for the member
These are user-facing data gaps on the dashboard.

Step 3: Implement MemberDirectory bulk operations (4 TODOs)
MemberDirectoryPage.tsx has 4 stub handlers at lines 82-100:

Bulk email (needs backend endpoint or email service integration)
Bulk status change (needs admin endpoint)
Export members (backend /admin/export/members already exists — just wire it up)
Export with filters (same backend endpoint with query params)
The export ones are quick wins since the backend already supports them.

Step 4: Fix hardcoded analytics metric
The engagement analytics endpoint returns averageSessionDuration: 12 as a hardcoded constant despite a user_sessions table existing in the Prisma schema. Either:

Implement actual session tracking (create sessions on login, end on logout/timeout, query for the metric), or
Remove the misleading metric until it's real
Step 5: Clean up architecture violations
Several routes bypass the controller→use-case pattern, talking directly to Prisma or infrastructure services:

Analytics routes (analyticsRoutes.ts) — extract into use cases like GetDashboardAnalytics, GetMemberGrowth, etc.
Push notification routes (pushRoutes.ts) — add domain entity PushSubscription, interface IPushSubscriptionRepository, and proper use cases
Contact routes (contactRoutes.ts) — already uses contactService but should follow controller pattern
Report/Upload routes — same pattern: extract to controllers + use cases
This isn't urgent for functionality but matters for maintainability and consistency.

Step 6: Activate user_sessions table
The user_sessions model is defined in schema.prisma with sessionStart, sessionEnd, duration, userAgent, ipAddress but no code anywhere creates or reads sessions. Implement:

Create session record on successful login (in authenticateUser use case)
End session on logout (in logoutUser use case)
Query sessions for the analytics averageSessionDuration metric
This also fixes the logoutUser.ts TODO at line 43 about refresh token storage
Step 7: Update OpenAPI spec
openapi.yaml only covers the original 5 resource endpoints. It's missing 40+ endpoints added in Phases 8-11: MFA, admin, analytics, push notifications, reports, uploads, health checks, contact forms, bulk announcement operations. Update the spec to match reality — this is critical for contract tests and API documentation.

Step 8: Fill unit test gaps (prioritized)
32 of 39 use cases have no dedicated unit tests. Prioritize by risk:

High priority: resetPassword (noted as <25% coverage), requestPasswordReset, enrollMFA, verifyMFACode — security-critical paths
Medium priority: createAnnouncement, sendMessage, createMemberAccount — write-path use cases
Low priority: Read-path use cases already covered by contract/integration tests
Step 9: Fix mock data in AdminAnalyticsPage
AdminAnalyticsPage.tsx uses mockHeatMapData (line 47) for the engagement heatmap. Either implement a real backend endpoint for activity heatmap data or remove the mock visualization so admins don't see fake data.

Wave 2 — New Features
Step 10: Event calendar view (deferred T151)
Currently events are only shown in list view. Add a calendar component (using the already-installed shadcn calendar component or a library like react-big-calendar) for both the public /events page and the authenticated /app/events page.

Step 11: Proper email templates
The templates/ directory is empty — all 3 email types (password reset, urgent announcement, welcome) use inline HTML in emailService.ts. Add:

Extract to .html or .hbs template files with a template engine (Handlebars/EJS)
Add missing templates: RSVP confirmation, event update notification, regular announcement notification, MFA setup confirmation
Support for Thai/English email content
Step 12: Expand real-time WebSocket usage
The websocketClient.ts handles message:new, announcement:new/urgent, event:update but most frontend pages don't actively listen for these events. Wire up live updates in:

Messages page (new message toast + auto-refresh)
Announcements page (new announcement banner)
Event detail page (RSVP count live update)
Step 13: PWA enhancements
The service worker (sw.js) is well-implemented with caching and push notifications. Enhance with:

Background sync for offline form submissions (messages, RSVPs)
Periodic background sync for data freshening
App shortcuts in the manifest
Verification
Wave 1: Run cd backend && npm test — all 138+ tests should pass. Run cd frontend && npm run build — no build errors. Test the dashboard, member directory export, and analytics page manually to confirm real data replaces dummies.
Wave 2: Add E2E tests for calendar view (event-calendar.spec.ts already exists as a skeleton) and new email templates.
Decisions
Registration: Remove /register placeholder — admin-only creation is the intended flow
i18n: Defer app-page localization — public pages already support Thai/English
Architecture cleanup: Do incrementally alongside feature work rather than as a big-bang refactor
Test gaps: Prioritize security-critical use cases over read-path ones already covered by contract tests

### New Plan for All Landing pages components opus 4.6

Plan: Church Landing Pages — Comprehensive Bug Fix, Accessibility & UX Enhancement
TL;DR: A thorough audit of all 14 public pages, 5 auth pages, and shared layouts revealed 3 runtime bugs, 4 broken links, 6 non-functional buttons/forms, 15+ i18n gaps, 14 accessibility violations, and major code duplication (navigation defined twice, footer copy-pasted 12 times). This plan organizes fixes into 6 prioritized phases — from critical runtime bugs through architecture consolidation, accessibility/i18n, UX enhancements, design system alignment (using ui-ux-pro-max), and final polish. Each phase is independently shippable.

Phase 1: Critical Runtime Bugs & Security Fixes (Priority: Immediate)
Fix handleAddToCalendar crash in EventDetailPage.tsx:242-252 — The date string "2026-02-07T11:00AM" is invalid ISO 8601, causing toISOString() to throw RangeError. Parse AM/PM time to 24-hour format before constructing the Date.

Fix navigate() called during render in MFAVerificationPage.tsx:47-49 — Wrap the !state?.mfaToken redirect in a useEffect to avoid the React anti-pattern warning.

Fix token flash bug in PasswordResetPage.tsx:22-35 — Initialize token state directly from searchParams.get('token') instead of empty string to prevent the "Invalid Reset Link" view from flashing.

Clean up setTimeout leak in PasswordResetPage.tsx:87 — Store the timer ID and return a cleanup function from the useEffect (or move the redirect into a useEffect with proper unmount handling).

Remove console.log of prayer data in PrayerPage.tsx:105 — Leaks potentially sensitive personal information in production.

Fix user enumeration risk in LoginPage.tsx:56 — Replace err.message with a generic "Invalid email or password" message regardless of the specific backend error.

Review MFA secret flow in MFAEnrollmentPage.tsx:71 — Sending the TOTP secret from client→server on verify is a security concern. Verify server-side tracking and remove client-sent secret if the server already stores it from the enrollment step.

Add Error Boundary — Wrap lazy-loaded routes in App.tsx with a React error boundary component that shows a retry UI when chunk loading fails, preventing full white-screen crashes.

Phase 2: Broken Links, Dead Buttons & Navigation Fixes
Fix broken blog links — BlogPage.tsx:297 links to /blog/:id but no BlogDetailPage route exists. Either create a BlogDetailPage.tsx component and add the route in App.tsx, or change links to anchor to expanded blog content on the same page.

Fix "Load More" button in BlogPage.tsx:413-417 — Add onClick handler (paginate or reveal additional posts from the hardcoded array).

Fix blog newsletter form in BlogPage.tsx:427-440 — Add name attribute to email input, onSubmit to form, and onClick to subscribe button. At minimum, show a success toast.

Fix incomplete ministry detail pages — MinistryDetailPage.tsx:82-230 only has data for 2 of 12 ministries. Add detail data for all 12, or show a proper "Coming soon" placeholder instead of silently redirecting.

Fix "Share Event" button in EventDetailPage.tsx:489-492 — Implement navigator.share() (with clipboard fallback) or a share menu.

Fix "Request Resource" button in ResourcesPage.tsx:537-539 — Add onClick handler (modal form or mailto link).

Fix resource download URLs in ResourcesPage.tsx — Replace "#" placeholder URLs with actual resources or disable buttons with a "Coming soon" tooltip.

Fix hash link navigation in PublicLayout.tsx:113-120 — When navigating from a subpage to /#contact, add a useEffect watching location.hash after navigation to trigger scroll.

Phase 3: Architecture Consolidation (DRY)
Unify navigation into a single component — Extract the NavigationHeaderContent from LandingPage.tsx:156 into a shared PublicNavigation component. Both LandingPage and PublicLayout.tsx should use this same component (with props for variant: transparent vs solid). Remove the inline NavigationHeaderContent from LandingPage. Consolidate the duplicated NAV_LINKS array into a single shared constant.

Add footer to PublicLayout — Create a shared PublicFooter component (rich version matching the LandingPage.tsx:815) and add it to PublicLayout.tsx. Remove all per-page inline footers from: AboutPage, VisitPage, SermonsPage, GalleryPage, MinistriesPage, PrayerPage, GivePage, BlogPage, ResourcesPage.

Remove unused landing components — Delete or wire up the 7 exported-but-unused components in landing: NavigationHeader, AboutSection, PlanYourVisitSection, PrayerRequestSection, GiveSection, ProgressCountersSection, MemberPortalLink. If they're earmarked for future use, move them to a \_drafts/ directory or add // TODO comments.

Share iconMap between pages — Move the ministry icon mapping from MinistryDetailPage.tsx:233-246 and MinistriesPage.tsx into a shared constants/ministries.ts file.

Standardize import paths — Migrate all relative imports (../../components/) to @/ alias paths across all public pages (AboutPage.tsx:29, VisitPage.tsx:27, SermonsPage.tsx:23).

Phase 4: Accessibility & i18n
Add aria-live="assertive" to all error alerts across all auth pages (LoginPage.tsx, PasswordResetRequestPage.tsx, PasswordResetPage.tsx, MFAVerificationPage.tsx, MFAEnrollmentPage.tsx) and public form pages.

Fix keyboard-inaccessible dropdown menus — LandingPage.tsx:252-257 and PublicLayout.tsx:165-180 use CSS :hover and onMouseEnter/onMouseLeave for dropdowns. Add aria-expanded, aria-haspopup, keyboard Enter/Space toggle, Escape to close, and focus trapping. Also add tap/click toggle for touch devices.

Fix label associations — Add htmlFor/id pairs to all form inputs in: PrayerPage.tsx:146-177, GivePage.tsx:265, MFAVerificationPage.tsx:99, MFAEnrollmentPage.tsx:148. Add <label> elements to <select> filters in SermonsPage.tsx:245-260.

Fix gallery keyboard navigation — GalleryPage.tsx:304-313 photo grid items are <div onClick>. Change to <button> or add role="button", tabIndex={0}, onKeyDown handler. Add aria-label to lightbox action buttons at GalleryPage.tsx:383-387.

Fix ARIA roles on EventsPage — EventsPage.tsx:295-320 view tabs need aria-controls, id attributes, and content panels need role="tabpanel". Category filter buttons at EventsPage.tsx:276-293 need role="radiogroup" / role="radio".

Add skip-to-content link to PublicLayout — PublicLayout.tsx lacks this; only LandingPage.tsx:109-114 has it.

Translate logo alt text — Change "Church Logo" in LandingPage.tsx:237 and PublicLayout.tsx:146 to use t('common.churchName').

Add autoComplete="one-time-code" to TOTP inputs in MFAVerificationPage.tsx and MFAEnrollmentPage.tsx.

i18n: Translate all auth pages — All 5 auth pages have zero Thai translations. Add bilingual support using the existing useI18n() hook for: login form labels, error messages, MFA instructions, password reset flows.

i18n: Translate remaining public page content — Priority order:

PrivacyPolicyPage.tsx — entire page is English-only; doesn't even use useI18n().
AboutPage.tsx:200-276 — Core beliefs, Our Story, Leadership — all English-only.
VisitPage.tsx:56-119 — Service names, "What to Know" sections — all English-only.
SermonsPage.tsx:43-116 — Sermon titles, speakers, descriptions.
LandingPage.tsx:822-918 — Footer service times, contact heading, tagline.
Add descriptive alt text to ministry gallery images in MinistryDetailPage.tsx:404-412 — currently empty alt="".
Phase 5: UX Enhancements & Performance
Generate a design system using ui-ux-pro-max — Run the toolkit to establish a formal design specification:
Then align all pages with the resulting design-system/MASTER.md.

Fix timezone bug in EventsPage calendar — EventsPage.tsx:525-527 isToday uses UTC toISOString(). Replace with local date formatting: new Intl.DateTimeFormat('en-CA').format(new Date()).

Memoize computed values — Add useMemo to:

LandingPage.tsx:559-585 tagline parsing
EventsPage.tsx:207-213 getDaysInMonth / getEventsForDate
GalleryPage.tsx:183-185 filteredPhotos
SermonsPage.tsx:133-155 — Replace useEffect + setState filtering pattern with useMemo.
Fix body overflow leak in GalleryPage.tsx:191 — Save and restore original document.body.style.overflow value instead of resetting to empty string.

Add form validation — Add min="1" to amount input in GivePage.tsx:265, guard against NaN in summary at GivePage.tsx:535, add phone pattern validation in VisitPage.tsx:398-401.

Remove YouTube autoplay in SermonsPage.tsx:210-215 — autoplay=1 is disruptive; let users opt-in to play.

Improve the 404 page — Extract the inline NotFoundPage from App.tsx:135-141 into a dedicated component with church branding, a "Go Home" button, and proper <title> update via useEffect.

Lazy-load non-critical eager routes — App.tsx eagerly loads AboutPage, VisitPage, SermonsPage, PrivacyPolicyPage. Convert these to React.lazy() imports to reduce initial bundle size.

Add loading="lazy" to images missing it: pastor photo in AboutPage.tsx:370-375, community image at AboutPage.tsx:307-309, Google Maps iframe in VisitPage.tsx:238-250.

Add image error fallbacks — All Unsplash images in AboutPage.tsx:44, elder photos at AboutPage.tsx:57-62, and gallery thumbnails need onError fallback handlers (show a placeholder/broken-image icon).

Fix dynamic footer year — Replace hardcoded "2026" in inline footers across ~10 pages with {new Date().getFullYear()} (this is automatically resolved if Phase 3 step 18 consolidates footers into a shared component).

Phase 6: Visual Polish & Design Consistency
Standardize color usage — Replace ad-hoc color classes (text-blue-600, bg-gray-50, text-indigo-600) with theme tokens (text-primary, bg-background, text-primary-foreground) across auth and public pages per the shadcn-ui-guide.md and ui-ux-pro-max pre-delivery checklist.

Add dark mode support to sub-pages — Only LandingPage.tsx:106 has dark: classes. Add dark mode variants to all public pages and PublicLayout.

Add SEO <title> and meta tags — Only the landing page uses the <SEO> component. Add it to all 13 other public pages and all auth pages with appropriate per-page titles and descriptions.

Add cursor-pointer to all interactive elements per ui-ux-pro-max checklist — Audit all card-based click targets (event cards, ministry cards, blog cards, gallery items) and ensure cursor-pointer is present.

Ensure consistent card hover states — Use hover:shadow-lg transition-shadow duration-200 pattern consistently across all card grids (events, ministries, blog, resources, sermons).

Fix mobile calendar usability — EventsPage.tsx:510 calendar cells are h-16 on mobile — too small. Increase to h-20 on mobile or switch to a list-based agenda view on small screens.

Add logo error fallback in PublicLayout.tsx:149-151 — Currently hides the image with no replacement. Show text fallback "SBA" or church name.

Verification
Phase 1: Run the app, navigate to /events/1 and click "Add to Calendar" — should not throw. Visit /mfa-verify without state — should redirect cleanly without console warnings. Check /reset-password?token=test — no "Invalid" flash.
Phase 2: Click every link on every page — confirm no 404s. Click every button — confirm all have handlers.
Phase 3: Change a navigation link → confirm it updates on all pages. Verify no import from pattern remains.
Phase 4: Run axe-core or Lighthouse accessibility audit across all pages — target 0 critical violations. Switch language to Thai — verify all visible text translates.
Phase 5: Run npm run build — confirm bundle size is reduced. Open in Chrome DevTools → Performance tab — no unnecessary re-renders.
Phase 6: Visual comparison at 375px, 768px, 1024px, 1440px breakpoints. Toggle dark mode. Run Lighthouse (Performance, Accessibility, SEO, Best Practices) — target 90+ on all.
Decisions
Shared footer strategy: Chose rich footer (matching LandingPage) in PublicLayout over minimal footer — provides consistent branding and navigation.
Blog detail page: Chose creating a BlogDetailPage route over removing links — the blog data structure already supports individual posts.
Navigation unification: Chose shared component with variant props over HOC — simpler, more explicit, easier to maintain.
Design system: Will use ui-ux-pro-max --design-system --persist --stack shadcn to generate a MASTER.md before Phase 6 implementation, ensuring all visual polish is grounded in a formal spec rather than ad-hoc decisions.

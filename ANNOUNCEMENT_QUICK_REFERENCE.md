# Quick Reference: New Announcement Features

## 🎯 For End Users

### Search & Filter Announcements

1. **Search**: Type in search box → Auto-filters after 500ms
2. **Priority Filter**: Select "Urgent" or "Normal" from dropdown
3. **Author Filter**: Select specific author from dropdown
4. **Sort**: Choose "Date", "Priority", or "Views"
5. **Sort Order**: Click ↑/↓ button to toggle ascending/descending
6. **Clear**: Click "Clear" to reset all filters

### Bulk Actions

1. **Select Items**: Check boxes next to announcements
2. **Select All**: Click checkbox in table header
3. **Archive Multiple**: Select items → Click "Archive" in bottom bar
4. **Delete Multiple**: Select items → Click "Delete" in bottom bar
5. **Clear Selection**: Click "Clear" or "X" in bottom bar

### View Analytics

1. **Access**: Click chart icon (📊) next to any announcement
2. **See**: Total views, first/last viewed dates, recent viewers
3. **Actions**: View or edit announcement from analytics page

---

## 💻 For Developers

### API Endpoints

**Search & Filter:**

```http
GET /api/v1/announcements?search=worship&priority=URGENT&authorId=123&sortBy=date&sortOrder=desc
```

**Bulk Archive:**

```http
POST /api/v1/announcements/bulk-archive
Content-Type: application/json

{
  "ids": ["id1", "id2", "id3"]
}
```

**Bulk Delete:**

```http
POST /api/v1/announcements/bulk-delete
Content-Type: application/json

{
  "ids": ["id1", "id2", "id3"]
}
```

**Unarchive:**

```http
POST /api/v1/announcements/:id/unarchive
```

**Get Authors:**

```http
GET /api/v1/announcements/authors
```

**Get Analytics:**

```http
GET /api/v1/announcements/:id/analytics
```

### Frontend Service Usage

```typescript
import { announcementService } from "@/services/endpoints/announcementService";

// Search and filter
const filters = {
  search: "worship",
  priority: "URGENT",
  authorId: "user-id",
  sortBy: "date",
  sortOrder: "desc",
};
const results = await announcementService.getAnnouncements(
  false,
  1,
  10,
  filters
);

// Bulk operations
await announcementService.bulkArchive(["id1", "id2"]);
await announcementService.bulkDelete(["id1", "id2"]);

// Unarchive
await announcementService.unarchiveAnnouncement("id");

// Get authors for filter
const authors = await announcementService.getAuthors();

// Get analytics
const analytics = await announcementService.getAnalytics("announcement-id");
```

### Component Usage

```typescript
import { AnnouncementFilters } from '@/components/announcements/AnnouncementFilters';
import { BulkActionBar } from '@/components/announcements/BulkActionBar';

// Filters component
<AnnouncementFilters
  onFiltersChange={setFilters}
  authors={authors}
  loading={loading}
/>

// Bulk action bar
<BulkActionBar
  selectedCount={selectedIds.length}
  onArchive={handleBulkArchive}
  onDelete={handleBulkDelete}
  onClearSelection={() => setSelectedIds([])}
  isArchived={showArchived}
/>
```

### Hook Usage

```typescript
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useDebounce } from "@/hooks/useDebounce";

// With filters
const filters = {
  search: "test",
  priority: "URGENT",
  sortBy: "date",
  sortOrder: "desc",
};
const { announcements, pagination, loading, error } = useAnnouncements(
  archived,
  page,
  limit,
  refreshKey,
  filters
);

// Debounce search
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);
```

---

## 🗂️ File Structure

### New Files Created:

```
frontend/src/
├── components/
│   └── announcements/
│       ├── AnnouncementFilters.tsx       ✨ NEW
│       └── BulkActionBar.tsx            ✨ NEW
├── hooks/
│   └── useDebounce.ts                   ✨ NEW
├── pages/
│   └── announcements/
│       └── AnnouncementAnalyticsPage.tsx ✨ NEW
└── services/
    └── endpoints/
        └── announcementService.ts        ✏️ UPDATED

backend/src/
├── infrastructure/
│   └── database/
│       └── repositories/
│           └── announcementRepository.ts  ✏️ UPDATED
├── application/
│   └── useCases/
│       └── getAnnouncements.ts           ✏️ UPDATED
└── presentation/
    ├── controllers/
    │   └── announcementController.ts     ✏️ UPDATED
    └── routes/
        └── announcementRoutes.ts         ✏️ UPDATED
```

---

## 🎨 UI Components

### AnnouncementFilters

**Props:**

- `onFiltersChange: (filters: FilterState) => void` - Callback when filters change
- `authors: Author[]` - List of authors for dropdown
- `loading?: boolean` - Disable controls when loading

### BulkActionBar

**Props:**

- `selectedCount: number` - Number of selected items
- `onArchive: () => void` - Archive handler
- `onDelete: () => void` - Delete handler
- `onClearSelection: () => void` - Clear selection handler
- `isArchived?: boolean` - Hide archive button if true

### AnnouncementAnalyticsPage

**Route:** `/admin/announcements/:id/analytics`
**Features:**

- Total views card
- First/last viewed cards
- Recent viewers list
- Navigation buttons

---

## 🔐 Permissions

All new features require proper authentication and authorization:

| Feature       | Required Role | Endpoint            |
| ------------- | ------------- | ------------------- |
| Search/Filter | All Members   | GET /announcements  |
| Bulk Archive  | Admin/Staff   | POST /bulk-archive  |
| Bulk Delete   | Admin/Staff   | POST /bulk-delete   |
| Unarchive     | Admin/Staff   | POST /:id/unarchive |
| Analytics     | Admin/Staff   | GET /:id/analytics  |
| Get Authors   | All Members   | GET /authors        |

---

## ⚡ Performance Tips

1. **Search is debounced** - Waits 500ms after typing stops
2. **Filters reset page** - Returns to page 1 when filter changes
3. **Selection clears** - Auto-clears when changing views
4. **Optimized queries** - Database indexes speed up searches
5. **Pagination works** - With all filter combinations

---

## 🐛 Troubleshooting

**Filters not working?**

- Check network tab for API calls
- Verify filter parameters in request
- Check console for errors

**Bulk actions not appearing?**

- Select at least one item
- BulkActionBar only shows when items selected

**Analytics not loading?**

- Verify announcement ID is valid
- Check user has Admin/Staff role
- Look for API errors in console

**Search too slow?**

- Debouncing is working (500ms delay)
- Check backend logs for query performance
- Verify database indexes are applied

---

## 📊 Analytics Data Structure

```typescript
interface ViewAnalytics {
  totalViews: number;
  firstViewed: string | null;
  lastViewed: string | null;
  recentViews: Array<{
    id: string;
    viewedAt: string;
    member: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}
```

---

## 🎯 Testing Checklist

### Manual Testing:

- [ ] Search with single word
- [ ] Search with multiple words
- [ ] Filter by priority
- [ ] Filter by author
- [ ] Combine multiple filters
- [ ] Sort by each option
- [ ] Toggle sort order
- [ ] Select single item
- [ ] Select multiple items
- [ ] Select all items
- [ ] Bulk archive
- [ ] Bulk delete
- [ ] View analytics
- [ ] Navigate from analytics
- [ ] Test on mobile device
- [ ] Test pagination with filters

### Automated Testing:

- [ ] Add tests for filter logic
- [ ] Add tests for bulk operations
- [ ] Add tests for analytics endpoint
- [ ] Add component tests for new components
- [ ] Update existing tests for new parameters

---

## 🚀 Quick Start

1. **Backend**: Already running with new endpoints
2. **Frontend**: Refresh browser to load new components
3. **Try it**: Go to Admin → Manage Announcements
4. **Search**: Type in search box
5. **Filter**: Select priority or author
6. **Select**: Check some boxes
7. **Bulk**: Archive or delete multiple
8. **Analytics**: Click chart icon

---

## 📚 Documentation

- `ANNOUNCEMENT_IMPLEMENTATION_COMPLETE.md` - Full implementation summary
- `ANNOUNCEMENT_IMPLEMENTATION_GUIDE.md` - Step-by-step guide
- `ANNOUNCEMENT_ENHANCEMENTS_STATUS.md` - Status tracking
- `ANNOUNCEMENT_IMPROVEMENTS_COMPLETE.md` - Original improvements

---

**Need Help?** All code is documented with JSDoc comments. Check component files for detailed usage information.

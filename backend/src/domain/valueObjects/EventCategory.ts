/**
 * Event categories for church activities
 */
export enum EventCategory {
  WORSHIP = 'WORSHIP',
  BIBLE_STUDY = 'BIBLE_STUDY',
  COMMUNITY = 'COMMUNITY',
  FELLOWSHIP = 'FELLOWSHIP',
}

/**
 * Get display name for event category
 */
export function getEventCategoryDisplay(category: EventCategory): string {
  const displayNames: Record<EventCategory, string> = {
    [EventCategory.WORSHIP]: 'Worship Service',
    [EventCategory.BIBLE_STUDY]: 'Bible Study',
    [EventCategory.COMMUNITY]: 'Community Outreach',
    [EventCategory.FELLOWSHIP]: 'Fellowship',
  };
  return displayNames[category];
}

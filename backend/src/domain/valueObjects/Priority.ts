/**
 * Priority levels for announcements
 */
export enum Priority {
  URGENT = 'URGENT',
  NORMAL = 'NORMAL',
}

/**
 * Check if priority is urgent
 */
export function isUrgent(priority: Priority): boolean {
  return priority === Priority.URGENT;
}

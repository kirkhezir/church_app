/**
 * User roles in the system
 */
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  MEMBER = 'MEMBER',
}

/**
 * Check if a role has admin privileges
 */
export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN;
}

/**
 * Check if a role has staff privileges (includes admin)
 */
export function isStaffOrAdmin(role: Role): boolean {
  return role === Role.ADMIN || role === Role.STAFF;
}

/**
 * Shared color utilities for consistent dark-mode-aware styling.
 *
 * Instead of repeating `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`
 * across dozens of components, import from here.
 */

/* ------------------------------------------------------------------ */
/* Badge / Pill colors                                                 */
/* ------------------------------------------------------------------ */

export const badgeColors = {
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
} as const;

export type BadgeColor = keyof typeof badgeColors;

/* ------------------------------------------------------------------ */
/* Icon container backgrounds (the soft circle behind an icon)         */
/* ------------------------------------------------------------------ */

export const iconBgColors = {
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
  violet: 'bg-violet-100 dark:bg-violet-900/30',
  amber: 'bg-amber-100 dark:bg-amber-900/30',
  rose: 'bg-rose-100 dark:bg-rose-900/30',
  red: 'bg-red-100 dark:bg-red-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  orange: 'bg-orange-100 dark:bg-orange-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  teal: 'bg-teal-100 dark:bg-teal-900/30',
} as const;

export type IconBgColor = keyof typeof iconBgColors;

/* ------------------------------------------------------------------ */
/* Tinted section backgrounds (subtle color washes for cards/sections) */
/* ------------------------------------------------------------------ */

export const tintedBg = {
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50',
  amber: 'bg-amber-50 dark:bg-amber-950/50',
  blue: 'bg-blue-50 dark:bg-blue-950/50',
  purple: 'bg-purple-50 dark:bg-purple-950/50',
  rose: 'bg-rose-50 dark:bg-rose-950/50',
  green: 'bg-green-50 dark:bg-green-950/50',
  red: 'bg-red-50 dark:bg-red-950/50',
  orange: 'bg-orange-50 dark:bg-orange-950/50',
  teal: 'bg-teal-50 dark:bg-teal-950/50',
} as const;

/* ------------------------------------------------------------------ */
/* Alert / Bordered message boxes                                      */
/* ------------------------------------------------------------------ */

export const alertColors = {
  green:
    'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
  red: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
  amber:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  blue: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
} as const;

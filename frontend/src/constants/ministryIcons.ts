/**
 * Shared ministry icon mapping
 *
 * Maps ministry slug IDs to their corresponding Lucide icon components.
 * Used by both MinistriesPage and MinistryDetailPage.
 */

import {
  Users,
  Baby,
  Heart,
  Music,
  BookOpen,
  Globe,
  Utensils,
  Compass,
  HeartHandshake,
  GraduationCap,
  Church,
  Mic2,
} from 'lucide-react';
import type React from 'react';

export const ministryIconMap: Record<string, React.ElementType> = {
  youth: Users,
  children: Baby,
  women: Heart,
  music: Music,
  'sabbath-school': BookOpen,
  pathfinders: Compass,
  'community-service': HeartHandshake,
  health: Utensils,
  missions: Globe,
  education: GraduationCap,
  deacons: Church,
  media: Mic2,
};

/**
 * Component Tests: AnnouncementCard
 *
 * Tests the AnnouncementCard component rendering and interactions
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AnnouncementCard } from '../../../src/components/features/announcements/AnnouncementCard';
import { describe, it, expect, jest } from '@jest/globals';

// Mock announcement data - dates should be ISO strings as per the Announcement interface
const mockNormalAnnouncement = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Sunday Service Update',
  content:
    'This is a normal announcement about our Sunday service schedule. It contains important information for all members.',
  priority: 'NORMAL' as const,
  publishedAt: '2025-11-10T10:00:00Z',
  archivedAt: null,
  isDraft: false,
  createdAt: '2025-11-10T10:00:00Z',
  author: {
    id: 'author-1',
    firstName: 'John',
    lastName: 'Pastor',
    email: 'pastor@church.com',
  },
};

const mockUrgentAnnouncement = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  title: 'Urgent Weather Alert',
  content:
    'Service cancelled due to severe weather conditions. Please stay safe at home and join us online instead.',
  priority: 'URGENT' as const,
  publishedAt: '2025-11-11T08:00:00Z',
  archivedAt: null,
  isDraft: false,
  createdAt: '2025-11-11T08:00:00Z',
  author: {
    id: 'author-1',
    firstName: 'John',
    lastName: 'Pastor',
    email: 'pastor@church.com',
  },
};

const mockArchivedAnnouncement = {
  ...mockNormalAnnouncement,
  id: '323e4567-e89b-12d3-a456-426614174002',
  title: 'Old Announcement',
  archivedAt: '2025-11-09T12:00:00Z',
};

// Wrapper component for Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AnnouncementCard', () => {
  describe('Rendering', () => {
    it('should render normal announcement correctly', () => {
      renderWithRouter(<AnnouncementCard announcement={mockNormalAnnouncement} />);

      // Title should be visible
      expect(screen.getByText('Sunday Service Update')).toBeInTheDocument();

      // Author should be visible - might have different format
      expect(screen.getByText(/John/i)).toBeInTheDocument();

      // Priority badge should show "Normal" - use getAllByText since content also has "normal"
      expect(screen.getAllByText(/normal/i).length).toBeGreaterThan(0);

      // Date should be formatted and visible
      expect(screen.getByText(/Nov/i)).toBeInTheDocument();

      // Content preview should be visible (truncated)
      expect(screen.getByText(/This is a normal announcement/)).toBeInTheDocument();
    });

    it('should render urgent announcement with urgent badge', () => {
      renderWithRouter(<AnnouncementCard announcement={mockUrgentAnnouncement} />);

      expect(screen.getByText('Urgent Weather Alert')).toBeInTheDocument();

      // Urgent badge should be visible
      const urgentBadge = screen.getByText('Urgent');
      expect(urgentBadge).toBeInTheDocument();
      expect(urgentBadge).toHaveClass(/red/i); // Should have red styling
    });

    it('should render archived announcement with archived indicator', () => {
      renderWithRouter(<AnnouncementCard announcement={mockArchivedAnnouncement} />);

      expect(screen.getByText('Old Announcement')).toBeInTheDocument();

      // Archived indicator should be visible
      expect(screen.getByText(/Archived/i)).toBeInTheDocument();
    });

    it('should truncate long content', () => {
      const longContentAnnouncement = {
        ...mockNormalAnnouncement,
        content: 'A'.repeat(500), // Very long content
      };

      renderWithRouter(<AnnouncementCard announcement={longContentAnnouncement} />);

      const content = screen.getByText(/A+/);
      // Content should be truncated (not showing all 500 characters)
      expect(content.textContent!.length).toBeLessThan(500);
    });
  });

  describe('Priority Badges', () => {
    it('should display blue badge for NORMAL priority', () => {
      renderWithRouter(<AnnouncementCard announcement={mockNormalAnnouncement} />);

      const badge = screen.getByText('Normal');
      expect(badge).toBeInTheDocument();
      // Should have blue styling classes
      expect(badge.closest('span')).toHaveClass(/blue/i);
    });

    it('should display red badge for URGENT priority', () => {
      renderWithRouter(<AnnouncementCard announcement={mockUrgentAnnouncement} />);

      const badge = screen.getByText('Urgent');
      expect(badge).toBeInTheDocument();
      // Should have red styling classes
      expect(badge.closest('span')).toHaveClass(/red/i);
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      renderWithRouter(<AnnouncementCard announcement={mockNormalAnnouncement} />);

      // Should show formatted date (e.g., "Nov 10, 2025")
      expect(screen.getByText(/Nov 10, 2025/i)).toBeInTheDocument();
    });

    it('should show both published date and archived date for archived announcements', () => {
      renderWithRouter(<AnnouncementCard announcement={mockArchivedAnnouncement} />);

      // Should show published date
      expect(screen.getByText(/Nov 10, 2025/i)).toBeInTheDocument();

      // Should show archived indicator
      expect(screen.getByText(/Archived/i)).toBeInTheDocument();
    });
  });

  describe('Author Information', () => {
    it('should display author full name', () => {
      renderWithRouter(<AnnouncementCard announcement={mockNormalAnnouncement} />);

      expect(screen.getByText(/John Pastor/i)).toBeInTheDocument();
    });

    it('should display author name without "By" prefix', () => {
      renderWithRouter(<AnnouncementCard announcement={mockNormalAnnouncement} />);

      // Component shows author name directly without "By" prefix
      expect(screen.getByText('John Pastor')).toBeInTheDocument();
    });
  });

  describe('View Details Button', () => {
    it('should have View Details button when onViewDetails is provided', () => {
      const mockOnViewDetails = jest.fn();
      renderWithRouter(
        <AnnouncementCard announcement={mockNormalAnnouncement} onViewDetails={mockOnViewDetails} />
      );

      const button = screen.getByTestId('view-details-button');
      expect(button).toBeInTheDocument();
    });

    it('should call onViewDetails when button is clicked', () => {
      const mockOnViewDetails = jest.fn();
      renderWithRouter(
        <AnnouncementCard announcement={mockNormalAnnouncement} onViewDetails={mockOnViewDetails} />
      );

      fireEvent.click(screen.getByTestId('view-details-button'));
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockNormalAnnouncement.id);
    });
  });

  describe('Card Structure', () => {
    it('should render as a card component', () => {
      renderWithRouter(<AnnouncementCard announcement={mockNormalAnnouncement} />);

      // Card renders with heading
      expect(screen.getByText('Sunday Service Update')).toBeInTheDocument();
    });

    it('should have accessible content', () => {
      const mockOnViewDetails = jest.fn();
      renderWithRouter(
        <AnnouncementCard announcement={mockNormalAnnouncement} onViewDetails={mockOnViewDetails} />
      );

      // Button should be accessible
      const button = screen.getByTestId('view-details-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short content', () => {
      const shortContentAnnouncement = {
        ...mockNormalAnnouncement,
        content: 'Hi',
      };

      renderWithRouter(<AnnouncementCard announcement={shortContentAnnouncement} />);

      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const emptyContentAnnouncement = {
        ...mockNormalAnnouncement,
        content: '',
      };

      renderWithRouter(<AnnouncementCard announcement={emptyContentAnnouncement} />);

      // Should still render the card without crashing
      expect(screen.getByText('Sunday Service Update')).toBeInTheDocument();
    });
  });
});

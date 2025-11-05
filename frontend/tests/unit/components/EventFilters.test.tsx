/**
 * Unit Tests for EventFilters Component (T122)
 * Tests filter controls, category selection, date inputs, and clear functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { EventFilters } from '@/components/features/events/EventFilters';
import { EventCategory } from '@/types/api';

describe('EventFilters', () => {
  const mockOnCategoryChange = jest.fn();
  const mockOnStartDateChange = jest.fn();
  const mockOnEndDateChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render all category filter buttons', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Worship')).toBeInTheDocument();
      expect(screen.getByText('Bible Study')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Fellowship')).toBeInTheDocument();
    });

    it('should render date range inputs', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByLabelText('From')).toBeInTheDocument();
      expect(screen.getByLabelText('To')).toBeInTheDocument();
    });

    it('should not show clear button when no filters are active', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });
  });

  describe('Category Selection', () => {
    it('should call onCategoryChange with undefined when "All" is clicked', () => {
      render(
        <EventFilters
          selectedCategory={EventCategory.WORSHIP}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const allButton = screen.getByText('All');
      fireEvent.click(allButton);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
      expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onCategoryChange with WORSHIP when "Worship" is clicked', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const worshipButton = screen.getByText('Worship');
      fireEvent.click(worshipButton);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
      expect(mockOnCategoryChange).toHaveBeenCalledWith(EventCategory.WORSHIP);
    });

    it('should call onCategoryChange with BIBLE_STUDY when "Bible Study" is clicked', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const bibleStudyButton = screen.getByText('Bible Study');
      fireEvent.click(bibleStudyButton);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
      expect(mockOnCategoryChange).toHaveBeenCalledWith(EventCategory.BIBLE_STUDY);
    });

    it('should call onCategoryChange with COMMUNITY when "Community" is clicked', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const communityButton = screen.getByText('Community');
      fireEvent.click(communityButton);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
      expect(mockOnCategoryChange).toHaveBeenCalledWith(EventCategory.COMMUNITY);
    });

    it('should call onCategoryChange with FELLOWSHIP when "Fellowship" is clicked', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const fellowshipButton = screen.getByText('Fellowship');
      fireEvent.click(fellowshipButton);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
      expect(mockOnCategoryChange).toHaveBeenCalledWith(EventCategory.FELLOWSHIP);
    });

    it('should highlight selected category button', () => {
      render(
        <EventFilters
          selectedCategory={EventCategory.WORSHIP}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const worshipButton = screen.getByText('Worship');
      // Check that the button has the 'default' variant (active state)
      expect(worshipButton.closest('button')).not.toHaveClass('variant-outline');
    });

    it('should show "All" as highlighted when no category is selected', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const allButton = screen.getByText('All');
      expect(allButton.closest('button')).not.toHaveClass('variant-outline');
    });
  });

  describe('Date Range Inputs', () => {
    it('should call onStartDateChange when start date is changed', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const startDateInput = screen.getByLabelText('From');
      fireEvent.change(startDateInput, { target: { value: '2025-11-10' } });

      expect(mockOnStartDateChange).toHaveBeenCalledTimes(1);
      expect(mockOnStartDateChange).toHaveBeenCalledWith('2025-11-10');
    });

    it('should call onEndDateChange when end date is changed', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const endDateInput = screen.getByLabelText('To');
      fireEvent.change(endDateInput, { target: { value: '2025-11-20' } });

      expect(mockOnEndDateChange).toHaveBeenCalledTimes(1);
      expect(mockOnEndDateChange).toHaveBeenCalledWith('2025-11-20');
    });

    it('should display start date value in input', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate="2025-11-10"
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const startDateInput = screen.getByLabelText('From') as HTMLInputElement;
      expect(startDateInput.value).toBe('2025-11-10');
    });

    it('should display end date value in input', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate="2025-11-20"
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const endDateInput = screen.getByLabelText('To') as HTMLInputElement;
      expect(endDateInput.value).toBe('2025-11-20');
    });
  });

  describe('Clear All Functionality', () => {
    it('should show clear button when category is selected', () => {
      render(
        <EventFilters
          selectedCategory={EventCategory.WORSHIP}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when start date is set', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate="2025-11-10"
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when end date is set', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate="2025-11-20"
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when multiple filters are active', () => {
      render(
        <EventFilters
          selectedCategory={EventCategory.WORSHIP}
          startDate="2025-11-10"
          endDate="2025-11-20"
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should call onClear when clear button is clicked', () => {
      render(
        <EventFilters
          selectedCategory={EventCategory.WORSHIP}
          startDate="2025-11-10"
          endDate="2025-11-20"
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should render with grid layout', () => {
      const { container } = render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const gridElement = container.querySelector('.grid');
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid category changes', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const worshipButton = screen.getByText('Worship');
      const bibleStudyButton = screen.getByText('Bible Study');

      fireEvent.click(worshipButton);
      fireEvent.click(bibleStudyButton);
      fireEvent.click(worshipButton);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(3);
    });

    it('should handle empty string dates', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate=""
          endDate=""
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const startDateInput = screen.getByLabelText('From') as HTMLInputElement;
      const endDateInput = screen.getByLabelText('To') as HTMLInputElement;

      expect(startDateInput.value).toBe('');
      expect(endDateInput.value).toBe('');
    });

    it('should handle same start and end dates', () => {
      render(
        <EventFilters
          selectedCategory={undefined}
          startDate="2025-11-10"
          endDate="2025-11-10"
          onCategoryChange={mockOnCategoryChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          onClear={mockOnClear}
        />
      );

      const startDateInput = screen.getByLabelText('From') as HTMLInputElement;
      const endDateInput = screen.getByLabelText('To') as HTMLInputElement;

      expect(startDateInput.value).toBe('2025-11-10');
      expect(endDateInput.value).toBe('2025-11-10');
    });
  });
});

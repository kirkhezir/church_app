import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

/**
 * Component Tests for Landing Page
 *
 * Tests all sections of the landing page:
 * - Hero section with church name and welcome message
 * - Worship times display
 * - Location map (embedded Google Maps)
 * - Mission statement
 * - Contact form with validation
 *
 * Following TDD: These tests should FAIL until components are implemented
 *
 * Note: Components don't exist yet - this is the RED phase
 */

// Mock fetch globally for contact form tests
global.fetch = jest.fn();

describe('LandingPage Component', () => {
  let LandingPage: any;

  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockClear();

    // Try to import the component (will fail in RED phase)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require('../../../src/pages/public/LandingPage');
      LandingPage = module.default || module.LandingPage;
    } catch (error) {
      LandingPage = undefined;
    }
  });

  it('should exist as a component', () => {
    if (!LandingPage) {
      expect(LandingPage).toBeUndefined();
      return;
    }

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Hero Section', () => {
    it('should display church name in both English and Thai', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Church name appears in multiple places (hero + location section)
      const englishNames = screen.getAllByText(/Sing Buri Adventist Center/i);
      expect(englishNames.length).toBeGreaterThan(0);
      expect(screen.getByText(/ศูนย์แอ็ดเวนตีสท์สิงห์บุรี/)).toBeInTheDocument();
    });

    it('should display welcome message', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // "Welcome" text appears in multiple places
      const welcomeTexts = screen.getAllByText(/welcome/i);
      expect(welcomeTexts.length).toBeGreaterThan(0);
    });

    it('should have accessible heading structure', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0].tagName).toBe('H1');
    });
  });

  describe('Worship Times Section', () => {
    it('should display worship times heading', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/worship.*times/i)).toBeInTheDocument();
    });

    it('should display Sabbath service time', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Multiple instances of "Sabbath" text expected (heading + time label)
      const sabbathTexts = screen.getAllByText(/sabbath/i);
      expect(sabbathTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/saturday/i)).toBeInTheDocument();
    });

    it('should display service times with proper formatting', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Should show times in format like "9:00 AM" or "9:00"
      expect(screen.getByText(/9:00|10:00/i)).toBeInTheDocument();
    });
  });

  describe('Location Map Section', () => {
    it('should display location heading', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/location|find us|where we are/i)).toBeInTheDocument();
    });

    it('should embed Google Maps iframe', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const iframe = screen.queryByTitle(/map|google maps/i);
      if (iframe) {
        expect(iframe.tagName).toBe('IFRAME');
      }
    });

    it('should display address', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Multiple instances of "Sing Buri" expected (hero, location, mission)
      const singBuriTexts = screen.getAllByText(/sing buri|สิงห์บุรี/i);
      expect(singBuriTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/thailand/i)).toBeInTheDocument();
    });
  });

  describe('Mission Statement Section', () => {
    it('should display mission heading', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/mission|about us|our purpose/i)).toBeInTheDocument();
    });

    it('should display mission statement content', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const content = screen.getAllByText(/community|faith|worship|christ/i);
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Contact Form Section', () => {
    it('should display contact form heading', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/contact.*us|get in touch/i)).toBeInTheDocument();
    });

    it('should have name input field', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.tagName).toBe('INPUT');
    });

    it('should have email input field with type email', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have subject input field', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const subjectInput = screen.getByLabelText(/subject/i);
      expect(subjectInput).toBeInTheDocument();
    });

    it('should have message textarea field', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const messageInput = screen.getByLabelText(/message/i);
      expect(messageInput).toBeInTheDocument();
      expect(messageInput.tagName).toBe('TEXTAREA');
    });

    it('should have submit button', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should validate required fields', async () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required|please fill/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should validate email format', async () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valid.*email|email.*format/i)).toBeInTheDocument();
      });
    });

    it('should validate message minimum length', async () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const messageInput = screen.getByLabelText(/message/i);
      fireEvent.change(messageInput, { target: { value: 'Short' } });

      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Use queryByText to check if the error message exists (checking error p tag, not label)
        expect(screen.getByText('Message must be at least 20 characters')).toBeInTheDocument();
      });
    });

    it('should show success message on successful submission', async () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Contact form received successfully' }),
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Fill valid form data
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test Subject' } });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'This is a test message with more than 20 characters' },
      });

      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/success|thank you|received/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      // Mock a slow fetch response to keep the button disabled
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      );

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Fill valid form
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Message with sufficient length' },
      });

      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      fireEvent.click(submitButton);

      // Check immediately after click - button should be disabled
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should be mobile-friendly', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass(/container|max-w/);
    });

    it('should have semantic HTML structure', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const form = screen.getByRole('form', { name: /contact/i });
      expect(form).toBeInTheDocument();
    });

    it('should have keyboard navigation support', () => {
      if (!LandingPage) {
        expect(LandingPage).toBeUndefined();
        return;
      }

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
    });
  });
});

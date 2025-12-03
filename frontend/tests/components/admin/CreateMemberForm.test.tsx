/**
 * Component Tests: Create Member Form / Admin Create Member Page
 *
 * Tests the admin member creation flow including:
 * - Form field validation
 * - Role selection
 * - Form submission
 * - Success state with temporary password
 * - Error handling
 *
 * T282: Write component tests for CreateMemberForm
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the adminService module
const mockCreateMember = jest.fn();

jest.mock('../../../src/services/endpoints/adminService', () => ({
  adminService: {
    createMember: (data: any) => mockCreateMember(data),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock SidebarLayout to avoid breadcrumb issues
jest.mock('../../../src/components/layout', () => ({
  SidebarLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-layout">{children}</div>
  ),
}));

// Import after mocks
import AdminCreateMemberPage from '../../../src/pages/admin/AdminCreateMemberPage';

// Wrapper for Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AdminCreateMemberPage', () => {
  const mockCreateMemberResponse = {
    id: 'member-123',
    email: 'newmember@church.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'MEMBER',
    temporaryPassword: 'TempPass123!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateMember.mockResolvedValue(mockCreateMemberResponse);
  });

  describe('Form Rendering', () => {
    it('should render the create member form', () => {
      renderWithRouter(<AdminCreateMemberPage />);

      expect(screen.getByText('Create New Member')).toBeInTheDocument();
      expect(screen.getByText(/Add a new member to the church directory/i)).toBeInTheDocument();
    });

    it('should have all required form fields', () => {
      renderWithRouter(<AdminCreateMemberPage />);

      // Check for form labels - use getAllByText for labels that may appear multiple times
      expect(screen.getByText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Email/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Role/i)).toBeInTheDocument();
    });

    it('should have optional phone and address fields', () => {
      renderWithRouter(<AdminCreateMemberPage />);

      expect(screen.getByText(/Phone/i)).toBeInTheDocument();
      expect(screen.getByText(/Address/i)).toBeInTheDocument();
    });

    it('should have Cancel and Create buttons', () => {
      renderWithRouter(<AdminCreateMemberPage />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Member/i })).toBeInTheDocument();
    });
  });

  describe('Form Input', () => {
    it('should update form fields when typing', () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');

      // Use fireEvent for faster tests
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      expect(inputs[0]).toHaveValue('John');
      expect(inputs[1]).toHaveValue('Doe');
    });
  });

  describe('Form Submission', () => {
    it('should call adminService.createMember with form data', async () => {
      renderWithRouter(<AdminCreateMemberPage />);

      // Fill form using fireEvent (faster than userEvent)
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      // Find email input by type
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      // Find phone input
      const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
      if (phoneInput) {
        fireEvent.change(phoneInput, { target: { value: '+66812345678' } });
      }

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateMember).toHaveBeenCalled();
      });
    });

    it('should show loading state while submitting', async () => {
      // Make createMember hang
      mockCreateMember.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should show success message after member creation', async () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Member Created Successfully')).toBeInTheDocument();
      });
    });

    it('should display temporary password in success state', async () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Temporary Password/i)).toBeInTheDocument();
        expect(screen.getByText('TempPass123!')).toBeInTheDocument();
      });
    });

    it('should have "Add Another" button in success state', async () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Another/i })).toBeInTheDocument();
      });
    });

    it('should reset form when "Add Another" is clicked', async () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Another/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Add Another/i }));

      // Should be back to form state
      await waitFor(() => {
        expect(screen.getByText('Create New Member')).toBeInTheDocument();
      });
    });

    it('should have link to view all members', async () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View All Members/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on submission failure', async () => {
      mockCreateMember.mockRejectedValue(new Error('Email already exists'));

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'Duplicate' } });
      fireEvent.change(inputs[1], { target: { value: 'User' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'existing@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message when error has no message', async () => {
      mockCreateMember.mockRejectedValue(new Error());

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create member/i)).toBeInTheDocument();
      });
    });

    it('should stay on form when error occurs', async () => {
      mockCreateMember.mockRejectedValue(new Error('Server error'));

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'John' } });
      fireEvent.change(inputs[1], { target: { value: 'Doe' } });

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'john@church.com' } });

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Form should still be visible
        expect(screen.getByText('Create New Member')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to members list when Cancel is clicked', () => {
      renderWithRouter(<AdminCreateMemberPage />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/members');
    });
  });
});

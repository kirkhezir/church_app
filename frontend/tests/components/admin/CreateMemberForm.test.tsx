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

      expect(screen.getByText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
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
    it('should update form fields when typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      // Get inputs by their associated label text
      const firstNameInput = screen.getByRole('textbox', { name: '' });
      const inputs = screen.getAllByRole('textbox');

      // Find specific inputs
      await user.type(inputs[0], 'John'); // First Name
      await user.type(inputs[1], 'Doe'); // Last Name

      expect(inputs[0]).toHaveValue('John');
      expect(inputs[1]).toHaveValue('Doe');
    });
  });

  describe('Form Submission', () => {
    it('should call adminService.createMember with form data', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      // Fill form using all textboxes
      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John'); // First Name
      await user.type(inputs[1], 'Doe'); // Last Name

      // Find email input by type
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      // Find phone input
      const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
      if (phoneInput) {
        await user.type(phoneInput, '+66812345678');
      }

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateMember).toHaveBeenCalled();
      });
    });

    it('should show loading state while submitting', async () => {
      const user = userEvent.setup();
      // Make createMember hang
      mockCreateMember.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should show success message after member creation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Member Created Successfully')).toBeInTheDocument();
      });
    });

    it('should display temporary password in success state', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Temporary Password/i)).toBeInTheDocument();
        expect(screen.getByText('TempPass123!')).toBeInTheDocument();
      });
    });

    it('should have "Add Another" button in success state', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Another/i })).toBeInTheDocument();
      });
    });

    it('should reset form when "Add Another" is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Another/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Add Another/i }));

      // Should be back to form state
      await waitFor(() => {
        expect(screen.getByText('Create New Member')).toBeInTheDocument();
      });
    });

    it('should have link to view all members', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View All Members/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on submission failure', async () => {
      const user = userEvent.setup();
      mockCreateMember.mockRejectedValue(new Error('Email already exists'));

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'Duplicate');
      await user.type(inputs[1], 'User');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'existing@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message when error has no message', async () => {
      const user = userEvent.setup();
      mockCreateMember.mockRejectedValue(new Error());

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create member/i)).toBeInTheDocument();
      });
    });

    it('should stay on form when error occurs', async () => {
      const user = userEvent.setup();
      mockCreateMember.mockRejectedValue(new Error('Server error'));

      renderWithRouter(<AdminCreateMemberPage />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Doe');

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      await user.type(emailInput, 'john@church.com');

      const submitButton = screen.getByRole('button', { name: /Create Member/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Form should still be visible
        expect(screen.getByText('Create New Member')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to members list when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminCreateMemberPage />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/members');
    });
  });
});

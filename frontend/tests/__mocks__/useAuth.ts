const mockLogin = jest.fn().mockResolvedValue(undefined);
const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockCompleteMFALogin = jest.fn();
const mockUpdateUser = jest.fn();

export const useAuth = () => ({
  user: {
    id: 'test-user-id',
    email: 'test@church.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
  },
  isAuthenticated: true,
  isLoading: false,
  login: mockLogin,
  logout: mockLogout,
  completeMFALogin: mockCompleteMFALogin,
  updateUser: mockUpdateUser,
});

export default useAuth;

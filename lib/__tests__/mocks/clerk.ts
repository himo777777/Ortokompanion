/**
 * Mock Clerk Authentication for Testing
 *
 * Provides mocked Clerk hooks and utilities for testing
 * authentication flows without a real Clerk instance.
 */

import { vi } from 'vitest';

/**
 * Mock user data
 */
export const mockClerkUser = {
  id: 'user_test_clerk_123',
  emailAddresses: [
    {
      id: 'email_test_123',
      emailAddress: 'test@example.com',
    },
  ],
  primaryEmailAddress: {
    id: 'email_test_123',
    emailAddress: 'test@example.com',
  },
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  imageUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

/**
 * Mock session data
 */
export const mockClerkSession = {
  id: 'sess_test_123',
  userId: 'user_test_clerk_123',
  status: 'active' as const,
  lastActiveAt: new Date(),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

/**
 * Mock useAuth hook
 */
export const mockUseAuth = vi.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  userId: 'user_test_clerk_123',
  sessionId: 'sess_test_123',
  signOut: vi.fn(),
  getToken: vi.fn().mockResolvedValue('mock_token_123'),
}));

/**
 * Mock useUser hook
 */
export const mockUseUser = vi.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  user: mockClerkUser,
}));

/**
 * Mock useSession hook
 */
export const mockUseSession = vi.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  session: mockClerkSession,
}));

/**
 * Mock auth() server function
 */
export const mockAuth = vi.fn(() => ({
  userId: 'user_test_clerk_123',
  sessionId: 'sess_test_123',
  getToken: vi.fn().mockResolvedValue('mock_token_123'),
}));

/**
 * Mock currentUser() server function
 */
export const mockCurrentUser = vi.fn(() => Promise.resolve(mockClerkUser));

/**
 * Mock ClerkProvider component
 */
export const MockClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/**
 * Mock SignIn component
 */
export const MockSignIn = () => <div data-testid="mock-sign-in">Sign In</div>;

/**
 * Mock SignUp component
 */
export const MockSignUp = () => <div data-testid="mock-sign-up">Sign Up</div>;

/**
 * Mock UserButton component
 */
export const MockUserButton = () => (
  <div data-testid="mock-user-button">User Button</div>
);

/**
 * Create mock Clerk module
 * Use this with vi.mock('@clerk/nextjs')
 */
export const mockClerkModule = {
  useAuth: mockUseAuth,
  useUser: mockUseUser,
  useSession: mockUseSession,
  auth: mockAuth,
  currentUser: mockCurrentUser,
  ClerkProvider: MockClerkProvider,
  SignIn: MockSignIn,
  SignUp: MockSignUp,
  UserButton: MockUserButton,
};

/**
 * Reset all Clerk mocks
 * Call this in beforeEach() to ensure clean state
 */
export const resetClerkMocks = () => {
  mockUseAuth.mockClear();
  mockUseUser.mockClear();
  mockUseSession.mockClear();
  mockAuth.mockClear();
  mockCurrentUser.mockClear();
};

/**
 * Mock signed out state
 */
export const mockSignedOut = () => {
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    signOut: vi.fn(),
    getToken: vi.fn().mockResolvedValue(null),
  });

  mockUseUser.mockReturnValue({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  });

  mockUseSession.mockReturnValue({
    isLoaded: true,
    isSignedIn: false,
    session: null,
  });

  mockAuth.mockReturnValue({
    userId: null,
    sessionId: null,
    getToken: vi.fn().mockResolvedValue(null),
  });

  mockCurrentUser.mockResolvedValue(null);
};

/**
 * Mock signed in state (default)
 */
export const mockSignedIn = () => {
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_test_clerk_123',
    sessionId: 'sess_test_123',
    signOut: vi.fn(),
    getToken: vi.fn().mockResolvedValue('mock_token_123'),
  });

  mockUseUser.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: mockClerkUser,
  });

  mockUseSession.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    session: mockClerkSession,
  });

  mockAuth.mockReturnValue({
    userId: 'user_test_clerk_123',
    sessionId: 'sess_test_123',
    getToken: vi.fn().mockResolvedValue('mock_token_123'),
  });

  mockCurrentUser.mockResolvedValue(mockClerkUser);
};

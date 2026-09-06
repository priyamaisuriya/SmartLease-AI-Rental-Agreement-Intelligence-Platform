import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smartlease_user');

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error('Failed to read saved user:', error);

      localStorage.removeItem('smartlease_user');

      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  const loadUser = async () => {
    const token = localStorage.getItem('smartlease_token');

    // No token = definitely logged out
    if (!token) {
      setUser(null);
      localStorage.removeItem('smartlease_user');
      setLoading(false);

      return null;
    }

    try {
      const response = await api.get('/auth/me');

      const currentUser =
        response.data?.user || response.data;

      if (!currentUser || !currentUser.role) {
        throw new Error(
          'Invalid user information returned from server.'
        );
      }

      setUser(currentUser);

      localStorage.setItem(
        'smartlease_user',
        JSON.stringify(currentUser)
      );

      return currentUser;

    } catch (error) {
      console.error(
        'Failed to load current user:',
        error.response?.status,
        error.response?.data || error.message
      );

      /*
       * IMPORTANT:
       *
       * Only remove authentication when backend
       * explicitly says the token is invalid.
       *
       * Network errors / server errors should NOT
       * automatically send the user to login.
       */
      if (error.response?.status === 401) {
        localStorage.removeItem('smartlease_token');
        localStorage.removeItem('smartlease_user');

        setUser(null);

        return null;
      }

      /*
       * For 500 / network / temporary errors:
       *
       * Keep the previously saved user.
       */
      return user;

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL AUTH CHECK
  // =====================================================

  useEffect(() => {
    loadUser();
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const token = response.data?.token;

    if (!token) {
      throw new Error(
        'Login successful but no authentication token was returned.'
      );
    }

    // Save token BEFORE requesting /auth/me
    localStorage.setItem(
      'smartlease_token',
      token
    );

    try {
      const meResponse = await api.get('/auth/me');

      const currentUser =
        meResponse.data?.user ||
        meResponse.data;

      if (!currentUser || !currentUser.role) {
        throw new Error(
          'Login succeeded but user information could not be loaded.'
        );
      }

      setUser(currentUser);

      localStorage.setItem(
        'smartlease_user',
        JSON.stringify(currentUser)
      );

      setLoading(false);

      return currentUser;

    } catch (error) {
      /*
       * Login itself succeeded, but /auth/me failed.
       * Remove token because we cannot safely establish
       * the authenticated session.
       */
      localStorage.removeItem('smartlease_token');
      localStorage.removeItem('smartlease_user');

      setUser(null);

      throw error;
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (
    name,
    email,
    password,
    role = 'tenant'
  ) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role,
    });

    return response.data;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem('smartlease_token');
    localStorage.removeItem('smartlease_user');

    setUser(null);
  };

  // =====================================================
  // REFRESH USER
  // =====================================================

  const refreshUser = async () => {
    return await loadUser();
  };

  // =====================================================
  // AUTH STATE
  // =====================================================

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
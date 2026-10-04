import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ============================================================
  // USER STATE
  // ============================================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem('smartlease_user');

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        'Failed to read saved user:',
        error
      );

      localStorage.removeItem('smartlease_user');

      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  const loadUser = async () => {
    const token =
      localStorage.getItem('smartlease_token');

    if (!token) {
      setUser(null);

      localStorage.removeItem(
        'smartlease_user'
      );

      setLoading(false);

      return null;
    }

    try {
      const response =
        await api.get('/auth/me');

      const currentUser =
        response.data?.user ||
        response.data;

      if (
        !currentUser ||
        !currentUser.role
      ) {
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
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          'smartlease_token'
        );

        localStorage.removeItem(
          'smartlease_user'
        );

        setUser(null);

        return null;
      }

      return user;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHECK LOGIN WHEN APP STARTS
  // ============================================================

  useEffect(() => {
    loadUser();
  }, []);

  // ============================================================
  // LOGIN - STEP 1
  // EMAIL + PASSWORD
  //
  // This does NOT create JWT.
  // It only sends Login OTP.
  // ============================================================

  const login = async (
    email,
    password
  ) => {
    const response =
      await api.post(
        '/auth/login/send-otp',
        {
          email,
          password,
        }
      );

    return response.data;
  };

  // ============================================================
  // LOGIN - STEP 2
  // VERIFY LOGIN OTP
  //
  // After successful OTP verification:
  // JWT token is returned.
  // ============================================================

  const verifyLoginOtp = async (
    email,
    otp
  ) => {
    const response =
      await api.post(
        '/auth/login/verify-otp',
        {
          email,
          otp,
        }
      );

    const token =
      response.data?.token;

    if (!token) {
      throw new Error(
        'Login OTP verified but no authentication token was returned.'
      );
    }

    // Save JWT
    localStorage.setItem(
      'smartlease_token',
      token
    );

    try {
      // Get logged-in user details
      const meResponse =
        await api.get('/auth/me');

      const currentUser =
        meResponse.data?.user ||
        meResponse.data;

      if (
        !currentUser ||
        !currentUser.role
      ) {
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
      // If /me fails, remove invalid token
      localStorage.removeItem(
        'smartlease_token'
      );

      localStorage.removeItem(
        'smartlease_user'
      );

      setUser(null);

      throw error;
    }
  };

  // ============================================================
  // REGISTER
  //
  // Registration OTP verification is handled
  // from Auth.jsx.
  // ============================================================

  const register = async (
    name,
    email,
    password,
    role = 'tenant'
  ) => {
    const response =
      await api.post(
        '/auth/register',
        {
          name,
          email,
          password,
          role,
        }
      );

    return response.data;
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem(
      'smartlease_token'
    );

    localStorage.removeItem(
      'smartlease_user'
    );

    setUser(null);
  };

  // ============================================================
  // REFRESH USER
  // ============================================================

  const refreshUser = async () => {
    return await loadUser();
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {
    user,
    loading,

    // Login
    login,
    verifyLoginOtp,

    // Registration
    register,

    // Other auth functions
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

// ============================================================
// CUSTOM HOOK
// ============================================================

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('smartlease_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth/me');

      const currentUser =
        response.data.user || response.data;

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

      // Only clear authentication when the token is actually invalid.
      if (error.response?.status === 401) {
        localStorage.removeItem('smartlease_token');
        localStorage.removeItem('smartlease_user');
        setUser(null);
      }

      return null;

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const token = response.data.token;

    if (!token) {
      throw new Error(
        'Login successful but no authentication token was returned.'
      );
    }

    localStorage.setItem(
      'smartlease_token',
      token
    );

    const currentUser = await loadUser();

    if (!currentUser) {
      throw new Error(
        'Login succeeded but the current user could not be loaded.'
      );
    }

    return currentUser;
  };

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

  const logout = () => {
    localStorage.removeItem('smartlease_token');
    localStorage.removeItem('smartlease_user');

    setUser(null);
  };

  const refreshUser = async () => {
    return await loadUser();
  };

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

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
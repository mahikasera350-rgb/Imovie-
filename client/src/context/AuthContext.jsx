import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { getSocket, joinUserRoom } from '../services/socketService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authService.getMe();
        if (data.data?.user) {
          setUser(data.data.user);
          joinUserRoom(data.data.user._id);
        }
      } catch (err) {
        // Not logged in or expired session
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up socket live notification listener for logged-in user
  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();
    joinUserRoom(user._id);

    const handleNotification = (notif) => {
      toast.info(`🔔 ${notif.title}: ${notif.message}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    };

    socket.on('new_notification', handleNotification);

    return () => {
      socket.off('new_notification', handleNotification);
    };
  }, [user?._id]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(res.data.user);
      joinUserRoom(res.data.user._id);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      return res.data.user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      setUser(res.data.user);
      joinUserRoom(res.data.user._id);
      toast.success('Registration successful! Welcome to IMovies.');
      return res.data.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.info('Logged out successfully');
    } catch (err) {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      setUser(res.data.user);
      toast.success('Profile updated successfully');
      return res.data.user;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

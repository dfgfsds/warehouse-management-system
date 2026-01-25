import { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthManager } from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthManager.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const loggedInUser = AuthManager.login(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    AuthManager.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: AuthManager.hasRole,
    canAccessWarehouse: AuthManager.canAccessWarehouse
  };
};
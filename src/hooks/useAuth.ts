import { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthManager } from '../utils/auth';
import { StorageManager } from '../utils/storage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(StorageManager.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = StorageManager.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = StorageManager.getUsers();

    // Simple mock logic: just match username for now as we don't store passwords in the mock users list
    // In a real offline app, you'd hash check. Here, we'll just check if user exists.
    // If username is "john_manager" (created in StorageManager), we let them in.

    const validUser = users.find(u => u.username === username || u.email === username);

    if (validUser) {
      StorageManager.setCurrentUser(validUser);
      setUser(validUser);
      window.location.reload(); // To force app to re-render with auth state (or just setState is enough but app structure might depnd on it)
      return { success: true };
    }

    // Fallback for demo if users array is somehow empty or user typed random stuff:
    // Actually, let's strictly require the user to be in the list OR create a dev backdoor
    if (username === 'admin') {
      const adminUser: User = {
        id: 'admin',
        username: 'admin',
        email: 'admin@local',
        role: 'warehouse_manager',
        warehouseIds: [],
        deviceId: 'admin-dev',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      StorageManager.setCurrentUser(adminUser);
      setUser(adminUser);
      window.location.reload();
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid username. Try "john_manager" or "admin".'
    };
  };

  const logout = () => {
    StorageManager.clearCurrentUser();
    setUser(null);
    window.location.reload();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => user?.role === role, // simplified hasRole
    canAccessWarehouse: (id: string) => user?.warehouseIds.includes(id) || user?.role === 'admin'
  };
};
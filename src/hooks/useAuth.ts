import { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthManager } from '../utils/auth';
import axios from 'axios';
import baseUrl from '../../api-endpoints/ApiUrls';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(AuthManager.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthManager.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // const login = async (username: string, password: string): Promise<boolean> => {
  //   const updatedApi = await axios.post(baseUrl?.signIn, { username, password, vendor_id: '0f258d22-df45-4f34-9093-c2164ad00579' })
  //   const loggedInUser = AuthManager.login(username, password);
  //   console.log(loggedInUser)
  //   if (loggedInUser) {
  //     setUser(loggedInUser);
  //     window.location.reload();
  //     return true;
  //   }
  //   return false;
  // };

  const login = async (
    username: string,
    password: string,
    // division: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post(baseUrl?.signIn, {
        username,
        password,
        // vendor_id: '0f258d22-df45-4f34-9093-c2164ad00579',
        // division_id: division
      });

      // 🔥 IMPORTANT: backend response structure
      const apiUser: User = res.data?.data;

      // store user
      if (apiUser) {
        AuthManager.loginWithApi(apiUser);
        setUser(apiUser);
        window.location.reload();
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Invalid username or password',
      };
    }
  };

  // const login = async (
  //   username: string,
  //   password: string
  // ): Promise<{ success: boolean; data?: any; error?: string }> => {
  //   try {
  //     const res = await axios.post(baseUrl?.signIn, {
  //       username,
  //       password,
  //       vendor_id: '0f258d22-df45-4f34-9093-c2164ad00579',
  //     });
  //     AuthManager.login(res.data?.data); // token/user save
  //     console.log(res?.data?.data)
  //     setUser(res.data?.data);

  //     return {
  //       success: true,
  //       data: res.data,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error:
  //         error?.response?.data?.message ||
  //         error?.response?.data?.error ||
  //         'Invalid username or password',
  //     };
  //   }
  // };


  const logout = () => {
    AuthManager.logout();
    setUser(null);
    window.location.reload();
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
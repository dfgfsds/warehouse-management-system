import React, { useState, useEffect } from 'react';
import { User, LogOut, Warehouse } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import baseUrl from '../../../api-endpoints/ApiUrls';
import { AuthManager } from '../../utils/auth';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout, setUser }: any = useAuth();

  // States for division
  const [divisions, setDivisions] = useState<any[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>(user?.division_id || '');
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>('');

  // Sync selectedDivision with user context
  useEffect(() => {
    if (user?.division_id) {
      setSelectedDivision(user.division_id);
    }
  }, [user?.division_id]);

  // Fetch divisions based on vendor_id
  useEffect(() => {
    if (!user?.vendor_id) return;

    const fetchDivisions = async () => {
      try {
        setLoadingDivisions(true);
        const res = await axios.get(`${baseUrl.divisions}/vendor/${user.vendor_id}`);
        if (res?.data?.data?.divisions) {
          setDivisions(res.data.data.divisions);
        }
      } catch (error) {
        console.error('Error fetching divisions:', error);
      } finally {
        setLoadingDivisions(false);
      }
    };

    fetchDivisions();
  }, [user?.vendor_id]);

  // Handle division change and update user
  // const handleDivisionChange = async (divisionId: string) => {
  //   setSelectedDivision(divisionId);
  //   setError('');

  //   if (!divisionId) return;

  //   try {
  //     setUpdating(true);

  //     const userId = user?.id || user?.user_id;
  //     if (!userId) {
  //       setError('User ID not found');
  //       return;
  //     }

  //     await axios.put(`${baseUrl.users}/${userId}`, {
  //       division_id: divisionId,
  //     });

  //     // 🔥 FINAL USER OBJECT
  //     const updatedUser: any = {
  //       ...user,
  //       division_id: divisionId,
  //     };

  //     // 🔥 UPDATE CONTEXT
  //     setUser(updatedUser);

  //     // 🔥 UPDATE LOCAL STORAGE (MOST IMPORTANT)
  //     localStorage.setItem('user', JSON.stringify(updatedUser));


  //   } catch (error: any) {
  //     setError(
  //       error?.response?.data?.message ||
  //       'Failed to update division'
  //     );
  //   } finally {
  //     setUpdating(false);
  //   }
  // };


  const handleDivisionChange = async (divisionId: string) => {
    setSelectedDivision(divisionId);
    setError('');

    if (!divisionId) return;

    try {
      setUpdating(true);

      const userId = user?.id || user?.user_id;
      if (!userId) {
        setError('User ID not found');
        return;
      }

      await axios.put(`${baseUrl.users}/${userId}`, {
        division_id: divisionId,
      });

      // 🔥 SINGLE SOURCE UPDATE
      const updatedUser: any = AuthManager.updateUser({
        division_id: divisionId,
      });

      // 🔥 UPDATE CONTEXT
      if (updatedUser) {
        window.location.reload();

        setUser(updatedUser);
      }

    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        'Failed to update division'
      );
    } finally {
      setUpdating(false);
    }
  };



  const getRoleLabel = (role: string) => {
    switch (role) {
      // case 'super_admin': return 'Super Admin';
      case 'admin': return 'Super Admin'
      case 'warehouse_manager': return 'Manager';
      case 'operator': return 'Operator';
      case 'auditor': return 'Auditor';
      default: return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Warehouse className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Division Selector */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500">Division</label>
              <select
                value={selectedDivision}
                onChange={(e) => handleDivisionChange(e.target.value)}
                disabled={loadingDivisions || updating}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Division</option>
                {divisions?.map((division: any) => (
                  <option key={division?.id} value={division?.id}>
                    {division?.division_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-l border-gray-200 h-8"></div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.full_name}</span>
              <span className="text-gray-400">•</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {getRoleLabel(user?.role || '')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* <button
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button> */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
import React, { useEffect, useState } from 'react';
import { Warehouse, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import baseUrl from '../../../api-endpoints/ApiUrls';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [division, setDivision] = useState({ division_id: '' });
  // const [divisionsOptions, setDivisionsOptions] = useState<any[]>([]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');
  //   setLoading(true);
  //   try {
  //     const success = await login(username, password);
  //     console.log(success)
  //     if(success){
  //     setLoading(false);
  //     }
  //     if (!success) {
  //       setError('Invalid username or password');
  //     }

  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   axios.get(`${baseUrl.divisions}/vendor/ec6b3315-13b2-4e65-8d73-03b97a184109`).then(r => setDivisionsOptions(r?.data?.data?.divisions || []));
  // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password
      // ,division?.division_id
    );

    if (result.success) {
      console.log('Login success:', result);
      setLoading(false);
    } else {
      console.log(result)
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Warehouse className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Warehouse Inventory System
            </h1>
            <p className="text-gray-600">
              Sign in to access your warehouse management dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Division
              </label>
              <select
                value={division.division_id}
                onChange={(e) =>
                  setDivision({ division_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Division</option>

                {divisionsOptions?.map((div: any) => (
                  <option key={div.id} value={div.id} className="capitalize">
                    {div.division_name}
                  </option>
                ))}
              </select>


            </div> */}

            {/* Division */}



            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500 mb-2">Demo Credentials:</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Admin: admin / admin123</div>
              <div>Manager: manager / manager123</div>
              <div>Operator: operator / operator123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
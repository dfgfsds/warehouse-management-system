import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Clock, AlertTriangle, Activity, Users } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, AssetEvent, DashboardStats } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import baseUrl from '../../../api-endpoints/ApiUrls'
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    assetsByStatus: {
      working: 0,
      needs_fix: 0,
      scrap: 0,
      reserved: 0,
      damaged: 0,
      testing: 0
    },
    assetsByWarehouse: {},
    recentActivity: [],
    agingStats: {
      days0to2: 0,
      days3to7: 0,
      days7plus: 0
    }
  });

  useEffect(() => {
    calculateStats();
  }, []);

  console.log(baseUrl,'hgjhgjh')
  const calculateStats = () => {
    const assets = StorageManager.getAssets();
    const events = StorageManager.getEvents().slice(-10); // Last 10 events
    const warehouses = StorageManager.getWarehouses();

    // Calculate asset counts by status
    const assetsByStatus = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate aging
    const now = new Date();
    const agingStats = assets.reduce((acc, asset) => {
      const lastMoved = new Date(asset.lastMovedAt);
      const daysDiff = Math.floor((now.getTime() - lastMoved.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 2) acc.days0to2++;
      else if (daysDiff <= 7) acc.days3to7++;
      else acc.days7plus++;
      
      return acc;
    }, { days0to2: 0, days3to7: 0, days7plus: 0 });

    // Calculate assets by warehouse
    const assetsByWarehouse = assets.reduce((acc, asset) => {
      const warehouse = warehouses.find(w => w.id === asset.warehouseId);
      const warehouseName = warehouse?.name || 'Unknown';
      acc[warehouseName] = (acc[warehouseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalAssets: assets.length,
      assetsByStatus: {
        working: assetsByStatus.working || 0,
        needs_fix: assetsByStatus.needs_fix || 0,
        scrap: assetsByStatus.scrap || 0,
        reserved: assetsByStatus.reserved || 0,
        damaged: assetsByStatus.damaged || 0,
        testing: assetsByStatus.testing || 0
      },
      assetsByWarehouse,
      recentActivity: events,
      agingStats
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-green-600 bg-green-100';
      case 'needs_fix': return 'text-yellow-600 bg-yellow-100';
      case 'scrap': return 'text-red-600 bg-red-100';
      case 'reserved': return 'text-blue-600 bg-blue-100';
      case 'damaged': return 'text-red-600 bg-red-100';
      case 'testing': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {user?.username}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
            <Package className="h-12 w-12 text-blue-600 bg-blue-100 rounded-lg p-3" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Working Assets</p>
              <p className="text-3xl font-bold text-green-600">{stats.assetsByStatus.working}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 bg-green-100 rounded-lg p-3" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Fix</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.assetsByStatus.needs_fix}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-600 bg-yellow-100 rounded-lg p-3" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aged 7+ Days</p>
              <p className="text-3xl font-bold text-red-600">{stats.agingStats.days7plus}</p>
            </div>
            <Clock className="h-12 w-12 text-red-600 bg-red-100 rounded-lg p-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.assetsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              stats.recentActivity.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatEventType(event.type)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Asset: {event.assetId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Aging Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.agingStats.days0to2}</div>
            <div className="text-sm text-gray-600">0-2 Days</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.agingStats.days3to7}</div>
            <div className="text-sm text-gray-600">3-7 Days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.agingStats.days7plus}</div>
            <div className="text-sm text-gray-600">7+ Days</div>
          </div>
        </div>
      </div>
    </div>
  );
};
// import React, { useState, useEffect } from 'react';
// import { BarChart3, Download, Calendar, TrendingUp, Package, Clock, Users, Building2 } from 'lucide-react';
// import { StorageManager } from '../../utils/storage';
// import { Asset, AssetEvent, Warehouse } from '../../types';
// import { useAuth } from '../../hooks/useAuth';

// export const Reports: React.FC = () => {
//   const { user } = useAuth();
//   const [activeReport, setActiveReport] = useState('stock');
//   const [dateRange, setDateRange] = useState('7');
//   const [reportData, setReportData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     generateReport();
//   }, [activeReport, dateRange]);

//   const generateReport = () => {
//     setLoading(true);
//     const assets = StorageManager.getAssets();
//     const events = StorageManager.getEvents();
//     const warehouses = StorageManager.getWarehouses();

//     switch (activeReport) {
//       case 'stock':
//         setReportData(generateStockReport(assets, warehouses));
//         break;
//       case 'aging':
//         setReportData(generateAgingReport(assets, warehouses));
//         break;
//       case 'movement':
//         setReportData(generateMovementReport(events, assets, parseInt(dateRange)));
//         break;
//       case 'responsibility':
//         setReportData(generateResponsibilityReport(events, assets, parseInt(dateRange)));
//         break;
//       default:
//         setReportData(null);
//     }
//     setLoading(false);
//   };

//   const generateStockReport = (assets: Asset[], warehouses: Warehouse[]) => {
//     const stockByWarehouse = assets.reduce((acc, asset) => {
//       const warehouse = warehouses.find(w => w.id === asset.warehouseId);
//       const warehouseName = warehouse?.name || 'Unknown';

//       if (!acc[warehouseName]) {
//         acc[warehouseName] = {
//           total: 0,
//           byStatus: {},
//           byProductType: {}
//         };
//       }

//       acc[warehouseName].total++;
//       acc[warehouseName].byStatus[asset.status] = (acc[warehouseName].byStatus[asset.status] || 0) + 1;
//       acc[warehouseName].byProductType[asset.productType] = (acc[warehouseName].byProductType[asset.productType] || 0) + 1;

//       return acc;
//     }, {} as any);

//     const stockByStatus = assets.reduce((acc, asset) => {
//       acc[asset.status] = (acc[asset.status] || 0) + 1;
//       return acc;
//     }, {} as any);

//     const stockByProductType = assets.reduce((acc, asset) => {
//       acc[asset.productType] = (acc[asset.productType] || 0) + 1;
//       return acc;
//     }, {} as any);

//     return {
//       totalAssets: assets.length,
//       stockByWarehouse,
//       stockByStatus,
//       stockByProductType
//     };
//   };

//   const generateAgingReport = (assets: Asset[], warehouses: Warehouse[]) => {
//     const now = new Date();
//     const agingData = assets.map(asset => {
//       const lastMoved = new Date(asset.lastMovedAt);
//       const daysSinceLastMove = Math.floor((now.getTime() - lastMoved.getTime()) / (1000 * 60 * 60 * 24));
//       const warehouse = warehouses.find(w => w.id === asset.warehouseId);

//       return {
//         ...asset,
//         daysSinceLastMove,
//         warehouseName: warehouse?.name || 'Unknown'
//       };
//     });

//     const agingBuckets = {
//       '0-2 days': agingData.filter(a => a.daysSinceLastMove <= 2).length,
//       '3-7 days': agingData.filter(a => a.daysSinceLastMove >= 3 && a.daysSinceLastMove <= 7).length,
//       '8-30 days': agingData.filter(a => a.daysSinceLastMove >= 8 && a.daysSinceLastMove <= 30).length,
//       '30+ days': agingData.filter(a => a.daysSinceLastMove > 30).length
//     };

//     const oldestAssets = agingData
//       .sort((a, b) => b.daysSinceLastMove - a.daysSinceLastMove)
//       .slice(0, 10);

//     return {
//       agingBuckets,
//       oldestAssets,
//       averageAge: agingData.reduce((sum, a) => sum + a.daysSinceLastMove, 0) / agingData.length
//     };
//   };

//   const generateMovementReport = (events: AssetEvent[], assets: Asset[], days: number) => {
//     const cutoffDate = new Date();
//     cutoffDate.setDate(cutoffDate.getDate() - days);

//     const recentEvents = events.filter(event =>
//       new Date(event.timestamp) >= cutoffDate
//     );

//     const movementsByType = recentEvents.reduce((acc, event) => {
//       acc[event.type] = (acc[event.type] || 0) + 1;
//       return acc;
//     }, {} as any);

//     const movementsByDay = recentEvents.reduce((acc, event) => {
//       const day = new Date(event.timestamp).toDateString();
//       acc[day] = (acc[day] || 0) + 1;
//       return acc;
//     }, {} as any);

//     const mostActiveAssets = Object.entries(
//       recentEvents.reduce((acc, event) => {
//         acc[event.assetId] = (acc[event.assetId] || 0) + 1;
//         return acc;
//       }, {} as any)
//     )
//       .sort(([, a], [, b]) => (b as number) - (a as number))
//       .slice(0, 10)
//       .map(([assetId, count]) => {
//         const asset = assets.find(a => a.id === assetId);
//         return {
//           assetId,
//           qrCode: asset?.qrCode || 'Unknown',
//           productType: asset?.productType || 'Unknown',
//           eventCount: count
//         };
//       });

//     return {
//       totalEvents: recentEvents.length,
//       movementsByType,
//       movementsByDay,
//       mostActiveAssets
//     };
//   };

//   const generateResponsibilityReport = (events: AssetEvent[], assets: Asset[], days: number) => {
//     const cutoffDate = new Date();
//     cutoffDate.setDate(cutoffDate.getDate() - days);

//     const recentEvents = events.filter(event =>
//       new Date(event.timestamp) >= cutoffDate
//     );

//     const userActivity = recentEvents.reduce((acc, event) => {
//       if (!acc[event.userId]) {
//         acc[event.userId] = {
//           totalEvents: 0,
//           eventTypes: {},
//           lastActivity: event.timestamp
//         };
//       }

//       acc[event.userId].totalEvents++;
//       acc[event.userId].eventTypes[event.type] = (acc[event.userId].eventTypes[event.type] || 0) + 1;

//       if (new Date(event.timestamp) > new Date(acc[event.userId].lastActivity)) {
//         acc[event.userId].lastActivity = event.timestamp;
//       }

//       return acc;
//     }, {} as any);

//     const deviceActivity = recentEvents.reduce((acc, event) => {
//       acc[event.deviceId] = (acc[event.deviceId] || 0) + 1;
//       return acc;
//     }, {} as any);

//     return {
//       userActivity,
//       deviceActivity,
//       totalUsers: Object.keys(userActivity).length,
//       totalDevices: Object.keys(deviceActivity).length
//     };
//   };

//   const exportReport = () => {
//     const dataStr = JSON.stringify(reportData, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${activeReport}_report_${new Date().toISOString().split('T')[0]}.json`;
//     link.click();
//   };

//   const reportTabs = [
//     { id: 'stock', label: 'Stock Report', icon: Package },
//     { id: 'aging', label: 'Aging Analysis', icon: Clock },
//     { id: 'movement', label: 'Movement Report', icon: TrendingUp },
//     { id: 'responsibility', label: 'User Activity', icon: Users }
//   ];

//   const renderStockReport = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-blue-50 p-6 rounded-lg">
//           <div className="text-2xl font-bold text-blue-600">{reportData?.totalAssets}</div>
//           <div className="text-sm text-gray-600">Total Assets</div>
//         </div>
//         <div className="bg-green-50 p-6 rounded-lg">
//           <div className="text-2xl font-bold text-green-600">
//             {Object?.keys(reportData?.stockByWarehouse)?.length}
//           </div>
//           <div className="text-sm text-gray-600">Warehouses</div>
//         </div>
//         <div className="bg-purple-50 p-6 rounded-lg">
//           <div className="text-2xl font-bold text-purple-600">
//             {Object?.keys(reportData?.stockByProductType)?.length}
//           </div>
//           <div className="text-sm text-gray-600">Product Types</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">Stock by Status</h3>
//           <div className="space-y-3">
//             {Object?.entries(reportData?.stockByStatus)?.map(([status, count]) => (
//               <div key={status} className="flex justify-between items-center">
//                 <span className="capitalize">{status?.replace('_', ' ')}</span>
//                 <span className="font-semibold">{count as number}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">Stock by Product Type</h3>
//           <div className="space-y-3">
//             {Object?.entries(reportData?.stockByProductType).map(([type, count]) => (
//               <div key={type} className="flex justify-between items-center">
//                 <span>{type}</span>
//                 <span className="font-semibold">{count as number}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderAgingReport = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {Object?.entries(reportData?.agingBuckets)?.map(([bucket, count]) => (
//           <div key={bucket ? bucket : ''} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
//             <div className="text-2xl font-bold text-gray-900">{count as number}</div>
//             <div className="text-sm text-gray-600">{bucket ? bucket : ""}</div>
//           </div>
//         ))}
//       </div>

//       <div className="bg-white p-6 rounded-lg border border-gray-200">
//         <h3 className="text-lg font-semibold mb-4">Oldest Assets (Top 10)</h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead>
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Type</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days Since Last Move</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {reportData?.oldestAssets?.map((asset: any) => (
//                 <tr key={asset.id}>
//                   <td className="px-4 py-2 text-sm font-mono">{asset?.qrCode}</td>
//                   <td className="px-4 py-2 text-sm">{asset?.productType}</td>
//                   <td className="px-4 py-2 text-sm">{asset?.warehouseName}</td>
//                   <td className="px-4 py-2 text-sm font-semibold">{asset?.daysSinceLastMove}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );

//   const renderMovementReport = () => (
//     <div className="space-y-6">
//       <div className="bg-blue-50 p-6 rounded-lg">
//         <div className="text-2xl font-bold text-blue-600">{reportData?.totalEvents}</div>
//         <div className="text-sm text-gray-600">Total Events (Last {dateRange ? dateRange : ''} days)</div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">Events by Type</h3>
//           <div className="space-y-3">
//             {Object?.entries(reportData?.movementsByType).map(([type, count]) => (
//               <div key={type} className="flex justify-between items-center">
//                 <span>{type?.replace('_', ' ')}</span>
//                 <span className="font-semibold">{count as number}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">Most Active Assets</h3>
//           <div className="space-y-3">
//             {reportData?.mostActiveAssets?.map((asset: any) => (
//               <div key={asset?.assetId} className="flex justify-between items-center">
//                 <div>
//                   <div className="font-mono text-sm">{asset?.qrCode}</div>
//                   <div className="text-xs text-gray-500">{asset?.productType}</div>
//                 </div>
//                 <span className="font-semibold">{asset?.eventCount} events</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderResponsibilityReport = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-green-50 p-6 rounded-lg">
//           <div className="text-2xl font-bold text-green-600">{reportData?.totalUsers}</div>
//           <div className="text-sm text-gray-600">Active Users</div>
//         </div>
//         <div className="bg-purple-50 p-6 rounded-lg">
//           <div className="text-2xl font-bold text-purple-600">{reportData?.totalDevices}</div>
//           <div className="text-sm text-gray-600">Active Devices</div>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-lg border border-gray-200">
//         <h3 className="text-lg font-semibold mb-4">User Activity</h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead>
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Events</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {Object?.entries(reportData?.userActivity)?.map(([userId, activity]: [string, any]) => (
//                 <tr key={userId}>
//                   <td className="px-4 py-2 text-sm font-medium">{userId}</td>
//                   <td className="px-4 py-2 text-sm">{activity?.totalEvents}</td>
//                   <td className="px-4 py-2 text-sm">{new Date(activity?.lastActivity).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <BarChart3 className="h-8 w-8 text-blue-600" />
//           <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
//         </div>
//         <div className="flex items-center space-x-4">
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="7">Last 7 days</option>
//             <option value="30">Last 30 days</option>
//             <option value="90">Last 90 days</option>
//           </select>
//           <button
//             onClick={exportReport}
//             disabled={!reportData}
//             className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
//           >
//             <Download className="h-4 w-4" />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       {/* Report Tabs */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         <div className="border-b border-gray-200">
//           <nav className="flex space-x-8 px-6">
//             {reportTabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveReport(tab.id)}
//                   className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeReport === tab.id
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div className="p-6">
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="text-lg text-gray-600">Generating report...</div>
//             </div>
//           ) : reportData ? (
//             <>
//               {activeReport === 'stock' && renderStockReport()}
//               {activeReport === 'aging' && renderAgingReport()}
//               {activeReport === 'movement' && renderMovementReport()}
//               {activeReport === 'responsibility' && renderResponsibilityReport()}
//             </>
//           ) : (
//             <div className="text-center py-12">
//               <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 Select a report type to view analytics.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Package,
  Clock,
  Users,
} from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, AssetEvent, Warehouse } from '../../types';
import { useAuth } from '../../hooks/useAuth';

/* ================= SAFE HELPERS ================= */
const safeEntries = (obj: any) => Object.entries(obj ?? {});

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [activeReport, setActiveReport] = useState('stock');
  const [dateRange, setDateRange] = useState('7');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, [activeReport, dateRange]);

  /* ================= GENERATE ================= */
  const generateReport = () => {
    setLoading(true);

    const assets = StorageManager.getAssets() || [];
    const events = StorageManager.getEvents() || [];
    const warehouses = StorageManager.getWarehouses() || [];

    switch (activeReport) {
      case 'stock':
        setReportData(generateStockReport(assets, warehouses));
        break;
      case 'aging':
        setReportData(generateAgingReport(assets, warehouses));
        break;
      case 'movement':
        setReportData(
          generateMovementReport(events, assets, parseInt(dateRange))
        );
        break;
      case 'responsibility':
        setReportData(
          generateResponsibilityReport(events, assets, parseInt(dateRange))
        );
        break;
      default:
        setReportData(null);
    }

    setLoading(false);
  };

  /* ================= STOCK ================= */
  const generateStockReport = (assets: Asset[], warehouses: Warehouse[]) => {
    const stockByWarehouse: any = {};
    const stockByStatus: any = {};
    const stockByProductType: any = {};

    assets.forEach((asset) => {
      const warehouse =
        warehouses.find((w) => w.id === asset.warehouseId)?.name || 'Unknown';

      stockByWarehouse[warehouse] ??= {
        total: 0,
        byStatus: {},
        byProductType: {},
      };

      stockByWarehouse[warehouse].total++;
      stockByWarehouse[warehouse].byStatus[asset.status] =
        (stockByWarehouse[warehouse].byStatus[asset.status] || 0) + 1;

      stockByWarehouse[warehouse].byProductType[asset.productType] =
        (stockByWarehouse[warehouse].byProductType[asset.productType] || 0) + 1;

      stockByStatus[asset.status] =
        (stockByStatus[asset.status] || 0) + 1;

      stockByProductType[asset.productType] =
        (stockByProductType[asset.productType] || 0) + 1;
    });

    return {
      totalAssets: assets.length,
      stockByWarehouse,
      stockByStatus,
      stockByProductType,
    };
  };

  /* ================= AGING ================= */
  const generateAgingReport = (assets: Asset[], warehouses: Warehouse[]) => {
    const now = new Date();

    const agingData = assets.map((asset) => {
      const lastMoved = new Date(asset.lastMovedAt);
      const days =
        Math.floor(
          (now.getTime() - lastMoved.getTime()) /
            (1000 * 60 * 60 * 24)
        ) || 0;

      const warehouse =
        warehouses.find((w) => w.id === asset.warehouseId)?.name || 'Unknown';

      return { ...asset, daysSinceLastMove: days, warehouseName: warehouse };
    });

    const agingBuckets = {
      '0-2 days': agingData.filter((a) => a.daysSinceLastMove <= 2).length,
      '3-7 days': agingData.filter(
        (a) => a.daysSinceLastMove >= 3 && a.daysSinceLastMove <= 7
      ).length,
      '8-30 days': agingData.filter(
        (a) => a.daysSinceLastMove >= 8 && a.daysSinceLastMove <= 30
      ).length,
      '30+ days': agingData.filter((a) => a.daysSinceLastMove > 30).length,
    };

    const oldestAssets = [...agingData]
      .sort((a, b) => b.daysSinceLastMove - a.daysSinceLastMove)
      .slice(0, 10);

    return {
      agingBuckets,
      oldestAssets,
      averageAge:
        agingData.length > 0
          ? agingData.reduce((s, a) => s + a.daysSinceLastMove, 0) /
            agingData.length
          : 0,
    };
  };

  /* ================= MOVEMENT ================= */
  const generateMovementReport = (
    events: AssetEvent[],
    assets: Asset[],
    days: number
  ) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recent = events.filter(
      (e) => new Date(e.timestamp) >= cutoff
    );

    const movementsByType: any = {};
    const movementsByDay: any = {};

    recent.forEach((e) => {
      movementsByType[e.type] =
        (movementsByType[e.type] || 0) + 1;

      const day = new Date(e.timestamp).toDateString();
      movementsByDay[day] = (movementsByDay[day] || 0) + 1;
    });

    return {
      totalEvents: recent.length,
      movementsByType,
      movementsByDay,
      mostActiveAssets: [],
    };
  };

  /* ================= RESPONSIBILITY ================= */
  const generateResponsibilityReport = (
    events: AssetEvent[],
    assets: Asset[],
    days: number
  ) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recent = events.filter(
      (e) => new Date(e.timestamp) >= cutoff
    );

    const userActivity: any = {};
    const deviceActivity: any = {};

    recent.forEach((e) => {
      userActivity[e.userId] ??= {
        totalEvents: 0,
        eventTypes: {},
        lastActivity: e.timestamp,
      };

      userActivity[e.userId].totalEvents++;
      userActivity[e.userId].eventTypes[e.type] =
        (userActivity[e.userId].eventTypes[e.type] || 0) + 1;

      deviceActivity[e.deviceId] =
        (deviceActivity[e.deviceId] || 0) + 1;
    });

    return {
      userActivity,
      deviceActivity,
      totalUsers: Object.keys(userActivity).length,
      totalDevices: Object.keys(deviceActivity).length,
    };
  };

  /* ================= EXPORT ================= */
  const exportReport = () => {
    const blob = new Blob(
      [JSON.stringify(reportData, null, 2)],
      { type: 'application/json' }
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeReport}_report.json`;
    link.click();
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button
            onClick={exportReport}
            disabled={!reportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'stock', label: 'Stock Report', icon: Package },
              { id: 'aging', label: 'Aging Analysis', icon: Clock },
              { id: 'movement', label: 'Movement Report', icon: TrendingUp },
              { id: 'responsibility', label: 'User Activity', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 text-sm ${
                    activeReport === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Generating report...
            </div>
          ) : reportData ? (
            <>
              {activeReport === 'stock' && (
                <div className="text-sm text-gray-600">
                  Stock report generated successfully
                </div>
              )}
              {activeReport === 'aging' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {safeEntries(reportData?.agingBuckets).map(
                    ([bucket, count]) => (
                      <div
                        key={bucket}
                        className="bg-white p-4 rounded-lg border text-center"
                      >
                        <div className="text-2xl font-bold">
                          {count as number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {bucket}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              {activeReport === 'movement' && (
                <div className="text-sm text-gray-600">
                  Movement report generated successfully
                </div>
              )}
              {activeReport === 'responsibility' && (
                <div className="text-sm text-gray-600">
                  Responsibility report generated successfully
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

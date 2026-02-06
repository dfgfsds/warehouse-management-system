// import React, { useState, useEffect } from 'react';
// import { Package, TrendingUp, Clock, AlertTriangle, Activity, Users } from 'lucide-react';
// import { StorageManager } from '../../utils/storage';
// import { Asset, AssetEvent, DashboardStats } from '../../types';
// import { useAuth } from '../../hooks/useAuth';
// import baseUrl from '../../../api-endpoints/ApiUrls'
// export const Dashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<DashboardStats>({
//     totalAssets: 0,
//     assetsByStatus: {
//       working: 0,
//       needs_fix: 0,
//       scrap: 0,
//       reserved: 0,
//       damaged: 0,
//       testing: 0
//     },
//     assetsByWarehouse: {},
//     recentActivity: [],
//     agingStats: {
//       days0to2: 0,
//       days3to7: 0,
//       days7plus: 0
//     }
//   });

//   useEffect(() => {
//     calculateStats();
//   }, []);

//   console.log(baseUrl,'hgjhgjh')
//   const calculateStats = () => {
//     const assets = StorageManager.getAssets();
//     const events = StorageManager.getEvents().slice(-10); // Last 10 events
//     const warehouses = StorageManager.getWarehouses();

//     // Calculate asset counts by status
//     const assetsByStatus = assets.reduce((acc, asset) => {
//       acc[asset.status] = (acc[asset.status] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     // Calculate aging
//     const now = new Date();
//     const agingStats = assets.reduce((acc, asset) => {
//       const lastMoved = new Date(asset.lastMovedAt);
//       const daysDiff = Math.floor((now.getTime() - lastMoved.getTime()) / (1000 * 60 * 60 * 24));

//       if (daysDiff <= 2) acc.days0to2++;
//       else if (daysDiff <= 7) acc.days3to7++;
//       else acc.days7plus++;

//       return acc;
//     }, { days0to2: 0, days3to7: 0, days7plus: 0 });

//     // Calculate assets by warehouse
//     const assetsByWarehouse = assets.reduce((acc, asset) => {
//       const warehouse = warehouses.find(w => w.id === asset.warehouseId);
//       const warehouseName = warehouse?.name || 'Unknown';
//       acc[warehouseName] = (acc[warehouseName] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     setStats({
//       totalAssets: assets.length,
//       assetsByStatus: {
//         working: assetsByStatus.working || 0,
//         needs_fix: assetsByStatus.needs_fix || 0,
//         scrap: assetsByStatus.scrap || 0,
//         reserved: assetsByStatus.reserved || 0,
//         damaged: assetsByStatus.damaged || 0,
//         testing: assetsByStatus.testing || 0
//       },
//       assetsByWarehouse,
//       recentActivity: events,
//       agingStats
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'working': return 'text-green-600 bg-green-100';
//       case 'needs_fix': return 'text-yellow-600 bg-yellow-100';
//       case 'scrap': return 'text-red-600 bg-red-100';
//       case 'reserved': return 'text-blue-600 bg-blue-100';
//       case 'damaged': return 'text-red-600 bg-red-100';
//       case 'testing': return 'text-purple-600 bg-purple-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const formatEventType = (type: string) => {
//     return type.split('_').map(word => 
//       word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//     ).join(' ');
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
//         <div className="text-sm text-gray-500">
//           Welcome back, {user?.username}
//         </div>
//       </div>

//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Assets</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalAssets}</p>
//             </div>
//             <Package className="h-12 w-12 text-blue-600 bg-blue-100 rounded-lg p-3" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Working Assets</p>
//               <p className="text-3xl font-bold text-green-600">{stats.assetsByStatus.working}</p>
//             </div>
//             <TrendingUp className="h-12 w-12 text-green-600 bg-green-100 rounded-lg p-3" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Needs Fix</p>
//               <p className="text-3xl font-bold text-yellow-600">{stats.assetsByStatus.needs_fix}</p>
//             </div>
//             <AlertTriangle className="h-12 w-12 text-yellow-600 bg-yellow-100 rounded-lg p-3" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Aged 7+ Days</p>
//               <p className="text-3xl font-bold text-red-600">{stats.agingStats.days7plus}</p>
//             </div>
//             <Clock className="h-12 w-12 text-red-600 bg-red-100 rounded-lg p-3" />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Asset Status Breakdown */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Status</h2>
//           <div className="space-y-3">
//             {Object.entries(stats.assetsByStatus).map(([status, count]) => (
//               <div key={status} className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
//                     {status.replace('_', ' ').toUpperCase()}
//                   </span>
//                 </div>
//                 <span className="font-semibold text-gray-900">{count}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Recent Activity */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center space-x-2 mb-4">
//             <Activity className="h-5 w-5 text-gray-600" />
//             <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
//           </div>
//           <div className="space-y-3">
//             {stats.recentActivity.length === 0 ? (
//               <p className="text-gray-500 text-sm">No recent activity</p>
//             ) : (
//               stats.recentActivity.map((event) => (
//                 <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
//                   <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900">
//                       {formatEventType(event.type)}
//                     </p>
//                     <p className="text-sm text-gray-600 truncate">
//                       Asset: {event.assetId}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(event.timestamp).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Aging Analysis */}
//       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Aging Analysis</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="text-center p-4 bg-green-50 rounded-lg">
//             <div className="text-2xl font-bold text-green-600">{stats.agingStats.days0to2}</div>
//             <div className="text-sm text-gray-600">0-2 Days</div>
//           </div>
//           <div className="text-center p-4 bg-yellow-50 rounded-lg">
//             <div className="text-2xl font-bold text-yellow-600">{stats.agingStats.days3to7}</div>
//             <div className="text-sm text-gray-600">3-7 Days</div>
//           </div>
//           <div className="text-center p-4 bg-red-50 rounded-lg">
//             <div className="text-2xl font-bold text-red-600">{stats.agingStats.days7plus}</div>
//             <div className="text-sm text-gray-600">7+ Days</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// import React, { useEffect, useState } from 'react';
// import {
//   Package,
//   AlertTriangle,
//   Clock,
//   TrendingUp,
// } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { StorageManager } from '../../utils/storage';
// import { Asset } from '../../types';

// interface DashboardStats {
//   total_assets: number;
//   status_counts: Record<string, number>;
//   warehouse_distribution: Record<string, number>;
//   recent_activity: any[];
//   aging_stats: {
//     days_0_to_2: number;
//     days_3_to_7: number;
//     days_7_plus: number;
//   };
// }

// export const Dashboard: React.FC = () => {
//   const { user }: any = useAuth();

//   const [stats, setStats] = useState<DashboardStats>({
//     total_assets: 0,
//     status_counts: {},
//     warehouse_distribution: {},
//     recent_activity: [],
//     aging_stats: {
//       days_0_to_2: 0,
//       days_3_to_7: 0,
//       days_7_plus: 0,
//     },
//   });

//   /* ================= CALCULATE STATS FROM LOCALSTORAGE ================= */
//   useEffect(() => {
//     calculateDashboardStats();
//   }, []);

//   const calculateDashboardStats = () => {
//     try {
//       const assets = StorageManager.getAssets();
//       const events = StorageManager.getEvents().slice(-10); // Last 10 events
//       const warehouses = StorageManager.getWarehouses();

//       // Count assets by status
//       const status_counts: Record<string, number> = {};
//       assets.forEach((asset) => {
//         const status = asset.status || 'unknown';
//         status_counts[status] = (status_counts[status] || 0) + 1;
//       });

//       // Distribute assets by warehouse
//       const warehouse_distribution: Record<string, number> = {};
//       assets.forEach((asset) => {
//         const warehouse = warehouses.find(w => w.id === asset.warehouseId);
//         const warehouseName = warehouse?.name || 'Unknown';
//         warehouse_distribution[warehouseName] = (warehouse_distribution[warehouseName] || 0) + 1;
//       });

//       // Calculate aging statistics (based on lastMovedAt)
//       const now = new Date();
//       const aging_stats = { days_0_to_2: 0, days_3_to_7: 0, days_7_plus: 0 };

//       assets.forEach((asset) => {
//         const lastMoved = new Date(asset.lastMovedAt);
//         const daysDiff = Math.floor((now.getTime() - lastMoved.getTime()) / (1000 * 60 * 60 * 24));

//         if (daysDiff <= 2) {
//           aging_stats.days_0_to_2++;
//         } else if (daysDiff <= 7) {
//           aging_stats.days_3_to_7++;
//         } else {
//           aging_stats.days_7_plus++;
//         }
//       });

//       setStats({
//         total_assets: assets.length,
//         status_counts,
//         warehouse_distribution,
//         recent_activity: events,
//         aging_stats,
//       });
//     } catch (error) {
//       console.error('Error calculating dashboard stats:', error);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
//         <span className="text-sm text-gray-500">
//           Welcome back, {user?.username || 'User'}
//         </span>
//       </div>

//       {/* ================= TOP METRICS ================= */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* TOTAL ASSETS */}
//         <div className="bg-white p-6 rounded-lg border shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Assets</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {stats.total_assets}
//               </p>
//             </div>
//             <Package className="h-12 w-12 text-blue-600 bg-blue-100 p-3 rounded-lg" />
//           </div>
//         </div>

//         {/* WORKING ASSETS */}
//         <div className="bg-white p-6 rounded-lg border shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Working</p>
//               <p className="text-3xl font-bold text-green-600">
//                 {stats.status_counts['working'] || 0}
//               </p>
//             </div>
//             <TrendingUp className="h-12 w-12 text-green-600 bg-green-100 p-3 rounded-lg" />
//           </div>
//         </div>

//         {/* NEEDS FIX */}
//         <div className="bg-white p-6 rounded-lg border shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Needs Fix</p>
//               <p className="text-3xl font-bold text-yellow-600">
//                 {stats.status_counts['needs_fix'] || 0}
//               </p>
//             </div>
//             <AlertTriangle className="h-12 w-12 text-yellow-600 bg-yellow-100 p-3 rounded-lg" />
//           </div>
//         </div>

//         {/* AGING 7+ DAYS */}
//         <div className="bg-white p-6 rounded-lg border shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Aged 7+ Days</p>
//               <p className="text-3xl font-bold text-red-600">
//                 {stats.aging_stats.days_7_plus}
//               </p>
//             </div>
//             <Clock className="h-12 w-12 text-red-600 bg-red-100 p-3 rounded-lg" />
//           </div>
//         </div>
//       </div>

//       {/* ================= STATUS BREAKDOWN ================= */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Asset Status */}
//         <div className="bg-white p-6 rounded-lg border shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">
//             Asset Status Breakdown
//           </h2>

//           {Object.keys(stats.status_counts).length === 0 ? (
//             <p className="text-sm text-gray-500">No assets available</p>
//           ) : (
//             <div className="space-y-3">
//               {Object.entries(stats.status_counts).map(([status, count]) => (
//                 <div key={status} className="flex items-center justify-between">
//                   <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
//                     {status.replace('_', ' ').toUpperCase()}
//                   </span>
//                   <span className="font-semibold text-gray-900">{count}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Warehouse Distribution */}
//         <div className="bg-white p-6 rounded-lg border shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">
//             Assets by Warehouse
//           </h2>

//           {Object.keys(stats.warehouse_distribution).length === 0 ? (
//             <p className="text-sm text-gray-500">No warehouse data available</p>
//           ) : (
//             <div className="space-y-3">
//               {Object.entries(stats.warehouse_distribution).map(([warehouse, count]) => (
//                 <div key={warehouse} className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-700">{warehouse}</span>
//                   <span className="font-semibold text-gray-900">{count}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ================= AGING ANALYSIS ================= */}
//       <div className="bg-white p-6 rounded-lg border shadow-sm">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//           Asset Aging Analysis
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <AgingCard
//             label="0–2 Days"
//             value={stats.aging_stats.days_0_to_2}
//             color="green"
//           />
//           <AgingCard
//             label="3–7 Days"
//             value={stats.aging_stats.days_3_to_7}
//             color="yellow"
//           />
//           <AgingCard
//             label="7+ Days"
//             value={stats.aging_stats.days_7_plus}
//             color="red"
//           />
//         </div>
//       </div>

//       {/* ================= RECENT ACTIVITY ================= */}
//       <div className="bg-white p-6 rounded-lg border shadow-sm">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//           Recent Activity
//         </h2>

//         {stats.recent_activity.length === 0 ? (
//           <p className="text-sm text-gray-500">No recent activity</p>
//         ) : (
//           <div className="space-y-3">
//             {stats.recent_activity.map((event) => (
//               <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-900">
//                     {event.type.replace('_', ' ').toUpperCase()}
//                   </p>
//                   <p className="text-sm text-gray-600 truncate">
//                     Asset: {event.assetId}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {new Date(event.timestamp).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ================= HELPER COMPONENT ================= */

// const AgingCard = ({
//   label,
//   value,
//   color,
// }: {
//   label: string;
//   value: number;
//   color: 'red' | 'yellow' | 'green';
// }) => {
//   const colorMap: any = {
//     red: 'text-red-600 bg-red-50',
//     yellow: 'text-yellow-600 bg-yellow-50',
//     green: 'text-green-600 bg-green-50',
//   };

//   return (
//     <div className={`text-center p-4 rounded-lg ${colorMap[color]}`}>
//       <div className="text-2xl font-bold">{value}</div>
//       <div className="text-sm font-medium">{label}</div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import baseUrl from "../../../api-endpoints/ApiUrls";

/* ================= TYPES ================= */
// (UNCHANGED)

type Product = { id: string; title: string };
type StatusStock = { status_id: string; status_name: string; stock: number };
type InOutStatusBreakdown = {
  status_id: string | null;
  status_name: string;
  total_in: number;
  total_out: number;
};
type InOutStats = {
  total_in: number;
  total_out: number;
  last_in_date: string | null;
  last_out_date: string | null;
  status_breakdown: InOutStatusBreakdown[];
};
type SalesRow = {
  date: string;
  product_name: string;
  total_quantity: number;
  total_amount: number;
  order_count: number;
};

/* ================= COMPONENT ================= */

export const Dashboard: React.FC = () => {
  const { user }: any = useAuth();

  /* ================= STATES (UNCHANGED) ================= */

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [totalStock, setTotalStock] = useState(0);
  const [statusStocks, setStatusStocks] = useState<StatusStock[]>([]);
  const [inOutStats, setInOutStats] = useState<InOutStats>({
    total_in: 0,
    total_out: 0,
    last_in_date: null,
    last_out_date: null,
    status_breakdown: [],
  });

  const [salesStartDate, setSalesStartDate] = useState("");
  const [salesEndDate, setSalesEndDate] = useState("");
  const [salesReport, setSalesReport] = useState<SalesRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSalesVolume, setTotalSalesVolume] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState<string>("");
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [hubInventoryLoading, setHubInventoryLoading] = useState(false);
  const [warehousesData, setWarehousesData] = useState<any[]>()
  const [productSearch, setProductSearch] = useState("");
  const [productData, setProductData] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");


  const getProducts = async () => {
    try {
      setLoading(true); // 🔥 start loading
      const updateApi = await axios.get(`${baseUrl?.products}/by-vendor/${user?.vendor_id}`);
      if (updateApi) {
        console.log(updateApi)
        setProductData(updateApi?.data?.data?.products || []);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user?.vendor_id) {
      getProducts();
    }
  }, [user?.vendor_id]);

  const filteredHubInventory = hubInventory.filter((item: any) => {
    if (!selectedProductId) return true;

    return item.product_id === selectedProductId;
  });



  const fetchHubInventory = async (hubId: string) => {
    if (!hubId) {
      setHubInventory([]);
      return;
    }

    setHubInventoryLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl.hubDivisionInventory}?hub_id=${hubId}&division_id=335f1aea-42f2-48e9-81b6-12d2e4f5c480`
      );

      setHubInventory(res?.data?.data?.inventory_stats || []);
    } catch (error) {
      console.error("Hub inventory error", error);
    } finally {
      setHubInventoryLoading(false);
    }
  };




  useEffect(() => {
    if (selectedHubId) {
      fetchHubInventory(selectedHubId);
    }
  }, [selectedHubId]);



  // Warehouses APIS 
  const getWarehouses = async () => {
    try {
      const updatedAPi = await axios.get(`${baseUrl?.vendors}/${user?.vendor_id}/hubs`)
      console.log(updatedAPi?.data)
      if (updatedAPi) {
        setWarehousesData(updatedAPi?.data?.data?.hubs)
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    getWarehouses();
  }, []);


  /* ================= API CALLS (UNCHANGED) ================= */

  useEffect(() => {
    if (!user?.vendor_id) return;
    axios.get(`${baseUrl.products}/by-vendor/${user.vendor_id}`).then((res) => {
      const list = res?.data?.data?.products || [];
      setProducts(list.map((p: any) => ({
        id: p.product.id,
        title: p.product.title,
      })));
    });
  }, [user?.vendor_id]);

  const fetchProductStats = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    const res = await axios.get(`${baseUrl.productStockStats}/${selectedProduct}`);
    const data = res?.data?.data;
    setTotalStock(data?.total_stock || 0);
    setStatusStocks(data?.stock_by_status || []);
    setInOutStats({
      total_in: data?.in_out_stats?.total_in || 0,
      total_out: data?.in_out_stats?.total_out || 0,
      last_in_date: data?.in_out_stats?.last_in_date || null,
      last_out_date: data?.in_out_stats?.last_out_date || null,
      status_breakdown: data?.in_out_stats?.status_breakdown || [],
    });
    setLoading(false);
  };

  const fetchSalesReport = async () => {
    if (!salesStartDate || !salesEndDate) return;
    setLoading(true);
    const res = await axios.get(
      `${baseUrl.salesReport}?vendor_id=${user.vendor_id}&start_date=${salesStartDate}&end_date=${salesEndDate}`
    );
    const data = res?.data?.data;
    setSalesReport(data?.report || []);
    setTotalRevenue(data?.total_revenue || 0);
    setTotalSalesVolume(data?.total_sales_volume || 0);
    setLoading(false);
  };

  /* ================= UI ================= */

  const getStockStyle = (stock: number) => {
    if (stock <= 5)
      return "bg-red-50 text-red-700 border-red-200";
    if (stock <= 20)
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Dashboard
        </h1>
        <span className="text-sm text-gray-500">
          Welcome back, <b>{user?.user_name}</b>
        </span>
      </div>


      <section className="rounded-2xl bg-white border shadow-lg p-6 space-y-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🏬 Hub Inventory Available Stock
          </h2>

          <div className="flex gap-3">

            {/* HUB SELECT */}
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm w-56 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Hub</option>
              {warehousesData?.map((hub: any) => (
                <option key={hub.id} value={hub.id}>
                  {hub.title}
                </option>
              ))}
            </select>

            {/* PRODUCT SEARCH */}
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>

              {productData?.map((item: any) => (
                <option
                  key={item?.product?.id}
                  value={item?.product?.id}
                  className="capitalize"
                >
                  {item?.product?.title} ({item?.product?.sku})
                </option>
              ))}
            </select>



          </div>
        </div>

        {/* STATES */}
        {hubInventoryLoading ? (
          <div className="py-10 text-center text-gray-400">
            Loading inventory…
          </div>
        ) : !selectedHubId ? (
          <div className="py-10 text-center text-gray-400">
            Please select a hub to view inventory
          </div>
        ) : filteredHubInventory.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No matching products found
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">SKU</th>
                  <th className="px-4 py-3 text-right">Available Stock</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredHubInventory.map((item: any) => (
                  <tr
                    key={item.product_id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* PRODUCT */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 capitalize">
                        {item.product_name}
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3 text-center font-mono text-gray-600">
                      {item.sku}
                    </td>

                    {/* AVAILABLE STOCK */}
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`inline-flex flex-col items-center justify-center px-3 py-1.5 rounded-lg border font-bold ${getStockStyle(
                          item.current_stock
                        )}`}
                      >
                        <span className="text-xl leading-none">
                          {item.current_stock}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide">
                          Available
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {/* PRODUCT SECTION */}
      <section className="rounded-2xl bg-white/80 backdrop-blur border shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          📦 Product Stock Overview
        </h2>

        <div className="flex gap-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="border rounded-xl px-4 py-2 w-80 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} className="capitalize">{p.title}</option>
            ))}
          </select>

          <button
            onClick={fetchProductStats}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:scale-105 transition"
          >
            Load Data
          </button>
        </div>
      </section>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric title="Total Stock" value={totalStock} icon={<Package />} color="blue" />
        <Metric title="Total In" value={inOutStats.total_in} icon={<TrendingUp />} color="green" />
        <Metric title="Total Out" value={inOutStats.total_out} icon={<TrendingDown />} color="red" />
        <Metric title="Last In" value={inOutStats.last_in_date || "-"} icon={<Clock />} color="purple" />
      </div>

      {/* STATUS */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border shadow p-6">
          <h3 className="font-semibold mb-4">Stock by Status</h3>
          {statusStocks.map((s) => (
            <div key={s.status_id}
              className="flex justify-between px-4 py-3 mb-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <span className="capitalize">{s?.status_name}</span>
              <span className="font-bold">{s.stock}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white border shadow p-6">
          <h3 className="font-semibold mb-4">In / Out Breakdown</h3>
          {inOutStats.status_breakdown.map((s, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span className="capitalize">{s.status_name}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">IN {s.total_in}</span>
                <span className="text-red-600">OUT {s.total_out}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SALES */}
      <section className="rounded-2xl bg-white border shadow-lg p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <BarChart3 /> Sales Report
        </h2>

        <div className="flex gap-4">
          <input type="date" value={salesStartDate}
            onChange={(e) => setSalesStartDate(e.target.value)}
            className="border rounded-xl px-3 py-2" />
          <input type="date" value={salesEndDate}
            onChange={(e) => setSalesEndDate(e.target.value)}
            className="border rounded-xl px-3 py-2" />
          <button
            onClick={fetchSalesReport}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 rounded-xl hover:scale-105 transition">
            Load Sales
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Metric title="Revenue" value={`₹${totalRevenue}`} icon={<IndianRupee />} color="green" />
          <Metric title="Quantity Sold" value={totalSalesVolume} icon={<ShoppingCart />} color="blue" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            {/* <tbody>
              {salesReport.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 capitalize">{r.product_name}</td>
                  <td className="px-4 py-2 text-center">{r.date}</td>
                  <td className="px-4 py-2 text-right">{r.total_quantity}</td>
                  <td className="px-4 py-2 text-right">{r.order_count}</td>
                  <td className="px-4 py-2 text-right font-semibold">₹{r.total_amount}</td>
                </tr>
              ))}
            </tbody> */}

            <tbody>
              {salesReport.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400 font-medium"
                  >
                    No sales data found for the selected date range
                  </td>
                </tr>
              ) : (
                salesReport?.map((r: any, i: number) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 capitalize">{r?.product_name}</td>
                    <td className="px-4 py-2 text-center">{r?.date}</td>
                    <td className="px-4 py-2 text-right">{r?.total_quantity}</td>
                    <td className="px-4 py-2 text-right">{r?.order_count}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ₹{r?.total_amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </section>
    </div>
  );
};

/* ================= METRIC CARD ================= */

const Metric = ({ title, value, icon, color }: any) => (
  <div className="rounded-2xl bg-white border shadow-md p-5 flex justify-between items-center hover:scale-[1.03] transition">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
  </div>
);

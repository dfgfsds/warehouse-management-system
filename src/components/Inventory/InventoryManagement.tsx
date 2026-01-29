import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Eye, CreditCard as Edit, Trash2, MapPin, Calendar, PlusCircle } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, Warehouse, AssetStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import AddProductModal, { Select } from '../Modals/AddProductModal';
import axios from 'axios';
import baseUrl from '../../../api-endpoints/ApiUrls';

export const InventoryManagement: React.FC = () => {
  const { user }: any = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  // const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [productData, setProductData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hubFilter, setHubFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [productStatuses, setProductStatuses] = useState<any[]>([]);

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



  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

    axios
      .get(baseUrl.productStatus)
      .then(r => setProductStatuses(r.data.product_status || []));
  }, [user?.vendor_id]);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allAssets = StorageManager.getAssets();
    const allWarehouses = StorageManager.getWarehouses();

    // Filter assets based on user permissions
    const filteredAssets = user?.role === 'admin'
      ? allAssets
      : allAssets.filter(asset => user?.warehouseIds.includes(asset.warehouseId));

    setAssets(filteredAssets);
    setWarehouses(allWarehouses);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'all' || asset.warehouseId === warehouseFilter;

    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  const getWarehouseInfo = (warehouseId: string, sectionId: string, trayId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const section = warehouse?.sections.find(s => s.id === sectionId);
    const tray = section?.trays.find(t => t.id === trayId);

    return {
      warehouseName: warehouse?.name || 'Unknown',
      sectionName: section?.name || 'Unknown',
      trayName: tray?.name || 'Unknown'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'needs_fix': return 'bg-yellow-100 text-yellow-800';
      case 'scrap': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetModal(true);
  };

  const AssetModal = () => {
    if (!selectedAsset) return null;

    const { warehouseName, sectionName, trayName } = getWarehouseInfo(
      selectedAsset.warehouseId,
      selectedAsset.sectionId,
      selectedAsset.trayId
    );

    const events = StorageManager.getEventsByAssetId(selectedAsset.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Asset Details</h2>
              <button
                onClick={() => setShowAssetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">QR Code</label>
                <p className="text-gray-900 font-mono">{selectedAsset.qrCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Type</label>
                <p className="text-gray-900">{selectedAsset.productType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                  {selectedAsset.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{warehouseName} {'>'} {sectionName} {'>'} {trayName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Packing Status</label>
                <p className="text-gray-900">{selectedAsset.isPacked ? 'Packed' : 'Unpacked'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch Status</label>
                <p className="text-gray-900">{selectedAsset.isDispatched ? 'Dispatched' : 'In Warehouse'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Events</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-sm">No events recorded</p>
                ) : (
                  events.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {event.type.replace('_', ' ')}
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
        </div>
      </div>
    );
  };

  // const AddAssetModal = () => {
  //   const [newAsset, setNewAsset] = useState<Partial<Asset>>({
  //     status: 'working',
  //     productType: '',
  //     qrCode: '',
  //     warehouseId: warehouses[0]?.id || '',
  //   });
  //   const [error, setError] = useState('');

  //   const productTypes = StorageManager.getProductTypes();

  //   const selectedWarehouse = warehouses.find(w => w.id === newAsset.warehouseId);
  //   if (selectedWarehouse && !newAsset.sectionId && selectedWarehouse.sections.length > 0) {
  //     // Auto-select first section/tray if available
  //   }

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setError('');

  //     if (!newAsset.qrCode || !newAsset.productType || !newAsset.warehouseId || !newAsset.sectionId || !newAsset.trayId) {
  //       setError('Please fill in all required fields');
  //       return;
  //     }

  //     const existing = StorageManager.getAssetByQR(newAsset.qrCode);
  //     if (existing) {
  //       setError('Asset with this QR Code already exists');
  //       return;
  //     }

  //     const asset: Asset = {
  //       id: `asset-${Date.now()}`,
  //       qrCode: newAsset.qrCode,
  //       productType: newAsset.productType,
  //       status: newAsset.status as AssetStatus,
  //       warehouseId: newAsset.warehouseId,
  //       sectionId: newAsset.sectionId,
  //       trayId: newAsset.trayId,
  //       parentAssetId: undefined,
  //       childAssetIds: [],
  //       isPacked: false,
  //       isDispatched: false,
  //       receivedAt: new Date().toISOString(),
  //       lastMovedAt: new Date().toISOString(),
  //       lastHandledBy: user?.id || 'unknown',
  //       deviceId: user?.deviceId || 'unknown',
  //       metadata: {}
  //     };

  //     StorageManager.addAsset(asset);

  //     StorageManager.addEvent({
  //       id: `event-${Date.now()}`,
  //       assetId: asset.id,
  //       type: 'RECEIVED',
  //       userId: user?.id || 'unknown',
  //       deviceId: user?.deviceId || 'unknown',
  //       timestamp: new Date().toISOString(),
  //       toLocation: {
  //         warehouseId: asset.warehouseId,
  //         warehouseName: warehouses.find(w => w.id === asset.warehouseId)?.name || 'Unknown',
  //         sectionId: asset.sectionId,
  //         sectionName: selectedWarehouse?.sections.find(s => s.id === asset.sectionId)?.name || 'Unknown',
  //         trayId: asset.trayId,
  //         trayName: selectedWarehouse?.sections.find(s => s.id === asset.sectionId)?.trays.find(t => t.id === asset.trayId)?.name || 'Unknown'
  //       }
  //     });

  //     loadData();
  //     setShowAddAssetModal(false);
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  //       <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
  //         <div className="p-6 border-b border-gray-200">
  //           <div className="flex items-center justify-between">
  //             <h2 className="text-xl font-semibold text-gray-900">Add New Asset</h2>
  //             <button
  //               onClick={() => setShowAddAssetModal(false)}
  //               className="text-gray-400 hover:text-gray-600"
  //             >
  //               ×
  //             </button>
  //           </div>
  //         </div>

  //         <form onSubmit={handleSubmit} className="p-6 space-y-4">
  //           {error && (
  //             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
  //               {error}
  //             </div>
  //           )}

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
  //             <input
  //               type="text"
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  //               value={newAsset.qrCode}
  //               onChange={e => setNewAsset({ ...newAsset, qrCode: e.target.value })}
  //               placeholder="Enter unique QR code"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
  //             <select
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  //               value={newAsset.productType}
  //               onChange={e => setNewAsset({ ...newAsset, productType: e.target.value })}
  //             >
  //               <option value="">Select Type</option>
  //               {productTypes.map(pt => (
  //                 <option key={pt.id} value={pt.name}>{pt.name}</option>
  //               ))}
  //             </select>
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
  //             <select
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  //               value={newAsset.status}
  //               onChange={e => setNewAsset({ ...newAsset, status: e.target.value as AssetStatus })}
  //             >
  //               <option value="working">Working</option>
  //               <option value="needs_fix">Needs Fix</option>
  //               <option value="scrap">Scrap</option>
  //               <option value="reserved">Reserved</option>
  //               <option value="damaged">Damaged</option>
  //               <option value="testing">Testing</option>
  //             </select>
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
  //             <select
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  //               value={newAsset.warehouseId}
  //               onChange={e => setNewAsset({ ...newAsset, warehouseId: e.target.value, sectionId: '', trayId: '' })}
  //             >
  //               <option value="">Select Warehouse</option>
  //               {warehouses.map(w => (
  //                 <option key={w.id} value={w.id}>{w.name}</option>
  //               ))}
  //             </select>
  //           </div>

  //           {newAsset.warehouseId && (
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
  //               <select
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  //                 value={newAsset.sectionId}
  //                 onChange={e => setNewAsset({ ...newAsset, sectionId: e.target.value, trayId: '' })}
  //               >
  //                 <option value="">Select Section</option>
  //                 {warehouses.find(w => w.id === newAsset.warehouseId)?.sections.map(s => (
  //                   <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
  //                 ))}
  //               </select>
  //             </div>
  //           )}

  //           {newAsset.sectionId && (
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">Tray</label>
  //               <select
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  //                 value={newAsset.trayId}
  //                 onChange={e => setNewAsset({ ...newAsset, trayId: e.target.value })}
  //               >
  //                 <option value="">Select Tray</option>
  //                 {warehouses.find(w => w.id === newAsset.warehouseId)?.sections.find(s => s.id === newAsset.sectionId)?.trays.map(t => (
  //                   <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
  //                 ))}
  //               </select>
  //             </div>
  //           )}

  //           <div className="pt-4 flex space-x-3">
  //             <button
  //               type="button"
  //               onClick={() => setShowAddAssetModal(false)}
  //               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
  //             >
  //               Cancel
  //             </button>
  //             <button
  //               type="submit"
  //               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //             >
  //               Add Asset
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // };

  const filteredProducts = productData?.filter((p: any) => {
    const search = searchTerm.toLowerCase();

    const matchSearch =
      p.title?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search) ||
      p.barcode?.includes(search);

    const matchStatus =
      statusFilter === "all" || p.statusId === statusFilter;

    const matchHub =
      hubFilter === "all" || p.hubId === hubFilter;

    const matchProductType =
      productTypeFilter === "all" || p.productTypeId === productTypeFilter;

    return matchSearch && matchStatus && matchHub && matchProductType;
  });




  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        {/* Spinner */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>

        {/* Text */}
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading brands, please wait...
        </p>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total Assets: {filteredAssets.length}
        </div>
      </div>


      <div className="bg-white p-6 rounded-lg border grid grid-cols-1  md:grid-cols-3 lg:grid-cols-5 gap-4">

        {/* Search */}
        <div>
          <label className="text-sm font-medium">Search</label>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title / SKU / barcode"
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Status */}
        <Select
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { id: "all", name: "All Status" },
            // ...productStatuses,
          ]}
        />

        {/* Warehouse */}
        <Select
          label="Warehouse"
          value={hubFilter}
          onChange={setHubFilter}
          options={[
            { id: "all", name: "All Warehouses" },
            // ...hubs,
          ]}
          labelKey="title"
        />

        {/* Product Type */}
        <Select
          label="Product Type"
          value={productTypeFilter}
          onChange={setProductTypeFilter}
          // options={[
          //   { id: "all", name: "All Types" },
          //   // ...productTypes,
          // ]}
          options={[
            ...(productTypes || []).map((productType: any) => ({
              id: productType.id,
              name: productType.name,
            })),
          ]}
        />

        <div className="flex items-end gap-5">
          <button
            onClick={loadData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-2"
          >
            Refresh
          </button>

          <button
            onClick={() => setShowAddAssetModal(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Asset
          </button>

        </div>
      </div>


      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU / Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hub
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  AMC / Insurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productData.map((item: any) => {
                const p = item.product;

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {p?.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.short_description}
                      </div>
                    </td>

                    {/* SKU / Barcode */}
                    <td className="px-6 py-4 text-sm">
                      <div>{p.sku}</div>
                      <div className="font-mono text-xs text-gray-500">
                        {p.barcode_value}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {p.product_status_id}
                      </span>
                    </td>

                    {/* Hub */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.hub_id}
                    </td>

                    {/* AMC / Insurance */}
                    <td className="px-6 py-4 text-sm">
                      <div>
                        AMC:{" "}
                        <span className="font-medium">
                          {p.amc_expiry_date || "-"}
                        </span>
                      </div>
                      <div>
                        INS:{" "}
                        <span className="font-medium">
                          {p.insurance_expiry_date || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {showAssetModal && <AssetModal />}
      {/* {showAddAssetModal && <AddAssetModal />} */}
      {showAddAssetModal &&
        <AddProductModal
          open={showAddAssetModal}
          onCancel={() => (setShowAddAssetModal(!showAddAssetModal))}
          // editProduct={ }
          // refresh={ }
          productTypes={productTypes}
          productStatuses={productStatuses}
        />}
    </div>
  );
};
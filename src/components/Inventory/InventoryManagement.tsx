import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Eye, CreditCard as Edit, Trash2, MapPin, Calendar, PlusCircle, Edit2 } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, Warehouse, AssetStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import AddProductModal, { Select } from '../Modals/AddProductModal';
import axios from 'axios';
import baseUrl from '../../../api-endpoints/ApiUrls';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import BarcodePrintModal from '../../utils/BarcodePrint';

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
  const [editData, setEditData] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hubFilter, setHubFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [productStatuses, setProductStatuses] = useState<any[]>([]);
  // Warehouses
  const [warehousesData, setWarehousesData] = useState<any[]>()

  // 🔹 delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");


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


  const handleDelete = async () => {
    try {
      await axios.delete(
        `${baseUrl.products}/${deleteItem?.product?.id}`
      );
      setConfirmOpen(false);
      setDeleteItem(null);
      getProducts();
    } catch (error) {
      console.log(error);
    }
  };


  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

    axios
      .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}&type=product`)
      .then(r => setProductStatuses(r?.data?.data?.statuses || []));
  }, [user?.vendor_id]);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setHubFilter('all');
    setProductTypeFilter('all');
  }
  // const loadData = () => {
  //   const allAssets = StorageManager.getAssets();
  //   const allWarehouses = StorageManager.getWarehouses();

  //   // Filter assets based on user permissions
  //   const filteredAssets = user?.role === 'admin'
  //     ? allAssets
  //     : allAssets.filter(asset => user?.warehouseIds.includes(asset.warehouseId));

  //   setAssets(filteredAssets);
  //   setWarehouses(allWarehouses);
  // };

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

  const filteredProducts = (productData || []).filter((item: any) => {
    const p = item.product;
    if (!p) return false;

    const search = searchTerm.toLowerCase();

    const matchSearch =
      p.title?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search) ||
      p.barcode_value?.toLowerCase().includes(search);

    const matchStatus =
      statusFilter === "all" || p.status?.id === statusFilter;

    const matchHub =
      hubFilter === "all" || p.hub?.id === hubFilter;

    const matchProductType =
      productTypeFilter === "all" ||
      p.product_type?.id === productTypeFilter;

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
          Total Assets: {filteredProducts?.length}
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
            ...(productStatuses || [])?.map((productType: any) => ({
              id: productType.id,
              name: productType.name,
            })),
          ]}
        />

        {/* Warehouse */}
        <Select
          label="Warehouse"
          value={hubFilter}
          onChange={setHubFilter}
          options={[
            ...(warehousesData || []).map((item: any) => ({
              id: item?.id,
              name: item?.title,
            })),
          ]}
        // labelKey="title"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts?.map((item: any) => {
                const p = item.product;

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {p?.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p?.short_description}
                      </div>
                    </td>

                    {/* SKU / Barcode */}
                    <td className="px-6 py-4 text-sm">
                      <div>{p?.sku}</div>
                      <div className="font-mono text-xs text-gray-500">
                        {p?.barcode_value}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {p.status?.name}
                      </span>
                    </td>

                    {/* Hub */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.hub?.name}
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

                    <td className="px-6 py-4 flex gap-4">
                      <button
                        onClick={() => {
                          setEditData(item);
                          setShowAddAssetModal(!showAddAssetModal);
                        }}
                        className="text-blue-600 flex gap-1"
                      >
                        <Edit2 size={16} /> Edit
                      </button>

                      <button
                        onClick={() => {
                          setDeleteItem(item);
                          setConfirmOpen(true);
                        }}
                        className="text-red-600 flex gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>

                      {p?.barcode_value && (
                        <button
                          onClick={() => {
                            setSelectedBarcode(p.barcode_value);
                            setSelectedProductName(p.title);
                            setBarcodeModalOpen(true);
                          }}
                          className="text-gray-700 underline text-sm"
                        >
                          Print Barcode
                        </button>
                      )}

                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {filteredProducts.length === 0 && (
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
          editProduct={editData}
          refresh={getProducts}
          productTypes={productTypes}
          productStatuses={productStatuses}
        />}

      <DeleteConfirmModal
        open={confirmOpen}
        title="Delete Product Unit"
        description={`Are you sure you want to delete "${deleteItem?.product?.title}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      <BarcodePrintModal
        open={barcodeModalOpen}
        barcode={selectedBarcode}
        productName={selectedProductName}
        onClose={() => setBarcodeModalOpen(false)}
      />


    </div>
  );
};
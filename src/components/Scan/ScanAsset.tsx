// import React, { useState, useEffect } from 'react';
// import { QrCode, Package, MapPin, Settings, Move, Truck, Scissors } from 'lucide-react';
// import { StorageManager } from '../../utils/storage';
// import { Asset, AssetEvent, EventType } from '../../types';
// import { useAuth } from '../../hooks/useAuth';
// import { QRGenerator } from '../../utils/qr-generator';
// import axios from 'axios';
// import baseUrl from '../../../api-endpoints/ApiUrls';

// export const ScanAsset: React.FC = () => {
//   const { user } = useAuth();
//   const [qrCode, setQrCode] = useState('');
//   const [asset, setAsset] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const getQrCode = async () => {
//     try {
//       const res = await axios.get(`${baseUrl?.barcode}/${qrCode}`)
//       console.log(res)
//       if(res){
//         setAsset(res?.data?.data)
//       }
//     } catch (error) {

//     }
//   }

//   useEffect(() => {
//     if (qrCode) {

//       getQrCode();
//     }

//   }, [qrCode])

//   const handleQRScan = async () => {
//     if (!qrCode.trim()) {
//       setMessage('Please enter a QR code');
//       return;
//     }

//     setLoading(true);
//     const foundAsset = StorageManager.getAssetByQR(qrCode.trim());

//     if (foundAsset) {
//       setAsset(foundAsset);
//       setMessage('');
//     } else {
//       setAsset(null);
//       setMessage('Asset not found');
//     }
//     setLoading(false);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleQRScan();
//     }
//   };

//   const createEvent = (type: EventType, metadata?: any) => {
//     if (!asset || !user) return;

//     const event: AssetEvent = {
//       id: QRGenerator.generateEventId(),
//       assetId: asset.id,
//       type,
//       userId: user.id,
//       deviceId: user.deviceId,
//       timestamp: new Date().toISOString(),
//       metadata
//     };

//     StorageManager.addEvent(event);
//   };

//   const handleAction = (action: string) => {
//     if (!asset) return;

//     switch (action) {
//       case 'move':
//         StorageManager.setCurrentScan({ type: 'move', assetId: asset.id });
//         break;
//       case 'status':
//         StorageManager.setCurrentScan({ type: 'status', assetId: asset.id });
//         break;
//       case 'pack':
//         const newPackedState = !asset.isPacked;
//         StorageManager.updateAsset(asset.id, { isPacked: newPackedState });
//         createEvent(newPackedState ? 'PACKED' : 'UNPACKED');
//         setAsset({ ...asset, isPacked: newPackedState });
//         setMessage(`Asset ${newPackedState ? 'packed' : 'unpacked'} successfully`);
//         break;
//       case 'dispatch':
//         StorageManager.setCurrentScan({ type: 'dispatch', assetId: asset.id });
//         break;
//       case 'dismantle':
//         if (!asset.childAssetIds.length) {
//           StorageManager.setCurrentScan({ type: 'dismantle', assetId: asset.id });
//         } else {
//           setMessage('This asset has already been dismantled');
//         }
//         break;
//     }
//   };

//   const getWarehouseInfo = (warehouseId: string, sectionId: string, trayId: string) => {
//     const warehouses = StorageManager.getWarehouses();
//     const warehouse = warehouses.find(w => w.id === warehouseId);
//     const section = warehouse?.sections.find(s => s.id === sectionId);
//     const tray = section?.trays.find(t => t.id === trayId);

//     return {
//       warehouseName: warehouse?.name || 'Unknown',
//       sectionName: section?.name || 'Unknown',
//       trayName: tray?.name || 'Unknown'
//     };
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'working': return 'bg-green-100 text-green-800';
//       case 'needs_fix': return 'bg-yellow-100 text-yellow-800';
//       case 'scrap': return 'bg-red-100 text-red-800';
//       case 'reserved': return 'bg-blue-100 text-blue-800';
//       case 'damaged': return 'bg-red-100 text-red-800';
//       case 'testing': return 'bg-purple-100 text-purple-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center space-x-3">
//         <QrCode className="h-8 w-8 text-blue-600" />
//         <h1 className="text-2xl font-bold text-gray-900">Scan Asset</h1>
//       </div>

//       {/* QR Code Input */}
//       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center space-x-4">
//           <div className="flex-1">
//             <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700 mb-2">
//               QR Code or Asset ID
//             </label>
//             <input
//               id="qr-input"
//               type="text"
//               value={qrCode}
//               onChange={(e) => setQrCode(e.target.value)}
//               onKeyPress={handleKeyPress}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
//               placeholder="Scan QR code or enter asset ID"
//               autoFocus
//             />
//           </div>
//           <button
//             onClick={handleQRScan}
//             disabled={loading}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
//           >
//             {loading ? 'Scanning...' : 'Scan'}
//           </button>
//         </div>

//         {/* {message && (
//           <div className={`mt-4 p-3 rounded-lg ${message.includes('successfully') || asset ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
//             }`}>
//             {message}
//           </div>
//         )} */}
//       </div>

//       {/* Asset Details */}
//       {asset && (
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <Package className="h-8 w-8 text-gray-600" />
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">Asset Details</h2>
//                 <p className="text-sm text-gray-600">QR: {asset?.product?.barcode_value}</p>
//               </div>
//             </div>
//             <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset?.product?.status?.name)}`}>
//               {asset?.product?.status?.name?.replace('_', ' ').toUpperCase()}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Product Type</label>
//               <p className="text-gray-900">{asset?.product?.product_type?.name}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Status</label>
//               <p className="text-gray-900 capitalize">{asset?.product?.status?.name?.replace('_', ' ')}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Current Location</label>
//               <div className="flex items-center space-x-2 text-gray-900">
//                 <MapPin className="h-4 w-4 text-gray-500" />
//                 <span>
//                   {(() => {
//                     const { warehouseName, sectionName, trayName } = getWarehouseInfo(
//                       asset.warehouseId, asset.sectionId, asset.trayId
//                     );
//                     return `${warehouseName} > ${sectionName} > ${trayName}`;
//                   })()}
//                 </span>
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Packing Status</label>
//               <p className="text-gray-900">{asset.isPacked ? 'Packed' : 'Unpacked'}</p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="border-t pt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-3">Available Actions</h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//               <button
//                 onClick={() => handleAction('move')}
//                 className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
//               >
//                 <Move className="h-6 w-6 text-blue-600" />
//                 <span className="text-sm font-medium">Move</span>
//               </button>

//               <button
//                 onClick={() => handleAction('status')}
//                 className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
//               >
//                 <Settings className="h-6 w-6 text-green-600" />
//                 <span className="text-sm font-medium">Status</span>
//               </button>

//               <button
//                 onClick={() => handleAction('pack')}
//                 className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
//               >
//                 <Package className="h-6 w-6 text-yellow-600" />
//                 <span className="text-sm font-medium">
//                   {asset.isPacked ? 'Unpack' : 'Pack'}
//                 </span>
//               </button>

//               <button
//                 onClick={() => handleAction('dispatch')}
//                 className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
//               >
//                 <Truck className="h-6 w-6 text-purple-600" />
//                 <span className="text-sm font-medium">Dispatch</span>
//               </button>

//               {!asset.childAssetIds.length && (
//                 <button
//                   onClick={() => handleAction('dismantle')}
//                   className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
//                 >
//                   <Scissors className="h-6 w-6 text-red-600" />
//                   <span className="text-sm font-medium">Dismantle</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useEffect, useState } from "react";
import { QrCode, Package, MapPin } from "lucide-react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";
import AddProductModal, { Select } from "../Modals/AddProductModal";
import ScanAddProductModal from "../Modals/ScanAddProductModal";

export const ScanAsset: React.FC = () => {
  const { user }: any = useAuth();

  // Barcode scanning
  const [qrCode, setQrCode] = useState("");
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Action Type selection (Add / Transfer)
  const [actionTypeValue, setActionTypeValue] = useState('');

  // FROM Section - Source location (Transfer only)
  const [fromHub, setFromHub] = useState('');
  const [fromDivision, setFromDivision] = useState('');
  const [fromTray, setFromTray] = useState('');
  const [fromDivisionsData, setFromDivisionsData] = useState<any[]>([]);
  const [fromTraysData, setFromTraysData] = useState<any[]>([]);
  const [sourceStatusFilter, setSourceStatusFilter] = useState('');

  // TO Section - Destination location
  const [toHub, setToHub] = useState('');
  const [toDivision, setToDivision] = useState('');
  const [toTray, setToTray] = useState('');
  const [toDivisionsData, setToDivisionsData] = useState<any[]>([]);
  const [toTraysData, setToTraysData] = useState<any[]>([]);
  const [toStatus, setToStatus] = useState('');


  // Dropdowns & Options
  const [productStatuses, setProductStatuses] = useState<any[]>([]);
  const [warehousesData, setWarehousesData] = useState<any[]>([]);

  // Status update mode (Auto / Manual)
  const [statusUpdateMode, setStatusUpdateMode] = useState<'auto' | 'manual'>('auto');
  const [manualStatusForProduct, setManualStatusForProduct] = useState('');

  // Scanned products tracking
  const [scannedProducts, setScannedProducts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('warehouse_transfer_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Dialogs
  const [showProductModal, setShowProductModal] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);


  const ActionType = [
    { id: "add", name: "Add New Stock" },
    { id: "transfer", name: "Transfer" },
  ];



  /* ================= FETCH DIVISIONS & TRAYS ================= */
  // Fetch divisions for FROM section (transfer source)
  const getFromDivisions = async () => {
    if (!user?.division_id) return;
    try {
      const res = await axios.get(
        `${baseUrl.divisions}/${user?.division_id}/hierarchy`
      );
      if (res?.data?.data?.division) {
        setFromDivisionsData(res?.data?.data?.division?.children || []);
        setFromDivision('');
        setFromTray('');
      }
    } catch (error) {
      console.error('Error fetching FROM divisions:', error);
    }
  };

  useEffect(() => {
    getFromDivisions();
  }, [user?.division_id]);

  // Fetch trays for FROM section based on selected division
  const getFromTrays = async () => {
    if (!fromDivision) return;
    try {
      const division = fromDivisionsData.find(d => d.id === fromDivision);
      if (division?.trays) {
        setFromTraysData(division.trays || []);
        setFromTray('');
      }
    } catch (error) {
      console.error('Error fetching FROM trays:', error);
    }
  };

  useEffect(() => {
    getFromTrays();
  }, [fromDivision]);

  // Fetch divisions for TO section (transfer destination)
  const getToDivisions = async () => {
    if (!toHub) return;
    try {
      const res = await axios.get(
        `${baseUrl.divisions}/hub/${toHub}`
      );
      if (res?.data?.data?.divisions) {
        setToDivisionsData(res.data.data.divisions || []);
        setToDivision('');
        setToTray('');
      }
    } catch (error) {
      console.error('Error fetching TO divisions:', error);
    }
  };

  useEffect(() => {
    getToDivisions();
  }, [toHub]);

  // Fetch trays for TO section based on selected division
  const getToTrays = async () => {
    if (!toDivision) return;
    try {
      const division = toDivisionsData.find(d => d.id === toDivision);
      if (division?.trays) {
        setToTraysData(division.trays || []);
        setToTray('');
      }
    } catch (error) {
      console.error('Error fetching TO trays:', error);
    }
  };

  useEffect(() => {
    getToTrays();
  }, [toDivision]);

  // Warehouses API
  const getWarehouses = async () => {
    try {
      const res = await axios.get(`${baseUrl?.vendors}/${user?.vendor_id}/hubs`);
      if (res?.data?.data?.hubs) {
        setWarehousesData(res.data.data.hubs);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  useEffect(() => {
    getWarehouses();
  }, [user?.vendor_id]);




  /* ================= LOAD PRODUCT STATUSES DROPDOWN ================= */
  useEffect(() => {
    if (!user?.vendor_id) return;
    axios
      .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}`)
      .then(r => setProductStatuses(r?.data?.data?.statuses || []))
      .catch(e => console.error('Error loading product statuses:', e));
  }, [user?.vendor_id]);

  /* ================= SAVE SCANNED PRODUCTS TO LOCAL STORAGE ================= */
  useEffect(() => {
    localStorage.setItem('warehouse_transfer_queue', JSON.stringify(scannedProducts));
  }, [scannedProducts]);


  // const handleQRScan = async () => {
  //   setMessage("")
  //   if (!qrCode.trim()) {
  //     setMessage("Please enter a QR / Barcode");
  //     return;
  //   }

  //   try {
  //     // setLoading(true);
  //     setMessage("");

  //     const res = await axios.get(
  //       `${baseUrl.barcode}/${qrCode.trim()}`
  //     );

  //     if (res?.data?.success) {
  //       setAsset(res.data.data);
  //       // } else {
  //       //   setAsset(null);
  //       //   setMessage("Asset not found");
  //     }
  //   } catch (error: any) {
  //     setAsset(null);
  //     let message = "Something went wrong";
  //     const data = error?.response?.data;
  //     console.log(data)
  //     if (data?.errors && typeof data.errors === "object") {
  //       const [field, value] = Object.entries(data.errors)[0] || [];
  //       message = `${field}: ${Array.isArray(value) ? value[0] : value
  //         }`;
  //     } else if (data?.message) {
  //       message = data.message;
  //     }

  //     setMessage(message);
  //     return error?.response;

  //     // setMessage("Asset not found");
  //   } finally {
  //     setLoading(false);
  //     setMessage("");
  //   }
  // };

  /* ================= HANDLE PRODUCT SCAN ================= */
  const handleQRScan = async () => {
    setMessage("");
    if (!qrCode.trim()) return;

    // Validate action type is selected
    if (!actionTypeValue) {
      setMessage("Please select Action Type first");
      return;
    }

    // Validate FROM section for transfer
    if (actionTypeValue === 'transfer' && (!fromHub || !fromDivision || !fromTray)) {
      setMessage("Please select source Hub, Division, and Tray for transfer");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl.barcode}/${qrCode.trim()}`);

      if (res?.data?.success) {
        const productData = res.data.data;

        // If manual status mode, show modal to select status
        if (statusUpdateMode === 'manual') {
          setAsset(productData);
          setManualStatusForProduct('');
          setShowStatusModal(true);
          setQrCode(''); // Clear input for next scan
        } else {
          // Auto mode - directly add to scanned products
          addScannedProduct(productData);
        }
      } else {
        // Product not found
        setAsset(null);
        setScannedBarcode(qrCode.trim());
        setShowProductModal(true);
      }
    } catch (error: any) {
      setAsset(null);
      const data = error?.response?.data;

      if (data?.message === "Product not found") {
        setScannedBarcode(qrCode.trim());
        setShowProductModal(true);
        return;
      }

      setMessage(data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD PRODUCT TO SCANNED LIST ================= */
  const addScannedProduct = (productData: any) => {
    const newScannedProduct = {
      id: Date.now(),
      product_id: productData.id,
      barcode: productData.product.barcode_value,
      title: productData.product.title,
      sku: productData.product.sku,
      quantity: 1,
      status: statusUpdateMode === 'auto' ? toStatus : manualStatusForProduct,
      timestamp: new Date().toISOString(),
    };

    setScannedProducts([...scannedProducts, newScannedProduct]);
    setMessage('');
    setQrCode('');
    setAsset(null);
    setShowStatusModal(false);
    setManualStatusForProduct('');
  };

  /* ================= REMOVE SCANNED PRODUCT ================= */
  const removeScannedProduct = (productId: number) => {
    setScannedProducts(scannedProducts.filter(p => p.id !== productId));
  };

  /* ================= UPDATE SCANNED PRODUCT QUANTITY ================= */
  const updateProductQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setScannedProducts(scannedProducts.map(p =>
      p.id === productId ? { ...p, quantity: newQuantity } : p
    ));
  };

  /* ================= HANDLE TRANSFER CONFIRMATION ================= */
  const handleTransferConfirmation = async () => {
    setIsTransferring(true);
    const transferPromises: any[] = [];
    let successCount = 0;
    let failureCount = 0;

    try {
      // Create transfer API calls for each scanned product
      for (const product of scannedProducts) {
        const transferPayload = {
          parent_id: fromTray,
          product_id: product.product_id,
          hub_id: toHub,
          status: product.status || toStatus,
          division_id: toDivision,
          vendor_id: user?.vendor_id,
          tray_id: toTray,
          stock: product.quantity,
          user_id: user?.id,
          action_type: "transfer",
          previous_division_id: fromDivision,
          previous_tray_id: fromTray,
          previous_hub_id: fromHub,
        };

        transferPromises.push(
          axios.post(`${baseUrl.transferInventory}`, transferPayload)
            .then(() => {
              successCount++;
            })
            .catch((error) => {
              failureCount++;
              console.error('Transfer failed for product:', product.barcode, error);
            })
        );
      }

      // Wait for all transfers to complete
      await Promise.all(transferPromises);

      // Show summary
      if (successCount > 0) {
        setMessage(`Transfer completed: ${successCount} product(s) successfully transferred${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
      }

      if (failureCount === 0) {
        // Reset form on complete success
        setScannedProducts([]);
        localStorage.removeItem('warehouse_transfer_queue');
        setShowConfirmationModal(false);
      }

    } catch (error) {
      console.error('Transfer error:', error);
      setMessage('An error occurred during transfer. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };



  useEffect(() => {
    if (!qrCode) return;

    const timer = setTimeout(() => {
      handleQRScan();
    }, 300); // Wait for scanner input to finish

    return () => clearTimeout(timer);
  }, [qrCode]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleQRScan();
  };

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // 🔹 Loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading Asset, please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <QrCode className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Scan Asset
        </h1>
      </div>

      <div className="space-y-6">

        {/* ================= FROM SECTION ================= */}
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-6 w-1 bg-blue-600 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-900">
              Mode
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            <Select
              label="Action Type"
              value={actionTypeValue}
              onChange={setActionTypeValue}
              options={(ActionType || []).map((item: any) => ({
                id: item.id,
                name: item.name,
              }))}
            />

          </div>
        </div>

        {/* FROM SECTION - Show only for TRANSFER */}
        {actionTypeValue === 'transfer' && (
          <div className="bg-white p-5 rounded-lg border shadow-sm border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-6 w-1 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-900">
                From (Source Location)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {/* <Select
                label="Hub"
                value={fromHub}
                onChange={setFromHub}
                options={(warehousesData || []).map((item: any) => ({
                  id: item.id,
                  name: item.title,
                }))}
              /> */}

              {/* <Select
                label="Division"
                value={fromDivision}
                onChange={setFromDivision}
                options={(fromDivisionsData || []).map((item: any) => ({
                  id: item.id,
                  name: item.name,
                }))}
                disabled={!fromHub}
              /> */}

              <Select
                label="Tray"
                value={fromTray}
                onChange={setFromTray}
                options={(fromDivisionsData || [])?.map((item: any) => ({
                  id: item?.id,
                  name: item?.division_name,
                }))}
                disabled={!fromDivision}
              />

              {/* <Select
                label="Status Filter"
                value={sourceStatusFilter}
                onChange={setSourceStatusFilter}
                options={(productStatuses || []).map((item: any) => ({
                  id: item.id,
                  name: item.name,
                }))}
              /> */}

            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">

        {/* ================= STATUS UPDATE MODE ================= */}
        <div className="bg-purple-50 p-5 rounded-lg border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">
              Status Update Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusMode"
                  value="auto"
                  checked={statusUpdateMode === 'auto'}
                  onChange={(e) => setStatusUpdateMode(e.target.value as 'auto' | 'manual')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Auto (Use fixed status)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusMode"
                  value="manual"
                  checked={statusUpdateMode === 'manual'}
                  onChange={(e) => setStatusUpdateMode(e.target.value as 'auto' | 'manual')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Manual (Select per product)</span>
              </label>
            </div>
          </div>
        </div>

        {/* ================= TO SECTION ================= */}
        <div className="bg-white p-5 rounded-lg border shadow-sm border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-6 w-1 bg-green-600 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-900">
              To (Destination Location)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            <Select
              label="Hub"
              value={toHub}
              onChange={setToHub}
              options={(warehousesData || []).map((item: any) => ({
                id: item.id,
                name: item.title,
              }))}
            />

            <Select
              label="Division"
              value={toDivision}
              onChange={setToDivision}
              options={(toDivisionsData || []).map((item: any) => ({
                id: item.id,
                name: item?.division_name,
              }))}
              disabled={!toHub}
            />

            <Select
              label="Tray"
              value={toTray}
              onChange={setToTray}
              options={(toTraysData || []).map((item: any) => ({
                id: item.id,
                name: item.name,
              }))}
              disabled={!toDivision}
            />

            {statusUpdateMode === 'auto' && (
              <Select
                label="Status"
                value={toStatus}
                onChange={setToStatus}
                options={(productStatuses || []).map((item: any) => ({
                  id: item.id,
                  name: item.name,
                }))}
              />
            )}

          </div>
        </div>

      </div>


      {/* SCAN INPUT */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <label className="block text-sm font-medium mb-2">
          QR / Barcode
        </label>

        <div className="flex gap-3">
          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border px-4 py-3 rounded-lg"
            placeholder="Scan or enter barcode"
            autoFocus
          />

          <button
            onClick={handleQRScan}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>

      {message && (
        <p className="mt-3 text-sm text-red-600">
          {message}
        </p>
      )}
    </div>

    {/* ================= SCANNED PRODUCTS TABLE ================= */}
    {scannedProducts.length > 0 && (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Scanned Products ({scannedProducts.length})
          </h2>
          <div className="text-sm text-gray-600">
            Total Qty: <span className="font-semibold">{scannedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Barcode</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scannedProducts.map((product: any, idx: number) => (
                <tr key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-900">{product.barcode}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-medium">{product.title}</div>
                    <div className="text-xs text-gray-600">SKU: {product.sku}</div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-center text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {product.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeScannedProduct(product.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={() => setScannedProducts([])}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowConfirmationModal(true)}
            disabled={scannedProducts.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
          >
            Proceed Transfer
          </button>
        </div>
      </div>
    )}


      {/* ASSET DETAILS */}
      {asset && (
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
          {/* TOP */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-gray-600" />
              <div>
                <h2 className="text-xl font-semibold">
                  {asset.product.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Barcode: {asset.product.barcode_value}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                asset.product.status?.name
              )}`}
            >
              {asset.product.status?.name?.toUpperCase()}
            </span>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="SKU" value={asset.product.sku} />
            <Detail
              label="Product Type"
              value={asset.product.product_type?.name}
            />
            <Detail
              label="Brand"
              value={asset.product.brand?.name}
            />
            <Detail
              label="Unit"
              value={asset.product.unit_of_measure?.name}
            />
            <Detail
              label="Division"
              value={asset.product.division?.name}
            />
            <Detail
              label="Hub"
              value={asset.product.hub?.name}
              icon={<MapPin className="h-4 w-4 text-gray-500" />}
            />
          </div>

          {/* INVENTORY */}
          {asset.inventory && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">
                Inventory Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Detail
                  label="Inventory Status"
                  value={asset.inventory.status}
                />
                <Detail
                  label="Stock"
                  value={asset.inventory.stock}
                />
                <Detail
                  label="Min Stock"
                  value={asset.inventory.min_required_stock}
                />
              </div>
            </div>
          )}

          {/* DATES */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">
              Expiry Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Detail
                label="Product Expiry"
                value={asset.product.product_expiry_date || "-"}
              />
              <Detail
                label="AMC Expiry"
                value={asset.product.amc_expiry_date || "-"}
              />
              <Detail
                label="Insurance Expiry"
                value={asset.product.insurance_expiry_date || "-"}
              />
            </div>
          </div>

          {/* TRACKING */}
          {asset.tracking && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">
                Tracking History
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                {asset.tracking.status_history_json.map(
                  (h: any, i: number) => (
                    <div key={i}>
                      • {h.status} –{" "}
                      {new Date(h.timestamp).toLocaleString()}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {showProductModal && (
        <ScanAddProductModal
          open={showProductModal}
          barcode={scannedBarcode}
          onCancel={() => setShowProductModal(false)}
          onSuccess={() => {
            setShowProductModal(false);
          }}
        />
      )}

      {/* MANUAL STATUS SELECTION MODAL */}
      <ManualStatusModal
        open={showStatusModal}
        asset={asset}
        statuses={productStatuses}
        selectedStatus={manualStatusForProduct}
        onStatusChange={setManualStatusForProduct}
        onConfirm={() => {
          if (asset) {
            addScannedProduct(asset);
          }
        }}
        onCancel={() => {
          setShowStatusModal(false);
          setAsset(null);
          setManualStatusForProduct('');
          setQrCode('');
        }}
      />

      {/* TRANSFER CONFIRMATION MODAL */}
      <TransferConfirmationModal
        open={showConfirmationModal}
        scannedProducts={scannedProducts}
        fromData={{
          hubName: warehousesData?.find(h => h.id === fromHub)?.title,
          divisionName: fromDivisionsData?.find(d => d.id === fromDivision)?.name,
          trayName: fromTraysData?.find(t => t.id === fromTray)?.name,
          status: sourceStatusFilter,
        }}
        toData={{
          hubName: warehousesData?.find(h => h.id === toHub)?.title,
          divisionName: toDivisionsData?.find(d => d.id === toDivision)?.name,
          trayName: toTraysData?.find(t => t.id === toTray)?.name,
          status: toStatus,
        }}
        onConfirm={() => {
          // Will implement transfer logic in next phase
          handleTransferConfirmation();
        }}
        onCancel={() => {
          setShowConfirmationModal(false);
        }}
        isProcessing={isTransferring}
      />

    </div>
  );
};

/* ================= MANUAL STATUS SELECTION MODAL ================= */
const ManualStatusModal = ({
  open,
  asset,
  statuses,
  selectedStatus,
  onStatusChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  asset: any;
  statuses: any[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Status for Product
          </h2>

          {asset && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{asset.product?.title}</p>
              <p className="text-xs text-gray-600 mt-1">SKU: {asset.product?.sku}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Status --</option>
              {statuses.map((status: any) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!selectedStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              Confirm & Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= TRANSFER CONFIRMATION MODAL ================= */
const TransferConfirmationModal = ({
  open,
  scannedProducts,
  fromData,
  toData,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  open: boolean;
  scannedProducts: any[];
  fromData: any;
  toData: any;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) => {
  if (!open) return null;

  const totalQty = scannedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Transfer Execution Plan
          </h2>

          {/* FROM Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">From (Source)</h3>
            {fromData && (
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>Hub: <span className="font-medium">{fromData.hubName || 'N/A'}</span></div>
                <div>Division: <span className="font-medium">{fromData.divisionName || 'N/A'}</span></div>
                <div>Tray: <span className="font-medium">{fromData.trayName || 'N/A'}</span></div>
                {fromData.status && <div>Status Filter: <span className="font-medium">{fromData.status}</span></div>}
              </div>
            )}
          </div>

          {/* TO Section */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">To (Destination)</h3>
            {toData && (
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>Hub: <span className="font-medium">{toData.hubName || 'N/A'}</span></div>
                <div>Division: <span className="font-medium">{toData.divisionName || 'N/A'}</span></div>
                <div>Tray: <span className="font-medium">{toData.trayName || 'N/A'}</span></div>
                {toData.status && <div>Status: <span className="font-medium">{toData.status}</span></div>}
              </div>
            )}
          </div>

          {/* Products Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Products to Transfer</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scannedProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm text-gray-700 pb-2 border-b last:border-b-0">
                  <div>
                    <span className="font-medium">{product.title}</span>
                    <span className="text-gray-500 ml-2">({product.barcode})</span>
                  </div>
                  <div className="font-medium">{product.quantity} unit(s)</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between">
              <span className="font-semibold text-gray-900">Total Quantity:</span>
              <span className="font-semibold text-lg text-blue-600">{totalQty}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isProcessing ? 'Processing...' : 'Confirm Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */
const Detail = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="flex items-center gap-2 text-gray-900">
      {icon}
      <span>{value || "-"}</span>
    </div>
  </div>
);

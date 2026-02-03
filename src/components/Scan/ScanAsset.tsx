import React, { useState, useEffect, useMemo } from 'react';
import { Package, MapPin, ArrowRight, CheckCircle, Plus, Trash2, Box, X, AlertCircle } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, Warehouse, Section, Tray, AssetStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import baseUrl from '../../../api-endpoints/ApiUrls';
import axios from 'axios';
import AddProductModal from '../Modals/AddProductModal';

// const PRODUCT_TYPES = ['Washing Machine', 'AC Unit', 'LED TV', 'Microwave', 'Refrigerator', 'Dishwasher'];
// const STATUSES: AssetStatus[] = ['working', 'needs_fix', 'scrap', 'reserved', 'damaged', 'testing'];

export const ScanAsset: React.FC = () => {
  const { user }: any = useAuth();
  // Workflow State
  const [actionType, setActionType] = useState<'add' | 'transfer' | ''>('');
  const [step, setStep] = useState<'setup' | 'scanning' | 'complete'>('setup');

  // Location State
  const [hubs, setHubs] = useState<Warehouse[]>([]);

  // From Location (Transfer Only)
  const [fromHub, setFromHub] = useState('');
  const [fromDiv, setFromDiv] = useState('');
  const [fromTray, setFromTray] = useState('');
  const [fromDivisions, setFromDivisions] = useState<Section[]>([]);
  const [fromTrays, setFromTrays] = useState<Tray[]>([]);

  // To Location
  const [toHub, setToHub] = useState('');
  const [toDiv, setToDiv] = useState('');
  const [toTray, setToTray] = useState('');
  const [toDivisions, setToDivisions] = useState<any[]>([]);
  const [toTrays, setToTrays] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  // Scanning State
  const [statusMode, setStatusMode] = useState<'auto' | 'manual'>('auto');
  const [autoStatus, setAutoStatus] = useState<any>();
  const [qrInput, setQrInput] = useState('');

  // console.log(autoStatus)
  // For manual status selection flow
  // const [pendingScanCode, setPendingScanCode] = useState<string | null>(null);
  const [pendingAsset, setPendingAsset] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  interface ScannedItem extends Asset {
    moveQuantity: number;
    isNewProduct?: boolean;
    sourceAssetId?: string; // ID of the asset record we are moving FROM (if found)
    maxQuantity?: number; // Unlimited if unknown source
  }

  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newAssetType, setNewAssetType] = useState('');
  const [newAssetQuantity, setNewAssetQuantity] = useState(1);
  const [newAssetStatus, setNewAssetStatus] = useState<AssetStatus>(); // For new asset modal
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Completion State
  const [movedItems, setMovedItems] = useState<ScannedItem[]>([]);


  const [PRODUCT_TYPES, setProductTypes] = useState<any[]>([]);
  const [STATUSES, setProductStatuses] = useState<any[]>([]);

  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAssetModalQrCode, setShowAssetModalQrCode] = useState('');

  useEffect(() => {
    if (STATUSES?.length > 0) {
      setAutoStatus(STATUSES[0].id as AssetStatus);
    }
  }, [STATUSES]);


  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

    axios
      .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}&type=division`)
      .then(r => setProductStatuses(r?.data?.data?.statuses || []));
  }, [user?.vendor_id]);


  useEffect(() => {
    axios
      .get(`${baseUrl.vendors}/${user?.vendor_id}/hubs`)
      .then(r => setHubs(r?.data?.data?.hubs || []));

    axios
      .get(`${baseUrl.divisions}/hub/${toHub}`)
      .then(r => setToDivisions(r?.data?.data?.divisions || []));
  }, [user?.vendor_id, toHub]);


  const getDivision = async () => {
    try {
      const res = await axios.get(
        `${baseUrl.divisions}/${toDiv}/hierarchy`
      );
      if (res) {
        setToTrays(res.data.data.division?.children);
      }
    } catch (error) {

    }

  };

  useEffect(() => {
    getDivision();
  }, [toDiv]);


  // Load Initial Data
  useEffect(() => {
    setHubs(StorageManager.getHubs());
  }, []);

  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.vendors}/${user.vendor_id}/hubs`)
      .then(r => setHubs(r?.data?.data?.hubs || []));
  }, [user?.vendor_id]);


  useEffect(() => {
    if (!fromHub) {
      setFromDivisions([]);
      setFromDiv('');
      setFromTrays([]);
      setFromTray('');
      return;
    }

    axios
      .get(`${baseUrl.divisions}/hub/${fromHub}`)
      .then(r => setFromDivisions(r?.data?.data?.divisions || []));
  }, [fromHub]);


  useEffect(() => {
    if (!fromDiv) {
      setFromTrays([]);
      setFromTray('');
      return;
    }

    axios
      .get(`${baseUrl.divisions}/${fromDiv}/hierarchy`)
      .then(r =>
        setFromTrays(r?.data?.data?.division?.children || [])
      );
  }, [fromDiv]);


  useEffect(() => {
    if (!toHub) {
      setToDivisions([]);
      setToDiv('');
      setToTrays([]);
      setToTray('');
      return;
    }

    axios
      .get(`${baseUrl.divisions}/hub/${toHub}`)
      .then(r => setToDivisions(r?.data?.data?.divisions || []));
  }, [toHub]);


  useEffect(() => {
    if (!toDiv) {
      setToTrays([]);
      setToTray('');
      return;
    }

    axios
      .get(`${baseUrl.divisions}/${toDiv}/hierarchy`)
      .then(r =>
        setToTrays(r?.data?.data?.division?.children || [])
      );
  }, [toDiv]);


  // Location Effect Hooks (From)
  // useEffect(() => {
  //   if (fromHub) {
  //     setFromDivisions(StorageManager.getDivisions(fromHub));
  //     setFromDiv('');
  //     setFromTray('');
  //   } else {
  //     setFromDivisions([]);
  //   }
  // }, [fromHub]);

  // useEffect(() => {
  //   if (fromDiv) {
  //     setFromTrays(StorageManager.getTrays(fromHub, fromDiv));
  //     setFromTray('');
  //   } else {
  //     setFromTrays([]);
  //   }
  // }, [fromDiv]);

  // Location Effect Hooks (To)
  // useEffect(() => {
  //   if (toHub) {
  //     setToDivisions(StorageManager.getDivisions(toHub));
  //     setToDiv('');
  //     setToTray('');
  //   } else {
  //     setToDivisions([]);
  //   }
  // }, [toHub]);

  // useEffect(() => {
  //   if (toDiv) {
  //     setToTrays(StorageManager.getTrays(toHub, toDiv));
  //     setToTray('');
  //   } else {
  //     setToTrays([]);
  //   }
  // }, [toDiv]);

  const handleStartScanning = () => {
    if (!actionType) return;
    if (!toHub || !toDiv || !toTray) return;
    if (actionType === 'transfer' && (!fromHub || !fromDiv || !fromTray)) return;
    setStep('scanning');
  };

  // const handleScan = (e?: React.FormEvent) => {
  //   e?.preventDefault();
  //   if (!qrInput.trim()) return;
  //   const code = qrInput.trim();
  //   setQrInput('');

  //   if (statusMode === 'manual') {
  //     setPendingScanCode(code);
  //     setShowStatusModal(true);
  //   } else {
  //     processScan(code, autoStatus);
  //   }
  // };

  // const handleScan = async (e?: React.FormEvent) => {
  //   e?.preventDefault();
  //   if (!qrInput.trim()) return;
  //   setShowAssetModalQrCode(qrInput)
  //   const code = qrInput.trim();
  //   setQrInput('');
  //   setMessage('');

  //   try {
  //     setLoading(true);

  //     const res = await axios.get(`${baseUrl.barcode}/${code}`);

  //     if (res?.data?.success) {
  //       const asset = res.data.data;

  //       const resolvedStatus =
  //         autoStatus && autoStatus.trim()
  //           ? autoStatus
  //           : autoStatus;
  //       console.log(asset, resolvedStatus)
  //       // AUTO ADD TO SCANNED LIST
  //       addOrIncrementScannedItem(asset, resolvedStatus);

  //     }
  //     //  else {
  //     //   // ❌ NOT FOUND → OPEN ADD MODAL
  //     //   setNewAssetCode(code);
  //     //   setNewAssetType('');
  //     //   setNewAssetQuantity(1);
  //     //   setNewAssetStatus('working');
  //     //   setShowAddModal(true);
  //     // }
  //   } catch (err: any) {
  //     if (err?.response?.data?.message === 'Product not found') {
  //       setShowAddAssetModal(true)
  //       // setNewAssetCode(code);
  //       // setShowAddModal(true);
  //     } else {
  //       setMessage('Scan failed');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };


const handleScan = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!qrInput.trim()) return;

  const code = qrInput.trim();
  setQrInput('');
  setMessage('');

  try {
    setLoading(true);

    const res = await axios.get(`${baseUrl.barcode}/${code}`);

    if (res?.data?.success) {
      const asset = res.data.data;

      if (statusMode === 'manual') {
        // ✅ SAVE FULL ASSET
        setPendingAsset(asset);
        setShowStatusModal(true);
      } else {
        // ✅ AUTO MODE
        processScan(asset, autoStatus);
      }
    }
  } catch (err: any) {
    if (err?.response?.data?.message === 'Product not found') {
      setShowAddAssetModal(true);
      setShowAssetModalQrCode(code);
    } else {
      setMessage('Scan failed');
    }
  } finally {
    setLoading(false);
  }
};



  const addOrIncrementScannedItem = (asset: any, status: string) => {
    setScannedItems((prev: any) => {
      const index = prev.findIndex(
        (i: any) => i?.qrCode === asset?.qrCode
      );
      // already scanned → increment
      if (index !== -1) {
        const updated = [...prev];
        updated[index].moveQuantity += 1;
        return updated;
      }
      // new scan
      return [
        ...prev,
        {
          assetId: asset?.product?.id,
          qrCode: asset?.product?.barcode_value,
          productType: asset?.product?.product_kind,
          spareName: asset?.product?.title,
          status: status,
          moveQuantity: 1,
          brand: asset?.product?.brand?.name,
          // maxQuantity: asset.quantity // used in transfer
        }
      ];
    });
  };


  // const confirmManualStatus = (status: string) => {
  //   if (!pendingAsset) return;

  //   addOrIncrementScannedItem(pendingAsset, status);

  //   setPendingAsset(null);
  //   setPendingScanCode('');
  //   setShowStatusModal(false);
  // };

  // const handleRemoveItem = (index: number) => {
  //   setScannedItems(prev => prev.filter((_, i) => i !== index));
  // };

  const handleUpdateQuantity = (index: number, qty: number) => {
    setScannedItems(prev => {
      const updated = [...prev];
      updated[index].moveQuantity = qty;
      return updated;
    });
  };


  // Called after status is determined (either auto or manually selected)
  // const processScan = (code: string, status: AssetStatus) => {
  //   // Check if already in list with SAME Status
  //   const existingIndex = scannedItems.findIndex(i => i.qrCode === code && i.status === status);

  //   if (existingIndex >= 0) {
  //     // Increment Quantity
  //     setScannedItems(prev => {
  //       const updated = [...prev];
  //       const item = updated[existingIndex];

  //       // If constraint exists, check it. If undefined (unknown source), no limit.
  //       if (actionType === 'transfer' && item.maxQuantity !== undefined && item.moveQuantity >= item.maxQuantity) {
  //         // Ideally warn user, but for "no constraints" we might just allow over-transfer if that was the intent?
  //         // User said: "allow products add in tray even it is not there, no constraints required"
  //         // This implies strict constraints are OFF.
  //         // However, if we KNOW the max quantity, it's safer to respect it? 
  //         // Let's implement SOFT constraint: Only warn if we know for sure.
  //         // But for "not found in source", maxQuantity will be undefined, so unlimited.
  //       }

  //       updated[existingIndex] = { ...item, moveQuantity: item.moveQuantity + 1 };
  //       return updated;
  //     });
  //   } else {
  //     // Add New Row
  //     if (actionType === 'add') {
  //       handleAddScan(code, status);
  //     } else {
  //       handleTransferScan(code, status);
  //     }
  //   }
  // };

const processScan = (asset: any, status: AssetStatus) => {
  const code = asset?.product?.barcode_value;

  setScannedItems((prev: any[]) => {
    const index = prev.findIndex(
      (i) => i.qrCode === code && i.status === status
    );

    // ✅ SAME BARCODE + SAME STATUS → +1
    if (index !== -1) {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        moveQuantity: updated[index].moveQuantity + 1,
      };
      return updated;
    }

    // ✅ NEW ROW WITH FULL DATA
    return [
      ...prev,
      {
        assetId: asset?.product?.id,
        qrCode: code,
        status,
        moveQuantity: 1,

        productType: asset?.product?.product_kind,
        spareName: asset?.product?.title,
        brand: asset?.product?.brand?.name,
      },
    ];
  });
};





  // const handleManualStatusSelect = (status: AssetStatus) => {
  //   if (pendingScanCode) {
  //     processScan(pendingScanCode, status);
  //     setPendingScanCode(null);
  //     setShowStatusModal(false);
  //   }
  // };

  // const handleManualStatusSelect = (status: AssetStatus) => {
  //   if (!pendingScanCode) return;

  //   processScan(pendingScanCode, status); // status = "test"
  //   setPendingScanCode(null);
  //   setShowStatusModal(false);
  // };


const handleManualStatusSelect = (status: any) => {
  if (!pendingAsset) return;

  // ✅ PASS FULL ASSET
  processScan(pendingAsset, status.id);

  // ✅ RESET (blank page bug fix)
  setPendingAsset(null);
  setShowStatusModal(false);
};



  const handleAddScan = (code: string, status: AssetStatus) => {
    // 1. Check Dest for Merge Details
    const existingInDest = StorageManager.getAssetAtLocation(code, toTray);
    if (existingInDest) {
      // Even if existing status is different, we are scanning THIS status.
      // If dest has 'working' and we scan 'damaged', we add a 'damaged' row to scannedItems.
      // If dest has 'working' and we scan 'working', we default to merging into that record logic eventually.
      const item: ScannedItem = {
        ...existingInDest,
        status: status, // Use scanned status
        moveQuantity: 1,
        isNewProduct: false
      };
      setScannedItems(prev => [...prev, item]);
      return;
    }

    // 2. Check Global
    const existingAnywhere = StorageManager.getAssetByQR(code);
    if (existingAnywhere) {
      const item: ScannedItem = {
        ...existingAnywhere,
        id: `new-entry-${Date.now()}`,
        quantity: 0,
        status: status,
        moveQuantity: 1,
        isNewProduct: false
      };
      setScannedItems(prev => [...prev, item]);
    } else {
      // 3. Brand New
      setNewAssetCode(code);
      setNewAssetStatus(status);
      setNewAssetQuantity(1);
      setShowAddModal(true);
    }
  };

  const handleTransferScan = (code: string, status: AssetStatus) => {
    // Check Source
    const sourceAsset = StorageManager.getAssetAtLocation(code, fromTray);

    if (sourceAsset) {
      // Exists in source
      const item: ScannedItem = {
        ...sourceAsset,
        status: status,
        moveQuantity: 1,
        maxQuantity: sourceAsset.quantity, // Known limit
        sourceAssetId: sourceAsset.id
      };
      setScannedItems(prev => [...prev, item]);
    } else {
      // Does NOT exist in source, but user wants to transfer anyway ("allow products add ... no constraints")
      // We look up global info to get Product Type if possible
      const globalInfo = StorageManager.getAssetByQR(code);

      if (globalInfo) {
        const item: ScannedItem = {
          ...globalInfo,
          id: `forced-transfer-${Date.now()}`,
          warehouseId: fromHub, // Virtual source
          sectionId: fromDiv,
          trayId: fromTray,
          quantity: 0, // Virtual 0
          status: status,
          moveQuantity: 1,
          maxQuantity: undefined, // Unlimited
          sourceAssetId: undefined
        };
        setScannedItems(prev => [...prev, item]);
      } else {
        // Unknown product entirely - Treat as New Asset Creation via Transfer
        setNewAssetCode(code);
        setNewAssetStatus(status);
        setNewAssetQuantity(1);
        setShowAddModal(true);
      }
    }
  };

  const handleAddNewAsset = () => {
    const newAsset: ScannedItem = {
      id: `new-${Date.now()}`,
      qrCode: newAssetCode,
      productType: newAssetType,
      quantity: 0,
      status: newAssetStatus, // Use the status initiated with
      warehouseId: toHub,
      sectionId: toDiv,
      trayId: toTray,
      moveQuantity: newAssetQuantity,
      isNewProduct: true,
      childAssetIds: [],
      isPacked: false,
      isDispatched: false,
      receivedAt: new Date().toISOString(),
      lastMovedAt: new Date().toISOString(),
      lastHandledBy: user?.id || 'unknown',
      deviceId: 'local-device',
      metadata: {}
    };

    setScannedItems(prev => [...prev, newAsset]);
    setShowAddModal(false);
    setNewAssetCode('');
  };

  const generateBarcode = () => {
    const prefix = newAssetType.substring(0, 2).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    setNewAssetCode(`${prefix}-${random}`);
  };

  const handleRemoveItem = (index: number) => {
    setScannedItems(prev => prev.filter((_, i) => i !== index));
  };

  // const handleUpdateQuantity = (index: number, newQty: number) => {
  //   setScannedItems(prev => {
  //     const updated = [...prev];
  //     const item = updated[index];

  //     if (newQty <= 0) return prev;
  //     // Soft check: You can prevent validation here if 'no constraints' is absolute, 
  //     // but logically you can't satisfy existing logic if > max. 
  //     // For known sources, we keep the limit. For unknown, it's unlimited.
  //     if (actionType === 'transfer' && item.maxQuantity && newQty > item.maxQuantity) {
  //       // Warn?
  //     }

  //     updated[index] = { ...item, moveQuantity: newQty };
  //     return updated;
  //   });
  // };

  // const confirmMove = () => {
  //   if (scannedItems.length === 0) return;

  //   scannedItems.forEach(item => {
  //     // Logic is almost same for add/transfer regarding DESTINATION
  //     // DIFFERENCE is Source handling.

  //     if (actionType === 'transfer' && item.sourceAssetId) {
  //       const source = StorageManager.getAssetById(item.sourceAssetId);
  //       if (source) {
  //         const newSourceQty = source.quantity - item.moveQuantity;
  //         StorageManager.updateAsset(source.id, { quantity: newSourceQty });
  //       }
  //     }
  //     // If transfer but sourceAssetId is undefined (Forced transfer), we ignore source decrement.

  //     // DESTINATION Logic (Identical for Add/Transfer)
  //     // Check if exact match (QR + Status) exists in Dest
  //     // Note: 'getAssetAtLocation' matches QR only. We must manually check status match if we want to separate 'working' vs 'damaged'.
  //     // However, typical WMS might merge same SKU same Location?
  //     // Usually: same SKU + Same Location + Same Status = Merge. 
  //     // If diff status, separate record?
  //     // For our Asset model, we store `status` on the Asset. So yes, separate records.

  //     // We'll iterate all assets at location to find exact match
  //     const assetsAtDest = StorageManager.getAssetsByTray(toTray);
  //     const exactMatch = assetsAtDest.find(a => a.qrCode === item.qrCode && a.status === item.status);

  //     if (exactMatch) {
  //       StorageManager.updateAsset(exactMatch.id, {
  //         quantity: exactMatch.quantity + item.moveQuantity,
  //         lastMovedAt: new Date().toISOString()
  //       });
  //     } else {
  //       const { moveQuantity, isNewProduct, sourceAssetId, maxQuantity, ...baseAsset } = item;
  //       const newAsset: Asset = {
  //         ...baseAsset,
  //         quantity: moveQuantity,
  //         warehouseId: toHub,
  //         sectionId: toDiv,
  //         trayId: toTray,
  //         // Ensure unique ID
  //         id: baseAsset.id.startsWith('new-') || baseAsset.id.startsWith('forced-') ? `final-${Date.now()}-${Math.random()}` : `moved-${Date.now()}-${Math.random()}`
  //       };
  //       StorageManager.addAsset(newAsset);
  //     }
  //   });

  //   setMovedItems(scannedItems);
  //   setScannedItems([]);
  //   setStep('complete');
  // };


  const confirmMove = async () => {
    if (scannedItems.length === 0) return;

    try {
      setLoading(true);

      const payload = scannedItems?.map((item: any) => ({
        parent_id: user?.vendor_id,        // source asset id
        product_id: item.assetId,               // REQUIRED
        vendor_id: user?.vendor_id,
        user_id: user?.user_id,

        // DESTINATION
        hub_id: toHub,
        division_id: toDiv,
        tray_id: toTray,

        status: item?.status,
        stock: item?.moveQuantity,
        action_type: actionType, // "add" | "transfer"

        // SOURCE (ONLY FOR TRANSFER)
        previous_hub_id: actionType === 'transfer' ? fromHub : null,
        previous_division_id: actionType === 'transfer' ? fromDiv : null,
        previous_tray_id: actionType === 'transfer' ? fromTray : null
      }));

      await axios.post(
        `${baseUrl.divisionInventoryBulk}`,
        payload
      );

      // ✅ SUCCESS
      setMovedItems(scannedItems);
      setScannedItems([]);
      setStep('complete');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Move failed');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'needs_fix': return 'bg-yellow-100 text-yellow-800';
      case 'scrap': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusMap = useMemo(() => {
    const map: Record<string, string> = {};
    STATUSES.forEach(s => {
      map[s.id] = s.name;
    });
    return map;
  }, [STATUSES]);


  if (step === 'setup') {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          Scan & Manage Stock
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setActionType('add')} className={`p-6 border-2 rounded-xl text-center transition-all ${actionType === 'add' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="font-semibold">Add / Update Stock</div>
          </button>
          <button onClick={() => setActionType('transfer')} className={`p-6 border-2 rounded-xl text-center transition-all ${actionType === 'transfer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
            <ArrowRight className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="font-semibold">Transfer Stock</div>
          </button>
        </div>

        {actionType && (
          <div className="space-y-6">
            {actionType === 'transfer' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold mb-4">Source Location</h3>
                <div className="grid grid-cols-3 gap-4">
                  <select className="input-field" value={fromHub} onChange={e => setFromHub(e.target.value)}>
                    <option value="">Select Hub...</option>
                    {hubs?.map((h: any) => <option key={h.id} value={h.id}>{h?.title || h.name}</option>)}
                  </select>
                  <select className="input-field" value={fromDiv} onChange={e => setFromDiv(e.target.value)} disabled={!fromHub}>
                    <option value="">Select Division...</option>
                    {/* {toDivisions?.map((d: any) => <option key={d.id} value={d.id}>{d?.division_name}</option>)} */}
                    {fromDivisions.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.division_name}</option>
                    ))}
                  </select>
                  <select className="input-field" value={fromTray} onChange={e => setFromTray(e.target.value)} disabled={!fromDiv}>
                    <option value="">Select Tray...</option>
                    {/* {toTrays?.map((t: any) => <option key={t.id} value={t.id}>{t.division_name || t.name}</option>)} */}
                    {fromTrays.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.division_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold mb-4 text-blue-800">Destination Location</h3>
              {/* <div className="grid grid-cols-3 gap-4">
                <select className="input-field" value={toHub} onChange={e => setToHub(e.target.value)}>
                  <option value="">Select Hub...</option>
                  {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                <select className="input-field" value={toDiv} onChange={e => setToDiv(e.target.value)} disabled={!toHub}>
                  <option value="">Select Division...</option>
                  {toDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select className="input-field" value={toTray} onChange={e => setToTray(e.target.value)} disabled={!toDiv}>
                  <option value="">Select Tray...</option>
                  {toTrays.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div> */}

              <div className="grid grid-cols-3 gap-4">
                {/* HUB */}
                <select
                  className="input-field"
                  value={toHub}
                  onChange={e => setToHub(e.target.value)}
                >
                  <option value="">Select Hub...</option>
                  {hubs?.map((h: any) => (
                    <option key={h.id} value={h.id} className='capitalize'>
                      {h?.title || h.name}
                    </option>
                  ))}
                </select>

                {/* DIVISION */}
                <select
                  className="input-field"
                  value={toDiv}
                  onChange={e => setToDiv(e.target.value)}
                  disabled={!toHub}
                >
                  <option value="">Select Division...</option>
                  {/* {toDivisions?.map((d: any) => (
                    <option key={d.id} value={d.id} className='capitalize'>
                      {d.division_name || d.name}
                    </option>
                  ))} */}
                  {toDivisions.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.division_name}</option>
                  ))}
                </select>

                {/* TRAY */}
                <select
                  className="input-field"
                  value={toTray}
                  onChange={e => setToTray(e.target.value)}
                  disabled={!toDiv}
                >
                  <option value="">Select Tray...</option>
                  {/* {toTrays?.map((t: any) => (
                    <option key={t.id} value={t.id} className='capitalize'>
                      {t.division_name || t.name}
                    </option>
                  ))} */}
                  {toTrays?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.division_name}</option>
                  ))}
                </select>
              </div>

            </div>
            <button onClick={handleStartScanning} disabled={!toTray || (actionType === 'transfer' && !fromTray)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50">
              Start Scanning
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{actionType === 'add' ? 'Adding Stock' : 'Transferring Stock'}</h2>
            <p className="text-sm text-gray-500">Target: {toDivisions?.find((d: any) => d?.id === toDiv)?.division_name} / {toTrays?.find((t: any) => t?.id === toTray)?.division_name}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setStatusMode('auto')} className={`px-3 py-1 rounded-md text-sm font-medium ${statusMode === 'auto' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Auto Status</button>
              <button onClick={() => setStatusMode('manual')} className={`px-3 py-1 rounded-md text-sm font-medium ${statusMode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Manual</button>
            </div>
            {/* {statusMode === 'auto' && (
              <select className="text-sm border-gray-300 rounded-lg" value={autoStatus} onChange={(e) => setAutoStatus(e.target.value as AssetStatus)}>
                {STATUSES?.map(s => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
              </select>
            )} */}

            {statusMode === 'auto' && (
              <select
                className="text-sm border-gray-300 rounded-lg"
                value={autoStatus}
                onChange={(e) => setAutoStatus(e.target.value as AssetStatus)}
              >
                {STATUSES?.map((s: any) => (
                  <option key={s?.id} value={s?.id}>
                    {s?.name}
                  </option>
                ))}
              </select>
            )}


            <button onClick={() => setStep('setup')} className="text-gray-500 font-medium">Cancel</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <form onSubmit={handleScan} className="flex gap-4">
            <input autoFocus type="text" placeholder="Scan Barcode..." className="flex-1 text-2xl p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" value={qrInput} onChange={e => setQrInput(e.target.value)} />
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Scanned Items ({scannedItems?.length})</h3>
            {scannedItems?.length > 0 && (
              <button
                onClick={confirmMove}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">
                Confirm
              </button>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="p-4">Product / QR</th>
                <th className="p-4">Product name</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scannedItems?.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Scan items to add them here. Same items will auto-increment.</td></tr>
              ) : (
                scannedItems?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium capitalize">{item?.productType}</div>
                      {/* <div className="font-medium">{item?.spareName}</div> */}
                      <div className="text-gray-500 text-sm">{item?.qrCode}</div>
                      {item?.maxQuantity === undefined && actionType === 'transfer' && (
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Not in source
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium capitalize">{item?.spareName}</div>
                      <div className="font-light text-sm">{item?.brand}</div>

                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="1"
                        className="w-20 text-center border rounded p-1 font-bold"
                        value={item?.moveQuantity}
                        onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value) || 0)}
                      />

                      {item?.maxQuantity !== undefined && <div className="text-xs text-gray-400 mt-1">Max: {item?.maxQuantity}</div>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(statusMap[item?.status])}`}>
                        {statusMap[item?.status] || item?.status}
                      </span>

                      {/* <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item?.status)}`}>{item?.status}</span> */}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* STATUS SELECTION MODAL */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Select Status</h3>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STATUSES?.map(s => (
                  <button
                    key={s?.id}
                    onClick={() => handleManualStatusSelect(s)}
                    className={`p-3 rounded-lg text-sm font-bold capitalize transition-colors ${getStatusColor(s?.name)} hover:opacity-80`}
                  >
                    {s?.name?.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-center text-gray-400">
                For item: {pendingScanCode}
              </div>
            </div>
          </div>
        )}

        {/* NEW PRODUCT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold">New Product</h3>
              <div className="gap-2"><input className="input-field w-full" value={newAssetCode} onChange={e => setNewAssetCode(e.target.value)} /></div>
              <select className="input-field w-full" value={newAssetType} onChange={e => setNewAssetType(e.target.value)}>{PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <div><label>Initial Quantity</label><input type="number" result="1" className="input-field w-full" value={newAssetQuantity} onChange={e => setNewAssetQuantity(parseInt(e.target.value))} /></div>
              <div className="flex gap-3"><button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-gray-100 rounded">Cancel</button><button onClick={handleAddNewAsset} className="flex-1 py-2 bg-blue-600 text-white rounded">Add</button></div>
            </div>
          </div>
        )}

        <AddProductModal
          open={showAddAssetModal}
          onCancel={() => (setShowAddAssetModal(!showAddAssetModal))}
          // editProduct={editData}
          selectedHubData={toHub}
          selectedDivData={toDiv}
          qrInput={showAssetModalQrCode}
        // selectedTray={selectedTray}
        // refresh={getProducts}
        // productTypes={productTypes}
        // productStatuses={productStatuses}
        />


      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-8">
        <div className="bg-green-50 text-green-700 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center"><CheckCircle className="h-12 w-12" /></div>
        <div><h1 className="text-3xl font-bold mb-2">Success!</h1><p className="text-gray-600">Processed {movedItems.reduce((acc, i) => acc + i.moveQuantity, 0)} items.</p></div>
        <button onClick={() => { setScannedItems([]); setMovedItems([]); setStep('setup'); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Next Scan</button>
      </div>
    );
  }

  return null;
};

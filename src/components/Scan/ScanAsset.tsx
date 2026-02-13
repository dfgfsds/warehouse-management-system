import React, { useState, useEffect, useMemo } from 'react';
import { Package, MapPin, ArrowRight, CheckCircle, Plus, Trash2, Box, X, AlertCircle, CreditCard } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, Warehouse, Section, Tray, AssetStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import baseUrl from '../../../api-endpoints/ApiUrls';
import axios from 'axios';
import AddProductModal from '../Modals/AddProductModal';
import OutputOrderModal from '../Modals/OutputOrderModal';

// const PRODUCT_TYPES = ['Washing Machine', 'AC Unit', 'LED TV', 'Microwave', 'Refrigerator', 'Dishwasher'];
// const STATUSES: AssetStatus[] = ['working', 'needs_fix', 'scrap', 'reserved', 'damaged', 'testing'];

export const ScanAsset: React.FC = () => {
  const { user }: any = useAuth();
  // Workflow State
  const [actionType, setActionType] = useState<'add' | 'transfer' | 'sale' | ''>('');
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
  const checkingArea = '';
  const Sales = '';

  interface ScannedItem extends Asset {
    moveQuantity: number;
    isNewProduct?: boolean;
    sourceAssetId?: string; // ID of the asset record we are moving FROM (if found)
    maxQuantity?: number; // Unlimited if unknown source
  }

  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
console.log(scannedItems)
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

  const [showOutputModal, setShowOutputModal] = useState(false);
  const [outputData, setOutputData] = useState<any>(null);

  const [isCancelling, setIsCancelling] = useState(false);


  useEffect(() => {
    if (isCancelling) return;
    if (!STATUSES?.length || !actionType) return;

    if (actionType === "sale") {
      setAutoStatus(STATUSES[5]?.id as AssetStatus);
    } else if (actionType === "add") {
      setAutoStatus(STATUSES[0]?.id as AssetStatus);
    } else {
      setAutoStatus(STATUSES[1]?.id as AssetStatus);
    }
  }, [STATUSES, actionType, isCancelling]);

  useEffect(() => {
    if (step !== "setup") {
      setIsCancelling(false);
    }
  }, [step]);



  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

    axios
      // .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}&type=division`)
      .get(`${baseUrl.divisions}/vendor/${user?.vendor_id}/hierarchy`)
      .then(r => setProductStatuses(r?.data?.data?.divisions || []));
  }, [user?.vendor_id]);


  useEffect(() => {
    axios
      .get(`${baseUrl.vendors}/${user?.vendor_id}/hubs`)
      .then(r => setHubs(r?.data?.data?.hubs || []));

    axios
      .get(`${baseUrl.divisions}/vendor/${toHub}`)
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


  const handleStartScanning = () => {
    if (!actionType) return;
    setStep('scanning');
  };

  const handleScan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!qrInput.trim()) return;

    const code = qrInput.trim().toUpperCase();
    setQrInput('');
    setMessage('');

    try {
      setLoading(true);

      const res = await axios.get(`${baseUrl.barcode}/${code}`);

      if (res?.data?.success) {
        const asset = res.data.data;

        if (statusMode === 'manual') {
          setPendingAsset(asset);      // ✅ full asset
          setShowStatusModal(true);
        } else {
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


  const handleUpdateQuantity = (index: number, qty: number) => {
    setScannedItems(prev => {
      const updated = [...prev];
      updated[index].moveQuantity = qty;
      return updated;
    });
  };



  const lastScanRef = React.useRef<{
    code: string | null;
    time: number;
  }>({ code: null, time: 0 });


  const processScan = (asset: any, status: AssetStatus) => {
    const code = asset?.product?.barcode_value;
    const now = Date.now();

    // 🚫 DUPLICATE SCAN GUARD (VERY IMPORTANT)
    if (
      lastScanRef.current.code === code &&
      now - lastScanRef.current.time < 300
    ) {
      return; // ignore duplicate scan
    }

    lastScanRef.current = { code, time: now };

    console.log(status)


    setScannedItems((prev: any[]) => {
      const index = prev.findIndex(
        (i) => i.qrCode === code && i.status === status
      );

      // ✅ increment ONLY by 1
      if (index !== -1) {
        return prev.map((item, i) =>
          i === index
            ? { ...item, moveQuantity: item.moveQuantity + 1 }
            : item
        );
      }
      // first time scan
      return [
        ...prev,
        {
          assetId: asset?.product?.id,
          qrCode: code,
          status,
          trayName: asset?.trays[0]?.name,
          ...(actionType === 'add' && {
            tray_id: asset?.trays?.find(
              (t: any) => t?.parent_division_id === status
            )?.id,
          }),
          ...(actionType === 'transfer' && {
            tray_id: asset?.trays?.find(
              (t: any) => t?.parent_division_id === status
            )?.id,
          }),
          ...(actionType === 'transfer' && {
            previous_tray_id: asset?.trays?.find(
              (t: any) => t?.parent_division_id === fromDiv
            )?.id,
          }),
          ...(actionType === 'sale' && {
            tray_id: asset?.trays?.find(
              (t: any) => t?.parent_division_id === status
            )?.id,
          }),
          moveQuantity: 1,
          productType: asset?.product?.product_kind,
          spareName: asset?.product?.title,
          brand: asset?.product?.brand?.name,
        },
      ];
    });
  };



  const handleManualStatusSelect = (status: any) => {
    if (!pendingAsset) return;

    processScan(pendingAsset, status.id);

    // ✅ reset everything (no blank render)
    setPendingAsset(null);
    setShowStatusModal(false);
  };

  const generateBarcode = () => {
    const prefix = newAssetType.substring(0, 2).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    setNewAssetCode(`${prefix}-${random}`);
  };

  const handleRemoveItem = (index: number) => {
    setScannedItems(prev => prev.filter((_, i) => i !== index));
  };

  const confirmMove = async () => {
    if (scannedItems.length === 0) return;
    console.log(scannedItems)
    try {
      setLoading(true);

      const payload = scannedItems?.map((item: any) => ({
        parent_id: user?.vendor_id,
        product_id: item?.assetId,               // REQUIRED
        vendor_id: user?.vendor_id,
        user_id: user?.user_id,

        // DESTINATION
        hub_id: toHub,
        ...(actionType === "add" && {
          division_id: item?.status,
        }),
        ...(actionType === "transfer" && {
          division_id: item?.status,
        }),
        ...(actionType === "sale" && {
          division_id: item?.status,
        }),
        tray_id: item?.tray_id,
        previous_tray_id: item?.previous_tray_id,
        // tray_id: toTray,

        // status: item?.status,
        stock: item?.moveQuantity,
        action_type: actionType,

        // SOURCE (ONLY FOR TRANSFER)
        previous_hub_id: actionType === 'transfer' ? fromHub : null,
        previous_division_id: actionType === 'transfer' ? fromDiv : null,
        // previous_tray_id: actionType === 'transfer' ? fromTray : null
      }));

      console.log(payload)
      if (actionType === 'sale') {
        setShowOutputModal(true);
        setOutputData(payload)
      } else {
        const updateApi = await axios.post(
          `${baseUrl.divisionInventoryBulk}`,
          payload
        );
        if (updateApi) {
          setMovedItems(scannedItems);
          setScannedItems([]);
          setStep('complete');
        }
      }
      // ✅ SUCCESS
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
    STATUSES?.forEach(s => {
      map[s.id] = s.division_name;
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
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setActionType('add')} className={`p-6 border-2 rounded-xl text-center transition-all ${actionType === 'add' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="font-semibold">Add / Update Stock</div>
          </button>
          <button onClick={() => setActionType('transfer')} className={`p-6 border-2 rounded-xl text-center transition-all ${actionType === 'transfer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
            <ArrowRight className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="font-semibold">Transfer Stock</div>
          </button>
          <button onClick={() => setActionType('sale')} className={`p-6 border-2 rounded-xl text-center transition-all ${actionType === 'sale' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="font-semibold">Sale</div>
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
                    {hubs?.map((h: any) => <option key={h.id} value={h.id} className='capitalize'>{h?.title || h.name}</option>)}
                  </select>
                  <select className="input-field" value={fromDiv} onChange={e => setFromDiv(e.target.value)} disabled={!fromHub}>
                    <option value="">Select Division...</option>
                    {STATUSES.map((d: any) => (
                      <option key={d.id} value={d.id} className='capitalize'>{d.division_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold mb-4 text-blue-800">Destination Location</h3>
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
              </div>

            </div>
            <button onClick={handleStartScanning}
              // disabled={!toTray || (actionType === 'transfer' && !fromTray)}
              disabled={!toHub || (actionType === 'transfer' && !fromDiv)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50">
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
            <h2 className="text-xl font-bold text-gray-800">{actionType === 'add' ? 'Adding Stock' : actionType === 'transfer' ? 'Transferring Stock' : actionType === 'sale' ? 'Sale' : ""}</h2>
            <div className="space-y-1">
              {actionType === "add" && (
                <p className="text-sm text-gray-600 font-semibold">
                  Target Division:
                  <span className="ml-1 text-blue-600">Checking Area</span>
                </p>
              )}

              {actionType === "transfer" && (
                <p className="text-sm text-gray-600 font-semibold">
                  Transfer From:
                  <span className="ml-1 text-indigo-600">
                    {
                      STATUSES?.find((d: any) => d?.id === fromDiv)
                        ?.division_name || "-"
                    }
                  </span>
                </p>
              )}

              {actionType === "sale" && (
                <p className="text-sm text-gray-600 font-semibold flex items-center gap-1">
                  <span className="text-red-600">Sale</span>
                  <span className="text-xs text-gray-400">(Stock will be reduced)</span>
                </p>
              )}
            </div>

          </div>
          <div className="flex gap-4">
            {actionType !== 'sale' && actionType !== 'add' && (
              <>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setStatusMode('auto')} className={`px-3 py-1 rounded-md text-sm font-medium ${statusMode === 'auto' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Auto Status</button>
                  <button onClick={() => setStatusMode('manual')} className={`px-3 py-1 rounded-md text-sm font-medium ${statusMode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Manual</button>
                </div>
                {statusMode === 'auto' && (
                  <select
                    className="text-sm border-gray-300 rounded-lg"
                    value={autoStatus}
                    onChange={(e) => setAutoStatus(e.target.value as AssetStatus)}
                  >
                    {STATUSES?.
                    // slice(1, 6)?.
                    map((s: any) => (
                      <option key={s?.id} value={s?.id}>
                        {s?.division_name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}

            <button onClick={() => {
              setIsCancelling(true);
              setStep('setup');
              setStatusMode('auto');
              setScannedItems([]);
              setToHub('');
              setFromHub('');
              setFromDiv('');
              setAutoStatus('');
              // window.location.reload();
            }} className="text-gray-500 font-medium">Cancel</button>
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
                <th className="p-4">Product Type / brand</th>
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
                      <div className="text-sm font-bold">tray: {item?.trayName}</div>
                      <div className="text-gray-500 text-sm">{item?.qrCode}</div>
                      <div className="text-gray-500 text-sm">{item?.categories?.[0]?.name}</div>

                      {/* {item?.maxQuantity === undefined && actionType === 'transfer' && (
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Not in source
                        </span>
                      )} */}
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
                {STATUSES?.slice(1, 6).map(s => (
                  <button
                    key={s?.id}
                    onClick={() => handleManualStatusSelect(s)}
                    className={`p-3 rounded-lg text-sm font-bold capitalize transition-colors ${getStatusColor(s?.name)} hover:opacity-80`}
                  >
                    {s?.division_name?.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-center text-gray-400">
                For item: {pendingAsset?.product?.barcode_value}
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

        {showOutputModal && outputData && (
          <OutputOrderModal
            asset={outputData}
            onClose={() => {
              setShowOutputModal(false);
              setOutputData(null);
            }}
            cancel={() => {
              setStep('setup');
              setStatusMode('auto');
              setScannedItems([]);
              setToHub('');
              setFromHub('');
              setFromDiv('');
              setAutoStatus('');
            }}
          />
        )}

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

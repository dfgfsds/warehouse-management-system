import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  MapPin,
  Printer,
  History,
  Box,
  PlusCircle,
  X,
  Loader,
  Menu
} from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, Warehouse, Section, Tray, AssetEvent } from '../../types';
import BarcodePrintModal from '../../utils/BarcodePrint';
import baseUrl from '../../../api-endpoints/ApiUrls';
import { useAuth } from '../../hooks/useAuth';
import AddDivisionModal from '../Modals/AddDivisionModal';
import AddTrayModal from '../Modals/AddTrayModa';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import AddProductModal from '../Modals/AddProductModal';
import AssetHistoryModal from '../Modals/AssetHistoryModal';
import OutputOrderModal from '../Modals/OutputOrderModal';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PRODUCT_TYPES = [
  'Washing Machine',
  'AC Unit',
  'LED TV',
  'Microwave',
  'Refrigerator',
  'Dishwasher'
];

export const InventoryManagement: React.FC = () => {
  const { user }: any = useAuth();

  // ---------------- Navigation State ----------------
  const [hubs, setHubs] = useState<Warehouse[]>([]);
  const [expandedHub, setExpandedHub] = useState<string | null>(null);
  const [expandedDiv, setExpandedDiv] = useState<string | null>(null);
  const [selectedTray, setSelectedTray] = useState<Tray | null>(null);
  const [selectedHubData, setSelectedHubData] = useState<Warehouse | null>(null);
  const [selectedDivData, setSelectedDivData] = useState<Section | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  console.log(selectedTray)
  // ---------------- Data State ----------------
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [hubCounts, setHubCounts] = useState<Record<string, number>>({});
  const [divCounts, setDivCounts] = useState<Record<string, number>>({});
  const [trayCounts, setTrayCounts] = useState<Record<string, number>>({});
  const [productTypes, setProductTypes] = useState<any[]>([]);

  // ---------------- Modal State ----------------
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddTrayModal, setShowAddTrayModal] = useState(false);
  const [showAddProductTypeModal, setShowAddProductTypeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetEvent[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingTray, setEditingTray] = useState<Tray | null>(null);
  const [editingProductType, setEditingProductType] = useState<any | null>(null);

  // ---------------- Add Warehouse / Section / Tray ----------------
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseCode, setNewWarehouseCode] = useState('');
  const [newWarehouseAddress, setNewWarehouseAddress] = useState('');

  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCode, setNewSectionCode] = useState('');

  const [newTrayName, setNewTrayName] = useState('');
  const [newTrayCode, setNewTrayCode] = useState('');
  const [newTrayCapacity, setNewTrayCapacity] = useState(100);


  const [newProductTypeName, setNewProductTypeName] = useState('');
  const [newProductTypeCode, setNewProductTypeCode] = useState('');
  const [newProductTypeCategory, setNewProductTypeCategory] = useState('');
  const [newProductTypeIsDismantleable, setNewProductTypeIsDismantleable] =
    useState(false);

  // ---------------- Add Asset ----------------
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newAssetType, setNewAssetType] = useState(PRODUCT_TYPES[0]);
  const [newAssetQuantity, setNewAssetQuantity] = useState(1);
  const [newAssetBrand, setNewAssetBrand] = useState('');
  const [newAssetSpare, setNewAssetSpare] = useState('');
  const [newAssetSpareName, setNewAssetSpareName] = useState('');
  const [newAssetStatus, setNewAssetStatus] = useState('working');

  // Division
  const [selectHubId, setSelectHubId] = useState('');
  const [editDivision, setEditDivision] = useState<any>(null);
  // Delete 
  const [divisionConfirmOpen, setdDvisionConfirmOpen] = useState(false);
  const [divisionConfirmLoading, setDivisionConfirmLoading] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);


  // Tray
  const [addTrayModal, setAddTrayModal] = useState(false);
  const [divisionModalData, setDivisionModalData] = useState<any>('');
  const [editTrayData, setEditTrayData] = useState<any>();

  // Delete 
  const [trayconfirmOpen, setTrayConfirmOpen] = useState(false);
  const [trayconfirmLoading, setTrayConfirmLoading] = useState(false);
  const [trayselectedDivision, setTraySelectedDivision] = useState<any>(null);


  // products 
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editProductData, setEditProductData] = useState("");

  const [searchText, setSearchText] = useState("");
  const [filterProductType, setFilterProductType] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // OUTPUT
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [selectedOutputAsset, setSelectedOutputAsset] = useState<any>(null);

  const [hubLoading, setHubLoading] = useState(false);
  const [divisionLoading, setDivisionLoading] = useState(false);
  const [trayLoading, setTrayLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);




  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

    //           axios
    // .get(`${baseUrl.divisions}/?vendor=${user?.vendor_id}/tray-codes`)
    // .then(r => setTrayOption(r?.data?.data?.divisions || []));

  }, [user?.vendor_id]);

  // const [categoryData, setCategoryData] = useState<any[]>([]);

  // console.log(categoryData)

  // 🔹 GET categories
  // const getCategories = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(`${baseUrl.categories}/by-vendor/${user?.vendor_id}/?vendor=${user?.vendor_id}`);
  //     setCategoryData(res?.data?.data?.categories || []);
  //     console.log(res?.data?.data?.categories)

  //     const divisions = res?.data?.data?.categories || [];
  //     const mappedSections: Section[] = divisions
  //       .filter((d: any) => d?.vendor_id === hub?.id)
  //       .map((d: any) => ({
  //         id: d?.id,
  //         name: d?.title,
  //         code: d?.title,
  //         parent_id: d?.parent_id,
  //         vendor_id: d?.vendor_id,
  //         division_type: d?.division_type,
  //         capacity: d?.capacity,
  //         description: d?.description,
  //         latitude: d?.latitude,
  //         longitude: d?.longitude,
  //         address: d?.address,
  //         trays: []
  //       }));

  //     setHubs((prev: any) =>
  //       prev?.map((h: any) =>
  //         h.id === hub.id ? { ...h, sections: mappedSections } : h
  //       )
  //     );

  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   getCategories();
  // }, []);



  const handleDeleteDivision = async () => {
    try {
      setDivisionConfirmLoading(true);
      const updateApi = await axios.delete(
        `${baseUrl.divisions}/${selectedDivision?.id}`
      );
      if (updateApi) {
        setdDvisionConfirmOpen(false)
        setDivisionConfirmLoading(false);
        setSelectedDivision(null);
        getWarehouses();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDivisionConfirmLoading(false);
    }

  };
  // ======================================================
  // 🔥 API CHANGE – LOAD HUBS (WAREHOUSES)
  // ======================================================
  const getWarehouses = async () => {
    try {
      setHubLoading(true);

      const res = await axios.get(
        `${baseUrl.vendors}/${user?.vendor_id}/hubs`
      );

      const apiHubs = res?.data?.data?.hubs || [];
      const mappedHubs = apiHubs.map((h: any) => ({
        id: h.id,
        name: h.title,
        code: h.code,
        address: h.address,
        sections: [],
      }));

      setHubs(mappedHubs);
    } catch (error) {
      console.error("Failed to load hubs", error);
    } finally {
      setHubLoading(false);
    }
  };

  // ---------------- Initial Load ----------------
  useEffect(() => {
    if (user?.vendor_id) {
      getWarehouses();
    }

    const types = StorageManager.getProductTypes();
    // setProductTypes(types);

    if (types.length > 0 && !newAssetType) {
      setNewAssetType(types[0].name);
    }
  }, [user?.vendor_id]);

  // ======================================================
  // 🔥 API CHANGE – HUB CLICK → LOAD DIVISIONS
  // ======================================================
  const handleHubClick = async (hub: Warehouse) => {
    setExpandedHub(expandedHub === hub.id ? null : hub.id);
    setSelectedHubData(hub);
    setExpandedDiv(null);
    setSelectedTray(null);

    try {
      setDivisionLoading(true);

      const res = await axios.get(
        `${baseUrl.categories}/by-vendor/${user?.vendor_id}/?vendor=${user?.vendor_id}&type=product`
      );

      const divisions = res?.data?.data?.categories || [];

      const mappedSections = divisions.map((d: any) => ({
        id: d.id,
        name: d.title,
        trays: [],
      }));

      setHubs((prev) =>
        prev.map((h) =>
          h.id === hub.id ? { ...h, sections: mappedSections } : h
        )
      );
    } catch (error) {
      console.error("Failed to load divisions", error);
    } finally {
      setDivisionLoading(false);
    }
  };



  // ======================================================
  // 🔥 API CHANGE – DIVISION CLICK → LOAD TRAYS
  // ======================================================
  const handleDivClick = async (div: Section) => {
    setExpandedDiv(expandedDiv === div.id ? null : div.id);
    setSelectedDivData(div);
    setSelectedTray(null);
    setTrayLoading(true);

    try {
      // const res = await axios.get(
      //   `${baseUrl.divisions}/${div.id}/hierarchy`
      // );

      const res = await axios.get(
        `${baseUrl.divisions}/vendor/${user?.vendor_id}/hierarchy`
      );
      console.log(res?.data?.data)
      const divisions = res?.data?.data?.divisions || [];
      console.log(divisions)
      const mappedTrays: Tray[] = divisions?.map((t: any) => ({
        id: t?.id,
        name: t?.division_name,
        code: t?.division_code,
        capacity: t?.capacity,
        currentCount: 0,
        createdAt: t?.created_at,
        description: t?.description,
        address: t?.address,
        hub_id: t?.hub_id,
        vendor_id: t?.vendor_id,
        latitude: t?.latitude,
        longitude: t?.longitude,
      }));

      setHubs(prev =>
        prev.map(h => ({
          ...h,
          sections: h.sections.map(s =>
            s.id === div.id ? { ...s, trays: mappedTrays } : s
          )
        }))
      );
    } catch (error) {
      console.error('Failed to load trays', error);
    } finally {
      setTrayLoading(false);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleTrayClick = (tray: Tray) => {
    setSelectedTray(tray);
    setIsSidebarOpen(false);
  };

  // ======================================================
  // 🔒 ASSET LOADING (UNCHANGED)
  // ======================================================
  // useEffect(() => {
  //   if (selectedTray) {
  //     setLoading(true);
  //     setTimeout(() => {
  //       const trayAssets = StorageManager.getAssetsByTray(selectedTray.id);
  //       setAssets(trayAssets);
  //       setLoading(false);
  //     }, 300);
  //   } else {
  //     setAssets([]);
  //   }
  // }, [selectedTray]);

  /* ===================== END PART 1 ===================== */


  // ======================================================
  // 🔒 COUNTS CALCULATION (UNCHANGED)
  // ======================================================
  useEffect(() => {
    const tCounts: Record<string, number> = {};
    const dCounts: Record<string, number> = {};
    const hCounts: Record<string, number> = {};

    hubs.forEach(h => {
      let hTotal = 0;
      h.sections.forEach(s => {
        let sTotal = 0;
        s.trays.forEach(t => {
          const assets = StorageManager.getAssetsByTray(t.id) || [];
          const count = assets?.reduce(
            (acc, curr) => acc + (curr.quantity || 1),
            0
          );
          tCounts[t.id] = count;
          sTotal += count;
        });
        dCounts[s.id] = sTotal;
        hTotal += sTotal;
      });
      hCounts[h.id] = hTotal;
    });

    setTrayCounts(tCounts);
    setDivCounts(dCounts);
    setHubCounts(hCounts);
  }, [hubs]);

  // ======================================================
  // 🔒 HISTORY / PRINT / EDIT LOGIC (UNCHANGED)
  // ======================================================
  const handleViewHistory = (asset: Asset) => {
    const events = StorageManager.getEventsByAssetId(asset.id);
    setAssetHistory(events);
    setSelectedAsset(asset);
    setShowHistoryModal(true);
  };

  const handlePrintBarcode = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowPrintModal(true);
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    setNewAssetCode(asset.qrCode);
    setNewAssetType(asset.productType);
    setNewAssetQuantity(asset.quantity);
    setNewAssetBrand(asset.brand || '');
    setNewAssetSpare(asset.spare || '');
    setNewAssetSpareName(asset.spareName || '');
    setNewAssetStatus(asset.status);
    setShowAddModal(true);
  };

  // ======================================================
  // 🔒 ADD / UPDATE ASSET (UNCHANGED)
  // ======================================================
  const handleAddAsset = () => {
    if (!selectedTray || !selectedHubData || !selectedDivData) return;

    const baseCode =
      newAssetCode || `GEN-${Math.floor(Math.random() * 10000)}`;

    if (editingAsset) {
      StorageManager.updateAsset(editingAsset.id, {
        qrCode: baseCode,
        productType: newAssetType,
        brand: newAssetBrand,
        spare: newAssetSpare,
        spareName: newAssetSpareName,
        quantity: newAssetQuantity,
        status: newAssetStatus,
        lastMovedAt: new Date().toISOString()
      });

      StorageManager.addEvent({
        id: `evt-${Date.now()}`,
        assetId: editingAsset.id,
        type: 'UPDATED',
        toLocation: {
          warehouseId: selectedHubData.id,
          warehouseName: selectedHubData.name,
          sectionId: selectedDivData.id,
          sectionName: selectedDivData.name,
          trayId: selectedTray.id,
          trayName: selectedTray.name
        },
        toStatus: newAssetStatus,
        userId: user?.id || 'local',
        deviceId: 'local',
        timestamp: new Date().toISOString(),
        remarks: `UPDATED: Modified product details`
      });

      setEditingAsset(null);
    } else {
      const newAsset: Asset = {
        id: `inv-new-${Date.now()}`,
        qrCode: baseCode,
        productType: newAssetType,
        brand: newAssetBrand,
        spare: newAssetSpare,
        spareName: newAssetSpareName,
        quantity: newAssetQuantity,
        status: newAssetStatus,
        warehouseId: selectedHubData.id,
        sectionId: selectedDivData.id,
        trayId: selectedTray.id,
        childAssetIds: [],
        isPacked: false,
        isDispatched: false,
        receivedAt: new Date().toISOString(),
        lastMovedAt: new Date().toISOString(),
        lastHandledBy: user?.id || 'local',
        deviceId: 'local-device',
        metadata: {}
      };

      StorageManager.addAsset(newAsset);

      StorageManager.addEvent({
        id: `evt-${Date.now()}`,
        assetId: newAsset.id,
        type: 'RECEIVED',
        toLocation: {
          warehouseId: selectedHubData.id,
          warehouseName: selectedHubData.name,
          sectionId: selectedDivData.id,
          sectionName: selectedDivData.name,
          trayId: selectedTray.id,
          trayName: selectedTray.name
        },
        toStatus: newAssetStatus,
        userId: user?.id || 'local',
        deviceId: 'local',
        timestamp: new Date().toISOString(),
        remarks: `DIRECT ADD: Initial stock ${newAssetQuantity}`
      });
    }

    setShowAddModal(false);
    const trayAssets = StorageManager.getAssetsByTray(selectedTray.id);
    setAssets(trayAssets);

    setNewAssetCode('');
    setNewAssetQuantity(1);
    setNewAssetBrand('');
    setNewAssetSpare('');
    setNewAssetSpareName('');
    setNewAssetStatus('working');
  };

  const generateBarcode = () => {
    const prefix = newAssetType.substring(0, 2).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    setNewAssetCode(`${prefix}-${random}`);
  };

  // ======================================================
  // 🔒 ADD / EDIT WAREHOUSE (UNCHANGED)
  // ======================================================
  const handleAddWarehouse = () => {
    if (!newWarehouseName.trim() || !newWarehouseCode.trim()) return;

    if (editingWarehouse) {
      const allHubs = StorageManager.getHubs();
      const hubIndex = allHubs.findIndex(
        h => h.id === editingWarehouse.id
      );
      if (hubIndex !== -1) {
        allHubs[hubIndex].name = newWarehouseName;
        allHubs[hubIndex].code = newWarehouseCode;
        allHubs[hubIndex].address = newWarehouseAddress;
        allHubs[hubIndex].updatedAt = new Date().toISOString();
        StorageManager.setWarehouses(allHubs);
      }
      setEditingWarehouse(null);
    } else {
      const newHub: Warehouse = {
        id: `hub-${Date.now()}`,
        name: newWarehouseName,
        code: newWarehouseCode,
        address: newWarehouseAddress,
        managerId: user?.id || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: []
      };

      const allHubs = StorageManager.getHubs();
      allHubs.push(newHub);
      StorageManager.setWarehouses(allHubs);
    }

    setShowAddWarehouseModal(false);
    setNewWarehouseName('');
    setNewWarehouseCode('');
    setNewWarehouseAddress('');
  };

  // ======================================================
  // 🔒 ADD / EDIT SECTION (UNCHANGED)
  // ======================================================
  const handleAddSection = () => {
    if (!selectedHubData || !newSectionName || !newSectionCode) return;

    if (editingSection) {
      const allHubs = StorageManager.getHubs();
      const hubIndex = allHubs.findIndex(
        h => h.id === selectedHubData.id
      );
      if (hubIndex !== -1) {
        const secIndex = allHubs[hubIndex].sections.findIndex(
          s => s.id === editingSection.id
        );
        if (secIndex !== -1) {
          allHubs[hubIndex].sections[secIndex].name = newSectionName;
          allHubs[hubIndex].sections[secIndex].code = newSectionCode;
          StorageManager.setWarehouses(allHubs);
        }
      }
      setEditingSection(null);
    } else {
      const newSection: Section = {
        id: `sec-${Date.now()}`,
        name: newSectionName,
        code: newSectionCode,
        warehouseId: selectedHubData.id,
        createdAt: new Date().toISOString(),
        trays: []
      };

      const allHubs = StorageManager.getHubs();
      const hubIndex = allHubs.findIndex(
        h => h.id === selectedHubData.id
      );
      if (hubIndex !== -1) {
        allHubs[hubIndex].sections.push(newSection);
        StorageManager.setWarehouses(allHubs);
      }
    }

    setShowAddSectionModal(false);
    setNewSectionName('');
    setNewSectionCode('');
  };

  /* ===================== END PART 2 ===================== */


  // ======================================================
  // 🔒 ADD / EDIT TRAY (UNCHANGED)
  // ======================================================
  const handleAddTray = () => {
    if (
      !selectedHubData ||
      !selectedDivData ||
      !newTrayName ||
      !newTrayCode
    )
      return;

    if (editingTray) {
      const allHubs = StorageManager.getHubs();
      const hubIndex = allHubs.findIndex(
        h => h.id === selectedHubData.id
      );
      if (hubIndex !== -1) {
        const secIndex = allHubs[hubIndex].sections.findIndex(
          s => s.id === selectedDivData.id
        );
        if (secIndex !== -1) {
          const trayIndex =
            allHubs[hubIndex].sections[secIndex].trays.findIndex(
              t => t.id === editingTray.id
            );
          if (trayIndex !== -1) {
            allHubs[hubIndex].sections[secIndex].trays[trayIndex].name =
              newTrayName;
            allHubs[hubIndex].sections[secIndex].trays[trayIndex].code =
              newTrayCode;
            allHubs[hubIndex].sections[secIndex].trays[trayIndex].capacity =
              newTrayCapacity;
            StorageManager.setWarehouses(allHubs);
          }
        }
      }
      setEditingTray(null);
    } else {
      const newTray: Tray = {
        id: `tray-${Date.now()}`,
        name: newTrayName,
        code: newTrayCode,
        sectionId: selectedDivData.id,
        capacity: newTrayCapacity,
        currentCount: 0,
        createdAt: new Date().toISOString()
      };

      const allHubs = StorageManager.getHubs();
      const hubIndex = allHubs.findIndex(
        h => h.id === selectedHubData.id
      );
      if (hubIndex !== -1) {
        const secIndex = allHubs[hubIndex].sections.findIndex(
          s => s.id === selectedDivData.id
        );
        if (secIndex !== -1) {
          allHubs[hubIndex].sections[secIndex].trays.push(newTray);
          StorageManager.setWarehouses(allHubs);
        }
      }
    }

    setShowAddTrayModal(false);
    setNewTrayName('');
    setNewTrayCode('');
    setNewTrayCapacity(100);
  };

  // ======================================================
  // 🔒 DELETE HANDLERS (UNCHANGED)
  // ======================================================
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    const allHubs = StorageManager.getHubs();

    switch (type) {
      case 'warehouse': {
        const idx = allHubs.findIndex(h => h.id === id);
        if (idx !== -1) {
          allHubs.splice(idx, 1);
          StorageManager.setWarehouses(allHubs);
        }
        break;
      }
      case 'section': {
        const hIdx = allHubs.findIndex(
          h => h.id === selectedHubData?.id
        );
        if (hIdx !== -1) {
          const sIdx = allHubs[hIdx].sections.findIndex(
            s => s.id === id
          );
          if (sIdx !== -1) {
            allHubs[hIdx].sections.splice(sIdx, 1);
            StorageManager.setWarehouses(allHubs);
          }
        }
        break;
      }
      case 'tray': {
        const hIdx = allHubs.findIndex(
          h => h.id === selectedHubData?.id
        );
        if (hIdx !== -1) {
          const sIdx = allHubs[hIdx].sections.findIndex(
            s => s.id === selectedDivData?.id
          );
          if (sIdx !== -1) {
            const tIdx =
              allHubs[hIdx].sections[sIdx].trays.findIndex(
                t => t.id === id
              );
            if (tIdx !== -1) {
              allHubs[hIdx].sections[sIdx].trays.splice(tIdx, 1);
              StorageManager.setWarehouses(allHubs);
            }
          }
        }
        break;
      }
    }

    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800';
      case 'needs_fix':
        return 'bg-yellow-100 text-yellow-800';
      case 'scrap':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ======================================================
  // 🔒 JSX RETURN (UNCHANGED – EXACT SAME AS FIRST CODE)
  // ======================================================
  const [productData, setProductData] = useState<any[]>([]);


  // filters
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const getTrayProductsApi = async () => {
    try {
      setProductLoading(true);

      const res = await axios.get(
        `${baseUrl.statsCategoryLogReport}`,
        {
          params: {
            category_id: expandedDiv,
            hub_id: expandedHub,
            division_id: selectedTray?.id,
            start_date: startDate,
            end_date: endDate,
          },
        }
      );

      setProductData(res?.data?.data || []);
    } catch (error) {
      console.error("Tray products fetch error", error);
    } finally {
      setProductLoading(false);
    }
  };


  useEffect(() => {
    if (expandedDiv && expandedHub && selectedTray?.id) {
      getTrayProductsApi();
    }
  }, [expandedDiv, expandedHub, selectedTray?.id, startDate, endDate]);


  // useEffect(() => {
  //   if (selectedTray?.id) {
  //     getTrayProductsApi();
  //   }
  // }, [selectedTray?.id])


  const [brands, setBrands] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [productStatuses, setProductStatuses] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${baseUrl.brands}/by-vendor/${user?.vendor_id}`).then(r => setBrands(r?.data?.data?.brands || []));
    axios.get(`${baseUrl.categories}/by-vendor/${user?.vendor_id}`).then(r => setCategoriesList(r?.data?.data?.categories || []));
    axios
      .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}&type=division`)
      .then(r => setProductStatuses(r?.data?.data?.statuses || []));
  }, []);


  const filteredAssets = productData?.filter((asset: any) => {
    const product = asset?.product_details?.product;
    const category = asset?.product_details?.categories?.[0];

    const search = searchText?.toLowerCase().trim();

    /* 🔍 SEARCH : barcode / sku / product name */
    const matchSearch =
      !search ||
      product?.barcode_value?.toLowerCase().includes(search) ||
      product?.sku?.toLowerCase().includes(search) ||
      product?.title?.toLowerCase().includes(search);

    /* 📦 PRODUCT TYPE */
    const matchProductType =
      filterProductType === "all" ||
      product?.product_type?.id === filterProductType;

    /* 🏷 BRAND */
    const matchBrand =
      filterBrand === "all" ||
      asset?.brand_name_id === filterBrand;

    /* 🗂 CATEGORY */
    const matchCategory =
      filterCategory === "all" ||
      category?.id === filterCategory;

    /* 🚦 STATUS */
    const matchStatus =
      filterStatus === "all" ||
      asset?.product_details?.product?.status?.id === filterStatus;

    return (
      matchSearch &&
      matchProductType &&
      matchBrand &&
      matchCategory &&
      matchStatus
    );
  });
  console.log(filteredAssets)
  // 🔹 delete Tray

  const tableRows = filteredAssets?.flatMap((item: any) => {
    if (!item.tracking || item.tracking.length === 0) {
      return [{
        id: item.id,
        productName: item.name,
        trayName: "-",
        barcode: item.id,
        brand: item.brand_name,
        productType: item.category_name,
        inStock: 0,
        availableStock: 0,
        divisionName: "-",
        totalOut: 0,
      }];
    }

    return item.tracking.map((track: any) => ({
      id: `${item.id}-${track.division_id}`,
      productName: item.name,
      trayName: track.tray_name || "-",
      barcode: item.id,
      brand: item.brand_name,
      productType: item.category_name,
      inStock: track.total_in,
      availableStock: track.available_stock,
      divisionName: track.division_name,
      totalOut: track.total_out,
    }));
  });


  const trackingHeaders = Array.from(
    new Set(
      filteredAssets?.flatMap((item: any) =>
        item?.tracking?.flatMap((t: any) => [
          ...(t?.in_track?.map((i: any) => i.division_name) || []),
          ...(t?.out_track?.map((o: any) => o.division_name) || []),
        ])
      )
    )
  );



  const getOutCount = (tracking: any, division: string) => {
    if (!tracking?.out_track) return 0;

    return tracking.out_track
      .filter((t: any) => t.division_name === division)
      .reduce((sum: number, t: any) => sum + (t.count || 0), 0);
  };



  const [trayconfirmOpenDelete, setTrayConfirmOpenDelete] = useState(false);
  const [traydeleteItem, setTrayDeleteItem] = useState<any>(null);

  const handleTrayDelete = async () => {
    try {
      await axios.delete(
        `${baseUrl.divisions}/${traydeleteItem?.id}`
      );
      setTrayConfirmOpenDelete(false);
      setTrayDeleteItem(null);
      getWarehouses();
    } catch (error) {
      console.log(error);
    }
  };

  const trayOptions = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    name: `Tray ${i + 1}`,
  }));

  // const [selectedTray, setSelectedTray] = useState<string>("");

  // const downloadExcel = () => {
  //   if (!filteredAssets || filteredAssets.length === 0) return;

  //   const rows = filteredAssets.map((item: any, index: number) => {
  //     const firstTracking = item?.tracking?.[0] || {};

  //     const row: any = {
  //       "S.No": index + 1,
  //       "Product Name": item.name,
  //       "Category": item.category_name,
  //       "Brand": item.brand_name,
  //       "Tray": firstTracking?.tray_name || "-",
  //       "Barcode": item.id,
  //       "Total In": firstTracking?.total_in || 0,
  //       "Total Out": firstTracking?.total_out || 0,
  //       "Available Stock": firstTracking?.available_stock || 0,
  //     };

  //     /* ================= SAME TABLE LOGIC ================= */

  //     if (selectedTray?.code === "CHECKING AREA") {
  //       row["Waiting Area"] = getOutCount(firstTracking, "WAITING AREA");
  //       row["Gum Leakage"] = getOutCount(firstTracking, "GUM LEAKAGE BOARD");
  //       row["Fault Board"] = getOutCount(firstTracking, "FAULT BOARD");
  //       row["Scrap"] = getOutCount(firstTracking, "SCRAP");
  //     }

  //     if (selectedTray?.code === "WAITING AREA") {
  //       row["Input"] = getInCount(firstTracking, "CHECKING AREA");
  //     }

  //     if (selectedTray?.code === "GUM LEAKAGE BOARD") {
  //       row["Waiting Area"] = getOutCount(firstTracking, "WAITING AREA");
  //     }

  //     if (selectedTray?.code === "FAULT BOARD") {
  //       row["Waiting Area"] = getOutCount(firstTracking, "WAITING AREA");
  //       row["Scrap"] = getOutCount(firstTracking, "SCRAP");
  //     }

  //     return row;
  //   });

  //   const worksheet = XLSX.utils.json_to_sheet(rows);
  //   const workbook = XLSX.utils.book_new();

  //   XLSX.utils.book_append_sheet(
  //     workbook,
  //     worksheet,
  //     selectedTray?.code || "Assets"
  //   );

  //   XLSX.writeFile(
  //     workbook,
  //     `Assets_${selectedTray?.code || "ALL"}_${new Date()
  //       .toISOString()
  //       .slice(0, 10)}.xlsx`
  //   );
  // };

  const downloadExcel = () => {
    if (!filteredAssets || filteredAssets.length === 0) return;

    const rows: any[] = [];
    const totals: any = {};

    filteredAssets.forEach((item: any, index: number) => {
      const firstTracking = item?.tracking?.[0] || {};

      const row: any = {
        "S.No": index + 1,
        "Product Name": item.name,
        "Category": item.category_name,
        "Brand": item.brand_name,
        "Tray": firstTracking?.tray_name || "-",
        "Barcode": item.id,
        "Total In": firstTracking?.total_in || 0,
        "Total Out": firstTracking?.total_out || 0,
        "Available Stock": firstTracking?.available_stock || 0,
      };

      /* ================= SAME TABLE LOGIC ================= */

      if (selectedTray?.code === "CHECKING AREA") {
        row["Waiting Area"] = getOutCount(firstTracking, "WAITING AREA");
        row["Gum Leakage"] = getOutCount(firstTracking, "GUM LEAKAGE BOARD");
        row["Fault Board"] = getOutCount(firstTracking, "FAULT BOARD");
        row["Scrap"] = getOutCount(firstTracking, "SCRAP");
      }

      if (selectedTray?.code === "WAITING AREA") {
        row["Input"] = getInCount(firstTracking, "CHECKING AREA");
      }

      if (selectedTray?.code === "GUM LEAKAGE BOARD") {
        row["Waiting Area"] = getOutCount(firstTracking, "WAITING AREA");
      }

      if (selectedTray?.code === "FAULT BOARD") {
        row["Waiting Area"] = getOutCount(firstTracking, "WAITING AREA");
        row["Scrap"] = getOutCount(firstTracking, "SCRAP");
      }

      // 🔥 accumulate totals dynamically
      Object.keys(row).forEach((key) => {
        if (typeof row[key] === "number") {
          totals[key] = (totals[key] || 0) + row[key];
        }
      });

      rows.push(row);
    });

    // 🔥 GRAND TOTAL ROW
    const totalRow: any = {
      "S.No": "",
      "Product Name": "GRAND TOTAL",
    };

    Object.keys(totals).forEach((key) => {
      totalRow[key] = totals[key];
    });

    rows.push(totalRow);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      selectedTray?.code || "Assets"
    );

    XLSX.writeFile(
      workbook,
      `Assets_${selectedTray?.code || "ALL"}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };


  const getInCount = (tracking: any, division: string) => {
    if (!tracking?.in_track) return 0;

    return tracking.in_track
      .filter((t: any) => t.division_name === division)
      .reduce((sum: number, t: any) => sum + (t.count || 0), 0);
  };


  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Sidebar - Tree View */}
      {/* <div className="w-80 border-r bg-white overflow-y-auto hidden md:block"> */}
      <div
        className={`
          bg-white border-r overflow-y-auto
          transition-all duration-300
          ${isSidebarOpen ? "w-80" : "w-0 overflow-hidden"}
        `}
      >
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" /> Organization
          </h2>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        {/* Search Input */}
        <div className="p-3 border-b bg-white sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections, trays, products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2">
              Showing results for: <span className="font-medium text-gray-700">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="p-2 space-y-1">
          {hubLoading && (
            <div className="px-4 py-2 text-sm text-gray-400 text-center">
              Loading hubs…
            </div>
          )}

          {/* {getFilteredHubs().map(hub => ( */}
          {hubs
            ?.filter(hub =>
              hub?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(hub => (

              <div key={hub.id}>
                <button
                  onClick={() => handleHubClick(hub)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${expandedHub === hub.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <div className="flex items-center gap-2">
                    {expandedHub === hub.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <MapPin className="h-4 w-4 opacity-70 capitalize" />
                    {hub.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{hub?.sections.length || 0}</span>
                    {/* {expandedHub === hub.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWarehouse(hub);
                            setShowAddSectionModal(true);
                            setSelectHubId(hub?.id)
                            setEditDivision(hub)
                          }}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                          title="Edit"
                        >
                          <PlusCircle className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWarehouse(hub.id, hub.name);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectHubId(hub?.id)
                            setShowAddSectionModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Add Section"
                        >
                          <PlusCircle className="h-3 w-3" />
                        </button>
                      </div>
                    )} */}
                  </div>
                </button>

                {/* {expandedHub === hub.id && (
                  <div className="ml-6 space-y-1 mt-1 border-l-2 border-gray-100 pl-2">
                    {hub.sections.map(div => ( */}
                {expandedHub === hub.id && (
                  <div className="ml-6 space-y-1 mt-1 border-l-2 border-gray-100 pl-2">
                    {divisionLoading && (
                      <div className="ml-6 text-xs text-gray-400  flex gap-2">
                        <Loader className="h-3 w-3 animate-spin my-auto text-gray-400 inline-block" />
                        Loading divisions…
                      </div>
                    )}

                    {hub.sections.map((div: any) => (

                      <div key={div.id}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDivClick(div); }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${expandedDiv === div.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <div className="flex items-center gap-2 capitalize">
                            {expandedDiv === div.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            {div.name}
                          </div>
                          <div className="flex items-center gap-1">
                            {/* <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{hub?.sections?.trays?.length || 0}</span> */}
                            {/* {expandedDiv === div.id && (
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedHubData(hub);
                                    handleEditSection(div);
                                    setShowAddSectionModal(true);
                                    setSelectHubId(div?.id)
                                    setEditDivision(div)
                                  }}
                                  className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                                  title="Edit"
                                >
                                  <PlusCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(div.id, div.name);
                                    setdDvisionConfirmOpen(!divisionConfirmOpen);
                                    setSelectedDivision(div);

                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDivData(div);
                                    setShowAddTrayModal(true);
                                    setShowAddSectionModal(true);
                                    setSelectHubId(div?.id)
                                    setEditDivision(div)
                                    setAddTrayModal(!addTrayModal)
                                    setDivisionModalData(div)
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Add Tray"
                                >
                                  <PlusCircle className="h-3 w-3" />
                                </button>
                              </div>
                            )} */}
                          </div>
                        </button>

                        {expandedDiv === div.id && (
                          <div className="ml-5 mt-1 space-y-1">
                            {trayLoading ? (
                              <div className="ml-6 text-xs text-gray-400  flex gap-2">
                                <Loader className="h-3 w-3 animate-spin my-auto text-gray-400 inline-block" />
                                Loading Status
                              </div>
                            ) : (
                              <>
                                {div.trays.map((tray: any) => (
                                  <div key={tray.id} className="flex items-center group">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleTrayClick(tray); }}
                                      className={`flex-1 text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${selectedTray?.id === tray.id ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-50 text-gray-500'}`}
                                    >
                                      <div className="flex items-center gap-2 capitalize">
                                        <Box className="h-3 w-3" />
                                        {tray.name}
                                      </div>
                                      {/* <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedTray?.id === tray.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                                        {trayCounts[tray.id] || 0}
                                      </span> */}
                                    </button>

                                    {/* <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTray(tray);
                                      setEditTrayData(tray)
                                      setAddTrayModal(!addTrayModal)
                                    }}
                                    className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                                    title="Edit"
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTrayDeleteItem(tray);
                                      setTrayConfirmOpenDelete(true);
                                      handleDeleteTray(tray.id, tray.name);
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div> */}

                                  </div>
                                ))}
                              </>
                            )}

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>
      <div className="flex-1 overflow-auto bg-gray-50 p-6">

        {selectedTray ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Tray Content</span>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedTray.name}
                </h1>
                <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm">
                  {selectedHubData?.name} <ChevronRight className="h-3 w-3" /> {selectedDivData?.name}
                </p>
              </div>
              {/* <button
                onClick={() => setShowAddModal(true)}
                onClick={() => setShowAddAssetModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-medium"
              >
                <PlusCircle className="h-5 w-5" />
                Add Product
              </button> */}
            </div>

            {/* Asset List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b gap-5  bg-gray-50/50">
                <h3 className="font-semibold text-gray-700">Assets ({filteredAssets?.length})</h3>
                {/* <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter assets..."
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none w-64"
                  />
                </div> */}
                {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
        
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  {/* Brand */}
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm"
                  >
                    <option value="all">All Brands</option>
                    {brands?.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.brand_name}</option>
                    ))}
                  </select>

                  {/* Product Type */}
                  <select
                    value={filterProductType}
                    onChange={(e) => setFilterProductType(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm"
                  >
                    <option value="all">All Product Types</option>
                    {productTypes?.map((pt: any) => (
                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                    ))}
                  </select>

                  {/* Start Date */}
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm"
                  />

                  {/* End Date */}
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm"
                  />

                  <button
                    onClick={downloadExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    ⬇ Download Excel
                  </button>
                </div>

              </div>

              {productLoading ? (
                <div className="p-12 flex flex-col items-center gap-3 text-gray-400">
                  <Loader className="h-6 w-6 animate-spin text-gray-400" />
                  Loading Products...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 text-[10px] uppercase text-gray-600 font-semibold">
                      <tr>
                        <th className="px-4 py-3">S.No</th>
                        <th className="px-4 py-3">Product / Tray
                          {/* / Barcode */}
                        </th>
                        <th className="px-4 py-3">Product Type / Brand</th>

                        <th className="px-4 py-3 text-center">Total In </th>
                        <th className="px-4 py-3 text-center">Total Out </th>
                        {/* <th className="px-4 py-3 text-center">In Stock</th> */}
                        <th className="px-4 py-3 text-center">Available Stock</th>
                        {/* <th className="px-4 py-3 text-center">Out Stock</th> */}

                        {/* out_track Stock  */}
                        {selectedTray?.code === "CHECKING AREA" && (
                          <>
                            <th className="px-4 py-3 text-center">Waiting Area</th>
                            <th className="px-4 py-3 text-center">Gum Leakage</th>
                            <th className="px-4 py-3 text-center">Fault Board</th>
                            <th className="px-4 py-3 text-center">Scrap</th>
                          </>
                        )}
                        {/* in_track Stock  */}
                        {selectedTray?.code === "WAITING AREA" && (
                          <>
                            <th className="px-4 py-3 text-center">Input</th>
                          </>
                        )}
                        {/* out_track Stock  */}
                        {selectedTray?.code === "GUM LEAKAGE BOARD" && (
                          <>
                            <th className="px-4 py-3 text-center">Waiting Area</th>
                          </>
                        )}

                        {/* out_track Stock  */}

                        {selectedTray?.code === "FAULT BOARD" && (
                          <>
                            <th className="px-4 py-3 text-center">Waiting Area</th>
                            <th className="px-4 py-3 text-center">Scrap</th>
                          </>
                        )}

                        <th className="px-4 py-3">Action</th>

                      </tr>
                    </thead>


                    <tbody className="divide-y divide-gray-200">
                      {filteredAssets?.map((item: any, index: number) => {
                        const firstTracking = item?.tracking?.[0]; // one tracking per product

                        return (
                          <tr key={item.id} className="hover:bg-gray-50 text-[10px] ">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">
                                {index + 1}
                              </div>
                            </td>
                            {/* Product */}
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Tray: {firstTracking?.tray_code || "-"}
                              </div>
                              {/* <div className="text-xs font-mono text-gray-600">
                                Barcode: {item.id}
                              </div> */}
                            </td>

                            {/* Product Type / Brand */}
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium">
                                {item.category_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Brand: {item.brand_name}
                              </div>
                            </td>

                            {/* Normal In */}
                            <td className="px-4 py-3 text-center font-bold text-blue-700">
                              {firstTracking?.total_in || 0}
                            </td>

                            {/* Normal Out */}
                            <td className="px-4 py-3 text-center font-bold text-red-700">
                              {firstTracking?.total_out || 0}
                            </td>

                            {/* Available */}
                            <td className="px-4 py-3 text-center font-bold text-green-700">
                              {firstTracking?.available_stock || 0}
                            </td>



                            {selectedTray?.code === "CHECKING AREA" && (
                              <>
                                <td className="px-4 py-3 text-center">
                                  {getOutCount(firstTracking, "WAITING AREA")}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getOutCount(firstTracking, "GUM LEAKAGE BOARD")}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getOutCount(firstTracking, "FAULT BOARD")}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getOutCount(firstTracking, "SCRAP")}
                                </td>
                              </>
                            )}

                            {selectedTray?.code === "WAITING AREA" && (
                              <td className="px-4 py-3 text-center font-semibold text-blue-600">
                                {getInCount(firstTracking, "CHECKING AREA")}
                              </td>
                            )}

                            {selectedTray?.code === "GUM LEAKAGE BOARD" && (
                              <td className="px-4 py-3 text-center">
                                {getOutCount(firstTracking, "WAITING AREA")}
                              </td>
                            )}

                            {selectedTray?.code === "FAULT BOARD" && (
                              <>
                                <td className="px-4 py-3 text-center">
                                  {getOutCount(firstTracking, "WAITING AREA")}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getOutCount(firstTracking, "SCRAP")}
                                </td>
                              </>
                            )}
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-end gap-2 ">
                                <button
                                  onClick={() => {
                                    setSelectedAsset(item);
                                    setShowHistoryModal(true);
                                  }}

                                  className="p-2 flex gap-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                  title="View History"
                                >
                                  <Package className="h-4 w-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>


                  </table>
                </div>

              )}
            </div>

          </div>


        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Folder className="h-16 w-16 text-gray-200 mb-4" />
            <p className="text-lg font-medium">Select a Tray from the sidebar</p>
            <p className="text-sm">Browse the organization hierarchy to view inventory</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {/* {showHistoryModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" /> Asset History
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <div className="p-4 bg-gray-50/50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Product</div>
                  <div className="font-medium text-gray-900">{selectedAsset.productType}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase font-bold">QR Code</div>
                  <div className="font-mono">{selectedAsset.qrCode}</div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {assetHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No history events found.</p>
              ) : (
                assetHistory.map((event, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0 last:pb-0">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-100 border-2 border-white ring-1 ring-blue-500"></div>
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      {event.type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    {event.remarks && (
                      <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-2">
                        Note: {event.remarks}
                      </div>
                    )}
                    {event.type === 'MOVED' && (
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                        <div><span className="font-semibold text-gray-500">From:</span> {event.fromLocation?.warehouseName} / {event.fromLocation?.sectionName} / {event.fromLocation?.trayName}</div>
                        <div><span className="font-semibold text-green-600">To:</span> {event.toLocation?.warehouseName} / {event.toLocation?.sectionName} / {event.toLocation?.trayName}</div>
                      </div>
                    )}
                    {event.type === 'RECEIVED' && (
                      <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                        Added to: {event.toLocation?.warehouseName} / {event.toLocation?.trayName}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )} */}

      <AssetHistoryModal
        open={showHistoryModal}
        onClose={() => { setShowHistoryModal(false), setSelectedAsset(null) }}
        selectedAsset={selectedAsset}
        // assetHistory={assetHistory}
        selectedTray={selectedTray}
      />



      {/* Print Modal */}
      <BarcodePrintModal
        open={showPrintModal}
        barcode={selectedAsset?.product_details?.product?.barcode_value || ''}
        productName={selectedAsset?.productType}
        onClose={() => setShowPrintModal(false)}
      />

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              {editingAsset ? 'Edit Product' : `Add Products to ${selectedTray?.name}`}
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium mb-1">QR Code *</label>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    value={newAssetCode}
                    onChange={e => setNewAssetCode(e.target.value)}
                    placeholder="e.g., SP-512608"
                  />
                  <button onClick={generateBarcode} className="text-blue-600 text-sm font-medium hover:underline px-2 py-1 whitespace-nowrap">
                    Generate
                  </button>
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Type *</label>
                {productTypes.length > 0 ? (
                  <select
                    className="input-field w-full"
                    value={newAssetType}
                    onChange={e => setNewAssetType(e.target.value)}
                  >
                    <option value="">-- Select Product Type --</option>
                    {productTypes.map(pt => (
                      <option key={pt.id} value={pt.name}>
                        {pt.name} ({pt.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input-field w-full"
                    value={newAssetType}
                    onChange={e => setNewAssetType(e.target.value)}
                    placeholder="e.g., Front Load Washing Machine"
                  />
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={newAssetBrand}
                  onChange={e => setNewAssetBrand(e.target.value)}
                  placeholder="e.g., SAMSUNG"
                />
              </div>

              {/* Spare Code */}
              <div>
                <label className="block text-sm font-medium mb-1">Spare Code</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={newAssetSpare}
                  onChange={e => setNewAssetSpare(e.target.value)}
                  placeholder="e.g., BOARD"
                />
              </div>

              {/* Spare Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Spare Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={newAssetSpareName}
                  onChange={e => setNewAssetSpareName(e.target.value)}
                  placeholder="e.g., ROTATOR BOARD (GF)"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  className="input-field w-full"
                  value={newAssetQuantity}
                  onChange={e => setNewAssetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  className="input-field w-full"
                  value={newAssetStatus}
                  onChange={e => setNewAssetStatus(e.target.value)}
                >
                  <option value="working">Working</option>
                  <option value="needs_fix">Needs Fix</option>
                  <option value="scrap">Scrap</option>
                  <option value="reserved">Reserved</option>
                  <option value="damaged">Damaged</option>
                  <option value="testing">Testing</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAsset(null);
                  setNewAssetCode('');
                  setNewAssetType(PRODUCT_TYPES[0]);
                  setNewAssetQuantity(1);
                  setNewAssetBrand('');
                  setNewAssetSpare('');
                  setNewAssetSpareName('');
                  setNewAssetStatus('working');
                }}
                className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {editingAsset ? 'Update Product' : 'Add to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Warehouse Modal */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              {editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Name *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newWarehouseName}
                onChange={e => setNewWarehouseName(e.target.value)}
                placeholder="e.g., Main Hub"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newWarehouseCode}
                onChange={e => setNewWarehouseCode(e.target.value)}
                placeholder="e.g., HUB01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                className="input-field w-full"
                value={newWarehouseAddress}
                onChange={e => setNewWarehouseAddress(e.target.value)}
                placeholder="e.g., 123 Main St"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => {
                setShowAddWarehouseModal(false);
                setEditingWarehouse(null);
                setNewWarehouseName('');
                setNewWarehouseCode('');
                setNewWarehouseAddress('');
              }} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleAddWarehouse} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                {editingWarehouse ? 'Update' : 'Add'} Warehouse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              {editingSection ? 'Edit Section' : `Add Section to ${selectedHubData?.name}`}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Section Name *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                placeholder="e.g., Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newSectionCode}
                onChange={e => setNewSectionCode(e.target.value)}
                placeholder="e.g., ELEC"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => {
                setShowAddSectionModal(false);
                setEditingSection(null);
                setNewSectionName('');
                setNewSectionCode('');
              }} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleAddSection} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                {editingSection ? 'Update' : 'Add'} Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tray Modal */}
      {showAddTrayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              {editingTray ? 'Edit Tray' : `Add Tray to ${selectedDivData?.name}`}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Tray Name *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newTrayName}
                onChange={e => setNewTrayName(e.target.value)}
                placeholder="e.g., Tray A1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newTrayCode}
                onChange={e => setNewTrayCode(e.target.value)}
                placeholder="e.g., A1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                max="10000"
                className="input-field w-full"
                value={newTrayCapacity}
                onChange={e => setNewTrayCapacity(Math.max(1, parseInt(e.target.value) || 100))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => {
                setShowAddTrayModal(false);
                setEditingTray(null);
                setNewTrayName('');
                setNewTrayCode('');
                setNewTrayCapacity(100);
              }} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleAddTray} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                {editingTray ? 'Update' : 'Add'} Tray
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Type Modal */}
      {showAddProductTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              {editingProductType ? 'Edit Product Type' : 'Add Product Type'}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newProductTypeName}
                onChange={e => setNewProductTypeName(e.target.value)}
                placeholder="e.g., Washing Machine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                className="input-field w-full"
                value={newProductTypeCode}
                onChange={e => setNewProductTypeCode(e.target.value)}
                placeholder="e.g., WM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                className="input-field w-full"
                value={newProductTypeCategory}
                onChange={e => setNewProductTypeCategory(e.target.value)}
                placeholder="e.g., Appliance"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dismantleable"
                checked={newProductTypeIsDismantleable}
                onChange={e => setNewProductTypeIsDismantleable(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="dismantleable" className="text-sm font-medium">
                Is Dismantleable
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => {
                setShowAddProductTypeModal(false);
                setEditingProductType(null);
                setNewProductTypeName('');
                setNewProductTypeCode('');
                setNewProductTypeCategory('');
                setNewProductTypeIsDismantleable(false);
              }} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button
                // onClick={handleAddProductType}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                {editingProductType ? 'Update' : 'Add'} Product Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <X className="h-5 w-5" />
              Delete {deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}
            </h3>

            <p className="text-gray-600">
              Are you sure you want to delete <span className="font-bold">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-xs text-red-700">
                <span className="font-semibold">Warning:</span> All associated items will be removed.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
              }} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AddDivisionModal
        open={showAddSectionModal}
        onCancel={() => { setShowAddSectionModal(!showAddSectionModal), setEditDivision('') }}
        editDivision={editDivision}
        hubId={selectHubId}
        getDivisions={getWarehouses}
      />


      <DeleteConfirmModal
        open={divisionConfirmOpen}
        title="Delete Division"
        description="Are you sure you want to delete this division?"
        confirmText="Delete"
        loading={divisionConfirmLoading}
        onCancel={() => {
          setdDvisionConfirmOpen(false);
          setSelectedDivision(null);
        }}
        onConfirm={handleDeleteDivision}
      />

      <AddTrayModal
        open={addTrayModal}
        onClose={() => { setAddTrayModal(!addTrayModal), setEditTrayData(''), setEditDivision('') }}
        editTrayData={editTrayData}
        divisionModalData={divisionModalData}
        reload={getWarehouses}
      />


      {showAddAssetModal &&
        <AddProductModal
          open={showAddAssetModal}
          onCancel={() => (setShowAddAssetModal(!showAddAssetModal))}
          editProduct={editProductData}
          selectedHubData={selectedHubData}
          selectedDivData={selectedDivData}
          selectedTray={selectedTray}
        // refresh={getProducts}
        // productTypes={productTypes}
        // productStatuses={productStatuses}
        />
      }

      {showOutputModal && selectedOutputAsset && (
        <OutputOrderModal
          asset={selectedOutputAsset}
          onClose={() => {
            setShowOutputModal(false);
            setSelectedOutputAsset(null);
          }}
          getTrayProductsApi={getTrayProductsApi}
        />
      )}


      {/* DELETE MODAL */}
      <DeleteConfirmModal
        open={trayconfirmOpenDelete}
        title="Delete Tray"
        description={`Are you sure you want to delete "${traydeleteItem?.name}"?`}
        onCancel={() => setTrayConfirmOpenDelete(false)}
        onConfirm={handleTrayDelete}
      />

    </div>
  );
};
/* ===================== END PART 3 ===================== */

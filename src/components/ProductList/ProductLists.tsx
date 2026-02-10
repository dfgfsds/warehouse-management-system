import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Eye, CreditCard as Edit, Trash2, MapPin, Calendar, PlusCircle, Edit2, Printer } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, Warehouse, AssetStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import AddProductModal, { Select } from '../Modals/AddProductModal';
import axios from 'axios';
import baseUrl from '../../../api-endpoints/ApiUrls';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import BarcodePrintModal from '../../utils/BarcodePrint';
import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
import { Download } from "lucide-react";

import JsBarcode from "jsbarcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface BarcodeItem {
    barcode: string;
    productName?: string;
    trayName?: string;
}

// import JsBarcode from "jsbarcode";

// export const printAllBarcodes = (items: any[]) => {
//     if (!items.length) return;

//     const win = window.open("", "", "width=1200,height=900");
//     if (!win) return;

//     win.document.write(`
//     <html>
//       <head>
//         <title>Barcode Print</title>
//         <style>
//           @page {
//             size: A4;
//             margin: 0;
//           }

//           body {
//             margin: 0;
//             padding: 0;
//             font-family: Arial, sans-serif;
//           }

//           /* ===== PAGE ===== */
//           .page {
//             width: 210mm;
//             height: 297mm;

//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             grid-template-rows: repeat(10, 1fr);

//             padding: 8mm;
//             box-sizing: border-box;

//             page-break-after: always;
//           }

//           /* ===== LABEL ===== */
//           .label {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             text-align: center;

//             border: none; /* ❌ NO BORDER */
//           }

//           .product {
//             font-size: 10px;
//             font-weight: bold;
//             margin-bottom: 1mm;
//           }

//           .tray {
//             font-size: 9px;
//             margin-bottom: 1mm;
//           }

//           svg {
//             height: 14mm;
//           }
//         </style>
//       </head>

//       <body>
//         ${items
//             .map((item, i) => `
//             ${i % 20 === 0 ? `<div class="page">` : ``}

//             <div class="label">
//               <div class="product">${item.productName}</div>
//               <div class="tray">Tray: ${item.trayName}</div>
//               <svg id="barcode-${i}"></svg>
//             </div>

//             ${(i % 20 === 19 || i === items.length - 1) ? `</div>` : ``}
//           `)
//             .join("")}
//       </body>
//     </html>
//   `);

//     win.document.close();

//     setTimeout(() => {
//         items.forEach((item, i) => {
//             const svg = win.document.getElementById(`barcode-${i}`);
//             if (svg) {
//                 JsBarcode(svg, item.barcode, {
//                     format: "CODE128",
//                     width: 1.6,
//                     height: 36,
//                     displayValue: true,
//                     fontSize: 10,
//                 });
//             }
//         });

//         win.focus();
//         win.print();
//     }, 700);
// };

// import QRCode from "qrcode";

// export const printAllQRCodes = async (items: any[]) => {
//   const safeItems = items.filter(
//     (i) => i?.barcode && i?.productName
//   );

//   if (!safeItems.length) {
//     alert("No QR codes to print");
//     return;
//   }

//   const win = window.open("", "", "width=1200,height=900");
//   if (!win) return;

//   win.document.write(`
//     <html>
//       <head>
//         <title>QR Print</title>
//         <style>
//           @page {
//             size: A4;
//             margin: 0;
//           }

//           body {
//             margin: 0;
//             font-family: Arial, sans-serif;
//           }

//           /* ===== ONE PAGE = 10 QR ===== */
//           .page {
//             width: 210mm;
//             height: 297mm;

//             display: grid;
//             grid-template-columns: 1fr 1fr;      /* 2 columns */
//             grid-template-rows: repeat(5, 1fr);  /* 5 rows = 10 */

//             padding: 8mm;
//             box-sizing: border-box;

//             page-break-after: always;
//           }

//           .label {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             text-align: center;
//           }

//           .product {
//             font-size: 10px;
//             font-weight: bold;
//             margin-bottom: 1mm;
//           }

//           .tray {
//             font-size: 9px;
//             margin-bottom: 1mm;
//           }

//           img {
//             width: 32mm;
//             height: 32mm;
//           }
//         </style>
//       </head>

//       <body>
//         ${safeItems
//           .map((item, i) => `
//             ${i % 10 === 0 ? `<div class="page">` : ``}

//             <div class="label">
//               <div class="product">${item.productName}</div>
//               <div class="tray">Tray: ${item.trayName}</div>
//               <div class="product">${item.barcode}</div>
//               <img id="qr-${i}" />
//             </div>

//             ${(i % 10 === 9 || i === safeItems.length - 1) ? `</div>` : ``}
//           `)
//           .join("")}
//       </body>
//     </html>
//   `);

//   win.document.close();

//   /* ===== SAFE BATCH QR GENERATION ===== */
//   const CHUNK_SIZE = 10;

//   for (let i = 0; i < safeItems.length; i += CHUNK_SIZE) {
//     const chunk = safeItems.slice(i, i + CHUNK_SIZE);

//     await Promise.all(
//       chunk.map(async (item, index) => {
//         const img = win.document.getElementById(
//           `qr-${i + index}`
//         ) as HTMLImageElement;

//         if (img) {
//           img.src = await QRCode.toDataURL(item.barcode, {
//             width: 220,
//             margin: 0, // ❌ no white border
//           });
//         }
//       })
//     );

//     // 🧠 browser breathe
//     await new Promise((r) => setTimeout(r, 0));
//   }

//   win.focus();
//   win.print();
// };



/* ================= DOWNLOAD ALL ================= */
// export const downloadAllBarcodes = async (items: BarcodeItem[]) => {
//     if (!items.length) {
//         alert("No barcodes found");
//         return;
//     }

//     const zip = new JSZip();

//     for (const item of items) {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         if (!ctx) continue;

//         const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//         JsBarcode(svg, item.barcode, {
//             format: "CODE128",
//             width: 2,
//             height: 50,
//             displayValue: true,
//         });

//         const img = new Image();
//         const svgData =
//             "data:image/svg+xml;base64," + btoa(svg.outerHTML);

//         await new Promise<void>((resolve) => {
//             img.onload = () => {
//                 canvas.width = img.width + 40;
//                 canvas.height = img.height + 70;

//                 ctx.fillStyle = "#fff";
//                 ctx.fillRect(0, 0, canvas.width, canvas.height);
//                 ctx.drawImage(img, 20, 20);

//                 ctx.fillStyle = "#000";
//                 ctx.textAlign = "center";
//                 ctx.font = "12px Arial";
//                 ctx.fillText(
//                     `${item.productName || ""} (${item.trayName || "-"})`,
//                     canvas.width / 2,
//                     canvas.height - 20
//                 );

//                 zip.file(
//                     `barcode-${item.barcode}.png`,
//                     canvas.toDataURL("image/png").split(",")[1],
//                     { base64: true }
//                 );
//                 resolve();
//             };
//             img.src = svgData;
//         });
//     }

//     const blob = await zip.generateAsync({ type: "blob" });
//     saveAs(blob, "all-barcodes.zip");
// };


export const ProductList: React.FC = () => {
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
    const [brandFilter, setBrandFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [hubFilter, setHubFilter] = useState("all");
    const [productTypeFilter, setProductTypeFilter] = useState("all");

    const [brands, setBrands] = useState<any[]>([]);
    const [categoriesList, setCategoriesList] = useState<any[]>([]);

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
    const [trayName, setTrayName] = useState("")

    const handleExportExcel = () => {
        if (!filteredProducts || filteredProducts.length === 0) {
            alert("No data to export");
            return;
        }

        const excelData = filteredProducts.map((item: any) => {
            const p = item.product;

            return {
                "Product Name": p?.title || "",
                "SKU": p?.sku || "",
                "Barcode": p?.barcode_value || "",
                "Status": p?.status?.name || "",
                "Brand": p?.brand?.name || "",
                "Category": item?.categories[0]?.name || "",
                "Product Type": p?.product_type?.name || "",
                "Hub": p?.hub?.name || "",
                "AMC Expiry": p?.amc_expiry_date || "",
                "Insurance Expiry": p?.insurance_expiry_date || "",
                "Created At": p?.created_at
                    ? new Date(p.created_at).toLocaleDateString()
                    : "",
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const fileData = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(fileData, `products_${Date.now()}.xlsx`);
    };

    // const getAllFilteredBarcodes = () => {
    //     const list: {
    //         barcode: string;
    //         productName?: string;
    //         trayName?: string;
    //     }[] = [];

    //     filteredProducts.forEach((item: any) => {
    //         const p = item?.product;
    //         if (!p?.barcode_value) return;

    //         // If trays exist, create barcode per tray
    //         if (item?.trays?.length > 0) {
    //             item.trays.forEach((t: any) => {
    //                 list.push({
    //                     barcode: p.barcode_value,
    //                     productName: p.title,
    //                     trayName: t?.code || "",
    //                 });
    //             });
    //         } else {
    //             list.push({
    //                 barcode: p.barcode_value,
    //                 productName: p.title,
    //                 trayName: "",
    //             });
    //         }
    //     });

    //     return list;
    // };


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

    useEffect(() => {
        axios.get(`${baseUrl.brands}/by-vendor/${user?.vendor_id}`).then(r => setBrands(r?.data?.data?.brands || []));
        axios.get(`${baseUrl.categories}/by-vendor/${user?.vendor_id}`).then(r => setCategoriesList(r?.data?.data?.categories || []));
    }, []);


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
            .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}&type=division`)
            .then(r => setProductStatuses(r?.data?.data?.statuses || []));
    }, [user?.vendor_id]);



    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all')
        setProductTypeFilter('all');
        setBrandFilter('all');
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

    // const filteredProducts = (productData || []).filter((item: any) => {
    //     const p = item.product;
    //     if (!p) return false;

    //     const search = searchTerm.toLowerCase();

    //     const matchSearch =
    //         p.title?.toLowerCase().includes(search) ||
    //         p.sku?.toLowerCase().includes(search) ||
    //         p.barcode_value?.toLowerCase().includes(search);



    //     const matchHub =
    //         hubFilter === "all" || p.hub?.id === hubFilter;

    //     const matchProductType =
    //         productTypeFilter === "all" ||
    //         p.product_type?.id === productTypeFilter;

    //     return matchSearch  && matchHub && matchProductType;
    // });


    const filteredProducts = (productData || []).filter((item: any) => {
        const p = item.product;
        if (!p) return false;
        console.log(p?.product_type?.id)
        const search = searchTerm.toLowerCase().trim();

        const matchSearch =
            !search ||
            p.title?.toLowerCase().includes(search) ||
            p.sku?.toLowerCase().includes(search) ||
            p.barcode_value?.toLowerCase().includes(search);

        const matchProductType =
            productTypeFilter === "all" ||
            p?.product_type?.id === productTypeFilter;

        const matchBrand =
            brandFilter === "all" ||
            p.brand?.id === brandFilter;

        const matchCategory =
            categoryFilter === "all" ||
            item?.categories?.some(
                (c: any) => c.category_id === categoryFilter
            );

        return (
            matchSearch &&
            matchProductType &&
            matchBrand &&
            matchCategory
        );
    });

    // const barcodeItems = filteredProducts.map((item: any) => ({
    //     barcode: item.product.barcode_value,
    //     productName: item.product.title,
    //     trayName: item.trays?.[0]?.code || "-"
    // }));

    // const getFilteredBarcodeItems = () => {
    //     return filteredProducts?.flatMap((item: any) => {
    //         const p = item?.product;
    //         if (!p?.barcode_value) return [];

    //         return (item?.trays?.length ? item?.trays : [{}]).map((t: any) => ({
    //             barcode: p?.barcode_value,
    //             productName: p?.title,
    //             trayName: item.trays?.[0]?.code || "-"
    //         }));
    //     });
    // };



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
                    Loading Products, please wait...
                </p>
            </div>
        );
    }


    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Products List</h1>
                </div>
                <div className="text-sm text-gray-600">
                    Total Products: {filteredProducts?.length}
                </div>
            </div>

            <div className="flex gap-3">
                {/* <button
                    onClick={() => printAllBarcodes(getFilteredBarcodeItems())}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex gap-2"
                >
                    <Printer size={16} />
                    Print All Barcodes
                </button> */}

                {/* <button
                    onClick={() => printAllBarcodes(barcodeItems)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                    <Printer size={16} />
                    Print All Barcodes
                </button> */}

                {/* <button
                    onClick={() => printAllQRCodes(getFilteredBarcodeItems())}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Print All QR Codes
                </button> */}



                {/* <button
                    onClick={() => downloadAllBarcodes(getFilteredBarcodeItems())}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex gap-2"
                >
                    <Download size={16} />
                    Download All Barcodes
                </button> */}
            </div>



            <div className="bg-white p-6 rounded-lg border grid grid-cols-1  md:grid-cols-3 lg:grid-cols-4 gap-4">

                {/* Search */}
                <div>
                    <label className="text-sm font-medium">Search</label>
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by title / barcode"
                        className="w-full border px-3 py-2 rounded-lg"
                    />
                </div>


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


                <Select
                    label="Brand"
                    value={brandFilter}
                    onChange={setBrandFilter}
                    options={[
                        // { id: "all", name: "All Brands" },
                        ...(brands || [])?.map((b: any) => ({
                            id: b?.id,
                            name: b?.brand_name,
                        })),
                    ]}
                />
                <Select
                    label="Category"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                        // { id: "all", name: "All Categories" },
                        ...(categoriesList || []).map((c: any) => ({
                            id: c?.id,
                            name: c?.title,
                        })),
                    ]}
                />


                {/* Status */}


                {/* Warehouse */}


                {/* <div className="flex items-end gap-5">
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

                </div> */}

                {/* <div className="flex items-end gap-3"> */}
                <button
                    onClick={loadData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Refresh
                </button>

                <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    <span className="flex mx-auto gap-2">
                    <Download size={16} className='my-auto'/>
                    Export Excel
                    </span>
                </button>
                <button
                    onClick={() => setShowAddAssetModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add Asset
                </button>
                {/* </div> */}

            </div>


            {/* Assets Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    S.No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Tray / Barcode
                                </th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Hub
                                </th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        AMC / Insurance
                                    </th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts?.map((item: any, index: number) => {
                                const p = item?.product;

                                return (
                                    <tr key={p?.id} className="hover:bg-gray-50">
                                        {/* Product */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {/* Product Name */}
                                                <div className="text-sm font-semibold text-gray-900 capitalize">
                                                    {p?.title}
                                                </div>

                                                {/* Brand */}
                                                {p?.brand?.name && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span className="font-medium text-gray-600">Brand:</span>
                                                        {p?.brand?.name}
                                                    </div>
                                                )}
                                                {p?.product_type?.name && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span className="font-medium text-gray-600">Product Type:</span>
                                                        {p?.product_type?.name}
                                                    </div>
                                                )}
                                                {/* Brand */}
                                                {item?.categories?.[0]?.name && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span className="font-medium text-gray-600">categorie:</span>
                                                        {item?.categories?.[0]?.name}
                                                    </div>
                                                )}

                                                {/* Category */}
                                                {/* {item?.categories?.[0]?.name && (
                                                    <div className="inline-flex w-fit mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium">
                                                        <span className="font-medium text-gray-600 pl-2">categorie:</span>{item.categories[0].name}
                                                    </div>
                                                )} */}
                                            </div>
                                        </td>

                                        {/* SKU / Barcode */}
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-0">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    Tray
                                                </span>

                                                <span className="px-2.5 py-1 rounded-md  text-indigo-700 text-sm font-semibold">
                                                    {item?.trays?.[0]?.code || "-"}
                                                </span>
                                            </div>

                                            <div className="font-mono text-xs text-gray-500">
                                                {p?.barcode_value}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        {/* <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {p.status?.name}
                                            </span>
                                        </td> */}

                                        {/* Hub */}
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {p?.hub?.name}
                                        </td>

                                        {/* AMC / Insurance */}
                                        {/* <td className="px-6 py-4 text-sm">
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
                                        </td> */}

                                        <td className="px-6 py-10 flex gap-4">
                                            <button
                                                onClick={() => {
                                                    setEditData(item);
                                                    setShowAddAssetModal(!showAddAssetModal);
                                                }}
                                                className="text-blue-600 flex gap-1"
                                            >
                                                <Edit2 size={16} />
                                                 {/* Edit */}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setDeleteItem(item);
                                                    setConfirmOpen(true);
                                                }}
                                                className="text-red-600 flex gap-1"
                                            >
                                                <Trash2 size={16} /> 
                                                {/* Delete */}
                                            </button>

                                            {p?.barcode_value && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBarcode(p?.barcode_value);
                                                        setSelectedProductName(p?.title);
                                                        setBarcodeModalOpen(true);
                                                        setTrayName(item?.trays?.[0]?.code || "")
                                                    }}
                                                    className="text-gray-700 underline text-sm"
                                                >
                                                    {/* Print Barcode */}
                                                    <Printer className="h-4 w-4" /> 
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
                    onCancel={() => (setShowAddAssetModal(!showAddAssetModal), setEditData(''))}
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
                trayName={trayName}
                onClose={() => { setTrayName(""); setBarcodeModalOpen(false); }}
            />


        </div>
    );
};
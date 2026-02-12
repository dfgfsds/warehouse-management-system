// import { History, X } from "lucide-react";

// type AssetHistoryModalProps = {
//   open: boolean;
//   onClose: () => void;
//   selectedAsset: any;
//   assetHistory: any[];
// };

// export default function AssetHistoryModal({
//   open,
//   onClose,
//   selectedAsset,
//   assetHistory
// }: AssetHistoryModalProps) {
//   if (!open || !selectedAsset) return null;

//   console.log(selectedAsset)
//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">

//         {/* HEADER */}
//         <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
//           <h3 className="font-bold text-gray-800 flex items-center gap-2">
//             <History className="h-5 w-5 text-blue-600" />
//             Asset History
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* ASSET INFO */}
//         <div className="p-4 bg-gray-50/50 border-b">
//           <div className="flex justify-between items-center">
//             <div>
//               <div className="text-xs text-gray-500 uppercase font-bold">
//                 Product
//               </div>
//               <div className="font-medium text-gray-900">
//                 {selectedAsset?.productType || "-"}
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-xs text-gray-500 uppercase font-bold">
//                 QR Code
//               </div>
//               <div className="font-mono">
//                 {selectedAsset?.qrCode || "-"}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* HISTORY LIST */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {assetHistory?.length === 0 ? (
//             <p className="text-center text-gray-400 py-8">
//               No history events found.
//             </p>
//           ) : (
//             assetHistory.map((event, idx) => (
//               <div
//                 key={idx}
//                 className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0 last:pb-0"
//               >
//                 <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-100 border-2 border-white ring-1 ring-blue-500"></div>

//                 <div className="text-sm font-bold text-gray-800 mb-1">
//                   {event?.type?.replace("_", " ")}
//                 </div>

//                 <div className="text-xs text-gray-500 mb-2">
//                   {new Date(event?.timestamp).toLocaleString()}
//                 </div>

//                 {event?.remarks && (
//                   <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-2">
//                     Note: {event.remarks}
//                   </div>
//                 )}

//                 {event?.type === "MOVED" && (
//                   <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 space-y-1">
//                     <div>
//                       <span className="font-semibold text-gray-500">
//                         From:
//                       </span>{" "}
//                       {event?.fromLocation?.warehouseName} /{" "}
//                       {event?.fromLocation?.sectionName} /{" "}
//                       {event?.fromLocation?.trayName}
//                     </div>
//                     <div>
//                       <span className="font-semibold text-green-600">
//                         To:
//                       </span>{" "}
//                       {event?.toLocation?.warehouseName} /{" "}
//                       {event?.toLocation?.sectionName} /{" "}
//                       {event?.toLocation?.trayName}
//                     </div>
//                   </div>
//                 )}

//                 {event?.type === "RECEIVED" && (
//                   <div className="bg-green-50 p-2 rounded text-xs text-green-800">
//                     Added to: {event?.toLocation?.warehouseName} /{" "}
//                     {event?.toLocation?.trayName}
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { History, X, Download } from "lucide-react";

type AssetHistoryModalProps = {
    open: boolean;
    onClose: () => void;
    selectedAsset: any;
    selectedTray: any;
};

export default function AssetHistoryModal({
    open,
    onClose,
    selectedAsset,
    selectedTray,
}: AssetHistoryModalProps) {
    const [assetHistory, setAssetHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    console.log(selectedAsset)

    console.log(selectedTray)

    // cons trayId=
    /* ================= FETCH HISTORY API ================= */
    const fetchHistory = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${baseUrl.productInventoryLogs}/product/${selectedAsset.id}/division/${selectedTray?.id}`
            );
            const logs = res?.data?.data?.logs || [];

            // 🔥 Normalize API → UI format
            const formatted = logs?.map((log: any) => ({
                type: log?.action_type === "add" ? "RECEIVED" : "MOVED",
                timestamp: log?.created_at,
                remarks: log?.description,
                userName: log?.user_name,
                stockChange: log?.stock_change,

                fromLocation: log?.previous_hub_name
                    ? {
                        warehouseName: log?.previous_hub_name,
                        sectionName: log?.previous_division_name,
                        trayName: log?.previous_tray_name,
                    }
                    : null,

                toLocation: {
                    warehouseName: log?.hub_name,
                    sectionName: log?.division_name,
                    trayName: log?.tray_name,
                },
            }));

            setAssetHistory(formatted);
        } catch (err) {
            console.error("History API error", err);
            setAssetHistory([]);
        } finally {
            setLoading(false);
        }
    };


    /* ================= CALL API WHEN MODAL OPENS ================= */
    useEffect(() => {
        if (selectedAsset?.id && selectedTray?.id) {
            fetchHistory();
        }
    }, [selectedAsset?.id, selectedTray?.id]);

    if (!open || !selectedAsset) return null;

    const exportHistoryExcel = () => {
        if (!assetHistory.length) return;

        const rows = assetHistory.map((e: any, i: number) => ({
            "S.No": i + 1,
            "Date & Time": new Date(e.timestamp).toLocaleString(),
            "Action": e.type,
            "Stock Change": e.stockChange || 0,
            "From Hub": e.fromLocation?.warehouseName || "-",
            "From Division": e.fromLocation?.sectionName || "-",
            "From Tray": e.fromLocation?.trayName || "-",
            "To Hub": e.toLocation?.warehouseName || "-",
            "To Division": e.toLocation?.sectionName || "-",
            "To Tray": e.toLocation?.trayName || "-",
            "User": e.userName || "-",
            "Remarks": e.remarks || "-",
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Asset History");

        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
            new Blob([buffer]),
            `${selectedAsset?.name || "Asset"}_History.xlsx`
        );
    };



    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">


                {/* ===== HEADER ===== */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Asset History</h2>
                            <p className="text-xs opacity-80">
                                {selectedAsset?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportHistoryExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50"
                        >
                            <Download size={16} />
                            Export Excel
                        </button>

                        <button
                            onClick={onClose}
                            className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                        >
                            <X />
                        </button>
                    </div>
                </div>


                {/* ===== ASSET INFO ===== */}
                <div className="px-6 py-3 bg-gray-50 border-b text-sm">
                    <div className="flex justify-between">
                        <div>
                            <div className="text-xs text-gray-500">Product</div>
                            <div className="font-semibold">
                                {selectedAsset?.name}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Barcode</div>
                            <div className="font-mono">
                                {selectedAsset?.brand_name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== TABLE ===== */}
                <div className="flex-1 overflow-auto bg-white p-5 ">
                    {loading ? (
                        <div className="py-16 text-center text-gray-400 font-medium">
                            Loading asset history…
                        </div>
                    ) : assetHistory.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 font-medium">
                            No history records found
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            {/* sticky top-0 */}
                            <thead className=" bg-gray-100 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left">#</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3">From</th>
                                    <th className="px-4 py-3">To</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Remarks</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {assetHistory.map((e: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">
                                            {i + 1}
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(e.timestamp).toLocaleString()}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${e.type === "RECEIVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {e.type}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`font-bold ${e.type === "RECEIVED"
                                                    ? "text-green-700"
                                                    : "text-blue-700"
                                                    }`}
                                            >
                                                {e.stockChange}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {e.fromLocation
                                                ? `${e.fromLocation.warehouseName} / ${e.fromLocation.sectionName}`
                                                : "-"}
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {`${e.toLocation.warehouseName} / ${e.toLocation.sectionName}`}
                                        </td>

                                        <td className="px-4 py-3 font-medium">
                                            {e.userName || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {e.remarks || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>



            </div>
        </div>
    );
}

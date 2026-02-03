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



import { History, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";

type AssetHistoryModalProps = {
    open: boolean;
    onClose: () => void;
    selectedAsset: any;
};

export default function AssetHistoryModal({
    open,
    onClose,
    selectedAsset,
}: AssetHistoryModalProps) {
    const [assetHistory, setAssetHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);



    /* ================= FETCH HISTORY API ================= */
    const fetchHistory = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${baseUrl.productInventoryLogs}/product/${selectedAsset.product_id}/tray/${selectedAsset.tray_id}`
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
        if (selectedAsset?.product_id && selectedAsset?.tray_id) {
            fetchHistory();
        }
    }, [selectedAsset?.product_id, selectedAsset?.tray_id]);

    if (!open || !selectedAsset) return null;


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">

                {/* HEADER */}
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600" />
                        Asset History
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* ASSET INFO */}
                <div className="p-4 bg-gray-50/50 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">
                                Product
                            </div>
                            <div className="font-medium text-gray-900">
                                {selectedAsset?.products?.title || "-"}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-bold">
                                QR Code
                            </div>
                            <div className="font-mono">
                                {selectedAsset?.products?.barcode_value || "-"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HISTORY LIST */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">
                            Loading history...
                        </p>
                    ) : assetHistory.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">
                            No history events found.
                        </p>
                    ) : (
                        assetHistory?.map((event, idx) => (
                            <div
                                key={idx}
                                className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0"
                            >
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-100 border-2 border-white ring-1 ring-blue-500"></div>

                                <div className="text-sm font-bold text-gray-800 mb-1">
                                    {event?.type}
                                </div>

                                <div className="text-xs text-gray-500 mb-2">
                                    {new Date(event?.timestamp).toLocaleString()}
                                    {event?.userName && ` • by ${event?.userName}`}
                                </div>

                                {event?.stockChange && (
                                    <div className="text-xs font-semibold text-blue-600 mb-2">
                                        Stock change: +{event?.stockChange}
                                    </div>
                                )}

                                {event?.remarks && (
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-2">
                                        Note: {event?.remarks}
                                    </div>
                                )}

                                {event?.type === "MOVED" && (
                                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                                        <div>
                                            <span className="font-semibold">From:</span>{" "}
                                            {event?.fromLocation?.warehouseName} /{" "}
                                            {event?.fromLocation?.sectionName} /{" "}
                                            {event?.fromLocation?.trayName}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-green-600">
                                                To:
                                            </span>{" "}
                                            {event?.toLocation?.warehouseName} /{" "}
                                            {event?.toLocation?.sectionName} /{" "}
                                            {event?.toLocation?.trayName}
                                        </div>
                                    </div>
                                )}

                                {event?.type === "RECEIVED" && (
                                    <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                                        Added to: {event?.toLocation?.warehouseName} /{" "}
                                        {event?.toLocation?.trayName}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

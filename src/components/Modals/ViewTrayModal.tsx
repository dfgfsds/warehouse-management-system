import axios from "axios";
import { X, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import EditTrayModal from "./EditTrayModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
// import EditTrayModal from "./EditTrayModal";
// import DeleteConfirmModal from "./DeleteConfirmModal";

type Tray = {
    id: string;
    division_name: string;
    division_code: string;
    capacity: string;
    description: string;
    address: string;
};

export default function ViewTrayModal({
    open,
    data,
    onClose,
}: {
    open: boolean;
    data: any;
    onClose: () => void;
}) {
    if (!open) return null;

    const [traysData, setTraysData] = useState<any>(null);
    const [editTray, setEditTray] = useState<Tray | null>(null);
    const [deleteTray, setDeleteTray] = useState<Tray | null>(null);
    const [loading, setLoading] = useState(false);

    const trays: Tray[] = traysData?.children || [];

    // 🔹 delete
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<any>(null);

    /* ================= FETCH ================= */
    const getDivision = async () => {
        setLoading(true)
        try {
            const res = await axios.get(
                `${baseUrl.divisions}/${data?.id}/hierarchy`
            );
            if (res) {
                setLoading(false)
                setTraysData(res.data.data.division);
            }
        } catch (error) {

        }

    };

    useEffect(() => {
        getDivision();
    }, []);

    const handleDelete = async () => {
        try {
            await axios.delete(
                `${baseUrl.divisions}/${deleteItem?.id}`
            );
            setConfirmOpen(false);
            setDeleteItem(null);
            getDivision();
        } catch (error) {
            console.log(error);
        }
    };



    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">

                    {/* HEADER */}
                    <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white flex justify-between">
                        <div>
                            <h2 className="text-xl font-semibold capitalize">
                                {data?.division_name}
                            </h2>
                            <p className="text-sm text-gray-600">
                                Code: {data?.division_code} • Capacity: {data?.capacity}
                            </p>
                        </div>
                        <button onClick={onClose}>
                            <X />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="p-6 overflow-y-auto bg-gray-50">

                        {/* 🔹 LOADING */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
                                Loading trays...
                            </div>
                        )}

                        {/* 🔹 EMPTY STATE */}
                        {!loading && trays.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <div className="text-4xl mb-3">📦</div>
                                <p className="text-sm font-medium">
                                    No trays found for this division
                                </p>
                                <p className="text-xs mt-1">
                                    Please add trays to see them here
                                </p>
                            </div>
                        )}

                        {/* 🔹 TABLE */}
                        {!loading && trays.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border bg-white">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">Tray Name</th>
                                            <th className="px-4 py-3">Code</th>
                                            <th className="px-4 py-3">Capacity</th>
                                            <th className="px-4 py-3">Address</th>
                                            <th className="px-4 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {trays.map((tray, i) => (
                                            <tr key={tray.id} className="hover:bg-blue-50">
                                                <td className="px-4 py-3">{i + 1}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {tray.division_name}
                                                </td>
                                                <td className="px-4 py-3 font-mono">
                                                    {tray.division_code}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {tray.capacity}
                                                </td>
                                                <td className="px-4 py-3 truncate max-w-xs">
                                                    {tray.address || "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setEditTray(tray)}
                                                            className="p-2 bg-blue-50 rounded hover:bg-blue-100"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteItem(tray);
                                                                setConfirmOpen(true);
                                                            }}
                                                            className="p-2 bg-red-50 rounded hover:bg-red-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>


                    {/* FOOTER */}
                    <div className="p-4 border-t flex justify-end">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editTray && (
                <EditTrayModal
                    tray={editTray}
                    onClose={() => setEditTray(null)}
                    onSuccess={() => {
                        setEditTray(null);
                        getDivision();
                    }}
                />
            )}

            {/* DELETE MODAL */}
            <DeleteConfirmModal
                open={confirmOpen}
                title="Delete Product Unit"
                description={`Are you sure you want to delete "${deleteItem?.product?.title}"?`}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}

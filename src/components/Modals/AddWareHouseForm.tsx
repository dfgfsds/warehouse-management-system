import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function AddWarehouseModal({
    open,
    onCancel,
    editWarehouse,
    getWarehouses,
}: any) {
    if (!open) return null;

    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState("");
    const { user }: any = useAuth();
    const [formData, setFormData] = useState({
        type: "hub",        // vendor | hub
        parent_id: user?.vendor_id,
        title: "",
        description: "",
        lat: "",
        log: "",
        address: "",
        code:""
    });

    // 🔹 Edit mode
    useEffect(() => {
        if (editWarehouse) {
            setFormData({
                type: editWarehouse?.type || "hub",
                parent_id: editWarehouse?.parentId || "",
                title: editWarehouse?.title || "",
                description: editWarehouse?.description || "",
                lat: editWarehouse?.lat || "",
                log: editWarehouse?.log || "",
                address: editWarehouse?.address || "",
                code:editWarehouse?.code || "",
            });
        }
    }, [editWarehouse]);

    // 🔹 Submit (Create / Update)
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setApiErrors("");

            if (editWarehouse) {
                // UPDATE
                await axios.put(
                    `${baseUrl.vendors}/${editWarehouse.id}`,
                    formData
                );
            } else {
                // CREATE
                await axios.post(baseUrl.vendors, formData);
            }
            getWarehouses();
            onCancel();
        } catch (error: any) {
            let message = "Something went wrong";
            const data = error?.response?.data;

            if (data?.errors && typeof data.errors === "object") {
                const [field, value]: any = Object.entries(data.errors)[0] || [];
                message = `${field}: ${Array.isArray(value) ? value[0] : value}`;
            } else if (data?.message) {
                message = data.message;
            }

            setApiErrors(message);
            return error?.response;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-y-auto max-h-[90vh] scrollbar-hide">

                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {editWarehouse ? "Edit Warehouse" : "Add Warehouse"}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 gap-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

   {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Code
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) =>
                                setFormData({ ...formData, code: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                    </div>

                    {/* Latitude */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                        </label>
                        <input
                            type="text"
                            value={formData.lat}
                            onChange={(e) =>
                                setFormData({ ...formData, lat: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Longitude */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                        </label>
                        <input
                            type="text"
                            value={formData.log}
                            onChange={(e) =>
                                setFormData({ ...formData, log: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                    </div>
                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 text-sm px-6 text-end p-1">
                        {apiErrors}
                    </p>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {loading ? "Saving..." : editWarehouse ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

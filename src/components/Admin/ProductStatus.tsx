import axios from "axios";
import { useEffect, useState } from "react";
import {
    PlusCircle,
    Edit,
    Trash2,
    Package,
    Search,
    X,
} from "lucide-react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import { useAuth } from "../../hooks/useAuth";

export default function ProductStatus() {
    const { user }: any = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    console.log(data)
    // 🔹 form modal
    const [showFormModal, setShowFormModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        vendor_id: user?.vendor_id,
        name: "",
        type: "product",
    });

    // 🔹 delete
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<any>(null);

    // =========================
    // GET
    // =========================
    const getStatuses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(baseUrl.productStatus);
            setData(res?.data?.data?.statuses || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStatuses();
    }, []);

    // =========================
    // RESET FORM
    // =========================
    const resetForm = () => {
        setFormData({ id: "", name: "", vendor_id: "", type: "product", });
        setIsEditing(false);
        setApiErrors("");
    };

    // =========================
    // CREATE / UPDATE
    // =========================
    const submit = async () => {
        try {
            setFormLoading(true);
            setApiErrors("");

            if (!formData.name.trim()) {
                setApiErrors("Name is required");
                return;
            }

            if (isEditing) {
                await axios.put(
                    `${baseUrl.productStatus}/${formData.id}`,
                    { name: formData.name }
                );
            } else {
                await axios.post(baseUrl.productStatus, {
                    name: formData.name,
                    vendor_id: user?.vendor_id,
                    type: "product",
                });
            }

            resetForm();
            setShowFormModal(false);
            getStatuses();
        } catch (error: any) {
            let message = "Something went wrong";
            const data = error?.response?.data;

            if (data?.errors) {
                const [_, value]: any = Object.entries(data.errors)[0] || [];
                message = Array.isArray(value) ? value[0] : value;
            } else if (data?.message) {
                message = data.message;
            }

            setApiErrors(message);
        } finally {
            setFormLoading(false);
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async () => {
        try {
            await axios.delete(
                `${baseUrl.productStatus}/${deleteItem.id}`
            );
            setConfirmOpen(false);
            setDeleteItem(null);
            getStatuses();
        } catch (error) {
            console.log(error);
        }
    };

    // =========================
    // FILTER
    // =========================
    const filteredData = data.filter((item: any) =>
        item?.name?.toLowerCase().includes(search.toLowerCase())
    );

    // =========================
    // LOADER
    // =========================
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                    Loading product status...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="p-2 space-y-6">
                {/* Header */}
                {/* <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Product Status
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowFormModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                        <PlusCircle size={18} />
                        Add Status
                    </button>
                </div> */}

                <div className="flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">Product Status</h2>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowFormModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle size={18} />
                        <span>Add Status</span>
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search status"
                            className="pl-10 pr-3 py-2 border rounded-lg w-full"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {filteredData.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 font-medium capitalize">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleString()
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 flex gap-4">
                                            <button
                                                onClick={() => {
                                                    setFormData({
                                                        id: item.id,
                                                        name: item.name,
                                                        vendor_id: item?.vendor_id,
                                                        type: item?.type
                                                    });
                                                    setIsEditing(true);
                                                    setShowFormModal(true);
                                                }}
                                                className="text-blue-600 flex gap-1"
                                            >
                                                <Edit size={16} /> Edit
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No product status found
                        </div>
                    )}
                </div>
            </div>

            {/* ================= FORM MODAL ================= */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        {/* Header */}
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {isEditing ? "Edit Product Status" : "Add Product Status"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowFormModal(false);
                                    resetForm();
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Status Name
                                </label>
                                <input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Enter status name"
                                />
                            </div>

                            {apiErrors && (
                                <p className="text-red-500 text-sm">{apiErrors}</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowFormModal(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={submit}
                                disabled={formLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                {formLoading
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update"
                                        : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELETE CONFIRM ================= */}
            <DeleteConfirmModal
                open={confirmOpen}
                title="Delete Product Status"
                description={`Are you sure you want to delete "${deleteItem?.name}"?`}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}

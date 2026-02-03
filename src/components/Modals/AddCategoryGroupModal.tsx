import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function AddCategoryGroupModal({
    open,
    onCancel,
    editData,
    getCategoryGroups,
}: any) {
    if (!open) return null;

    const { user }: any = useAuth();
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        vendor_id: user?.vendor_id,
        sortOrder: 0,
        type: "nav",
        category_id: "",
        is_active: true,
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                title: editData?.title || "",
                description: editData?.description || "",
                vendor_id:
                    editData?.vendor_id || user?.vendor_id,
                sortOrder: editData?.sortOrder || 0,
                type: editData?.type || "nav",
                category_id: editData?.category_id || "",
                is_active:
                    editData?.is_active ?? true,
            });
        }
    }, [editData, user]);

    // 🔹 GET categories
    const getCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(baseUrl.categories);
            setCategoryData(res?.data?.categories || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    // 🔹 Submit (Create / Update)
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setApiErrors("");
            if (editData) {
                // UPDATE
                const updateApi = await axios.put(
                    `${baseUrl.categoryGroups}/${editData.id}`,
                    formData
                );
                if (updateApi) {
                    getCategoryGroups();
                    onCancel();
                }
            } else {
                // CREATE
                const updateApi = await axios.post(baseUrl.categoryGroups, formData);
                if (updateApi) {
                    getCategoryGroups();
                    onCancel();
                }
            }
        } catch (error: any) {
            let message = "Something went wrong";
            const data = error?.response?.data;

            if (data?.errors && typeof data.errors === "object") {
                const [field, value] = Object.entries(data.errors)[0] || [];
                message = `${field}: ${Array.isArray(value) ? value[0] : value
                    }`;
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
                        {editData
                            ? "Edit Category Group"
                            : "Add Category Group"}
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={formData.category_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category_id: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Select Category</option>
                            {categoryData?.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="nav">Nav</option>
                            <option value="homepage">Homepage</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort Order
                        </label>
                        <input
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sortOrder: Number(e.target.value),
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_active: e.target.checked,
                                })
                            }
                        />
                        <span className="text-sm text-gray-700">
                            Is Active
                        </span>
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
                        {loading
                            ? "Saving..."
                            : editData
                                ? "Update"
                                : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

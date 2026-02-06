import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function AddCategoryModal({
    open,
    onCancel,
    editCategory,
    getCategories,
}: any) {
    if (!open) return null;

    const { user }: any = useAuth();
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        short_description: "",
        detailed_description: "",
        vendor_id: user?.vendor_id,
        parent_id: user?.vendor_id,
        type: "product",
    });

    // 🔹 Edit mode set values
    useEffect(() => {
        if (editCategory) {
            setFormData({
                title: editCategory?.title || "",
                description: editCategory?.description || "",
                short_description: editCategory?.short_description || "",
                detailed_description: editCategory?.detailed_description || "",
                vendor_id: editCategory?.vendor_id || user?.vendor_id,
                parent_id: editCategory?.parent_id || user?.vendor_id,
                type: editCategory?.type || "product",
            });
        }
    }, [editCategory, user]);

    // 🔹 Submit (Create / Update)
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setApiErrors("");

            if (editCategory) {
                // UPDATE
                await axios.put(
                    `${baseUrl.categories}/${editCategory.id}`,
                    formData
                );
            } else {
                // CREATE
                await axios.post(baseUrl.categories, formData);
            }

            getCategories();
            onCancel();
        } catch (error: any) {
            let message = "Something went wrong";

            const data = error?.response?.data;

            if (data?.errors && typeof data.errors === "object") {
                // 👉 pick first field error
                const [field, value] = Object.entries(data.errors)[0] || [];
                message = Array.isArray(value) ? value[0] : String(value);

                // optional: field name venumna
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
                        {editCategory ? "Edit Category" : "Add Category"}
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

                    {/* Short Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description
                        </label>
                        <textarea
                            rows={2}
                            value={formData.short_description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    short_description: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
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

                    {/* Detailed Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Detailed Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.detailed_description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    detailed_description: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                    </div>
                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 text-sm px-6 text-end p-1">{apiErrors}</p>
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
                            : editCategory
                                ? "Update"
                                : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

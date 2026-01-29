import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function AddProductTypeModal({
    open,
    onCancel,
    editData,
    refresh,
}: any) {
    if (!open) return null;

    const { user }: any = useAuth();
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState("");
    const [categoryData, setCategoryData] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        code: "",
        category_id: "",
        name: "",
        vendor_id: user?.vendor_id,
    });

    // ================= EDIT MODE =================
    useEffect(() => {
        if (editData) {
            setFormData({
                code: editData.code || "",
                category_id: editData.category_id || "",
                name: editData.name || "",
                vendor_id: editData.vendor_id || user?.vendor_id,
            });
        }
    }, [editData, user]);


    // 🔹 GET categories
    const getCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(baseUrl.categories);
            setCategoryData(res?.data?.data?.categories || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);


    // ================= SUBMIT =================
    const submit = async () => {
        try {
            setLoading(true);
            setApiErrors("");

            if (!formData.code || !formData?.category_id || !formData.name) {
                setApiErrors("All fields are required");
                return;
            }

            if (editData) {
                await axios.put(
                    `${baseUrl.productTypes}/${editData.id}`,
                    formData
                );
            } else {
                await axios.post(baseUrl.productTypes, formData);
            }

            refresh();
            onCancel();
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
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
                {/* Header */}
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">
                        {editData ? "Edit Product Type" : "Add Product Type"}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Code</label>
                        <input
                            value={formData.code}
                            onChange={(e) =>
                                setFormData({ ...formData, code: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
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


                </div>

                {apiErrors && (
                    <p className="text-red-500 text-sm px-6">{apiErrors}</p>
                )}

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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

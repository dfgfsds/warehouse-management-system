import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function BrandForm({
    open,
    onCancel,
    editBrand,
    getBrands,
}: any) {
    if (!open) return null;

    const { user }: any = useAuth();

    const [formData, setFormData] = useState({
        brand_name: "",
        logo_file: "",
        description: "",
        sub_description: "",
        vendor_id: user?.vendor_id
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>(""); // existing image
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    // 🔁 Edit mode prefill
    useEffect(() => {
        if (editBrand) {
            setFormData({
                brand_name: editBrand.brand_name || "",
                logo_file: editBrand?.logo_media || "",
                description: editBrand.description || "",
                sub_description: editBrand.sub_description || "",
                vendor_id: user?.vendor_id

            });
            setLogoPreview(editBrand?.logo_media?.file_path || "");
        }
    }, [editBrand]);

    // 🚀 Submit
    const submit = async () => {
        try {
            setLoading(true);
            setApiErrors("");

            // 🟢 brand payload (WITHOUT logo id)
            const payload = {
                brand_name: formData.brand_name,
                description: formData.description,
                sub_description: formData.sub_description,
                vendor_id: user?.vendor_id

            };

            // ✅ FormData
            const formDatas = new FormData();

            // 🔑 brand JSON
            formDatas.append("brand_data", JSON.stringify(payload));

            // 🔑 logo file directly
            if (logoFile) {
                formDatas.append("logo_file", logoFile);
            }

            let res;
            if (editBrand) {
                res = await axios.put(
                    `${baseUrl.brands}/${editBrand.id}`,
                    formDatas,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            } else {
                res = await axios.post(
                    baseUrl.brands,
                    formDatas,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            if (res?.status === 200 || res?.status === 201) {
                getBrands && getBrands();
                onCancel();
            }

        } catch (error: any) {
            const err =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong";

            if (typeof err === "object") {
                const [_, value] = Object.entries(err)[0] || [];
                setApiErrors(Array.isArray(value) ? value[0] : value);
            } else {
                setApiErrors(err);
            }
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
                        {editBrand ? "Edit Brand" : "Add Brand"}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-1 gap-4">

                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand Name
                        </label>
                        <input
                            type="text"
                            value={formData.brand_name}
                            onChange={(e) =>
                                setFormData({ ...formData, brand_name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand Logo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e: any) => {
                                const file = e.target.files?.[0];
                                if (file) setLogoFile(file);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {logoPreview && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Logo Preview</p>
                            <img
                                src={logoPreview}
                                alt="Brand Logo"
                                className="h-20 w-20 object-contain border rounded"
                            />
                        </div>
                    )}


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
                            placeholder="Enter description"
                        />
                    </div>


                    {/* Sub Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sub Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.sub_description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sub_description: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                            placeholder="Enter sub description"
                        />
                    </div>

                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end px-6">
                        {apiErrors}
                    </p>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

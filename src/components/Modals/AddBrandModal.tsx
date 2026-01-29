import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";

export default function BrandForm({
    open,
    onCancel,
    editBrand,
    getBrands,
}: any) {
    if (!open) return null;

    const [formData, setFormData] = useState({
        brand_name: "",
        logo_media_id: "",
        description: "",
        sub_description: "",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    // 🔁 Edit mode prefill
    useEffect(() => {
        if (editBrand) {
            setFormData({
                brand_name: editBrand.brand_name || "",
                logo_media_id: editBrand.logo_media_id || "",
                description: editBrand.description || "",
                sub_description: editBrand.sub_description || "",
            });
        }
    }, [editBrand]);

    // 🚀 Submit
    const submit = async () => {
        try {
            setLoading(true);
            setApiErrors("");
            let logoMediaId = formData.logo_media_id;
            // 🟢 Step 1: upload logo if file selected
            if (logoFile) {
                const fd = new FormData();
                fd.append("file", logoFile);

                const uploadRes = await axios.post(
                    baseUrl.uploadMedia,
                    fd,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                logoMediaId = uploadRes.data?.id;
            }
            // 🟢 Step 2: payload
            const payload = {
                brand_name: formData.brand_name,
                logo_media_id: logoMediaId,
                description: formData.description,
                sub_description: formData.sub_description,
            };
            // 🟢 Step 3: create / update
            let res;
            if (editBrand) {
                res = await axios.put(
                    `${baseUrl.brands}/${editBrand.id}`,
                    payload
                );
            } else {
                res = await axios.post(baseUrl.brands, payload);
            }

            // 🟢 Success
            if (res?.status === 200 || res?.status === 201) {
                getBrands && getBrands();
                onCancel();
            }

            return res;
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

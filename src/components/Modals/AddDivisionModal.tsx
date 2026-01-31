import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function AddDivisionModal({
    open,
    onCancel,
    editDivision,
    getDivisions,
    divisionData,
}: any) {
    if (!open) return null;
    const { user }: any = useAuth();
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [hubsData, setHubsData] = useState([]);

    const [formData, setFormData] = useState({
        vendor_id: user?.vendor_id,
        hub_id: "",
        // division_title: "",
        division_name: "",
        capacity: '',
        division_code: '',
        division_type: "rack",
        // title: "",
        description: "",
        latitude: "",
        longitude: "",
        address: "",
    });


    // 🔹 GET Hubs
    const getHubs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseUrl?.vendors}/${user?.vendor_id}/hubs`);
            if (res) {
                setHubsData(res?.data?.data?.hubs || []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getHubs();
    }, []);


    // 🔁 Edit mode prefill
    useEffect(() => {
        if (editDivision) {
            setFormData({
                vendor_id: editDivision?.vendor_id || "",
                hub_id: editDivision?.hub_id || "",
                // division_title: editDivision?.division?.division_title || "",
                division_code: editDivision?.division_code || "",
                division_name: editDivision?.division_name || "",
                division_type: editDivision?.division_type || "tray",
                capacity: editDivision?.capacity || "tray",
                // title: editDivision?.division?.title || "",
                description: editDivision?.description || "",
                latitude: editDivision?.latitude || "",
                longitude: editDivision?.longitude || "",
                address: editDivision?.address || "",
            });
        }
    }, [editDivision]);

    // 🚀 Submit (Create + Edit)
    const submit = async () => {
        try {
            setLoading(true);
            setApiErrors("");

            const payload = {
                ...formData,
                vendor_id: String(formData.vendor_id),
                // parent_id: formData.parent_id || null,
            };

            let res;
            if (editDivision) {
                // ✏️ Edit
                res = await axios.put(
                    `${baseUrl?.divisions}/${editDivision?.id}`,
                    payload
                );
            } else {
                // ➕ Create
                res = await axios.post(baseUrl?.divisions, payload);
            }

            if (res?.status === 200 || res?.status === 201) {
                getDivisions && getDivisions();
                onCancel();
            }

            return res;
        } catch (error: any) {
            let message = "Something went wrong";
            const data = error?.response?.data?.data;
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
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {editDivision ? "Edit Division" : "Add Division"}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto max-h-[65vh] scrollbar-hide">

                    {/* Title */}
                    {/* <div>
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
                    </div> */}




                    {/* Division Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Division Name
                        </label>
                        <input
                            type="text"
                            value={formData.division_name}
                            onChange={(e) =>
                                setFormData({ ...formData, division_name: e.target.value })
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
                            value={formData.division_code}
                            onChange={(e) =>
                                setFormData({ ...formData, division_code: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Division Capacity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity
                        </label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({ ...formData, capacity: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Division Type */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Division Type
                        </label>
                        <select
                            value={formData.division_type}
                            onChange={(e) =>
                                setFormData({ ...formData, division_type: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="tray">tray</option>
                            <option value="rack ">Rack </option>
                        </select>
                    </div> */}

                    {/* Hubs ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hubs
                        </label>
                        <select
                            value={formData.hub_id}
                            onChange={(e) =>
                                setFormData({ ...formData, hub_id: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Select Hub</option>
                            {hubsData?.map((item: any) => (
                                <option value={item?.id}>{item?.title}</option>
                            ))}

                        </select>
                    </div>



                    {/* Description */}
                    <div className="lg:col-span-2">
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
                            type="number"
                            value={formData.latitude}
                            onChange={(e) =>
                                setFormData({ ...formData, latitude: e.target.value })
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
                            type="number"
                            value={formData.longitude}
                            onChange={(e) =>
                                setFormData({ ...formData, longitude: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Address */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            rows={2}
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
                    <p className="text-red-500 text-sm px-6 mt-2 text-right">
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
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        {loading ? "Submitting..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

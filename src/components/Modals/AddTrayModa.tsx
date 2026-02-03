import axios from "axios";
import { X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

/* ================= TYPES ================= */
type Division = {
    division_name: string;
    division_code: string;
    capacity: string;
    description: string;
    latitude: string;
    longitude: string;
    address: string;
};

const emptyDivision: Division = {
    division_name: "",
    division_code: "",
    capacity: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
};

export default function AddTrayModal({
    open,
    onClose,
    // onSave,
    divisionModalData,
    reload,
    editTrayData,
}: {
    open: any;
    onClose: () => void;
    // onSave: (data: any) => void;
    divisionModalData: any;
    reload: any;
    editTrayData: any;
}) {
    if (!open) return null;
    const { user }: any = useAuth();
    const [apiErrors, setApiErrors] = useState<string>("");
    const [divisions, setDivisions] = useState<Division[]>([
        { ...emptyDivision },
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editTrayData) {
            setDivisions([
                {
                    division_name: editTrayData?.name || "",
                    division_code: editTrayData?.code || "",
                    capacity: editTrayData?.capacity || "",
                    description: editTrayData?.description || "",
                    latitude: editTrayData?.latitude || "",
                    longitude: editTrayData?.longitude || "",
                    address: editTrayData?.address || "",
                },
            ]);
        }
    }, [editTrayData]);

    /* ================= HANDLERS ================= */
    const handleChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const updated = [...divisions];
        updated[index] = { ...updated[index], [name]: value };
        setDivisions(updated);
    };

    const addDivision = () => {
        setDivisions([...divisions, { ...emptyDivision }]);
    };

    const removeDivision = (index: number) => {
        if (divisions.length === 1) return;
        setDivisions(divisions.filter((_, i) => i !== index));
    };

    console.log(editTrayData)
    // const handleSubmit = async () => {
    //     setLoading(true);
    //     setApiErrors("");
    //     try {
    //         const payload = {
    //             vendor_id: user?.vendor_id,
    //             hub_id: divisionModalData?.hub_id,
    //             parent_id: divisionModalData?.id,
    //             division_type: "tray",
    //             divisions: divisions.map((d) => ({
    //                 division_name: d.division_name,
    //                 division_code: d.division_code,
    //                 capacity: d.capacity,
    //                 description: d.description,
    //                 latitude: Number(d.latitude) || 0,
    //                 longitude: Number(d.longitude) || 0,
    //                 address: d.address,
    //             })),
    //         };
    //         const editData={
    //              division_name: editTrayData?.name,
    //                 division_code: editTrayData?.code,
    //                 capacity: editTrayData?.capacity,
    //                 description: editTrayData?.description,
    //                 latitude: Number(editTrayData?.latitude) || 0,
    //                 longitude: Number(editTrayData?.longitude) || 0,
    //                 address: editTrayData?.address,
    //         }
    //         if (editTrayData) {
    //             const updatedApi = await axios.put(`${baseUrl?.divisions}/${editTrayData.id}`, editData)
    //             if (updatedApi) {
    //                 reload();
    //                 onClose();
    //             }
    //         } else {
    //             const updatedApi = await axios.post(baseUrl?.divisionsBulk, payload)
    //             if (updatedApi) {
    //                 reload();
    //                 onClose();
    //             }
    //         }

    //         // onSave(payload);
    //     } catch (error: any) {
    //         let message = "Something went wrong";
    //         const data = error?.response?.data?.data;
    //         if (data?.errors && typeof data.errors === "object") {
    //             const [field, value] = Object.entries(data.errors)[0] || [];
    //             message = `${field}: ${Array.isArray(value) ? value[0] : value
    //                 }`;
    //         } else if (data?.message) {
    //             message = data.message;
    //         }

    //         setApiErrors(message);
    //         return error?.response;
    //     } finally {
    //         setLoading(false);
    //     }

    // };


    const handleSubmit = async () => {
  setLoading(true);
  setApiErrors("");

  try {
    if (editTrayData) {
      // ✅ TAKE DATA FROM FORM STATE
      const d = divisions[0];

      const editPayload = {
        division_name: d.division_name,
        division_code: d.division_code,
        capacity: d.capacity,
        description: d.description,
        latitude: Number(d.latitude) || 0,
        longitude: Number(d.longitude) || 0,
        address: d.address,
      };

      const updatedApi = await axios.put(
        `${baseUrl.divisions}/${editTrayData.id}`,
        editPayload
      );

      if (updatedApi) {
        reload();
        onClose();
      }
    } else {
      // 🟢 POST BULK (UNCHANGED)
      const payload = {
        vendor_id: user?.vendor_id,
        hub_id: divisionModalData?.hub_id,
        parent_id: divisionModalData?.id,
        division_type: "tray",
        divisions: divisions.map((d) => ({
          division_name: d.division_name,
          division_code: d.division_code,
          capacity: d.capacity,
          description: d.description,
          latitude: Number(d.latitude) || 0,
          longitude: Number(d.longitude) || 0,
          address: d.address,
        })),
      };

      const updatedApi = await axios.post(
        baseUrl?.divisionsBulk,
        payload
      );

      if (updatedApi) {
        reload();
        onClose();
      }
    }
  } catch (error: any) {
    let message = "Something went wrong";
    const data = error?.response?.data?.data;

    if (data?.errors && typeof data.errors === "object") {
      const [field, value] = Object.entries(data.errors)[0] || [];
      message = `${field}: ${Array.isArray(value) ? value[0] : value}`;
    } else if (data?.message) {
      message = data.message;
    }

    setApiErrors(message);
  } finally {
    setLoading(false);
  }
};


    /* ================= UI ================= */
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Add Trays
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-5 overflow-y-auto space-y-6">
                    {divisions.map((division, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4 relative"
                        >
                            {/* REMOVE */}
                            {divisions.length > 1 && (
                                <button
                                    onClick={() => removeDivision(index)}
                                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}

                            {/* Tray Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tray Name
                                </label>
                                <input
                                    name="division_name"
                                    value={division.division_name}
                                    onChange={(e) => handleChange(index, e)}
                                    className="w-full border px-3 py-2 rounded-lg text-sm"
                                    placeholder="Tray name"
                                />
                            </div>

                            {/* Tray Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tray Code
                                </label>
                                <input
                                    name="division_code"
                                    value={division.division_code}
                                    onChange={(e) => handleChange(index, e)}
                                    className="w-full border px-3 py-2 rounded-lg text-sm font-mono"
                                    placeholder="T-A1"
                                />
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacity
                                </label>
                                <input
                                    name="capacity"
                                    value={division.capacity}
                                    onChange={(e) => handleChange(index, e)}
                                    className="w-full border px-3 py-2 rounded-lg text-sm"
                                    placeholder="100"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={division.description}
                                    onChange={(e) => handleChange(index, e)}
                                    className="w-full border px-3 py-2 rounded-lg text-sm"
                                    rows={2}
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    name="address"
                                    value={division.address}
                                    onChange={(e) => handleChange(index, e)}
                                    className="w-full border px-3 py-2 rounded-lg text-sm"
                                />
                            </div>

                            {/* Lat / Long */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="latitude"
                                    value={division.latitude}
                                    onChange={(e) => handleChange(index, e)}
                                    className="border px-3 py-2 rounded-lg text-sm"
                                    placeholder="Latitude"
                                />
                                <input
                                    name="longitude"
                                    value={division.longitude}
                                    onChange={(e) => handleChange(index, e)}
                                    className="border px-3 py-2 rounded-lg text-sm"
                                    placeholder="Longitude"
                                />
                            </div>
                        </div>
                    ))}

                    {/* ADD MORE */}{!editTrayData && (
                        <button
                            onClick={addDivision}
                            className="w-full border-2 border-dashed rounded-lg py-3 text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-50"
                        >
                            <Plus className="h-4 w-4" /> Add Another Tray
                        </button>
                    )}

                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 text-sm px-6 mt-2 text-right py-3">
                        {apiErrors}
                    </p>
                )}

                {/* FOOTER */}
                <div className="p-5 border-t flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Save Trays
                    </button>
                </div>
            </div>
        </div>
    );
}

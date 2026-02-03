import axios from "axios";
import { X } from "lucide-react";
import { useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";

export default function EditTrayModal({
  tray,
  onClose,
  onSuccess,
}: {
  tray: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState(tray);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.put(`${baseUrl.divisions}/${tray.id}`, {
        division_name: form.division_name,
        division_code: form.division_code,
        capacity: form.capacity,
        address: form.address,
        description: form.description,
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl flex flex-col">

        {/* ================= HEADER ================= */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Edit Tray
              {/* <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Update
              </span> */}
            </h2>
            <p className="text-sm text-gray-500">
              Modify tray details and save changes
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 bg-gray-50 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tray Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tray Name
              </label>
              <input
                value={form.division_name}
                onChange={(e) =>
                  setForm({ ...form, division_name: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Tray Name"
              />
            </div>

            {/* Tray Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tray Code
              </label>
              <input
                value={form.division_code}
                onChange={(e) =>
                  setForm({ ...form, division_code: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
                placeholder="T-A1"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Warehouse address"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

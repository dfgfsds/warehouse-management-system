import axios from "axios";
import { useEffect, useState } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Package,
  Search,
} from "lucide-react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import AddProductTypeModal from "../Modals/AddProductTypeModal";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import { useAuth } from "../../hooks/useAuth";

export default function ProductTypes() {
  const { user }: any = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  // ================= GET =================
  const getProductTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl?.productTypes}/by-vendor/${user?.vendor_id}`);
      setData(res?.data?.data?.product_types || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductTypes();
  }, []);

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${baseUrl?.productTypes}/${deleteItem.id}`
      );
      setConfirmOpen(false);
      setDeleteItem(null);
      getProductTypes();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SEARCH =================
  const filteredData = data?.filter((item: any) => {
    const s = search.toLowerCase();
    return (
      item?.name?.toLowerCase().includes(s) ||
      item?.code?.toLowerCase().includes(s) ||
      item?.category?.toLowerCase().includes(s)
    );
  });

  // ================= LOADER =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Loading product types...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Product Types</h2>
          <button
            onClick={() => {
              setEditData(null);
              setOpenModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} />
            <span>Add Warehouse</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name / code / category"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData?.map((productType) => (
            <div key={productType?.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 capitalize">{productType?.name}</h3>
                <button
                  onClick={() => {
                    setEditData(productType);
                    setOpenModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-1">Code: {productType?.code}</p>
              <p className="text-sm text-gray-600 mb-2">Category: {productType.category?.title}</p>
              <p className="text-xs text-gray-500">
                {productType?.isDismantleable ? 'Dismantleable' : 'Not dismantleable'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddProductTypeModal
        open={openModal}
        editData={editData}
        onCancel={() => setOpenModal(false)}
        refresh={getProductTypes}
      />

      {/* Delete Confirm */}
      <DeleteConfirmModal
        open={confirmOpen}
        title="Delete Product Type"
        description={`Are you sure you want to delete "${deleteItem?.name}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

import axios from "axios";
import { Edit, Package, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import AddCategoryGroupModal from "../Modals/AddCategoryGroupModal";


export default function CategoryGroups() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    console.log(editData)
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // 🔹 GET
    const getCategoryGroups = async () => {
        try {
            setLoading(true);
            const res = await axios.get(baseUrl.categoryGroups);
            setData(res?.data?.category_groups || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategoryGroups();
    }, []);

    // 🔹 DELETE
    const handleDelete = async () => {
        try {
            await axios.delete(
                `${baseUrl.categoryGroups}/${selectedItem.id}`
            );
            setConfirmOpen(false);
            setSelectedItem(null);
            getCategoryGroups();
        } catch (err) {
            console.log(err);
        }
    };

    // 🔹 SEARCH
    const filteredData = data.filter((item: any) =>
        item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🔹 LOADER
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-gray-200" />
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                    Loading category groups...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Category Groups
                        </h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {filteredData.length}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between flex-wrap gap-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Search
                            </label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-3 py-2 border rounded-lg w-full"
                                    placeholder="Search by title"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setOpenModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg flex gap-2"
                            >
                                <PlusCircle className="h-4 w-4 my-auto" />
                                Add Group
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredData?.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 flex gap-4">
                                        <button
                                            onClick={() => {
                                                setEditData(item);
                                                setOpenModal(!openModal);
                                            }}
                                            className="text-blue-600 flex gap-1"
                                        >
                                            <Edit className="h-4 w-4" /> Edit
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setConfirmOpen(!confirmOpen);
                                            }}
                                            className="text-red-600 flex gap-1"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredData.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No Category Groups found
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Modal */}
            <AddCategoryGroupModal
                open={openModal}
                onCancel={() => {
                    setOpenModal(!openModal);
                    setEditData('');
                }}
                editData={editData}
                getCategoryGroups={getCategoryGroups}
            />

            {/* Delete Confirm */}
            <DeleteConfirmModal
                open={confirmOpen}
                title="Delete Category Group"
                description="Are you sure you want to delete this category group?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}

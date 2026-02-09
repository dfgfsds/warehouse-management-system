import axios from "axios";
import { useEffect, useState } from "react";
import { Package, PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import AddCategoryModal from "../Modals/AddCategoryModal";
import { useAuth } from "../../hooks/useAuth";

// import AddCategoryModal from "../Modals/AddCategoryModal";

export default function CategoryList() {
    const { user }: any = useAuth();
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editCategory, setEditCategory] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    // 🔹 GET categories
    const getCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseUrl.categories}/by-vendor/${user?.vendor_id}/?vendor=${user?.vendor_id}&type=product`);
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

    // 🔹 Search filter
    const filteredCategories = categoryData.filter((item: any) => {
        const search = searchTerm.toLowerCase();
        return (
            item?.category_name?.toLowerCase().includes(search) ||
            item?.description?.toLowerCase().includes(search)
        );
    });

    // 🔹 Delete category
    const handleDeleteCategory = async () => {
        try {
            setDeleteLoading(true);
            await axios.delete(`${baseUrl.categories}/${selectedCategory?.id}`);
            setConfirmOpen(false);
            setSelectedCategory(null);
            getCategories();
        } catch (error) {
            console.log(error);
        } finally {
            setDeleteLoading(false);
        }
    };

    // 🔹 Loader
    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">
                    Loading categories, please wait...
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
                            Categories List
                        </h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total Categories: {filteredCategories.length}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between flex-wrap gap-2">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search by category name"
                                />
                            </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => setOpenModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Add Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        S.No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Short Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>


                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCategories?.map((item: any, index: number) => (
                                    <tr key={item.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                                            {index + 1}
                                        </td>


                                        {/* Title */}
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                                            {item.title}
                                        </td>

                                        {/* Short Description */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.short_description
                                                ? item.short_description.slice(0, 40)
                                                : "-"}
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.description
                                                ? item.description.slice(0, 50)
                                                : "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-sm font-medium flex gap-4">
                                            <button
                                                onClick={() => {
                                                    setEditCategory(item);
                                                    setOpenModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedCategory(item);
                                                    setConfirmOpen(true);
                                                }}
                                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                    {/* Empty */}
                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No Categories found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Modal */}

            <AddCategoryModal
                open={openModal}
                onCancel={() => {
                    setOpenModal(false);
                    setEditCategory(null);
                }}
                editCategory={editCategory}
                getCategories={getCategories}
            />


            {/* Delete Confirm */}
            <DeleteConfirmModal
                open={confirmOpen}
                title="Delete Category"
                description="Are you sure you want to delete this category?"
                confirmText="Delete"
                loading={deleteLoading}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedCategory(null);
                }}
                onConfirm={handleDeleteCategory}
            />
        </>
    );
}

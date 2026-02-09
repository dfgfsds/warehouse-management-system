import axios from "axios";
import { Edit, Package, PlusCircle, Search, Slice, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import BrandForm from "../Modals/AddBrandModal";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import { useAuth } from "../../hooks/useAuth";

export default function Brands() {
    const { user }: any = useAuth();
    const [brandData, setBrandData] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editBrand, setEditBrand] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Delete 
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);


    const handleDeleteBrand = async () => {
        try {
            setDeleteLoading(true);

            await axios.delete(`${baseUrl.brands}/${selectedBrand?.id}`);

            setConfirmOpen(false);
            setSelectedBrand(null);
            getBrands(); // 🔁 refresh list
        } catch (error) {
            console.log(error);
        } finally {
            setDeleteLoading(false);
        }
    };


    const filteredBrands = brandData.filter((item: any) => {
        const search = searchTerm.toLowerCase();
        return (
            item?.brand_name?.toLowerCase().includes(search) ||
            item?.description?.toLowerCase().includes(search) ||
            item?.sub_description?.toLowerCase().includes(search)
        );
    });

    const getBrands = async () => {
        try {
            setLoading(true); // 🔥 start loading
            const updateApi = await axios.get(`${baseUrl?.brands}/by-vendor/${user?.vendor_id}`);
            if (updateApi) {
                setBrandData(updateApi?.data?.data?.brands || []);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getBrands();
    }, [])


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                {/* Spinner */}
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>

                {/* Text */}
                <p className="mt-4 text-sm font-medium text-gray-600">
                    Loading brands, please wait...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Brands Lists</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total Brands: {brandData?.length}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between flex-wrap gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by QR or product type"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setOpenModal(!openModal)}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Add Brand
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      S.No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Brand Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        sub_description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBrands?.map((item: any, index: number) => {
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                             <td className="px-6 py-4 whitespace-nowrap">
                                                    {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 capitalize">{item.brand_name}</div>
                                                    <div className="text-sm text-gray-500 font-mono">{item.qrCode}</div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500 capitalize">
                                                    {item?.description?.slice(0, 50)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500 capitalize">
                                                    {item?.sub_description?.slice(0, 50)}
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    // onClick={() => handleViewAsset(asset)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setOpenModal(!openModal), setEditBrand(item) }}
                                                    className="text-blue-600 hover:text-blue-900 mr-3 flex gap-2 my-auto"
                                                >
                                                    Edit <Edit className="h-4 w-4" />
                                                </button>
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => {
                                                        setOpenModal(true);
                                                        setEditBrand(item);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedBrand(item);
                                                        setConfirmOpen(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredBrands.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No Brand found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search criteria.
                            </p>
                        </div>
                    )}

                </div>


            </div>
            <BrandForm
                open={openModal}
                onCancel={() => { setOpenModal(!openModal), setEditBrand('') }}
                editBrand={editBrand}
                getBrands={getBrands}
            />

            <DeleteConfirmModal
                open={confirmOpen}
                title="Delete Brand"
                description="Are you sure you want to delete this brand? This action cannot be undone."
                confirmText="Delete"
                loading={deleteLoading}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedBrand(null);
                }}
                onConfirm={handleDeleteBrand}
            />

        </>
    )
}
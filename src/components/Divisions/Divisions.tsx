import axios from "axios";
import { Package, PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import AddDivisionModal from "../Modals/AddDivisionModal";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import { useAuth } from "../../hooks/useAuth";
// import DivisionForm from "../Modals/AddDivisionModal";

export default function Divisions() {
    const [divisionData, setDivisionData] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editDivision, setEditDivision] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Delete 
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<any>(null);


    const handleDeleteDivision = async () => {
        try {
            setConfirmLoading(true);
            await axios.delete(
                `${baseUrl.divisions}/${selectedDivision?.id}`
            );
            setConfirmOpen(false);
            setSelectedDivision(null);
            getDivisions();
        } catch (error) {
            console.log(error);
        } finally {
            setConfirmLoading(false);
        }
    };


    // 🔹 GET divisions
    const getDivisions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(baseUrl?.divisions);
            if (res) {
                setDivisionData(res?.data?.data?.divisions || []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDivisions();
    }, []);

    // 🔹 Search filter
    const filteredDivisions = divisionData?.filter((item: any) => {
        const search = searchTerm?.toLowerCase();
        return (
            item?.division_title?.toLowerCase().includes(search) ||
            item?.division_name?.toLowerCase().includes(search) ||
            item?.division_type?.toLowerCase().includes(search)
        );
    });

    // 🔹 Loader
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">
                    Loading divisions, please wait...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-division?.center justify-between">
                    <div className="flex items-division?.center space-x-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Divisions List
                        </h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total Divisions: {filteredDivisions.length}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between">
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
                                    placeholder="Search by title / name / type"
                                />
                            </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => setOpenModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-division?.center gap-2"
                            >
                                <PlusCircle className="h-4 w-4 my-auto" />
                                Add Division
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
                                        Division Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Description
                                    </th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Capacity
                                    </th>
                                    
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDivisions.map((item: any) => (
                                    <tr key={item?.division?.id} className="hover:bg-gray-50">
                                     
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item?.division_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {item?.description?.slice(0,50)}
                                        </td>
                                         <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {item?.capacity}
                                        </td>
                                        {/* <td className="px-6 py-4 text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setEditDivision(item);
                                                    setOpenModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 flex items-division?.center gap-2"
                                            >
                                                Edit <Edit className="h-4 w-4" />
                                            </button>
                                        </td> */}

                                        <td className="px-6 py-4 text-sm font-medium flex gap-4">
                                            {/* Edit */}
                                            <button
                                                onClick={() => {
                                                    setEditDivision(item);
                                                    setOpenModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => {
                                                    setSelectedDivision(item);
                                                    setConfirmOpen(!confirmOpen);
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

                    {/* Empty state */}
                    {filteredDivisions.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No Divisions found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal (plug later) */}

            <AddDivisionModal
                open={openModal}
                onCancel={() => {
                    setOpenModal(false);
                    setEditDivision('');
                }}
                editDivision={editDivision}
                getDivisions={getDivisions}
                divisionData={divisionData}
            />


            {/* DELETE  */}

            <DeleteConfirmModal
                open={confirmOpen}
                title="Delete Division"
                description="Are you sure you want to delete this division?"
                confirmText="Delete"
                loading={confirmLoading}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedDivision(null);
                }}
                onConfirm={handleDeleteDivision}
            />


        </>
    );
}

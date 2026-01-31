import React, { useState, useEffect } from 'react';
import { Settings, Users, Building2, Package2, Plus, CreditCard as Edit, Trash2, Save, X, Layout, ChevronDown, ChevronRight, Eye, UserPlus, Grid, Box, Edit2, Stamp } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Warehouse, ProductType, User, Section, Tray, Asset } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserForm from '../Modals/UserForm';
import axios from 'axios';
import baseUrl from '../../../api-endpoints/ApiUrls';
import WarehouseForm from '../Modals/AddWareHouseForm';
import ProductStatus from './ProductStatus';
import ProductUnit from './ProductUnit';
import ProductTypes from './ProductTypes';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import SectionManagerModal from '../Modals/SectionManagerModal';

export const Administration: React.FC = () => {
  const { user }: any = useAuth();
  const [activeTab, setActiveTab] = useState('warehouses');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [managingSectionsFor, setManagingSectionsFor] = useState<Warehouse | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<any>();

  // Warehouses
  const [warehousesData, setWarehousesData] = useState<any[]>()
  const [editWarehouse, setEditWarehouse] = useState('');

  // Filter States
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [filterSection, setFilterSection] = useState('all');


  // 🔹 delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);


  const handleDelete = async () => {
    try {
      await axios.delete(
        `${baseUrl?.users}/${deleteItem.id}`
      );
      setConfirmOpen(false);
      setDeleteItem(null);
      getUser();
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  // USER APIS 
  const getUser = async () => {
    try {
      const updatedAPi = await axios.get(`${baseUrl?.users}`)
      console.log(updatedAPi?.data)
      if (updatedAPi) {
        setUsersList(updatedAPi?.data?.data?.users)
      }
    } catch (error) {

    }
  }



  // Warehouses APIS 
  const getWarehouses = async () => {
    try {
      const updatedAPi = await axios.get(`${baseUrl?.vendors}/${user?.vendor_id}/hubs`)
      console.log(updatedAPi?.data)
      if (updatedAPi) {
        setWarehousesData(updatedAPi?.data?.data?.hubs)
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    getUser();
    getWarehouses();
  }, []);



  const loadData = () => {
    setWarehouses(StorageManager.getWarehouses());
    setProductTypes(StorageManager.getProductTypes());
    // setUsersList(StorageManager.getUsers());
  };

  // const handleSaveWarehouse = (warehouse: Warehouse) => {
  //   const warehouses = StorageManager.getWarehouses();
  //   const index = warehouses.findIndex(w => w.id === warehouse.id);

  //   if (index >= 0) {
  //     warehouses[index] = { ...warehouse, updatedAt: new Date().toISOString() };
  //   } else {
  //     warehouses.push({
  //       ...warehouse,
  //       id: 'wh-' + Date.now(),
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString()
  //     });
  //   }

  //   StorageManager.setWarehouses(warehouses);
  //   loadData();
  //   setEditingItem(null);
  //   setShowAddModal(false);
  // };

  const handleSaveProductType = (productType: ProductType) => {
    const types = StorageManager.getProductTypes();
    const index = types.findIndex(t => t.id === productType.id);

    if (index >= 0) {
      types[index] = productType;
    } else {
      types.push({
        ...productType,
        id: 'pt-' + Date.now()
      });
    }

    StorageManager.setProductTypes(types);
    loadData();
    setEditingItem(null);
    setShowAddModal(false);
  };



  // const ProductTypeForm = ({ productType, onSave, onCancel }: any) => {
  //   const [formData, setFormData] = useState(productType || {
  //     name: '',
  //     code: '',
  //     category: '',
  //     isDismantleable: false,
  //     defaultParts: []
  //   });

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  //       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
  //         <div className="p-6 border-b border-gray-200">
  //           <h3 className="text-lg font-semibold text-gray-900">
  //             {productType ? 'Edit Product Type' : 'Add Product Type'}
  //           </h3>
  //         </div>

  //         <div className="p-6 space-y-4">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
  //             <input
  //               type="text"
  //               value={formData.name}
  //               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
  //             <input
  //               type="text"
  //               value={formData.code}
  //               onChange={(e) => setFormData({ ...formData, code: e.target.value })}
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
  //             <input
  //               type="text"
  //               value={formData.category}
  //               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  //               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //             />
  //           </div>

  //           <div className="flex items-center">
  //             <input
  //               type="checkbox"
  //               id="dismantleable"
  //               checked={formData.isDismantleable}
  //               onChange={(e) => setFormData({ ...formData, isDismantleable: e.target.checked })}
  //               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
  //             />
  //             <label htmlFor="dismantleable" className="ml-2 block text-sm text-gray-900">
  //               Can be dismantled
  //             </label>
  //           </div>
  //         </div>

  //         <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
  //           <button
  //             onClick={onCancel}
  //             className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
  //           >
  //             Cancel
  //           </button>
  //           <button
  //             onClick={() => onSave(formData)}
  //             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  //           >
  //             Save
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };



  const adminTabs = [
    ...(user?.role !== 'manager'
      ? [{ id: 'warehouses', label: 'Warehouses', icon: Building2 }]
      : []),

    { id: 'products', label: 'Product Types', icon: Package2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'productStatus', label: 'Product Status', icon: Stamp },
    { id: 'productUnit', label: 'Product Units', icon: Box },
  ];

  // Helper to get all sections flattened
  const getAllSections = () => {
    return warehouses.flatMap(w => w.sections.map(s => ({ ...s, warehouseName: w.name })));
  };

  // Helper to get all trays flattened
  const getAllTrays = () => {
    return warehouses.flatMap(w =>
      w.sections.flatMap(s =>
        s.trays.map(t => ({ ...t, sectionName: s.name, warehouseName: w.name, warehouseId: w.id }))
      )
    );
  };

  console.log(user?.role)
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
      </div>

      {/* Admin Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 flex-wrap">
            {adminTabs?.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'warehouses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Warehouse Management</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Warehouse</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehousesData?.map((warehouse: any) => (
                  <div key={warehouse?.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{warehouse?.title}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setManagingSectionsFor(warehouse)}
                          className="text-gray-500 hover:text-blue-600 p-1"
                          title="Manage Sections"
                        >
                          <Layout className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditWarehouse(warehouse),
                              // setEditingItem(warehouse)
                              setShowAddModal(!showAddModal)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Warehouse"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Code: {warehouse?.code}</p>
                    <p className="text-sm text-gray-600 mb-2">{warehouse?.address}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {warehouse?.sections?.length} sections
                      </span>
                      <button
                        onClick={() => setManagingSectionsFor(warehouse)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Manage Layout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductTypes />
            // <div className="space-y-4">
            //   <div className="flex justify-between items-center">
            //     <h2 className="text-lg font-semibold text-gray-900">Product Type Management</h2>
            //     <button
            //       onClick={() => setShowAddModal(true)}
            //       className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            //     >
            //       <Plus className="h-4 w-4" />
            //       <span>Add Product Type</span>
            //     </button>
            //   </div>

            //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            //     {productTypes.map((productType) => (
            //       <div key={productType.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            //         <div className="flex justify-between items-start mb-2">
            //           <h3 className="font-semibold text-gray-900">{productType.name}</h3>
            //           <button
            //             onClick={() => setEditingItem(productType)}
            //             className="text-blue-600 hover:text-blue-800"
            //           >
            //             <Edit className="h-4 w-4" />
            //           </button>
            //         </div>
            //         <p className="text-sm text-gray-600 mb-1">Code: {productType.code}</p>
            //         <p className="text-sm text-gray-600 mb-2">Category: {productType.category}</p>
            //         <p className="text-xs text-gray-500">
            //           {productType.isDismantleable ? 'Dismantleable' : 'Not dismantleable'}
            //         </p>
            //       </div>
            //     ))}
            //   </div>
            // </div>
          )}

          <div className="text-center py-12" hidden={usersList?.length > 0}>
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">User Management</h3>
            <p className="mt-1 text-sm text-gray-500">No users found.</p>
          </div>
          {activeTab === 'users' && (
            <>
              {usersList?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">Users ({usersList.length})</h2>
                    <button onClick={() => setShowUserModal(!showAddModal)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <UserPlus className="h-4 w-4" /> <span>Add User</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {usersList?.map((u: any) => (
                            <tr key={u.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u?.full_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u?.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{u?.email.replace('_', ' ')}</td>

                              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer" onClick={() => { setShowUserModal(!showUserModal), setEditUser(u) }}>
                                Edit
                              </td> */}

                              <td className="px-6 py-4 flex gap-4">
                                <button
                                  onClick={() => { setShowUserModal(!showUserModal), setEditUser(u) }}
                                  className="text-blue-600 flex gap-1"
                                >
                                  <Edit2 size={16} /> Edit
                                </button>

                                <button
                                  onClick={() => {
                                    setDeleteItem(u);
                                    setConfirmOpen(true);
                                  }}
                                  className="text-red-600 flex gap-1"
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'productStatus' && (
            <ProductStatus />)}

          {activeTab === 'productUnit' && (
            <ProductUnit />)}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && activeTab === 'warehouses' && (
        <WarehouseForm
          open={showAddModal}
          editWarehouse={editWarehouse}
          getWarehouses={getWarehouses}
          onCancel={() => { setShowAddModal(false), setEditWarehouse('') }}
        />
      )}

      {activeTab === 'users' && (
        <UserForm
          open={showUserModal}
          editUser={editUser}
          onCancel={() => { setShowUserModal(!showUserModal), setEditUser('') }}
          getUser={getUser}
          warehousesData={warehousesData}
        />
      )}

      {/* {managingSectionsFor && (
        <SectionManagerModal
          warehouse={managingSectionsFor}
          onSave={(updatedWarehouse: Warehouse) => handleSaveWarehouse(updatedWarehouse)}
          onCancel={() => setManagingSectionsFor(null)}
        />
      )} */}

      {/* ================= DELETE CONFIRM ================= */}
      <DeleteConfirmModal
        open={confirmOpen}
        title="Delete user"
        description={`Are you sure you want to delete "${deleteItem?.full_name}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

    </div>
  );
};
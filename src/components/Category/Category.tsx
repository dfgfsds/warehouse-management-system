import { Group, Package } from "lucide-react";
import { useState } from "react";
import CategoryList from "./CategoryList";
import CategoryGroups from "./CategoryGroups";

export default function Category() {
    const [activeReport, setActiveReport] = useState('category');
    const categoryTabs = [
        { id: 'category', label: 'Categorys', icon: Package },
        { id: 'categoryGroups', label: 'Category Groups', icon: Group },
    ];
    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Categorys and Category Groups</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        {/* Total Brands: {brandData?.length} */}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {categoryTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveReport(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeReport === tab.id
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

                        <>
                            {activeReport === 'category' &&

                                <CategoryList />}
                            {activeReport === 'categoryGroups' && <CategoryGroups />}
                        </>

                    </div>
                </div>


            </div>

        </>
    )
}
// import axios from "axios";
// import { ChevronDown, ChevronRight, Plus, Save, Trash2, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import baseUrl from "../../../api-endpoints/ApiUrls";
// import { useAuth } from "../../hooks/useAuth";


// export default function SectionManagerModal({ warehouse, onSave, onCancel }: { warehouse: any, onSave: (w: any) => void, onCancel: () => void }) {
//     const [currentWarehouse, setCurrentWarehouse] = useState<any>(JSON.parse(JSON.stringify(warehouse)));
//     const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
//     const [viewingAssets, setViewingAssets] = useState<{ type: 'section' | 'tray', id: string, name: string } | null>(null);
//     const [usersList, setUsersList] = useState<any[]>([]);
//   const { user }: any = useAuth();

// console.log(warehouse)
//     // Replace mock users with real usersList
//     const mockUsers = usersList;

//     const getDivisionSections = async () => {
//         try {
//             const res = await axios.get(`${baseUrl?.divisions}/vendor/${user?.vendor_id}/hierarchy`)
//             console.log(res,"res")
//         } catch (error) {

//         }
//     }

//     useEffect(() => {
//         getDivisionSections();
//     }, [])

//     const toggleSection = (sectionId: string) => {
//         const newExpanded = new Set(expandedSections);
//         if (newExpanded.has(sectionId)) {
//             newExpanded.delete(sectionId);
//         } else {
//             newExpanded.add(sectionId);
//         }
//         setExpandedSections(newExpanded);
//     };

//     const handleAddSection = () => {
//         const newSection: any = {
//             id: `sec-${Date.now()}`,
//             name: 'New Section',
//             code: `SEC-${currentWarehouse?.length + 1}`,
//             warehouseId: currentWarehouse.id,
//             trays: [],
//             createdAt: new Date().toISOString()
//         };
//         setCurrentWarehouse({
//             ...currentWarehouse,
//             sections: [...currentWarehouse, newSection]
//         });
//         toggleSection(newSection.id); // Auto expand
//     };

//     const handleDeleteSection = (sectionId: string) => {
//         if (window.confirm('Are you sure? This will delete all trays and assets in this section.')) {
//             setCurrentWarehouse({
//                 ...currentWarehouse,
//                 sections: currentWarehouse.sections.filter((s: any) => s.id !== sectionId)
//             });
//         }
//     };

//     const updateSection = (sectionId: string, updates: Partial<any>) => {
//         setCurrentWarehouse({
//             ...currentWarehouse,
//             sections: currentWarehouse.sections.map((s: any) => s.id === sectionId ? { ...s, ...updates } : s)
//         });
//     };

//     const handleAddTray = (sectionId: string) => {
//         const section = currentWarehouse.sections.find((s: any) => s.id === sectionId);
//         if (!section) return;

//         const newTray: any = {
//             id: `tray-${Date.now()}`,
//             name: 'New Tray',
//             code: `T${section.trays.length + 1}`,
//             sectionId: sectionId,
//             capacity: 50,
//             currentCount: 0,
//             createdAt: new Date().toISOString()
//         };

//         setCurrentWarehouse({
//             ...currentWarehouse,
//             sections: currentWarehouse.sections.map((s: any) => {
//                 if (s.id === sectionId) {
//                     return { ...s, trays: [...s.trays, newTray] };
//                 }
//                 return s;
//             })
//         });
//     };

//     const handleDeleteTray = (sectionId: string, trayId: string) => {
//         if (window.confirm('Are you sure?')) {
//             setCurrentWarehouse({
//                 ...currentWarehouse,
//                 sections: currentWarehouse.sections.map((s: any) => {
//                     if (s.id === sectionId) {
//                         return { ...s, trays: s.trays.filter((t: any) => t.id !== trayId) };
//                     }
//                     return s;
//                 })
//             });
//         }
//     };

//     const updateTray = (sectionId: string, trayId: string, updates: Partial<any>) => {
//         setCurrentWarehouse({
//             ...currentWarehouse,
//             sections: currentWarehouse.sections.map((s: any) => {
//                 if (s.id === sectionId) {
//                     return {
//                         ...s,
//                         trays: s.trays.map((t: any) => t.id === trayId ? { ...t, ...updates } : t)
//                     };
//                 }
//                 return s;
//             })
//         });
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
//                 <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
//                     <div>
//                         <h3 className="text-xl font-bold text-gray-900">Manage Sections</h3>
//                         <p className="text-sm text-gray-600">{currentWarehouse?.name} ({currentWarehouse?.code})</p>
//                     </div>
//                     <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
//                 </div>

//                 <div className="p-6 overflow-y-auto flex-1 bg-gray-100">
//                     <div className="space-y-4">
//                         {currentWarehouse?.sections?.map((section: any) => (
//                             <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                                 <div className="p-4 flex items-start justify-between bg-white">
//                                     <div className="flex items-center gap-3 flex-1">
//                                         <button onClick={() => toggleSection(section.id)} className="text-gray-500 hover:text-gray-700">
//                                             {expandedSections.has(section.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
//                                         </button>
//                                         <div className="grid grid-cols-2 gap-4 flex-1">
//                                             <input
//                                                 type="text"
//                                                 value={section.name}
//                                                 onChange={(e) => updateSection(section.id, { name: e.target.value })}
//                                                 className="px-2 py-1 border border-gray-300 rounded text-sm font-medium"
//                                                 placeholder="Section Name"
//                                             />
//                                             <input
//                                                 type="text"
//                                                 value={section.code}
//                                                 onChange={(e) => updateSection(section.id, { code: e.target.value })}
//                                                 className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
//                                                 placeholder="Section Code"
//                                             />
//                                         </div>
//                                     </div>
//                                     <button
//                                         onClick={() => handleDeleteSection(section.id)}
//                                         className="text-red-500 hover:text-red-700 ml-4 p-1"
//                                         title="Delete Section"
//                                     >
//                                         <Trash2 className="h-4 w-4" />
//                                     </button>
//                                 </div>

//                                 {expandedSections.has(section.id) && (
//                                     <div className="bg-gray-50 p-4 border-t border-gray-200">
//                                         <div className="space-y-2">
//                                             <div className="flex justify-between items-center mb-2">
//                                                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trays / Shelves</span>
//                                                 <button
//                                                     onClick={() => handleAddTray(section.id)}
//                                                     className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
//                                                 >
//                                                     <Plus className="h-3 w-3" /> Add Tray
//                                                 </button>
//                                             </div>
//                                             {section.trays.map((tray: any) => (
//                                                 <div key={tray.id} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200">
//                                                     <div className="grid grid-cols-3 gap-3 flex-1">
//                                                         <input
//                                                             type="text"
//                                                             value={tray.name}
//                                                             onChange={(e) => updateTray(section.id, tray.id, { name: e.target.value })}
//                                                             className="px-2 py-1 border border-gray-300 rounded text-sm"
//                                                             placeholder="Tray Name"
//                                                         />
//                                                         <input
//                                                             type="text"
//                                                             value={tray.code}
//                                                             onChange={(e) => updateTray(section.id, tray.id, { code: e.target.value })}
//                                                             className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
//                                                             placeholder="Tray Code"
//                                                         />
//                                                         <input
//                                                             type="number"
//                                                             value={tray.capacity}
//                                                             onChange={(e) => updateTray(section.id, tray.id, { capacity: parseInt(e.target.value) || 0 })}
//                                                             className="px-2 py-1 border border-gray-300 rounded text-sm"
//                                                             placeholder="Capacity"
//                                                         />
//                                                     </div>
//                                                     <button
//                                                         onClick={() => handleDeleteTray(section.id, tray.id)}
//                                                         className="text-red-400 hover:text-red-600"
//                                                         title="Delete Tray"
//                                                     >
//                                                         <X className="h-4 w-4" />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                             {section.trays.length === 0 && (
//                                                 <p className="text-sm text-gray-400 italic text-center py-2">No trays in this section</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ))}
//                     </div>

//                     <button
//                         onClick={handleAddSection}
//                         className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
//                     >
//                         <Plus className="h-5 w-5" /> Add New Section
//                     </button>
//                 </div>

//                 <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-white rounded-b-lg">
//                     <button
//                         onClick={onCancel}
//                         className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={() => onSave(currentWarehouse)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                     >
//                         <Save className="h-4 w-4" /> Save Changes
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };


import axios from "axios";
import {
    ChevronDown,
    ChevronRight,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

/* ================= TYPES ================= */
type Tray = {
    id: string;
    name: string;
    code: string;
    capacity: string;
};

type Section = {
    id: string;
    name: string;
    code: string;
    trays: Tray[];
};

export default function SectionManagerModal({
    warehouse,
    onSave,
    onCancel,
}: {
    warehouse: any;
    onSave: (w: any) => void;
    onCancel: () => void;
}) {
    const { user }: any = useAuth();

    /* ================= STATE ================= */
    const [currentWarehouse, setCurrentWarehouse] = useState<any>({
        ...warehouse,
        sections: [],
    });

    console.log(currentWarehouse)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set()
    );

    /* ================= API → UI MAPPER ================= */
    const mapDivisionsToSections = (divisions: any[]): Section[] => {
        return divisions
            // .filter((d) => d.division_type === "rack")
            .map((rack) => ({
                id: rack.id,
                name: rack.division_name,
                code: rack.division_code || "",
                trays: (rack.children || []).map((tray: any) => ({
                    id: tray.id,
                    name: tray.division_name,
                    code: tray.division_code || "",
                    capacity: tray.capacity || "",
                })),
            }));
    };

    /* ================= LOAD SECTIONS ================= */
    const getDivisionSections = async () => {
        try {
            const res = await axios.get(
                `${baseUrl.divisions}/hub/${warehouse.id}`
            );
            const sections = mapDivisionsToSections(
                res?.data?.data?.divisions
            );

            setCurrentWarehouse((prev: any) => ({
                ...prev,
                sections,
            }));
        } catch (error) {
            console.error("Failed to load sections", error);
        }
    };

    useEffect(() => {
        getDivisionSections();
    }, []);

    /* ================= HANDLERS ================= */
    const toggleSection = (id: string) => {
        const copy = new Set(expandedSections);
        copy.has(id) ? copy.delete(id) : copy.add(id);
        setExpandedSections(copy);
    };

    const handleAddSection = () => {
        const newSection: Section = {
            id: `sec-${Date.now()}`,
            name: "New Section",
            code: "",
            trays: [],
        };

        setCurrentWarehouse((prev: any) => ({
            ...prev,
            sections: [...prev.sections, newSection],
        }));

        toggleSection(newSection.id);
    };

    const handleDeleteSection = (id: string) => {
        if (!window.confirm("Delete this section?")) return;

        setCurrentWarehouse((prev: any) => ({
            ...prev,
            sections: prev.sections.filter((s: Section) => s.id !== id),
        }));
    };

    const updateSection = (id: string, updates: Partial<Section>) => {
        setCurrentWarehouse((prev: any) => ({
            ...prev,
            sections: prev.sections.map((s: Section) =>
                s.id === id ? { ...s, ...updates } : s
            ),
        }));
    };

    const handleAddTray = (sectionId: string) => {
        const newTray: Tray = {
            id: `tray-${Date.now()}`,
            name: "New Tray",
            code: "",
            capacity: "",
        };

        setCurrentWarehouse((prev: any) => ({
            ...prev,
            sections: prev.sections.map((s: Section) =>
                s.id === sectionId
                    ? { ...s, trays: [...s.trays, newTray] }
                    : s
            ),
        }));
    };

    const handleDeleteTray = (sectionId: string, trayId: string) => {
        if (!window.confirm("Delete this tray?")) return;

        setCurrentWarehouse((prev: any) => ({
            ...prev,
            sections: prev.sections.map((s: Section) =>
                s.id === sectionId
                    ? {
                        ...s,
                        trays: s.trays.filter((t) => t.id !== trayId),
                    }
                    : s
            ),
        }));
    };

    const updateTray = (
        sectionId: string,
        trayId: string,
        updates: Partial<Tray>
    ) => {
        setCurrentWarehouse((prev: any) => ({
            ...prev,
            sections: prev.sections.map((s: Section) =>
                s.id === sectionId
                    ? {
                        ...s,
                        trays: s.trays.map((t) =>
                            t.id === trayId ? { ...t, ...updates } : t
                        ),
                    }
                    : s
            ),
        }));
    };

    /* ================= UI ================= */
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
                {/* HEADER */}
                <div className="p-6 border-b flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Manage Sections</h2>
                        <p className="text-sm text-gray-600">
                            {currentWarehouse.title}
                        </p>
                    </div>
                    <button onClick={onCancel}>
                        <X />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto space-y-4">
                    {currentWarehouse?.sections.map((section: Section) => (
                        <div key={section.id} className="border rounded-lg">
                            <div className="p-4 flex gap-3 items-center">
                                <button onClick={() => toggleSection(section.id)}>
                                    {expandedSections.has(section.id) ? (
                                        <ChevronDown />
                                    ) : (
                                        <ChevronRight />
                                    )}
                                </button>
                                <div>
                                    <label className="block text-xs font-medium text-gray-900 mb-1">
                                        Division ID
                                    </label>
                                    <input
                                        value={section.name}
                                        onChange={(e) =>
                                            updateSection(section.id, {
                                                name: e.target.value,
                                            })
                                        }
                                        className="border px-2 py-1 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-900 mb-1">
                                        Division Code
                                    </label>
                                    <input
                                        value={section.code}
                                        onChange={(e) =>
                                            updateSection(section.id, {
                                                code: e.target.value,
                                            })
                                        }
                                        className="border px-2 py-1 rounded"
                                    />
                                </div>
                                <button
                                    onClick={() =>
                                        handleDeleteSection(section.id)
                                    }
                                    className="text-red-500 ml-auto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {expandedSections?.has(section.id) && (
                                <div className="bg-gray-50 p-4 space-y-2">
                                    {section?.trays.map((tray) => (
                                        <div
                                            key={tray.id}
                                            className="flex gap-2 items-center"
                                        >
                                            <div>
                                                <label className="block text-xs font-medium text-gray-900 mb-1">
                                                    Division Name
                                                </label>
                                                <input
                                                    value={tray.name}
                                                    onChange={(e) =>
                                                        updateTray(section.id, tray.id, {
                                                            name: e.target.value,
                                                        })
                                                    }
                                                    className="border px-2 py-1 rounded"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-900 mb-1">
                                                    Division Code
                                                </label>
                                                <input
                                                    value={tray.code}
                                                    onChange={(e) =>
                                                        updateTray(section.id, tray.id, {
                                                            code: e.target.value,
                                                        })
                                                    }
                                                    className="border px-2 py-1 rounded"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-900 mb-1">
                                                    capacity
                                                </label>
                                                <input
                                                    value={tray.capacity}
                                                    onChange={(e) =>
                                                        updateTray(section.id, tray.id, {
                                                            capacity: e.target.value,
                                                        })
                                                    }
                                                    className="border px-2 py-1 rounded"
                                                />
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleDeleteTray(
                                                        section.id,
                                                        tray.id
                                                    )
                                                }
                                                className="text-red-400"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => handleAddTray(section.id)}
                                        className="text-blue-600 text-sm flex gap-1 items-center"
                                    >
                                        <Plus size={14} /> Add Tray
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleAddSection}
                        className="w-full border-dashed  border-2 p-3 rounded-lg text-gray-500"
                    >
                        <Plus className="mx-auto" /> Add Section
                    </button>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(currentWarehouse)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
}




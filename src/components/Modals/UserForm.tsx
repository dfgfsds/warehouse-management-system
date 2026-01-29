import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from '../../../api-endpoints/ApiUrls';
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function UserForm({ open, onCancel, editUser, getUser }: any) {
    if (!open) return null;
    const { user }: any = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [apiErrors, setApiErrors] = useState<any>()
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        mobile_number: "",
    });
    const [divisionsData, setDivisionsData] = useState<any[]>();

    const [formData, setFormData] = useState({
        full_name: "",
        role: "admin",
        designation: "",
        mobile_number: "",
        email: "",
        vendor_id: user?.vendor_id,
        division_id: "",
        password: "",
        // permission_type: "both",
        // permission_status: "",
    });

    useEffect(() => {
        if (editUser) {
            setFormData(editUser)
        }
    }, [])

    // getDivisions APIS

    const getDivisions = async () => {
        try {
            const updatedApi = await axios.get(baseUrl?.divisions)
            console.log(updatedApi)
            if (updatedApi) {
                setDivisionsData(updatedApi?.data?.data?.divisions)
            }
        } catch (error) {
        }
    }
    useEffect(() => {
        getDivisions();
    }, [])


    const handleMobileChange = (e: any) => {
        const value = e.target.value.replace(/\D/g, "");

        if (value.length > 10) return;

        setFormData({ ...formData, mobile_number: value });

        if (value.length === 10) {
            setErrors((prev) => ({ ...prev, mobile_number: "" }));
        } else {
            setErrors((prev) => ({
                ...prev,
                mobile_number: "Mobile number must be 10 digits",
            }));
        }
    };

    const handleEmailChange = (e: any) => {
        const value = e.target.value;
        setFormData({ ...formData, email: value });

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (gmailRegex.test(value)) {
            setErrors((prev) => ({ ...prev, email: "" }));
        } else {
            setErrors((prev) => ({
                ...prev,
                email: "Only @gmail.com email is allowed",
            }));
        }
    };

    const submit = async () => {
        setLoading(true);
        setApiErrors('')
        try {
            if (editUser) {
                const updatedApi = await axios.put(`${baseUrl?.users}/${editUser?.id}`, formData)
                if (updatedApi) {
                    getUser();
                    setLoading(true);
                    setApiErrors('');
                    onCancel();
                }
            } else {
                const updatedApi = await axios.post(baseUrl?.vendorUsers, formData)
                if (updatedApi) {
                    getUser();
                    setLoading(true);
                    setApiErrors('');
                    onCancel();
                }
            }
        } catch (error: any) {
            console.log(error?.response)
            if (error?.response?.data?.error) {
                const errObj = error.response.data.error;
                const [key, value] = Object.entries(errObj)[0] || [];
                const firstMessage = Array.isArray(value) ? value[0] : value;

                setApiErrors(`${firstMessage}`);
            } else {
                setApiErrors(error?.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-y-auto max-h-[90vh] scrollbar-hide">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {editUser ? "Edit user" : "Add User"}
                    </h3>
                </div>

                {/* <div className="p-6 space-y-4"> */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) =>
                                setFormData({ ...formData, full_name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>


                    {/* Designation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Designation
                        </label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) =>
                                setFormData({ ...formData, designation: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            value={formData.mobile_number}
                            onChange={handleMobileChange}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.mobile_number ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.mobile_number && (
                            <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>
                        )}
                    </div>


                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>


                    {/* Vendor ID */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor ID
                        </label>
                        <input
                            type="text"
                            value={formData.vendor_id}
                            onChange={(e) =>
                                setFormData({ ...formData, vendor_id: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div> */}

                    {/* Division ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Division ID
                        </label>
                        <select
                            value={formData.division_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    division_id: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Select division</option>
                            {divisionsData?.map((item: any) => (
                                <option value={item?.division?.id}>{item?.division?.division_title}</option>

                            ))}

                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>


                    {/* Permission Type */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Permission Type
                        </label>
                        <select
                            value={formData.permission_type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    permission_type: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Select Permission</option>
                            <option value="both">Both</option>
                            <option value="read">Read</option>
                            <option value="write">Write</option>
                        </select>
                    </div> */}


                    {/* Permission Status */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Permission Status
                        </label>
                        <input
                            type="text"
                            value={formData.permission_status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    permission_status: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div> */}

                </div>
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end p-6">{apiErrors}</p>
                )}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => submit()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}


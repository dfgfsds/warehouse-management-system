import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";
import { Eye } from "lucide-react";
import * as XLSX from "xlsx";

export default function OrderHistory() {
    const { user }: any = useAuth();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [productData, setProductData] = useState<any[]>([]);
    const [productTypes, setProductTypes] = useState<any[]>([]);
    const [categoriesList, setCategoriesList] = useState<any[]>([]);

    const [productFilter, setProductFilter] = useState("");
    const [productTypeFilter, setProductTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    /* ================= FETCH ORDERS ================= */
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${baseUrl.orders}/filter?hub_id=d5afb387-1747-45f9-992b-8b22e8dac2be&skip=0&limit=100`
            );
            setOrders(res?.data?.data?.orders || []);
        } catch (err) {
            console.error("Order fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* ================= FILTER ================= */
    const filteredOrders = orders.filter((order: any) => {
        const details = order?.product_details?.[0]?.details;
        const product = details?.product;

        if (productFilter && product?.id !== productFilter) return false;
        if (productTypeFilter && product?.product_type?.id !== productTypeFilter)
            return false;
        if (
            categoryFilter &&
            details?.categories?.[0]?.id !== categoryFilter
        )
            return false;

        return true;
    });

    /* ================= LOAD DROPDOWNS ================= */
    useEffect(() => {
        if (!user?.vendor_id) return;

        axios
            .get(`${baseUrl.products}/by-vendor/${user.vendor_id}`)
            .then((r) => setProductData(r?.data?.data?.products || []));

        axios
            .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
            .then((r) => setProductTypes(r?.data?.data?.product_types || []));

        axios
            .get(
                `${baseUrl.categories}/by-vendor/${user.vendor_id}/?vendor=${user.vendor_id}&type=product`
            )
            .then((r) => setCategoriesList(r?.data?.data?.categories || []));
    }, [user?.vendor_id]);

    /* ================= EXPORT EXCEL ================= */
    const handleExportExcel = () => {
        const rows = filteredOrders.map((o: any) => ({
            Product: o?.product_details?.[0]?.details?.product?.title,
            Category:
                o?.product_details?.[0]?.details?.categories?.[0]?.name,
            ProductType:
                o?.product_details?.[0]?.details?.product?.product_type?.name,
            Hub: o.hub_name,
            Status: o.order_status,
            Amount: o.amount,
            Customer: o.customer_name,
            Mobile: o.customer_mobile,
            Email: o.customer_email,
            Address: o.customer_address,
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, "Order_History.xlsx");
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Order History</h1>

            {/* ================= FILTER BAR ================= */}
            <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
                    <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All Products</option>
                        {productData.map((p: any) => (
                            <option key={p?.product?.id} value={p?.product?.id}>
                                {p?.product?.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={productTypeFilter}
                        onChange={(e) => setProductTypeFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All Types</option>
                        {productTypes.map((t: any) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All Categories</option>
                        {categoriesList.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Export Excel
                    </button>

                    <button
                        onClick={() => {
                            setProductFilter("");
                            setProductTypeFilter("");
                            setCategoryFilter("");
                        }}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* ================= TABLE ================= */}
            <div className="overflow-x-auto border rounded-xl bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Type / Category</th>
                            <th className="px-4 py-3">Hub</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {filteredOrders.map((order: any, index: number) => {
                            const details = order?.product_details?.[0]?.details;
                            const product = details?.product;

                            return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{index + 1}</td>

                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{product?.title}</div>
                                        <div className="text-xs text-gray-500">
                                            BarCode: {product?.sku}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div>{product?.product_type?.name} /</div>
                                        <div className="text-xs text-gray-500">
                                            {details?.categories?.[0]?.name}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">{order.hub_name}</td>

                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${order.order_status === "success"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {order.order_status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-right font-bold">
                                        ₹ {order.amount}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-gray-500">
                                            {order.customer_mobile}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowViewModal(true);
                                            }}
                                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ================= MODAL (NO TABLE) ================= */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col overflow-y-auto">


                        {/* ===== HEADER ===== */}
                        <div className="px-8 py-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Order Details</h2>
                                <p className="text-xs opacity-80">
                                    Order ID: {selectedOrder.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ===== BODY ===== */}
                        <div className="p-8 space-y-8 text-sm bg-gray-50">

                            {/* ===== SUMMARY STRIP ===== */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-500">Hub</p>
                                    <p className="font-semibold">{selectedOrder.hub_name}</p>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        ₹ {selectedOrder.amount}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span
                                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold
                ${selectedOrder.order_status === "success"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"}`}
                                    >
                                        {selectedOrder.order_status}
                                    </span>
                                </div>




                                {/* 
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-500">Division</p>
                                    <p className="font-semibold">{selectedOrder.division_name}</p>
                                </div> */}
                            </div>

                            {/* ===== CUSTOMER CARD ===== */}
                            <section className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
                                    Customer Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Name</p>
                                        <p className="font-semibold">{selectedOrder.customer_name}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">Mobile</p>
                                        <p className="font-semibold">{selectedOrder.customer_mobile}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-semibold break-all">
                                            {selectedOrder.customer_email}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">Order Date</p>
                                        <p className="font-semibold">
                                            {new Date(selectedOrder.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="mt-1 text-gray-700 leading-relaxed">
                                        {selectedOrder.customer_address}
                                    </p>
                                </div>
                            </section>

                            {/* ===== PRODUCTS ===== */}
                            <section className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
                                    Product Details
                                </h3>

                                <div className="space-y-4">
                                    {selectedOrder.product_details.map((p: any, i: number) => {
                                        const prod = p?.details?.product;

                                        return (
                                            <div
                                                key={i}
                                                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 rounded-xl p-4 border"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {prod?.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        SKU: {prod?.sku} · Brand: {prod?.brand?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Type: {prod?.product_type?.name}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="text-lg font-bold">{p.quantity}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* ===== FOOTER ===== */}
                        <div className="px-8 py-4 border-t bg-white flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-6 py-2 rounded-lg border font-semibold hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

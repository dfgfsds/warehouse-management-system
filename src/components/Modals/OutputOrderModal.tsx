import { X, IndianRupee } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";

export default function OutputOrderModal({ asset, onClose, getTrayProductsApi }: any) {
    const { user }: any = useAuth();
    const product = asset?.product_details?.product;

    const [quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);

    const [paymentMode, setPaymentMode] = useState("cash");
    const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
    const [transactionId, setTransactionId] = useState("");

    const [customerName, setCustomerName] = useState("");
    const [customerMobile, setCustomerMobile] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");

    const [loading, setLoading] = useState(false);

    const orderTotal = quantity * amount;

    const handleSubmit = async () => {
        if (quantity <= 0) return alert("Quantity must be greater than 0");
        if (quantity > asset?.stock) return alert("Quantity exceeds stock");
        if (amount <= 0) return alert("Amount must be greater than 0");

        if (paymentType === "full" && paidAmount !== orderTotal) {
            return alert("Paid amount must equal order total for FULL payment");
        }

        if (paymentType === "partial" && paidAmount >= orderTotal) {
            return alert("Paid amount must be less than order total");
        }

        const payload = {
            parent_id: user?.vendor_id,
            product_id: product?.id,
            hub_id: asset?.hub_id,
            division_id: asset?.division_id,
            tray_id: asset?.tray_id,
            vendor_id: asset?.vendor_id,
            status: asset?.status,
            stock: asset?.stock,
            user_id: user?.user_id,

            order_type: "customer",
            order_total: orderTotal,

            customer_name: customerName,
            customer_mobile: customerMobile,
            customer_email: customerEmail,
            customer_address: customerAddress,

            payment_mode: paymentMode,
            transaction_id: transactionId || null,
            payment_date: new Date().toISOString().split("T")[0],
            payment_type: paymentType,
            paid_amount: paidAmount,
        };

        try {
            setLoading(true);
            const updatedApi = await axios.post(`${baseUrl.divisionInventory}`, payload);
            if (updatedApi) {
                alert("✅ Order created successfully");
                onClose();
                getTrayProductsApi();
            }

        } catch (err: any) {
            alert(err?.response?.data?.message || "❌ Order failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

                {/* ================= HEADER ================= */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">
                        Output Order
                    </h3>
                    <button onClick={onClose}>
                        <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                {/* ================= BODY (SCROLLABLE) ================= */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* PRODUCT INFO */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="font-semibold text-gray-800">
                            {product?.title}
                        </div>
                        <div className="text-sm text-gray-600">
                            Barcode: {product?.barcode_value}
                        </div>
                        <div className="text-sm text-gray-600">
                            Available Stock: <b>{asset?.stock}</b>
                        </div>
                    </div>

                    {/* QTY + PRICE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={asset?.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Price / Unit
                            </label>
                            <div className="relative mt-1">
                                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full pl-9 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TOTAL */}
                    <div className="flex justify-between bg-gray-100 px-4 py-3 rounded-lg font-bold">
                        <span>Total</span>
                        <span>₹ {orderTotal}</span>
                    </div>

                    {/* PAYMENT */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Payment Mode
                            </label>
                            <select
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                            >
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="cheque">Cheque</option>
                                <option value="bank">Bank</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Payment Type
                            </label>
                            <select
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value as any)}
                            >
                                <option value="full">Full</option>
                                <option value="partial">Partial</option>
                            </select>
                        </div>
                    </div>

                    {/* PAID AMOUNT */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                            Paid Amount
                        </label>
                        <input
                            type="number"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                    </div>

                    {paymentMode !== "cash" && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Transaction ID
                            </label>
                            <input
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                    )}

                    {/* CUSTOMER */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Customer Name
                            </label>
                            <input
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                Mobile
                            </label>
                            <input
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                            Email
                        </label>
                        <input
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                        />
                    </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                    >
                        {loading ? "Processing..." : "Confirm Output"}
                    </button>
                </div>
            </div>
        </div>

    );
}

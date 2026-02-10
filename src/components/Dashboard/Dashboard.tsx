import React, { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import baseUrl from "../../../api-endpoints/ApiUrls";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ================= TYPES ================= */
// (UNCHANGED)

type Product = { id: string; title: string };
type StatusStock = { status_id: string; status_name: string; stock: number };
type InOutStatusBreakdown = {
  status_id: string | null;
  status_name: string;
  total_in: number;
  total_out: number;
};
type InOutStats = {
  total_in: number;
  total_out: number;
  last_in_date: string | null;
  last_out_date: string | null;
  status_breakdown: InOutStatusBreakdown[];
};
type SalesRow = {
  date: string;
  product_name: string;
  total_quantity: number;
  total_amount: number;
  order_count: number;
};

/* ================= COMPONENT ================= */

export const Dashboard: React.FC = () => {
  const { user }: any = useAuth();

  /* ================= STATES (UNCHANGED) ================= */

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [totalStock, setTotalStock] = useState(0);
  const [statusStocks, setStatusStocks] = useState<StatusStock[]>([]);
  const [inOutStats, setInOutStats] = useState<InOutStats>({
    total_in: 0,
    total_out: 0,
    last_in_date: null,
    last_out_date: null,
    status_breakdown: [],
  });

  const [salesStartDate, setSalesStartDate] = useState("");
  const [salesEndDate, setSalesEndDate] = useState("");
  const [salesReport, setSalesReport] = useState<SalesRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSalesVolume, setTotalSalesVolume] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState<string>("");
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [hubInventoryLoading, setHubInventoryLoading] = useState(false);
  const [warehousesData, setWarehousesData] = useState<any[]>()
  const [productSearch, setProductSearch] = useState("");
  const [productData, setProductData] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);



  const getProducts = async () => {
    try {
      setLoading(true); // 🔥 start loading
      const updateApi = await axios.get(`${baseUrl?.products}/by-vendor/${user?.vendor_id}`);
      if (updateApi) {
        console.log(updateApi)
        setProductData(updateApi?.data?.data?.products || []);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get(`${baseUrl.categories}/by-vendor/${user.vendor_id}/?vendor=${user.vendor_id}&type=product`).then(r => setCategoriesList(r?.data?.data?.categories || []));
  }, []);


  useEffect(() => {
    if (user?.vendor_id) {
      getProducts();
    }
  }, [user?.vendor_id]);


  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.brands}/by-vendor/${user.vendor_id}`)
      .then(r => setBrandsList(r?.data?.data?.brands || []));

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

  }, [user?.vendor_id]);

  const filteredHubInventory = hubInventory?.filter((item: any) => {
    const product = item?.product_details?.product;
    const productId = product?.id;
    const categoryId = item?.product_details?.categories?.[0]?.id;
    const brandId = product?.brand?.id;
    const productTypeId = product?.product_type?.id;

    if (selectedProductId && productId !== selectedProductId) {
      return false;
    }

    if (selectedCategoryId && categoryId !== selectedCategoryId) {
      return false;
    }

    if (selectedBrandId && brandId !== selectedBrandId) {
      return false;
    }

    if (selectedProductTypeId && productTypeId !== selectedProductTypeId) {
      return false;
    }

    return true;
  });


  const fetchHubInventory = async () => {
    if (!selectedHubId) {
      setHubInventory([]);
      return;
    }

    setHubInventoryLoading(true);

    try {
      const params: any = {
        hub_id: selectedHubId,
      };

      if (selectedProductId) params.product_id = selectedProductId;
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (startDate) params.start_date = startDate;   // 🔥
      if (endDate) params.end_date = endDate;         // 🔥

      const res = await axios.get(baseUrl.hubDivisionInventory, {
        params,
      });

      setHubInventory(res?.data?.data || []);
    } catch (error) {
      console.error("Hub inventory error", error);
    } finally {
      setHubInventoryLoading(false);
    }
  };


  useEffect(() => {
    fetchHubInventory();
  }, [
    selectedHubId,
    selectedProductId,
    selectedCategoryId,
    startDate,
    endDate,
  ]);




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
    getWarehouses();
  }, []);


  /* ================= API CALLS (UNCHANGED) ================= */

  useEffect(() => {
    if (!user?.vendor_id) return;
    axios.get(`${baseUrl.products}/by-vendor/${user.vendor_id}`).then((res) => {
      const list = res?.data?.data?.products || [];
      setProducts(list.map((p: any) => ({
        id: p.product.id,
        title: p.product.title,
      })));
    });
  }, [user?.vendor_id]);

  const fetchProductStats = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    const res = await axios.get(`${baseUrl.productStockStats}/${selectedProduct}`);
    const data = res?.data?.data;
    setTotalStock(data?.total_stock || 0);
    setStatusStocks(data?.stock_by_status || []);
    setInOutStats({
      total_in: data?.in_out_stats?.total_in || 0,
      total_out: data?.in_out_stats?.total_out || 0,
      last_in_date: data?.in_out_stats?.last_in_date || null,
      last_out_date: data?.in_out_stats?.last_out_date || null,
      status_breakdown: data?.in_out_stats?.status_breakdown || [],
    });
    setLoading(false);
  };

  const fetchSalesReport = async () => {
    if (!salesStartDate || !salesEndDate) return;
    setLoading(true);
    const res = await axios.get(
      `${baseUrl.salesReport}?vendor_id=${user.vendor_id}&start_date=${salesStartDate}&end_date=${salesEndDate}`
    );
    const data = res?.data?.data;
    setSalesReport(data?.report || []);
    setTotalRevenue(data?.total_revenue || 0);
    setTotalSalesVolume(data?.total_sales_volume || 0);
    setLoading(false);
  };

  /* ================= UI ================= */

  const getStockStyle = (stock: number) => {
    if (stock <= 5)
      return "bg-red-50 text-red-700 border-red-200";
    if (stock <= 20)
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  const trackingHeaders = Array.from(
    new Set(
      hubInventory.flatMap(
        (item: any) =>
          item.tracking?.map((t: any) => t.division_name) || []
      )
    )
  );

  // INPUT first, rest after
  const orderedTrackingHeaders = [
    "INPUT",
    ...trackingHeaders.filter((h) => h !== "INPUT"),
  ];


  const downloadHubInventoryExcel = () => {
    if (!filteredHubInventory || filteredHubInventory.length === 0) return;

    const rows = filteredHubInventory.map((item: any, i: number) => {
      const product = item?.product_details?.product;
      const category =
        item?.product_details?.categories?.[0]?.name || "-";

      // tracking map
      const trackingMap = (item?.tracking || []).reduce(
        (acc: any, t: any) => {
          acc[t.division_name] = t.currently_available ?? 0;
          return acc;
        },
        {}
      );

      const baseRow: any = {
        "S.No": i + 1,
        "Product": product?.title || "-",
        "Tray": item?.product_details?.trays?.[0]?.name || "-",
        "Brand": product?.brand?.name || "-",
        "Category": category,
        "Product Type": product?.product_type?.name || "-",
        "Total In": item?.total_in ?? 0,
        "Total Out": item?.total_out ?? 0,
      };

      // 🔥 dynamic tracking columns (same as table)
      orderedTrackingHeaders.forEach((name: string) => {
        const key = name === "INPUT" ? "Available Stock" : name;
        baseRow[key] = trackingMap[name] ?? 0;
      });

      return baseRow;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hub Inventory");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer]),
      `Hub_Inventory_${selectedHubId || "All"}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };

  const handleClearAllFilters = () => {
    setSelectedHubId("");
    setSelectedCategoryId("");
    setSelectedBrandId("");
    setSelectedProductTypeId("");
    setSelectedProductId("");
    setStartDate("");
    setEndDate("");

    // optional but best UX
    setHubInventory([]);
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Dashboard
        </h1>
        <span className="text-sm text-gray-500">
          Welcome back, <b>{user?.user_name}</b>
        </span>
      </div>


      <section className="rounded-2xl bg-white border shadow-lg p-6 space-y-4">
        <h2 className="text-lg mb-5 font-semibold text-gray-800 flex items-center gap-2">
          🏬 Hub Inventory Available Stock
        </h2>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          {/* <div className="flex flex-wrap gap-4 items-end mb-4 my-auto ">

            <div>
              <label className="block text-sm font-medium mb-1">
                Hub
              </label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-56 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Hub</option>
                {warehousesData?.map((hub: any) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.title}
                  </option>
                ))}
              </select>
            </div>

     
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-64 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categoriesList?.map((x: any) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Brand
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-56 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {brandsList.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.brand_name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium mb-1">
                Product Type
              </label>
              <select
                value={selectedProductTypeId}
                onChange={(e) => setSelectedProductTypeId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-56 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {productTypes.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-72 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {productData?.map((item: any) => (
                  <option key={item.product.id} value={item.product.id}>
                    {item.product.title} ({item.product.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-44
               focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-44
               focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <button
              onClick={handleClearAllFilters}
              disabled={
                !selectedHubId &&
                !selectedCategoryId &&
                !selectedBrandId &&
                !selectedProductTypeId &&
                !selectedProductId &&
                !startDate &&
                !endDate
              }
              className="px-4 py-2 border rounded-lg text-sm font-semibold
             hover:bg-red-50 hover:text-red-600
             disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ❌ Clear Data
            </button>

            {user?.role === "admin" && (
              <div className="flex justify-end">
                <button
                  onClick={downloadHubInventoryExcel}
                  disabled={filteredHubInventory.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
      bg-green-600 text-white rounded-lg
      hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⬇ Export Excel
                </button>
              </div>
            )}
          </div> */}
          <div
            className="
    grid gap-4 mb-4
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-5
    items-end
  "
          >
            {/* HUB */}
            <div>
              <label className="block text-sm font-medium mb-1">Hub</label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              >
                <option value="">Select Hub</option>
                {warehousesData?.map((hub: any) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.title}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              >
                <option value="">All Categories</option>
                {categoriesList?.map((x: any) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </div>

            {/* BRAND */}
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              >
                <option value="">All Brands</option>
                {brandsList.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.brand_name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCT TYPE */}
            <div>
              <label className="block text-sm font-medium mb-1">Product Type</label>
              <select
                value={selectedProductTypeId}
                onChange={(e) => setSelectedProductTypeId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              >
                <option value="">All Types</option>
                {productTypes.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCT */}
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              >
                <option value="">All Products</option>
                {productData?.map((item: any) => (
                  <option key={item.product.id} value={item.product.id}>
                    {item.product.title} ({item.product.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* START DATE */}
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              />
            </div>

            {/* END DATE */}
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm w-full"
              />
            </div>

            {/* CLEAR */}
            <button
              onClick={handleClearAllFilters}
              disabled={
                !selectedHubId &&
                !selectedCategoryId &&
                !selectedBrandId &&
                !selectedProductTypeId &&
                !selectedProductId &&
                !startDate &&
                !endDate
              }
              className="px-4 py-2 border rounded-lg text-sm font-semibold
               hover:bg-red-50 hover:text-red-600
               disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ❌ Clear Data
            </button>

            {/* EXPORT */}
            {user?.role === "admin" && (
              <button
                onClick={downloadHubInventoryExcel}
                disabled={filteredHubInventory.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg
                 text-sm font-semibold hover:bg-green-700
                 disabled:opacity-50"
              >
                ⬇ Export Excel
              </button>
            )}
          </div>


        </div>

        {/* STATES */}
        {hubInventoryLoading ? (
          <div className="py-10 text-center text-gray-400">
            Loading inventory…
          </div>
        ) : !selectedHubId ? (
          <div className="py-10 text-center text-gray-400">
            Please select a hub to view inventory
          </div>
        ) : filteredHubInventory.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No matching products found
          </div>
        ) : (
          /* TABLE */
          <div className="relative overflow-x-auto rounded-lg border shadow-sm bg-white">
            <table className="w-full text-[12px] leading-tight">
              {/* ===== HEADER ===== */}
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-600 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left">Product / Tray</th>
                  <th className="px-2 py-2 text-left">Brand / Category / Type</th>
                  <th className="px-2 py-2 text-center">Total In</th>
                  <th className="px-2 py-2 text-center border-r">Total Out</th>

                  {orderedTrackingHeaders.map((name) => (
                    <th
                      key={name}
                      className={`px-2 py-2 text-right whitespace-nowrap text-[11px] ${name === "INPUT"
                        ? "bg-green-50 text-green-700 font-semibold"
                        : ""
                        }`}
                    >
                      {name === "INPUT"
                        ? "Available"
                        : name?.split(" ")[0]}
                    </th>
                  ))}

                </tr>
              </thead>


              {/* ===== BODY ===== */}
              <tbody className="divide-y">
                {filteredHubInventory.map((item: any, index: number) => {
                  const product = item?.product_details?.product;
                  const category =
                    item?.product_details?.categories?.[0]?.name || "-";

                  const trackingMap = (item?.tracking || []).reduce(
                    (acc: any, t: any) => {
                      acc[t.division_name] = t.currently_available ?? 0;
                      return acc;
                    },
                    {}
                  );

                  return (
                    <tr key={index} className="hover:bg-gray-50">

                      {/* PRODUCT */}
                      <td className="px-2 py-2">
                        <div className="font-semibold text-gray-900 text-[12px]">
                          {product?.title}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Tray : {item?.product_details?.trays[0]?.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Tray : {item?.product_details?.trays[0]?.name}
                        </div>
                      </td>


                      {/* BRAND / CATEGORY / TYPE */}
                      <td className="px-2 py-2">
                        <div className="font-medium text-gray-800 text-[11px]">
                          {product?.brand?.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {category} · {product?.product_type?.name}
                        </div>
                      </td>


                      {/* TOTAL IN */}
                      <td className="px-2 py-2 text-center">
                        <span className="px-2 py-[2px] rounded bg-green-100 text-green-700 font-semibold text-[11px]">
                          {item?.total_in ?? 0}
                        </span>
                      </td>

                      {/* TOTAL OUT */}
                      <td className="px-2 py-2 text-center border-r">
                        <span className="px-2 py-[2px] rounded bg-red-100 text-red-700 font-semibold text-[11px]">
                          {item?.total_out ?? 0}
                        </span>
                      </td>


                      {/* 🔥 TRACKING VALUES */}
                      {orderedTrackingHeaders.map((name) => (
                        <td
                          key={name}
                          className={`px-2 py-2 text-right font-semibold text-[11px] ${name === "INPUT"
                            ? "text-green-700 bg-green-50"
                            : "text-gray-700"
                            }`}
                        >
                          {trackingMap[name] ?? 0}
                        </td>
                      ))}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        )}
      </section>


      {/* PRODUCT SECTION */}
      {/* <section className="rounded-2xl bg-white/80 backdrop-blur border shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          📦 Product Stock Overview
        </h2>

        <div className="flex gap-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="border rounded-xl px-4 py-2 w-80 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} className="capitalize">{p.title}</option>
            ))}
          </select>

          <button
            onClick={fetchProductStats}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:scale-105 transition"
          >
            Load Data
          </button>
        </div>
      </section> */}

      {/* METRICS */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric title="Total Stock" value={totalStock} icon={<Package />} color="blue" />
        <Metric title="Total In" value={inOutStats.total_in} icon={<TrendingUp />} color="green" />
        <Metric title="Total Out" value={inOutStats.total_out} icon={<TrendingDown />} color="red" />
        <Metric title="Last In" value={inOutStats.last_in_date || "-"} icon={<Clock />} color="purple" />
      </div> */}

      {/* STATUS */}
      {/* <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border shadow p-6">
          <h3 className="font-semibold mb-4">Stock by Status</h3>
          {statusStocks?.map((s) => (
            <div key={s.status_id}
              className="flex justify-between px-4 py-3 mb-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <span className="capitalize">{s?.status_name}</span>
              <span className="font-bold">{s.stock}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white border shadow p-6">
          <h3 className="font-semibold mb-4">In / Out Breakdown</h3>
          {inOutStats.status_breakdown.map((s, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span className="capitalize">{s.status_name}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">IN {s.total_in}</span>
                <span className="text-red-600">OUT {s.total_out}</span>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* SALES */}
      <section className="rounded-2xl bg-white border shadow-lg p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <BarChart3 /> Sales Report
        </h2>

        <div className="flex gap-4">
          <input type="date" value={salesStartDate}
            onChange={(e) => setSalesStartDate(e.target.value)}
            className="border rounded-xl px-3 py-2" />
          <input type="date" value={salesEndDate}
            onChange={(e) => setSalesEndDate(e.target.value)}
            className="border rounded-xl px-3 py-2" />
          <button
            onClick={fetchSalesReport}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 rounded-xl hover:scale-105 transition">
            Load Sales
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Metric title="Revenue" value={`₹${totalRevenue}`} icon={<IndianRupee />} color="green" />
          <Metric title="Quantity Sold" value={totalSalesVolume} icon={<ShoppingCart />} color="blue" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {salesReport.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400 font-medium"
                  >
                    No sales data found for the selected date range
                  </td>
                </tr>
              ) : (
                salesReport?.map((r: any, i: number) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 capitalize">{r?.product_name}</td>
                    <td className="px-4 py-2 text-center">{r?.date}</td>
                    <td className="px-4 py-2 text-right">{r?.total_quantity}</td>
                    <td className="px-4 py-2 text-right">{r?.order_count}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ₹{r?.total_amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </section>
    </div>
  );
};

/* ================= METRIC CARD ================= */

const Metric = ({ title, value, icon, color }: any) => (
  <div className="rounded-2xl bg-white border shadow-md p-5 flex justify-between items-center hover:scale-[1.03] transition">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
  </div>
);

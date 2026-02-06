import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../api-endpoints/ApiUrls";
import { useAuth } from "../../hooks/useAuth";
import { TrashIcon, X } from "lucide-react";

export default function AddProductModal({
  open,
  onCancel,
  editProduct,
  refresh,
  selectedHubData,
  selectedTray,
  selectedDivData,
  qrInput,
}: any) {
  if (!open) return null;
  const { user }: any = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState("");

  /* ================= OPTIONS ================= */
  const [brands, setBrands] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  // const [productTypes, setProductTypes] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [productStatuses, setProductStatuses] = useState<any[]>([]);
  const [trayOption, setTrayOption] = useState([])

  useEffect(() => {
    if (!user?.vendor_id) return;

    axios
      .get(`${baseUrl.productTypes}/by-vendor/${user.vendor_id}`)
      .then(r => setProductTypes(r?.data?.data?.product_types || []));

    axios
      .get(`${baseUrl.productStatus}/?vendor_id=${user?.vendor_id}&type=division`)
      .then(r => setProductStatuses(r?.data?.data?.statuses || []));

    axios
      .get(`${baseUrl.divisions}/?vendor=${user?.vendor_id}/tray-codes`)
      .then(r => setTrayOption(r?.data?.data?.divisions || []));

  }, [user?.vendor_id]);

  // divisions

  /* ================= PRODUCT ================= */
  const [product, setProduct] = useState<any>({
    title: "",
    description: "",
    sku: "",
    short_description: "",
    detailed_description: "",
    vendor_id: user?.vendor_id,
    brand_id: "",
    barcode_value: qrInput,
    // meta_data: {},
    product_kind: "",
    parent_id: null,
    unit_of_measure_id: "",
    product_type_id: "",
    // product_status_id: "",
    hsn_code: "",
    // hub_id: selectedHubData,
    // division_id: selectedDivData,
    // product_expiry_date: null,
    // amc_expiry_date: "",
    // insurance_expiry_date: "",
    tray_codes: '',
  });

  /* ================= CATEGORIES (ARRAY) ================= */
  const [categories, setCategories] = useState<any[]>([
    { category_id: "", vendor_id: user?.vendor_id },
  ]);

  /* ================= PRICING (ARRAY) ================= */
  const [pricing, setPricing] = useState<any[]>([
    {
      title: "",
      value: "",
      tax: "",
      is_tax_included: false,
      currency: "INR",
    },
  ]);

  /* ================= INVENTORY ================= */
  // const [inventory, setInventory] = useState<any>({
  //   status: "in_stock",
  //   stock: "",
  //   min_required_stock: "",
  //   max_stock: "",
  //   vendor_id: user?.vendor_id,
  // });

  const inventoryStatusOptions = [
    { id: "in_stock", name: "In Stock" },
    { id: "out_of_stock", name: "Out of Stock" },
    // { id: "low_stock", name: "Low Stock" },
  ];


  useEffect(() => {
    if (!editProduct) return;

    const p = editProduct?.product;

    /* ================= PRODUCT ================= */
    setProduct({
      title: p?.title || "",
      description: p?.description || "",
      sku: p.sku || "",
      short_description: p.short_description || "",
      detailed_description: p.detailed_description || "",
      barcode_value: p.barcode_value || "",
      // meta_data: p.meta_data || {},
      product_kind: p.product_kind || "product",
      parent_id: p.parent_id || null,
      hsn_code: p.hsn_code || "",

      // ✅ NOW IT WILL WORK
      brand_id: p.brand?.id ?? "",
      unit_of_measure_id: p.unit_of_measure?.id ?? "",
      product_type_id: p.product_type?.id ?? "",
      // product_status_id: p.status?.id ?? "",
      // division_id: p.division?.id ?? "",
      hub_id: p.hub?.id ?? "",
      tray_codes: p?.tray_codes || [],

      // 📅 dates (YYYY-MM-DD format)
      // product_expiry_date: p.product_expiry_date
      //   ? p.product_expiry_date.split("T")[0]
      //   : null,

      // amc_expiry_date: p.amc_expiry_date
      //   ? p.amc_expiry_date.split("T")[0]
      //   : "",

      // insurance_expiry_date: p.insurance_expiry_date
      //   ? p.insurance_expiry_date.split("T")[0]
      //   : "",
    });

    /* ================= CATEGORIES ================= */
    setCategories(
      (editProduct.categories || []).map((c: any) => ({
        category_id: c.id,
        vendor_id: user?.vendor_id,
      }))
    );

    /* ================= PRICING ================= */
    setPricing(
      (editProduct.pricing || []).map((p: any) => ({
        title: p.title,
        value: p.value,
        tax: p.tax,
        is_tax_included: p.is_tax_included,
        currency: p.currency || "INR",
      }))
    );

    /* ================= INVENTORY ================= */
    // if (editProduct.inventory) {
    //   setInventory({
    //     status: editProduct.inventory?.status || "in_stock",
    //     stock: editProduct.inventory.stock ?? "",
    //     min_required_stock: editProduct.inventory.min_required_stock ?? "",
    //     max_stock: editProduct.inventory.max_stock ?? "",
    //     vendor_id: user?.vendor_id,
    //   });
    // }
  }, [editProduct, user?.vendor_id]);


  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    axios.get(`${baseUrl.brands}/by-vendor/${user?.vendor_id}`).then(r => setBrands(r?.data?.data?.brands || []));
    axios.get(`${baseUrl.productUnits}/by-vendor/${user?.vendor_id}`).then(r => setUnits(r?.data?.data?.product_units || []));
    axios.get(`${baseUrl.vendors}/${user?.vendor_id}/hubs`).then(r => setHubs(r?.data?.data?.hubs || []));
    axios.get(`${baseUrl.divisions}/vendor/${user?.vendor_id}`).then(r => setDivisions(r?.data?.data?.divisions || []));
    axios.get(`${baseUrl.categories}/by-vendor/${user?.vendor_id}`).then(r => setCategoriesList(r?.data?.data?.categories || []));
  }, []);


  // /* ================= EDIT MODE ================= */
  // useEffect(() => {
  //   if (editProduct) {
  //     setProduct(editProduct.product);
  //     setCategories(editProduct.categories || []);
  //     setPricing(editProduct.pricing || []);
  //     setInventory(editProduct.inventory || inventory);
  //   }
  // }, [editProduct]);

  /* ================= ADD / REMOVE ================= */
  const addCategory = () =>
    setCategories([...categories, { category_id: "", vendor_id: user?.vendor_id }]);

  const removeCategory = (index: number) =>
    setCategories(categories.filter((_, i) => i !== index));

  const addPricing = () =>
    setPricing([
      ...pricing,
      { title: "", value: "", tax: "", is_tax_included: false, currency: "INR" },
    ]);

  const removePricing = (index: number) =>
    setPricing(pricing.filter((_, i) => i !== index));

  const generateBarcode = async () => {
    try {
      setBarcodeLoading(true);

      const res = await axios.get(
        `${baseUrl.products}/generate-barcode/vendor`,
        {
          params: { vendor_id: user?.vendor_id },
        }
      );

      const barcode = res?.data?.data?.barcode;

      if (barcode) {
        setProduct((prev: any) => ({
          ...prev,
          barcode_value: barcode,
        }));
      }
    } catch (error) {
      console.error("Barcode generate failed", error);
      setApiErrors("Failed to generate barcode");
    } finally {
      setBarcodeLoading(false);
    }
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);
      setApiErrors("");

      if (!product.title || !product.sku) {
        setApiErrors("Title and SKU are required");
        return;
      }

      const productData = {
        product: {
          ...product,
          vendor_id: user.vendor_id,
          product_kind: product.product_kind || "product",
        },
        categories: categories
          .filter(c => c.category_id)   // empty remove
          .map(c => ({
            category_id: c.category_id,
            vendor_id: user.vendor_id,  // force correct vendor
          })),

        pricing: pricing.map(p => ({
          ...p,
          value: Number(p.value),
          tax: p.tax === "" ? null : Number(p.tax),
          currency: "INR"
        })),
        // inventory: {
        //   ...inventory,
        //   stock: Number(inventory.stock),
        //   min_required_stock: Number(inventory.min_required_stock),
        //   max_stock: Number(inventory.max_stock),
        //   vendor_id: user.vendor_id,
        // },
        tray_codes: [product?.tray_codes]
      };

      // ✅ FormData
      const formData = new FormData();

      // 🔑 IMPORTANT
      formData.append(
        "product_data",
        JSON.stringify(productData)
      );

      editProduct
        ? await axios.put(
          `${baseUrl.products}/${editProduct?.product?.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
        : await axios.post(
          baseUrl.products,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

      refresh();
      onCancel();
    } catch (error: any) {
      const data = error?.response?.data;

      if (data?.data?.errors) {
        const [k, v]: any = Object.entries(data.data.errors)[0];
        setApiErrors(`${k}: ${Array.isArray(v) ? v[0] : v}`);
      } else {
        setApiErrors(data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const PRICING_TYPES = [
    { id: "cost", name: "Cost" },
    { id: "selling", name: "Selling" },
    { id: "mrp", name: "MRP" },
  ];


  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="p-6 border-b font-semibold text-lg">
          {editProduct ? "Edit Product" : "Add Product"}
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* BASIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Categorie
              </label>
              <select
                value={categories[0]?.category_id || ""}
                onChange={(e) =>
                  setCategories([
                    {
                      category_id: e.target.value,
                      vendor_id: user?.vendor_id,
                    },
                  ])
                }
                className="w-full border px-3 py-2 rounded-md bg-white"
              >
                <option value="">Select Category</option>
                {categoriesList?.map((x: any) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Type
              </label>
              <select
                value={product.product_type_id}
                onChange={(e) =>
                  setProduct({ ...product, product_type_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Type</option>

                {productTypes?.map((productType: any) => (
                  <option key={productType.id} value={productType.id} className="capitalize">
                    {productType?.name} {/* or hub.name */}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Brand
              </label>
              <select
                value={product.brand_id}
                onChange={(e) =>
                  setProduct({ ...product, brand_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Brand</option>

                {brands?.map((brand: any) => (
                  <option key={brand.id} value={brand.id} className="capitalize">
                    {brand?.brand_name} {/* or hub.name */}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Title" value={product?.title} onChange={(v: any) => setProduct({ ...product, title: v })} />
            {/* <Input label="Product kind" value={product?.product_kind} onChange={(v: any) => setProduct({ ...product, product_kind: v })} /> */}


            {/* <Input label="Barcode" value={product.barcode_value} onChange={(v: any) => setProduct({ ...product, barcode_value: v })} /> */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Barcode
              </label>

              <div className="flex gap-2">
                {/* INPUT */}
                <input
                  value={product.barcode_value}
                  onChange={(e) =>
                    setProduct({ ...product, barcode_value: e.target.value })
                  }
                  placeholder="Enter barcode or generate"
                  className="flex-1 border px-3 py-2 rounded-lg"
                />

                {/* GENERATE BUTTON */}
                <button
                  type="button"
                  onClick={generateBarcode}
                  disabled={barcodeLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {barcodeLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>


            <Input label="Hsn Code" value={product.hsn_code} onChange={(v: any) => setProduct({ ...product, hsn_code: v })} />

            <Input label="SKU" value={product.sku} onChange={(v: any) => setProduct({ ...product, sku: v })} />
            {/* <Input label="Tray codes" value={product.tray_codes} onChange={(v: any) => setProduct({ ...product, tray_codes: v })} /> */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Tray codes
              </label>
              <select
                value={product.tray_codes}
                onChange={(e) =>
                  setProduct({ ...product, tray_codes: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select tray_codes</option>

                {trayOption?.map((tray: any) => (
                  <option key={tray?.division_code} value={tray?.division_code} className="capitalize">
                    {tray?.division_name} {/* or hub.name */}
                  </option>
                ))}
              </select>
            </div>
            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Hub
              </label>
              <select
                value={product.hub_id}
                onChange={(e) =>
                  setProduct({ ...product, hub_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Hub</option>

                {hubs?.map((hub: any) => (
                  <option key={hub.id} value={hub.id} className="capitalize">
                    {hub.title} 
                  </option>
                ))}
              </select>
            </div> */}

            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Division
              </label>
              <select
                value={product.division_id}
                onChange={(e) =>
                  setProduct({ ...product, division_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Division</option>

                {divisions?.map((division: any) => (
                  <option key={division.id} value={division.id} className="capitalize">
                    {division?.division_name}
                  </option>
                ))}
              </select>
            </div> */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Of Measure
              </label>
              <select
                value={product.unit_of_measure_id}
                onChange={(e) =>
                  setProduct({ ...product, unit_of_measure_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Unit</option>

                {units?.map((Unit: any) => (
                  <option key={Unit.id} value={Unit.id} className="capitalize">
                    {Unit?.value}
                  </option>
                ))}
              </select>
            </div>



            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                value={product.product_status_id}
                onChange={(e) =>
                  setProduct({ ...product, product_status_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg bg-white"
              >
                <option value="">Select Status</option>

                {productStatuses?.map((Unit: any) => (
                  <option key={Unit.id} value={Unit.id} className="capitalize">
                    {Unit?.name}
                  </option>
                ))}
              </select>
            </div> */}



            {/* <Select label="Brand" value={product.brand_id} onChange={(v: any) => setProduct({ ...product, brand_id: v })} options={brands} /> */}
            {/* <Select label="Unit" value={product.unit_of_measure_id} onChange={(v: any) => setProduct({ ...product, unit_of_measure_id: v })} options={units} labelKey="value" /> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea label="Short Description" value={product.short_description}
              onChange={(v: any) => setProduct({ ...product, short_description: v })} />

            <Textarea label="Detailed Description" value={product.detailed_description}
              onChange={(v: any) => setProduct({ ...product, detailed_description: v })} />
          </div>

          {/* ================= EXPIRY DETAILS ================= */}
          <div>
            {/* <h4 className="font-semibold mb-3">Expiry Details</h4> */}

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Expiry Date
                </label>
                <input
                  type="date"
                  value={product.product_expiry_date || ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      product_expiry_date: e.target.value || null,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AMC Expiry Date
                </label>
                <input
                  type="date"
                  value={product.amc_expiry_date || ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      amc_expiry_date: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Expiry Date
                </label>
                <input
                  type="date"
                  value={product.insurance_expiry_date || ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      insurance_expiry_date: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
            </div> */}

          </div>

          {/* CATEGORIES */}
          {/* <div>
            <h4 className="font-semibold mb-2">Categories</h4>
            {categories.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={c.category_id}
                  onChange={(e) => { const a = [...categories]; a[i].category_id = e.target.value; setCategories(a); }}
                  className="flex-1 border px-3 py-2 rounded-lg">
                  <option value="">Select Category</option>
                  {categoriesList.map((x: any) => (
                    <option key={x.id} value={x.id}>{x.title}</option>
                  ))}
                </select>
                {categories.length > 1 && (
                  <button onClick={() => removeCategory(i)} className="text-red-600">
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addCategory} className="text-blue-600 text-sm">+ Add Category</button>
          </div> */}

          {/* ================= CATEGORIES ================= */}
          {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">

        
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800">
                Categories
              </h4>
              <span className="text-xs text-gray-500">
                Assign product categories
              </span>
            </div>

            
            <div className="border-t border-gray-200" />

         
            <div className="space-y-3">
              {categories.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3"
                >
           
                  <div className="text-sm font-medium text-gray-500 w-20">
                    Category {i + 1}
                  </div>

           
                  <select
                    value={c.category_id}
                    onChange={(e) => {
                      const a = [...categories];
                      a[i].category_id = e.target.value;
                      setCategories(a);
                    }}
                    className="flex-1 border px-3 py-2 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((x: any) => (
                      <option key={x.id} value={x.id}>
                        {x.title}
                      </option>
                    ))}
                  </select>

            
                  {categories.length > 1 && (
                    <button
                      onClick={() => removeCategory(i)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove category"
                    >
                      <TrashIcon size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            Add Button
            <button
              type="button"
              onClick={addCategory}
              className="text-white bg-blue-600 rounded-md text-sm font-medium p-2"
            >
              + Add another category
            </button>
          </div> */}


          {/* ================= PRICING ================= */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-900">Pricing</h4>

            </div>

            {pricing?.map((p, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 mb-4 bg-gray-50 relative"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Pricing {i + 1}
                  </span>

                  {pricing.length > 1 && (
                    <button
                      onClick={() => removePricing(i)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove pricing"
                    >
                      <TrashIcon size={18} />
                    </button>
                  )}
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* <Select
                    label="Type"
                    value={p.title}
                    onChange={(v: any) => {
                      const a = [...pricing];
                      a[i].title = v;            // ✅ correct field
                      setPricing(a);
                    }}
                    options={[
                      { id: "cost", name: "Cost" },
                      { id: "selling", name: "Selling" },
                      { id: "mrp", name: "MRP" },
                    ]}
                  /> */}

                  <Select
                    label="Type"
                    value={p.title}
                    onChange={(v: any) => {
                      const a = [...pricing];
                      a[i].title = v;
                      setPricing(a);
                    }}
                    options={PRICING_TYPES.filter(
                      (opt) =>
                        // show if not used OR it's the current row value
                        !pricing.some(
                          (row, idx) => idx !== i && row.title === opt.id
                        )
                    )}
                  />

                  <Input
                    label="Price"
                    type="number"
                    value={p.value}
                    onChange={(v: any) => {
                      const a = [...pricing];
                      a[i].value = v;
                      setPricing(a);
                    }}
                  />

                  <Select
                    label="Tax Included"
                    value={p.is_tax_included ? "true" : "false"}
                    onChange={(v: any) => {
                      const a = [...pricing];
                      a[i].is_tax_included = v === "true";
                      setPricing(a);
                    }}
                    options={[
                      { id: "false", name: "No" },
                      { id: "true", name: "Yes" },
                    ]}
                  />

                  <Input
                    label="Tax %"
                    type="number"
                    value={p.tax || ""}
                    onChange={(v: any) => {
                      const a = [...pricing];
                      a[i].tax = v;
                      setPricing(a);
                    }}
                  />


                </div>
              </div>
            ))}

            <button
              onClick={addPricing}
              className="text-white bg-blue-600 rounded-md text-sm font-medium p-2"
            >
              + Add Pricing
            </button>
          </div>



          {/* INVENTORY */}
          {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">

          
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800">
                Inventory Details
              </h4>
              <span className="text-xs text-gray-500">
                Stock & availability
              </span>
            </div>

         
            <div className="border-t border-gray-200" />

         
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Inventory Status"
                value={product.status}
                onChange={(v: any) =>
                  setProduct({ ...product, status: v })
                }
                options={inventoryStatusOptions}
              />

              <Input
                label="Available Stock"
                type='number'
                value={inventory.stock}
                onChange={(v: any) =>
                  setInventory({ ...inventory, stock: v })
                }
              />

              <Input
                label="Minimum Stock"
                type='number'
                value={inventory.min_required_stock}
                onChange={(v: any) =>
                  setInventory({
                    ...inventory,
                    min_required_stock: v,
                  })
                }
              />

              <Input
                label="Maximum Stock"
                type='number'
                value={inventory.max_stock}
                onChange={(v: any) =>
                  setInventory({ ...inventory, max_stock: v })
                }
              />
            </div>
          </div> */}


          {apiErrors && <p className="text-red-500 text-sm text-right">{apiErrors}</p>}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {loading ? "Saving..." : editProduct ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */
const Input = ({ label, value, onChange, type }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input value={value} type={type} onChange={(e) => onChange(e.target.value)}
      className="w-full border px-3 py-2 rounded-lg" />
  </div>
);

const Textarea = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border px-3 py-2 rounded-lg" />
  </div>
);

export const Select = ({ label, value, onChange, options, labelKey = "name" }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border px-3 py-2 rounded-lg bg-white">
      <option value="">Select</option>
      {options?.map((o: any) => (
        <option key={o.id} value={o.id}>{o[labelKey]}</option>
      ))}
    </select>
  </div>
);

# Product Transfer Feature - Code Reference

## Key Functions & Logic

### 1. Product Scanning Handler
```typescript
const handleQRScan = async () => {
  setMessage("");
  if (!qrCode.trim()) return;

  // Validate action type is selected
  if (!actionTypeValue) {
    setMessage("Please select Action Type first");
    return;
  }

  // Validate FROM section for transfer
  if (actionTypeValue === 'transfer' && (!fromHub || !fromDivision || !fromTray)) {
    setMessage("Please select source Hub, Division, and Tray for transfer");
    return;
  }

  try {
    setLoading(true);
    const res = await axios.get(`${baseUrl.barcode}/${qrCode.trim()}`);

    if (res?.data?.success) {
      const productData = res.data.data;

      // If manual status mode, show modal to select status
      if (statusUpdateMode === 'manual') {
        setAsset(productData);
        setManualStatusForProduct('');
        setShowStatusModal(true);
        setQrCode(''); // Clear input for next scan
      } else {
        // Auto mode - directly add to scanned products
        addScannedProduct(productData);
      }
    } else {
      // Product not found
      setAsset(null);
      setScannedBarcode(qrCode.trim());
      setShowProductModal(true);
    }
  } catch (error: any) {
    // ... error handling
  }
};
```

### 2. Add Product to Scanned List
```typescript
const addScannedProduct = (productData: any) => {
  const newScannedProduct = {
    id: Date.now(),
    product_id: productData.id,
    barcode: productData.product.barcode_value,
    title: productData.product.title,
    sku: productData.product.sku,
    quantity: 1,
    status: statusUpdateMode === 'auto' ? toStatus : manualStatusForProduct,
    timestamp: new Date().toISOString(),
  };

  setScannedProducts([...scannedProducts, newScannedProduct]);
  setMessage('');
  setQrCode('');
  setAsset(null);
  setShowStatusModal(false);
  setManualStatusForProduct('');
};
```

### 3. Remove Product from Queue
```typescript
const removeScannedProduct = (productId: number) => {
  setScannedProducts(scannedProducts.filter(p => p.id !== productId));
};
```

### 4. Update Product Quantity
```typescript
const updateProductQuantity = (productId: number, newQuantity: number) => {
  if (newQuantity < 1) return;
  setScannedProducts(scannedProducts.map(p =>
    p.id === productId ? { ...p, quantity: newQuantity } : p
  ));
};
```

### 5. Handle Transfer Confirmation
```typescript
const handleTransferConfirmation = async () => {
  setIsTransferring(true);
  const transferPromises: any[] = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    // Create transfer API calls for each scanned product
    for (const product of scannedProducts) {
      const transferPayload = {
        parent_id: fromTray,
        product_id: product.product_id,
        hub_id: toHub,
        status: product.status || toStatus,
        division_id: toDivision,
        vendor_id: user?.vendor_id,
        tray_id: toTray,
        stock: product.quantity,
        user_id: user?.id,
        action_type: "transfer",
        previous_division_id: fromDivision,
        previous_tray_id: fromTray,
        previous_hub_id: fromHub,
      };

      transferPromises.push(
        axios.post(`${baseUrl.transferInventory}`, transferPayload)
          .then(() => {
            successCount++;
          })
          .catch((error) => {
            failureCount++;
            console.error('Transfer failed for product:', product.barcode, error);
          })
      );
    }

    // Wait for all transfers to complete
    await Promise.all(transferPromises);

    // Show summary
    if (successCount > 0) {
      setMessage(`Transfer completed: ${successCount} product(s) successfully transferred${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
    }

    if (failureCount === 0) {
      // Reset form on complete success
      setScannedProducts([]);
      localStorage.removeItem('warehouse_transfer_queue');
      setShowConfirmationModal(false);
    }

  } catch (error) {
    console.error('Transfer error:', error);
    setMessage('An error occurred during transfer. Please try again.');
  } finally {
    setIsTransferring(false);
  }
};
```

### 6. Fetch Divisions Dynamically
```typescript
const getFromDivisions = async () => {
  if (!fromHub) return;
  try {
    const res = await axios.get(
      `${baseUrl.divisions}/${fromHub}/hierarchy`
    );
    if (res?.data?.data?.division) {
      setFromDivisionsData(res.data.data.division || []);
      setFromDivision('');
      setFromTray('');
    }
  } catch (error) {
    console.error('Error fetching FROM divisions:', error);
  }
};

useEffect(() => {
  getFromDivisions();
}, [fromHub]);
```

### 7. Persist Queue to LocalStorage
```typescript
useEffect(() => {
  localStorage.setItem('warehouse_transfer_queue', JSON.stringify(scannedProducts));
}, [scannedProducts]);
```

### 8. Load Queue from LocalStorage
```typescript
const [scannedProducts, setScannedProducts] = useState<any[]>(() => {
  try {
    const saved = localStorage.getItem('warehouse_transfer_queue');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});
```

---

## Component Props

### ManualStatusModal Props
```typescript
{
  open: boolean;
  asset: any;                    // Product data
  statuses: any[];              // Available statuses
  selectedStatus: string;       // Current status selection
  onStatusChange: (status: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}
```

### TransferConfirmationModal Props
```typescript
{
  open: boolean;
  scannedProducts: any[];       // Array of products to transfer
  fromData: {
    hubName: string;
    divisionName: string;
    trayName: string;
    status?: string;
  };
  toData: {
    hubName: string;
    divisionName: string;
    trayName: string;
    status?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;        // Shows spinner while processing
}
```

---

## State Management Patterns

### Cascading Selects Pattern
```typescript
// When Hub changes
const handleHubChange = (hubId: string) => {
  setFromHub(hubId);
  // Division & Tray will auto-fetch via useEffect
  // State automatically resets via useEffect
};

// useEffect watches fromHub
useEffect(() => {
  getFromDivisions();
}, [fromHub]);

// useEffect watches fromDivision
useEffect(() => {
  getFromTrays();
}, [fromDivision]);
```

### Queue Persistence Pattern
```typescript
// 1. Load from localStorage on mount
const [scannedProducts, setScannedProducts] = useState<any[]>(() => {
  try {
    const saved = localStorage.getItem('warehouse_transfer_queue');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

// 2. Save to localStorage on every change
useEffect(() => {
  localStorage.setItem('warehouse_transfer_queue', JSON.stringify(scannedProducts));
}, [scannedProducts]);

// 3. Clear after successful transfer
if (failureCount === 0) {
  setScannedProducts([]);
  localStorage.removeItem('warehouse_transfer_queue');
}
```

---

## API Request/Response Examples

### Get Divisions
```typescript
// Request
GET /divisions/{hub_id}/hierarchy

// Response
{
  data: {
    division: [
      {
        id: "div-001",
        name: "Division A",
        trays: [
          {
            id: "tray-001",
            name: "Tray 1"
          },
          {
            id: "tray-002",
            name: "Tray 2"
          }
        ]
      }
    ]
  }
}
```

### Transfer Inventory
```typescript
// Request
POST /inventory/transfer
{
  parent_id: "tray-001",
  product_id: "prod-123",
  hub_id: "hub-456",
  status: "status-789",
  division_id: "div-001",
  vendor_id: "vendor-001",
  tray_id: "tray-002",
  stock: 5,
  user_id: "user-001",
  action_type: "transfer",
  previous_division_id: "div-001",
  previous_tray_id: "tray-001",
  previous_hub_id: "hub-123"
}

// Response
{
  success: true,
  data: {
    id: "transfer-001",
    product_id: "prod-123",
    quantity: 5,
    from: { hub: "hub-123", division: "div-001", tray: "tray-001" },
    to: { hub: "hub-456", division: "div-001", tray: "tray-002" },
    status: "completed"
  }
}
```

---

## Error Handling Patterns

### API Error Handling
```typescript
try {
  const res = await axios.get(url);
  if (res?.data?.success) {
    // Handle success
  } else {
    // Handle API success=false
  }
} catch (error: any) {
  const data = error?.response?.data;
  
  if (data?.message === "Product not found") {
    // Special handling for product not found
    setShowProductModal(true);
  } else {
    setMessage(data?.message || "Something went wrong");
  }
}
```

### Validation Error Handling
```typescript
// Check required fields before API call
if (!actionTypeValue) {
  setMessage("Please select Action Type first");
  return;
}

if (actionTypeValue === 'transfer' && (!fromHub || !fromDivision || !fromTray)) {
  setMessage("Please select source Hub, Division, and Tray for transfer");
  return;
}
```

---

## Conditional Rendering Patterns

### Show/Hide Sections Based on Action Type
```typescript
{actionTypeValue === 'transfer' && (
  <div className="...">
    {/* FROM Section only shows for Transfer */}
  </div>
)}
```

### Show Status Field Only in Auto Mode
```typescript
{statusUpdateMode === 'auto' && (
  <Select
    label="Status"
    value={toStatus}
    onChange={setToStatus}
    options={productStatuses}
  />
)}
```

### Disable Dependent Dropdowns
```typescript
<Select
  label="Division"
  disabled={!fromHub}  // Only enable if Hub selected
  ...
/>
```

---

## Performance Optimization Techniques

### Debounce Barcode Input
```typescript
useEffect(() => {
  if (!qrCode) return;

  const timer = setTimeout(() => {
    handleQRScan();
  }, 300); // 300ms debounce

  return () => clearTimeout(timer);
}, [qrCode]);
```

### Batch API Calls
```typescript
const transferPromises = [];

for (const product of scannedProducts) {
  transferPromises.push(
    axios.post(url, payload)
  );
}

// Execute all in parallel
await Promise.all(transferPromises);
```

### Memoized Data
```typescript
// Divisions data is fetched once and cached
const [fromDivisionsData, setFromDivisionsData] = useState<any[]>([]);

// Only refetch when Hub changes
useEffect(() => {
  getFromDivisions();
}, [fromHub]); // Only dependency
```

---

## Testing Scenarios

```typescript
// Test 1: Valid transfer with auto status
const testAutoTransfer = () => {
  setActionTypeValue('transfer');
  setFromHub('hub-1');
  // Wait for divisions to load
  setFromDivision('div-1');
  setFromTray('tray-1');
  setStatusUpdateMode('auto');
  setToHub('hub-2');
  setToDivision('div-2');
  setToTray('tray-2');
  setToStatus('status-active');
  setQrCode('BARCODE123');
  // Should add to queue automatically
};

// Test 2: Valid transfer with manual status
const testManualTransfer = () => {
  setStatusUpdateMode('manual');
  setQrCode('BARCODE456');
  // Should show status modal
  setManualStatusForProduct('status-testing');
  // Confirm should add to queue
};

// Test 3: Product not found
const testProductNotFound = () => {
  setQrCode('INVALID_BARCODE');
  // Should show product modal
};

// Test 4: Queue persistence
const testQueuePersistence = () => {
  // Add products to queue
  // Reload page
  // Queue should restore from localStorage
};
```


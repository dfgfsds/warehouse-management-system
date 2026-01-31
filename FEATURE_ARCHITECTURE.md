# Product Transfer Feature - Architecture & Data Flow

## Component Structure

```
ScanAsset Component
├── State Management
│   ├── Barcode & Asset Scanning
│   ├── Action Type (Add/Transfer)
│   ├── FROM Location State (Transfer only)
│   ├── TO Location State
│   ├── Status Update Mode (Auto/Manual)
│   ├── Scanned Products Queue (with localStorage)
│   └── Modal States
│
├── UI Sections
│   ├── Header
│   ├── Mode Selection (Action Type)
│   ├── FROM Section (Transfer only)
│   │   ├── Hub Dropdown
│   │   ├── Division Dropdown (cascading)
│   │   ├── Tray Dropdown (cascading)
│   │   └── Status Filter
│   │
│   ├── Scanner Input
│   │   ├── Barcode/QR Input Field
│   │   └── Scan Button
│   │
│   ├── Status Update Mode Toggle
│   │   ├── Auto Mode
│   │   └── Manual Mode
│   │
│   ├── TO Section (Destination)
│   │   ├── Hub Dropdown
│   │   ├── Division Dropdown (cascading)
│   │   ├── Tray Dropdown (cascading)
│   │   └── Status Dropdown (Auto mode only)
│   │
│   ├── Scanned Products Table
│   │   ├── Product Details (Barcode, Title, SKU)
│   │   ├── Editable Quantity Field
│   │   ├── Status Badge
│   │   ├── Remove Button
│   │   ├── Total Quantity Counter
│   │   ├── Clear All Button
│   │   └── Proceed Transfer Button
│   │
│   ├── Product Details Display (when showing fetched product)
│   │   └── Product Information
│   │
│   └── Modals
│       ├── Manual Status Selection Modal
│       ├── Add Product Modal (when product not found)
│       └── Transfer Confirmation Modal
│
└── API Integration
    ├── Get Hubs
    ├── Get Divisions by Hub
    ├── Get Trays by Division
    ├── Get Product by Barcode
    ├── Get Product Statuses
    └── POST Transfer Inventory
```

## State Variables Overview

### Scanning State
```typescript
const [qrCode, setQrCode] = useState("");
const [asset, setAsset] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
```

### Action Type
```typescript
const [actionTypeValue, setActionTypeValue] = useState('');
// 'add' | 'transfer'
```

### FROM Section (Transfer Source)
```typescript
const [fromHub, setFromHub] = useState('');
const [fromDivision, setFromDivision] = useState('');
const [fromTray, setFromTray] = useState('');
const [fromDivisionsData, setFromDivisionsData] = useState<any[]>([]);
const [fromTraysData, setFromTraysData] = useState<any[]>([]);
const [sourceStatusFilter, setSourceStatusFilter] = useState('');
```

### TO Section (Transfer Destination)
```typescript
const [toHub, setToHub] = useState('');
const [toDivision, setToDivision] = useState('');
const [toTray, setToTray] = useState('');
const [toDivisionsData, setToDivisionsData] = useState<any[]>([]);
const [toTraysData, setToTraysData] = useState<any[]>([]);
const [toStatus, setToStatus] = useState('');
```

### Status Update Mode
```typescript
const [statusUpdateMode, setStatusUpdateMode] = useState<'auto' | 'manual'>('auto');
const [manualStatusForProduct, setManualStatusForProduct] = useState('');
```

### Scanned Products
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

### Modals
```typescript
const [showProductModal, setShowProductModal] = useState(false);
const [showStatusModal, setShowStatusModal] = useState(false);
const [showConfirmationModal, setShowConfirmationModal] = useState(false);
const [isTransferring, setIsTransferring] = useState(false);
```

---

## Data Flow Diagram

### Scanning & Adding Products
```
┌─────────────────────────────────────────────────────────────────┐
│ User Scans Barcode                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Validate Action Type Selected                                   │
│ If Transfer: Validate FROM section (Hub, Division, Tray)        │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
                  ✓ Valid?
                   / \
                  /   \
            Yes /       \ No
               /         \
              ↓           ↓
        Fetch Product  Show Error
        from API       Message
              |
              ↓
         Product Found?
          / \
       Yes   No
       /       \
      ↓         ↓
    Check    Ask User
    Status   to Add New
    Mode     Product
    |         |
    |    ┌────┴────┐
    |    Yes      No
    |    |         |
    |    |    Skip to
    |    |    Next Scan
    |    |
Manual?  |
 / \     |
/   \    |
Yes  No  |
|    |   |
|    └──→+─→Add to Queue
|        |
Show  Use Fixed
Modal Status
|    from TO
│
├─→ User
    Selects  ─→ Add to Queue
    Status      │
                ↓
            Clear Input
            │
            ↓
        Display in Table
            │
            ↓
    Ready for Next Scan
```

### Transfer Execution
```
┌──────────────────────────────────────────┐
│ User Clicks: Proceed Transfer            │
└──────────────────────┬───────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│ Show Confirmation Modal                  │
│ - FROM details                           │
│ - TO details                             │
│ - All scanned products with quantities   │
└──────────────────────┬───────────────────┘
                       ↓
                   User Confirms?
                    / \
                   /   \
             Yes  /     \ No
                 /       \
                ↓         ↓
        Execute       Cancel
        Transfer      Modal
        │
        ↓
    For Each Product:
    POST transferInventory API
    {
      parent_id: fromTray,
      product_id,
      hub_id: toHub,
      status,
      division_id: toDivision,
      vendor_id,
      tray_id: toTray,
      stock: quantity,
      user_id,
      action_type: "transfer",
      previous_division_id: fromDivision,
      previous_tray_id: fromTray,
      previous_hub_id: fromHub
    }
    │
    ├─→ Success: successCount++
    │
    └─→ Error: failureCount++
        │
        ↓
    All Promises Resolved
    │
    ├─→ All Success?
    │   │
    │   ├─ Yes: Clear Queue
    │   │       Show Success Message
    │   │       Reset Form
    │   │
    │   └─ No: Show Mixed Result
    │          Keep Queue for Retry
    │
    └─→ Error: Show Error Message
```

---

## Cascading Dropdown Logic

### FROM Section Cascading
```
User selects FROM Hub
        ↓
Fetch divisions for that Hub
        ↓
User selects FROM Division
        ↓
Extract trays from division data
        ↓
User selects FROM Tray
```

### TO Section Cascading
```
User selects TO Hub
        ↓
Fetch divisions for that Hub
        ↓
User selects TO Division
        ↓
Extract trays from division data
        ↓
User selects TO Tray
```

---

## Product Queue Data Structure

### Scanned Product Object
```typescript
{
  id: number,                    // Unique local ID (timestamp)
  product_id: string,            // From API response
  barcode: string,               // Product barcode
  title: string,                 // Product name
  sku: string,                   // Product SKU
  quantity: number,              // Editable quantity
  status: string,                // Selected status ID
  timestamp: ISO8601 string      // When scanned
}
```

### LocalStorage Key
```
warehouse_transfer_queue
```

### Persistence Flow
```
Scanned Product Added
        ↓
setScannedProducts([...old, new])
        ↓
useEffect triggered
        ↓
localStorage.setItem('warehouse_transfer_queue', JSON.stringify(scannedProducts))
        ↓
Data persists across page reload/browser close
```

---

## API Endpoints Used

1. **Get Warehouses/Hubs**
   ```
   GET /vendors/{vendor_id}/hubs
   ```

2. **Get Divisions Hierarchy**
   ```
   GET /divisions/{hub_id}/hierarchy
   ```

3. **Get Product by Barcode**
   ```
   GET /products/barcode/{barcode}
   ```

4. **Get Product Statuses**
   ```
   GET /statuses?vendor_id={vendor_id}
   ```

5. **Transfer Inventory** (New)
   ```
   POST /inventory/transfer
   ```

---

## Error Handling

### Scanning Errors
- Action Type not selected → Show message
- FROM section incomplete (Transfer) → Show message
- Invalid barcode format → Show API error
- Product not found → Offer to add new product

### Transfer Errors
- Missing destination details → Show message before confirmation
- API call failure → Log error, increment failure count, show message
- Mixed success/failure → Show summary, allow retry

---

## User Permissions & Validation

- Only valid action types allowed: 'add', 'transfer'
- Barcode validation via API
- Quantity must be ≥ 1
- Cannot transfer without complete FROM/TO location
- Cannot proceed without scanned products in queue

---

## Performance Optimizations

1. **Debounced Barcode Input**: 300ms delay before API call (prevents multiple rapid calls)
2. **LocalStorage Persistence**: Queue survives page reload
3. **Cascading Selects**: Divisions/Trays fetched only when needed
4. **Memoized Dropdowns**: Data cached until parent selection changes
5. **Batch API Calls**: All transfers sent in parallel Promise.all()

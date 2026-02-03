# Product Transfer Feature - User Guide

## 🎯 Feature Overview

This feature allows warehouse operators to efficiently transfer products from one location (Hub > Division > Tray) to another, with support for both:
- **Individual status selection** (Manual Mode) - Select status for each product
- **Bulk status update** (Auto Mode) - Apply same status to all products

---

## 📋 Step-by-Step Usage

### Step 1: Select Action Type
At the top of the form, choose your operation:
- **"Add New Stock"** - Add products without source location
- **"Transfer"** - Move products from one location to another

### Step 2a: If Choosing TRANSFER - Set Source Location
The "From (Source Location)" section will appear:

1. **Select Hub** - Choose the warehouse/hub containing the products
2. **Select Division** - Choose the division (automatically fetched after Hub selection)
3. **Select Tray** - Choose the source tray (automatically fetched after Division selection)
4. **Optional: Status Filter** - Filter products by status in the source location

### Step 2b: If Choosing ADD - Skip to Step 3
Source location fields will be hidden.

### Step 3: Choose Status Update Mode
Select how you want to update product statuses:

**"Auto (Use fixed status)"**
- All scanned products get the same status
- Status field appears in "To (Destination)" section
- Faster for bulk transfers with uniform status

**"Manual (Select per product)"**
- Status selection modal appears after each product scan
- Different statuses for different products in same transfer
- More control but requires additional clicks

### Step 4: Set Destination Location
The "To (Destination Location)" section:

1. **Select Hub** - Choose destination warehouse/hub
2. **Select Division** - Choose destination division (auto-fetches based on Hub)
3. **Select Tray** - Choose destination tray (auto-fetches based on Division)
4. **If Auto Mode: Select Status** - Choose status for all products

*Note: Status field only appears in Auto Mode. In Manual Mode, you'll select status per product.*

### Step 5: Scan Products
1. Click in the **"QR / Barcode"** input field (auto-focused)
2. Scan or manually enter a barcode
3. System automatically fetches product after 300ms or when you press Enter

**If Manual Mode:**
- Status selection modal appears
- Select the product status from dropdown
- Click "Confirm & Add"
- Product added to table, input cleared for next scan

**If Auto Mode:**
- Product automatically added to table with Auto status
- Input cleared for next scan
- Continue scanning next product

### Step 6: Review Scanned Products
In the "Scanned Products" table, you can:

- **Edit Quantity**: Click the quantity field and change the number (must be ≥ 1)
- **Remove Product**: Click "Remove" button to delete from transfer queue
- **Clear All**: Clear entire queue and start fresh
- **View Total**: Total quantity shown at top of table

### Step 7: Proceed to Transfer
When satisfied with all products and quantities:

1. Click **"Proceed Transfer"** button
2. Confirmation modal will appear showing:
   - **From details**: Source Hub, Division, Tray, Status filter
   - **To details**: Destination Hub, Division, Tray, Status
   - **Products list**: All items with quantities
   - **Total quantity**: Sum of all quantities

### Step 8: Confirm Transfer
Review the execution plan in the modal:
- Verify all source and destination details
- Check all products and quantities
- Click **"Confirm Transfer"** to execute

*Note: This will send API calls for all products in parallel.*

### Step 9: Transfer Complete
After successful transfer:
- Success message displays showing count of transferred products
- Queue automatically clears
- LocalStorage queue is emptied
- Form ready for next transfer
- Scan field auto-focused

---

## 🔄 Workflow Examples

### Example 1: Transfer 5 Units of Same Product (Auto Mode)
```
1. Select Action Type: "Transfer"
2. FROM: Hub A > Division 1 > Tray 1
3. Mode: "Auto"
4. TO: Hub B > Division 2 > Tray 2
5. Status: "Active"
6. Scan Product Barcode: ABC123
   → Automatically added to queue (Qty: 1)
7. Edit Quantity: Change to 5
8. Click "Proceed Transfer"
9. Confirm in modal
10. Done! 5 units transferred
```

### Example 2: Transfer Multiple Products with Different Statuses (Manual Mode)
```
1. Select Action Type: "Transfer"
2. FROM: Hub A > Division 1 > Tray 1
3. Mode: "Manual"
4. TO: Hub B > Division 2 > Tray 2
5. Scan Product 1: XYZ789
   → Modal appears: Select Status "Active"
   → Click "Confirm & Add"
6. Scan Product 2: DEF456
   → Modal appears: Select Status "Testing"
   → Click "Confirm & Add"
7. Scan Product 3: GHI123
   → Modal appears: Select Status "Testing"
   → Click "Confirm & Add"
8. Table shows 3 products with different statuses
9. Click "Proceed Transfer"
10. Confirm in modal
11. Done! 3 products with different statuses transferred
```

### Example 3: Add New Stock (No Source)
```
1. Select Action Type: "Add New Stock"
2. Source section hidden
3. TO: Hub B > Division 2 > Tray 2 (only visible section)
4. Status: "Active"
5. Scan Product: NEW001
   → Added to queue
6. Scan Product: NEW002
   → Added to queue
7. Edit quantities as needed
8. Proceed Transfer
9. Done! New products added to destination location
```

---

## ⚠️ Important Notes

### Validation Rules
- Must select Action Type before scanning
- For Transfer: Must select FROM Hub, Division, and Tray
- Barcode must exist in system (or offer to create new)
- Quantity must be at least 1
- Destination must be fully specified before transfer

### Data Persistence
- Scanned products queue is **saved to browser LocalStorage**
- If page is refreshed, queue is restored automatically
- Queue persists until:
  - Transfer completes successfully
  - User clicks "Clear All"
  - User manually removes all products

### Status Update
- **Auto Mode**: All products in transfer get same status
- **Manual Mode**: Each product gets its own selected status
- Status applies at destination, not source

### Cascading Dropdowns
- Changing Hub automatically clears Division & Tray
- Changing Division automatically clears Tray
- Always refetch latest data when parent changes

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Barcode not found | Barcode doesn't exist in system. Option to add new product appears. |
| Division not showing | Select Hub first. Divisions are fetched based on selected Hub. |
| Tray not showing | Select Division first. Trays are fetched based on selected Division. |
| Product added with quantity 0 | Edit quantity in table. Minimum is 1. |
| Status modal not appearing | Check if Manual Mode is selected. Auto Mode skips status modal. |
| Transfer failed | Check API error message. Network issue or invalid data. |
| Queue disappeared | Page may have crashed. Try refreshing - queue auto-restores from LocalStorage. |

---

## 🎨 UI Elements Reference

### Buttons & Controls

| Element | Purpose |
|---------|---------|
| Scan Button | Manual trigger for barcode validation |
| Proceed Transfer | Validates and shows confirmation |
| Confirm Transfer (in modal) | Executes the transfer |
| Remove (in table) | Delete product from queue |
| Clear All | Empty entire queue |

### Color Coding

| Color | Meaning |
|-------|---------|
| Blue bar | FROM (Source) section |
| Green bar | TO (Destination) section |
| Purple bar | Status Mode selection |
| Green button | Proceed/Confirm transfer |
| Red button | Remove product |

### Status Indicators

| Element | Status |
|---------|--------|
| Modal with spinner | Transfer processing |
| Green message | Success |
| Red message | Error |
| Table row count | Number of products ready |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Scan product (in barcode field) |
| Tab | Move to next field |
| Click away | Close any open dropdown |

---

## 📊 Data Validation

Before transfer, system validates:
- ✅ Action type selected
- ✅ For Transfer: FROM location complete
- ✅ TO location complete
- ✅ At least 1 product scanned
- ✅ All quantities ≥ 1
- ✅ All products have valid IDs
- ✅ Status selected (if required)

---

## 🔐 Permissions

Ensure user has permission to:
- Access source Hub/Division/Tray (for Transfer)
- Access destination Hub/Division/Tray
- Modify product status
- Create transfer records

---

## 💾 Data Saved

After successful transfer:
- ✅ Product moved to new location
- ✅ Status updated (if applicable)
- ✅ Transfer record created
- ✅ History/audit trail logged
- ✅ LocalStorage queue cleared

---

## 🆘 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all dropdowns are properly selected
3. Ensure barcode/product exists
4. Check network connectivity
5. Try refreshing the page
6. Contact your system administrator if problem persists


import { User, Asset, AssetEvent, Warehouse, ProductType, ScanOperation, Section, Tray, AssetStatus } from '../types';

const STORAGE_KEYS = {
  USER: 'warehouse_user',
  ASSETS: 'warehouse_assets',
  EVENTS: 'warehouse_events',
  WAREHOUSES: 'warehouse_warehouses',
  PRODUCT_TYPES: 'warehouse_product_types',
  CURRENT_SCAN: 'warehouse_current_scan',
  USERS: 'warehouse_users_list',
} as const;

export class StorageManager {
  static getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  static setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getAssets(): Asset[] {
    const assets = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return assets ? JSON.parse(assets) : [];
  }

  static setAssets(assets: Asset[]): void {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }

  static addAsset(asset: Asset): void {
    const assets = this.getAssets();
    assets.push(asset);
    this.setAssets(assets);
  }

  static updateAsset(assetId: string, updates: Partial<Asset>): void {
    const assets = this.getAssets();
    const index = assets.findIndex(a => a.id === assetId);
    if (index !== -1) {
      assets[index] = { ...assets[index], ...updates };
      // If quantity becomes 0 or less, remove the asset? 
      // User might want to keep record with 0 stock? Usually we delete or mark empty.
      // For now let's keep it unless explicitly deleted, but typically WMS removes empty records or shows 0.
      // If quantity is updated to <= 0, let's remove it to keep inventory clean unless it's a specific requirement.
      if (updates.quantity !== undefined && updates.quantity <= 0) {
        assets.splice(index, 1);
      } else {
        assets[index] = { ...assets[index], ...updates };
      }
      this.setAssets(assets);
    }
  }

  static deleteAsset(assetId: string): void {
    const assets = this.getAssets();
    const newAssets = assets.filter(a => a.id !== assetId);
    this.setAssets(newAssets);
  }

  static getAssetById(id: string): Asset | null {
    const assets = this.getAssets();
    return assets.find(a => a.id === id) || null;
  }

  // Find any instance of this QR (first match)
  static getAssetByQR(qrCode: string): Asset | null {
    const assets = this.getAssets();
    return assets.find(a => a.qrCode.toLowerCase() === qrCode.toLowerCase()) || null;
  }

  // Find specific asset record at a specific location
  static getAssetAtLocation(qrCode: string, trayId: string): Asset | null {
    const assets = this.getAssets();
    return assets.find(a =>
      a.qrCode.toLowerCase() === qrCode.toLowerCase() &&
      a.trayId === trayId
    ) || null;
  }

  static getEvents(): AssetEvent[] {
    const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return events ? JSON.parse(events) : [];
  }

  static addEvent(event: AssetEvent): void {
    const events = this.getEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  static getEventsByAssetId(assetId: string): AssetEvent[] {
    const events = this.getEvents();
    return events.filter(e => e.assetId === assetId).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static getWarehouses(): Warehouse[] {
    const warehouses = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
    return warehouses ? JSON.parse(warehouses) : [];
  }

  static setWarehouses(warehouses: Warehouse[]): void {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
  }

  static getProductTypes(): ProductType[] {
    const types = localStorage.getItem(STORAGE_KEYS.PRODUCT_TYPES);
    return types ? JSON.parse(types) : [];
  }

  static setProductTypes(types: ProductType[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCT_TYPES, JSON.stringify(types));
  }

  static getCurrentScan(): ScanOperation | null {
    const scan = localStorage.getItem(STORAGE_KEYS.CURRENT_SCAN);
    return scan ? JSON.parse(scan) : null;
  }

  static setCurrentScan(scan: ScanOperation | null): void {
    if (scan) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SCAN, JSON.stringify(scan));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SCAN);
    }
  }

  // --- Helper Methods for Locations ---

  static getHubs(): Warehouse[] {
    return this.getWarehouses();
  }

  static getDivisions(hubId: string): Section[] {
    const hub = this.getWarehouses().find(w => w.id === hubId);
    return hub ? hub.sections : [];
  }

  static getTrays(hubId: string, divisionId: string): Tray[] {
    const divisions = this.getDivisions(hubId);
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.trays : [];
  }

  static getAssetsByTray(trayId: string): Asset[] {
    const assets = this.getAssets();
    // Sort by Product Type then Code
    return assets.filter(a => a.trayId === trayId).sort((a, b) => a.productType?.localeCompare(b.productType));
  }

  // --- Initialization ---

  static initializeDefaultData(): void {
    // Initialize default users if none exist
    if (this.getUsers().length === 0) {
      const defaultUsers: User[] = [
        { id: 'user-001', username: 'john_manager', email: 'john@example.com', role: 'warehouse_manager', warehouseIds: ['wh-001'], deviceId: 'dev-001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      this.setUsers(defaultUsers);
    }

    if (this.getWarehouses().length === 0) {
      const defaultWarehouses: Warehouse[] = [
        {
          id: 'hub-001',
          name: 'Main Hub',
          code: 'HUB01',
          address: '123 Main St',
          managerId: 'user-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: [
            {
              id: 'div-001',
              name: 'Electronics',
              code: 'ELEC',
              warehouseId: 'hub-001',
              createdAt: new Date().toISOString(),
              trays: [
                { id: 'tray-001', name: 'Tray A1', code: 'A1', sectionId: 'div-001', capacity: 100, currentCount: 0, createdAt: new Date().toISOString() },
                { id: 'tray-002', name: 'Tray A2', code: 'A2', sectionId: 'div-001', capacity: 100, currentCount: 0, createdAt: new Date().toISOString() },
                { id: 'tray-003', name: 'Tray A3', code: 'A3', sectionId: 'div-001', capacity: 100, currentCount: 0, createdAt: new Date().toISOString() },
              ]
            },
            {
              id: 'div-002',
              name: 'Appliance',
              code: 'APPL',
              warehouseId: 'hub-001',
              createdAt: new Date().toISOString(),
              trays: [
                { id: 'tray-004', name: 'Tray B1', code: 'B1', sectionId: 'div-002', capacity: 50, currentCount: 0, createdAt: new Date().toISOString() },
                { id: 'tray-005', name: 'Tray B2', code: 'B2', sectionId: 'div-002', capacity: 50, currentCount: 0, createdAt: new Date().toISOString() },
              ]
            }
          ]
        },
        {
          id: 'hub-002',
          name: 'North Hub',
          code: 'HUB02',
          address: '456 North Rd',
          managerId: 'user-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: [
            {
              id: 'div-003',
              name: 'Spares',
              code: 'SPAR',
              warehouseId: 'hub-002',
              createdAt: new Date().toISOString(),
              trays: [
                { id: 'tray-006', name: 'Tray C1', code: 'C1', sectionId: 'div-003', capacity: 200, currentCount: 0, createdAt: new Date().toISOString() },
                { id: 'tray-007', name: 'Tray C2', code: 'C2', sectionId: 'div-003', capacity: 200, currentCount: 0, createdAt: new Date().toISOString() },
              ]
            }
          ]
        }
      ];
      this.setWarehouses(defaultWarehouses);
    }

    if (this.getProductTypes().length === 0) {
      const defaultProductTypes: ProductType[] = [
        { id: 'pt-001', name: 'Washing Machine', code: 'WM', category: 'Appliance', isDismantleable: true, defaultParts: [] },
        { id: 'pt-002', name: 'AC Unit', code: 'AC', category: 'Appliance', isDismantleable: false, defaultParts: [] },
        { id: 'pt-003', name: 'LED TV', code: 'TV', category: 'Appliance', isDismantleable: false, defaultParts: [] },
        { id: 'pt-004', name: 'Microwave', code: 'MW', category: 'Appliance', isDismantleable: false, defaultParts: [] },
      ];
      this.setProductTypes(defaultProductTypes);
    }

    if (this.getAssets().length === 0) {
      const sampleAssets: Asset[] = [
        {
          id: 'asset-101',
          qrCode: 'WM-1001',
          productType: 'Washing Machine',
          quantity: 5,
          status: 'working',
          warehouseId: 'hub-001',
          sectionId: 'div-001',
          trayId: 'tray-001',
          parentAssetId: undefined,
          childAssetIds: [],
          isPacked: false,
          isDispatched: false,
          receivedAt: new Date().toISOString(),
          lastMovedAt: new Date().toISOString(),
          lastHandledBy: 'user-001',
          deviceId: 'dev-001',
          metadata: {}
        },
        {
          id: 'asset-102',
          qrCode: 'TV-2002',
          productType: 'LED TV',
          quantity: 2,
          status: 'needs_fix',
          warehouseId: 'hub-001',
          sectionId: 'div-001',
          trayId: 'tray-002',
          parentAssetId: undefined,
          childAssetIds: [],
          isPacked: false,
          isDispatched: false,
          receivedAt: new Date().toISOString(),
          lastMovedAt: new Date().toISOString(),
          lastHandledBy: 'user-001',
          deviceId: 'dev-001',
          metadata: {}
        }
      ];
      this.setAssets(sampleAssets);

      // Events...
    }
  }
}
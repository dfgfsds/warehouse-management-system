import { User, Asset, AssetEvent, Warehouse, ProductType, ScanOperation } from '../types';

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
      this.setAssets(assets);
    }
  }

  static getAssetById(id: string): Asset | null {
    const assets = this.getAssets();
    return assets.find(a => a.id === id) || null;
  }

  static getAssetByQR(qrCode: string): Asset | null {
    const assets = this.getAssets();
    return assets.find(a => a.qrCode === qrCode) || null;
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

  static initializeDefaultData(): void {
    // Initialize default users if none exist
    if (this.getUsers().length === 0) {
      const defaultUsers: User[] = [
        { id: 'user-001', username: 'john_manager', email: 'john@example.com', role: 'warehouse_manager', warehouseIds: ['wh-001'], deviceId: 'dev-001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'user-002', username: 'jane_operator', email: 'jane@example.com', role: 'operator', warehouseIds: ['wh-001'], deviceId: 'dev-002', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'user-003', username: 'bob_operator', email: 'bob@example.com', role: 'operator', warehouseIds: ['wh-001'], deviceId: 'dev-003', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      this.setUsers(defaultUsers);
    }

    // Initialize default warehouses if none exist
    if (this.getWarehouses().length === 0) {
      const defaultWarehouses: Warehouse[] = [
        {
          id: 'wh-001',
          name: 'Main Warehouse',
          code: 'WH001',
          address: '123 Industrial Ave',
          managerId: 'user-001',
          sections: [
            {
              id: 'sec-001',
              name: 'Receiving',
              code: 'REC',
              warehouseId: 'wh-001',
              trays: [
                { id: 'tray-001', name: 'Tray A1', code: 'A1', sectionId: 'sec-001', capacity: 50, currentCount: 0, createdAt: new Date().toISOString() },
                { id: 'tray-002', name: 'Tray A2', code: 'A2', sectionId: 'sec-001', capacity: 50, currentCount: 0, createdAt: new Date().toISOString() }
              ],
              createdAt: new Date().toISOString()
            },
            {
              id: 'sec-002',
              name: 'Processing',
              code: 'PROC',
              warehouseId: 'wh-001',
              trays: [
                { id: 'tray-003', name: 'Tray B1', code: 'B1', sectionId: 'sec-002', capacity: 30, currentCount: 0, createdAt: new Date().toISOString() },
                { id: 'tray-004', name: 'Tray B2', code: 'B2', sectionId: 'sec-002', capacity: 30, currentCount: 0, createdAt: new Date().toISOString() }
              ],
              createdAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.setWarehouses(defaultWarehouses);
    }

    // Initialize default product types
    if (this.getProductTypes().length === 0) {
      const defaultProductTypes: ProductType[] = [
        {
          id: 'pt-001',
          name: 'Washing Machine',
          code: 'WM',
          category: 'Appliance',
          isDismantleable: true,
          defaultParts: ['Motor', 'Drum', 'Control Panel', 'Door', 'Pump']
        },
        {
          id: 'pt-002',
          name: 'Refrigerator',
          code: 'RF',
          category: 'Appliance',
          isDismantleable: true,
          defaultParts: ['Compressor', 'Evaporator', 'Door Seals', 'Shelves']
        },
        {
          id: 'pt-003',
          name: 'Dishwasher',
          code: 'DW',
          category: 'Appliance',
          isDismantleable: true,
          defaultParts: ['Pump', 'Motor', 'Control Board', 'Spray Arms']
        },
        {
          id: 'pt-004',
          name: 'Microwave',
          code: 'MW',
          category: 'Appliance',
          isDismantleable: false,
          defaultParts: []
        }
      ];
      this.setProductTypes(defaultProductTypes);
    }

    // Add some sample assets for demo
    if (this.getAssets().length === 0) {
      const sampleAssets: Asset[] = [
        {
          id: 'asset-001',
          qrCode: 'AST-001-DEMO',
          productType: 'Washing Machine',
          status: 'working',
          warehouseId: 'wh-001',
          sectionId: 'sec-001',
          trayId: 'tray-001',
          parentAssetId: undefined,
          childAssetIds: [],
          isPacked: false,
          isDispatched: false,
          receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastMovedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastHandledBy: 'user-003',
          deviceId: 'device-demo',
          metadata: {}
        },
        {
          id: 'asset-002',
          qrCode: 'AST-002-DEMO',
          productType: 'Refrigerator',
          status: 'needs_fix',
          warehouseId: 'wh-001',
          sectionId: 'sec-002',
          trayId: 'tray-003',
          parentAssetId: undefined,
          childAssetIds: [],
          isPacked: false,
          isDispatched: false,
          receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          lastMovedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastHandledBy: 'user-002',
          deviceId: 'device-demo',
          metadata: {}
        },
        {
          id: 'asset-003',
          qrCode: 'AST-003-DEMO',
          productType: 'Dishwasher',
          status: 'scrap',
          warehouseId: 'wh-001',
          sectionId: 'sec-001',
          trayId: 'tray-002',
          parentAssetId: undefined,
          childAssetIds: [],
          isPacked: true,
          isDispatched: false,
          receivedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastMovedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastHandledBy: 'user-001',
          deviceId: 'device-demo',
          metadata: {}
        }
      ];
      this.setAssets(sampleAssets);

      // Add some sample events
      const sampleEvents: AssetEvent[] = [
        {
          id: 'event-001',
          assetId: 'asset-001',
          type: 'RECEIVED',
          userId: 'user-003',
          deviceId: 'device-demo',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'event-002',
          assetId: 'asset-001',
          type: 'STATUS_CHANGED',
          fromStatus: 'testing',
          toStatus: 'working',
          userId: 'user-002',
          deviceId: 'device-demo',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'event-003',
          assetId: 'asset-002',
          type: 'RECEIVED',
          userId: 'user-003',
          deviceId: 'device-demo',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      sampleEvents.forEach(event => this.addEvent(event));
    }
  }
}
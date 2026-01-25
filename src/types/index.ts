export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  warehouseIds: string[];
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'warehouse_manager' | 'operator' | 'auditor';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  managerId: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  trays: Tray[];
  assignedUserId?: string;
  createdAt: string;
}

export interface Tray {
  id: string;
  name: string;
  code: string;
  sectionId: string;
  capacity: number;
  currentCount: number;
  assignedUserId?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  qrCode: string;
  productType: string;
  status: AssetStatus;
  warehouseId: string;
  sectionId: string;
  trayId: string;
  parentAssetId?: string;
  childAssetIds: string[];
  isPacked: boolean;
  isDispatched: boolean;
  receivedAt: string;
  lastMovedAt: string;
  lastHandledBy: string;
  deviceId: string;
  metadata: Record<string, any>;
}

export type AssetStatus = 'working' | 'needs_fix' | 'scrap' | 'reserved' | 'damaged' | 'testing';

export interface AssetEvent {
  id: string;
  assetId: string;
  type: EventType;
  fromLocation?: Location;
  toLocation?: Location;
  fromStatus?: AssetStatus;
  toStatus?: AssetStatus;
  userId: string;
  deviceId: string;
  timestamp: string;
  metadata?: Record<string, any>;
  remarks?: string;
}

export type EventType =
  | 'RECEIVED'
  | 'MOVED'
  | 'STATUS_CHANGED'
  | 'PACKED'
  | 'UNPACKED'
  | 'DISPATCHED'
  | 'DISMANTLED'
  | 'CREATED_FROM_DISMANTLE';

export interface Location {
  warehouseId: string;
  warehouseName: string;
  sectionId: string;
  sectionName: string;
  trayId: string;
  trayName: string;
}

export interface ProductType {
  id: string;
  name: string;
  code: string;
  category: string;
  isDismantleable: boolean;
  defaultParts: string[];
}

export interface DashboardStats {
  totalAssets: number;
  assetsByStatus: Record<AssetStatus, number>;
  assetsByWarehouse: Record<string, number>;
  recentActivity: AssetEvent[];
  agingStats: {
    days0to2: number;
    days3to7: number;
    days7plus: number;
  };
}

export interface ScanOperation {
  type: 'move' | 'status' | 'pack' | 'unpack' | 'dispatch' | 'dismantle';
  assetId?: string;
  data?: any;
}
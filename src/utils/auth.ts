import { User, UserRole } from '../types';
import { StorageManager } from './storage';

export class AuthManager {
  static login(username: string, password: string): User | null {
    // Mock authentication - in real app, this would call an API
    try {
      const mockUsers: Record<string, { password: string; user: User }> = {
        'admin': {
          password: 'admin123',
          user: {
            id: 'user-001',
            username: 'admin',
            email: 'admin@warehouse.com',
            role: 'super_admin',
            warehouseIds: ['wh-001'],
            deviceId: this.getDeviceId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        'manager': {
          password: 'manager123',
          user: {
            id: 'user-002',
            username: 'manager',
            email: 'manager@warehouse.com',
            role: 'warehouse_manager',
            warehouseIds: ['wh-001'],
            deviceId: this.getDeviceId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        'operator': {
          password: 'operator123',
          user: {
            id: 'user-003',
            username: 'operator',
            email: 'operator@warehouse.com',
            role: 'operator',
            warehouseIds: ['wh-001'],
            deviceId: this.getDeviceId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        'auditor': {
          password: 'auditor123',
          user: {
            id: 'user-004',
            username: 'auditor',
            email: 'auditor@warehouse.com',
            role: 'auditor',
            warehouseIds: ['wh-001'],
            deviceId: this.getDeviceId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      };

      const userRecord = mockUsers[username.toLowerCase()];
      if (userRecord && userRecord.password === password) {
        StorageManager.setCurrentUser(userRecord.user);
        return userRecord.user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  static logout(): void {
    StorageManager.clearCurrentUser();
    StorageManager.setCurrentScan(null);
  }

  static getCurrentUser(): User | null {
    return StorageManager.getCurrentUser();
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(requiredRole: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      'auditor': 1,
      'operator': 2,
      'warehouse_manager': 3,
      'super_admin': 4
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  static canAccessWarehouse(warehouseId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.warehouseIds.includes(warehouseId);
  }

  private static getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }
}
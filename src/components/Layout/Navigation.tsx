import React from 'react';
import { 
  LayoutDashboard, 
  QrCode, 
  Package, 
  History, 
  BarChart3, 
  Settings,
  Users,
  Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'warehouse_manager', 'operator', 'auditor'] },
    { id: 'scan', label: 'Scan Asset', icon: QrCode, roles: ['operator', 'warehouse_manager', 'super_admin'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['super_admin', 'warehouse_manager', 'operator', 'auditor'] },
    { id: 'history', label: 'Asset History', icon: History, roles: ['super_admin', 'warehouse_manager', 'auditor'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['super_admin', 'warehouse_manager'] },
    { id: 'admin', label: 'Administration', icon: Settings, roles: ['super_admin'] },
  ];

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <nav className="bg-gray-50 border-r border-gray-200 w-64 h-full overflow-y-auto">
      <div className="p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
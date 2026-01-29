import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { StorageManager } from './utils/storage';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Login } from './components/Auth/Login';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ScanAsset } from './components/Scan/ScanAsset';
import { InventoryManagement } from './components/Inventory/InventoryManagement';
import { AssetHistory } from './components/History/AssetHistory';
import { Reports } from './components/Reports/Reports';
import { Administration } from './components/Admin/Administration';
import { MoveAsset } from './components/Scan/MoveAsset';
import Brands from './components/Brands/Brands';
import Divisions from './components/Divisions/Divisions';
import Category from './components/Category/Category';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentScan, setCurrentScan] = useState<any>(null);

  useEffect(() => {
    // Initialize default data on app start
    StorageManager.initializeDefaultData();

    // Check for ongoing scan operation
    const scan = StorageManager.getCurrentScan();
    setCurrentScan(scan);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Handle scan operations
  const handleScanComplete = () => {
    StorageManager.setCurrentScan(null);
    setCurrentScan(null);
    setActiveTab('scan');
  };

  const handleScanCancel = () => {
    StorageManager.setCurrentScan(null);
    setCurrentScan(null);
  };

  // If there's an active scan operation, show the appropriate screen
  if (currentScan) {
    switch (currentScan.type) {
      case 'move':
        return (
          <div className="min-h-screen bg-gray-50">
            <Header title="Warehouse Management System" />
            <MoveAsset
              assetId={currentScan.assetId}
              onComplete={handleScanComplete}
              onCancel={handleScanCancel}
            />
          </div>
        );
      default:
        // Clear unknown scan types
        StorageManager.setCurrentScan(null);
        setCurrentScan(null);
        break;
    }
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'brands':
        return <Brands />;
      case 'divisions':
        return <Divisions />
      case 'categorys':
        return <Category />
      case 'scan':
        return <ScanAsset />;
      case 'inventory':
        return <InventoryManagement />;
      case 'history':
        return <AssetHistory />;
      case 'reports':
        return <Reports />;
      case 'admin':
        return <Administration />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Warehouse Management System" />
      <div className="flex h-[calc(100vh-4rem)]">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;
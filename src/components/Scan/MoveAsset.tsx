import React, { useState, useEffect } from 'react';
import { Move, MapPin, ArrowRight, Check, X } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, AssetEvent, Warehouse, Location } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { QRGenerator } from '../../utils/qr-generator';

interface MoveAssetProps {
  assetId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const MoveAsset: React.FC<MoveAssetProps> = ({ assetId, onComplete, onCancel }) => {
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTray, setSelectedTray] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const foundAsset = StorageManager.getAssetById(assetId);
    const allWarehouses = StorageManager.getWarehouses();
    
    setAsset(foundAsset);
    setWarehouses(allWarehouses);
    
    if (foundAsset) {
      setSelectedWarehouse(foundAsset.warehouseId);
      setSelectedSection(foundAsset.sectionId);
      setSelectedTray(foundAsset.trayId);
    }
  }, [assetId]);

  const getCurrentLocation = (): Location | null => {
    if (!asset) return null;
    
    const warehouse = warehouses.find(w => w.id === asset.warehouseId);
    const section = warehouse?.sections.find(s => s.id === asset.sectionId);
    const tray = section?.trays.find(t => t.id === asset.trayId);
    
    if (!warehouse || !section || !tray) return null;
    
    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      sectionId: section.id,
      sectionName: section.name,
      trayId: tray.id,
      trayName: tray.name
    };
  };

  const getNewLocation = (): Location | null => {
    const warehouse = warehouses.find(w => w.id === selectedWarehouse);
    const section = warehouse?.sections.find(s => s.id === selectedSection);
    const tray = section?.trays.find(t => t.id === selectedTray);
    
    if (!warehouse || !section || !tray) return null;
    
    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      sectionId: section.id,
      sectionName: section.name,
      trayId: tray.id,
      trayName: tray.name
    };
  };

  const handleMove = async () => {
    if (!asset || !user) return;
    
    const fromLocation = getCurrentLocation();
    const toLocation = getNewLocation();
    
    if (!fromLocation || !toLocation) return;
    
    // Check if location actually changed
    if (fromLocation.warehouseId === toLocation.warehouseId &&
        fromLocation.sectionId === toLocation.sectionId &&
        fromLocation.trayId === toLocation.trayId) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Update asset location
      StorageManager.updateAsset(assetId, {
        warehouseId: selectedWarehouse,
        sectionId: selectedSection,
        trayId: selectedTray,
        lastMovedAt: new Date().toISOString(),
        lastHandledBy: user.id
      });
      
      // Create move event
      const event: AssetEvent = {
        id: QRGenerator.generateEventId(),
        assetId: asset.id,
        type: 'MOVED',
        fromLocation,
        toLocation,
        userId: user.id,
        deviceId: user.deviceId,
        timestamp: new Date().toISOString()
      };
      
      StorageManager.addEvent(event);
      
      onComplete();
    } catch (error) {
      console.error('Move failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedWarehouseObj = warehouses.find(w => w.id === selectedWarehouse);
  const selectedSectionObj = selectedWarehouseObj?.sections.find(s => s.id === selectedSection);

  if (!asset) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Asset not found</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg">
          Cancel
        </button>
      </div>
    );
  }

  const currentLocation = getCurrentLocation();
  const newLocation = getNewLocation();
  const canMove = newLocation && (
    currentLocation?.warehouseId !== newLocation.warehouseId ||
    currentLocation?.sectionId !== newLocation.sectionId ||
    currentLocation?.trayId !== newLocation.trayId
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Move className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Move Asset</h1>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Asset Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">QR Code</label>
            <p className="text-gray-900 font-mono">{asset.qrCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Type</label>
            <p className="text-gray-900">{asset.productType}</p>
          </div>
        </div>
      </div>

      {/* Current vs New Location */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Change</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Current Location */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Current Location</h3>
            {currentLocation && (
              <div className="space-y-1 text-sm text-red-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{currentLocation.warehouseName}</span>
                </div>
                <div className="ml-6">{currentLocation.sectionName}</div>
                <div className="ml-6">{currentLocation.trayName}</div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-8 w-8 text-gray-400" />
          </div>

          {/* New Location */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">New Location</h3>
            {newLocation && (
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{newLocation.warehouseName}</span>
                </div>
                <div className="ml-6">{newLocation.sectionName}</div>
                <div className="ml-6">{newLocation.trayName}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select New Location</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Warehouse Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                setSelectedSection('');
                setSelectedTray('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedTray('');
              }}
              disabled={!selectedWarehouse}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Section</option>
              {selectedWarehouseObj?.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tray Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tray</label>
            <select
              value={selectedTray}
              onChange={(e) => setSelectedTray(e.target.value)}
              disabled={!selectedSection}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Tray</option>
              {selectedSectionObj?.trays.map((tray) => (
                <option key={tray.id} value={tray.id}>
                  {tray.name} ({tray.currentCount}/{tray.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleMove}
          disabled={!canMove || loading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-5 w-5" />
          <span>{loading ? 'Moving...' : 'Confirm Move'}</span>
        </button>
      </div>
    </div>
  );
};
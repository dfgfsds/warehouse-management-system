import React, { useState, useEffect } from 'react';
import { QrCode, Package, MapPin, Settings, Move, Truck, Scissors } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, AssetEvent, EventType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { QRGenerator } from '../../utils/qr-generator';
import axios from 'axios';
import baseUrl from '../../../api-endpoints/ApiUrls';

export const ScanAsset: React.FC = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getQrCode = async () => {
    try {
      const res = await axios.get(`${baseUrl?.barcode}/${qrCode}`)
    } catch (error) {

    }
  }

  useEffect(() => {
    if (qrCode) {

      getQrCode();
    }

  }, [qrCode])

  const handleQRScan = async () => {
    if (!qrCode.trim()) {
      setMessage('Please enter a QR code');
      return;
    }

    setLoading(true);
    const foundAsset = StorageManager.getAssetByQR(qrCode.trim());

    if (foundAsset) {
      setAsset(foundAsset);
      setMessage('');
    } else {
      setAsset(null);
      setMessage('Asset not found');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQRScan();
    }
  };

  const createEvent = (type: EventType, metadata?: any) => {
    if (!asset || !user) return;

    const event: AssetEvent = {
      id: QRGenerator.generateEventId(),
      assetId: asset.id,
      type,
      userId: user.id,
      deviceId: user.deviceId,
      timestamp: new Date().toISOString(),
      metadata
    };

    StorageManager.addEvent(event);
  };

  const handleAction = (action: string) => {
    if (!asset) return;

    switch (action) {
      case 'move':
        StorageManager.setCurrentScan({ type: 'move', assetId: asset.id });
        break;
      case 'status':
        StorageManager.setCurrentScan({ type: 'status', assetId: asset.id });
        break;
      case 'pack':
        const newPackedState = !asset.isPacked;
        StorageManager.updateAsset(asset.id, { isPacked: newPackedState });
        createEvent(newPackedState ? 'PACKED' : 'UNPACKED');
        setAsset({ ...asset, isPacked: newPackedState });
        setMessage(`Asset ${newPackedState ? 'packed' : 'unpacked'} successfully`);
        break;
      case 'dispatch':
        StorageManager.setCurrentScan({ type: 'dispatch', assetId: asset.id });
        break;
      case 'dismantle':
        if (!asset.childAssetIds.length) {
          StorageManager.setCurrentScan({ type: 'dismantle', assetId: asset.id });
        } else {
          setMessage('This asset has already been dismantled');
        }
        break;
    }
  };

  const getWarehouseInfo = (warehouseId: string, sectionId: string, trayId: string) => {
    const warehouses = StorageManager.getWarehouses();
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const section = warehouse?.sections.find(s => s.id === sectionId);
    const tray = section?.trays.find(t => t.id === trayId);

    return {
      warehouseName: warehouse?.name || 'Unknown',
      sectionName: section?.name || 'Unknown',
      trayName: tray?.name || 'Unknown'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'needs_fix': return 'bg-yellow-100 text-yellow-800';
      case 'scrap': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <QrCode className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Scan Asset</h1>
      </div>

      {/* QR Code Input */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700 mb-2">
              QR Code or Asset ID
            </label>
            <input
              id="qr-input"
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Scan QR code or enter asset ID"
              autoFocus
            />
          </div>
          <button
            onClick={handleQRScan}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${message.includes('successfully') || asset ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            {message}
          </div>
        )}
      </div>

      {/* Asset Details */}
      {asset && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-gray-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Asset Details</h2>
                <p className="text-sm text-gray-600">QR: {asset.qrCode}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}>
              {asset.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Type</label>
              <p className="text-gray-900">{asset.productType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="text-gray-900 capitalize">{asset.status.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Location</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>
                  {(() => {
                    const { warehouseName, sectionName, trayName } = getWarehouseInfo(
                      asset.warehouseId, asset.sectionId, asset.trayId
                    );
                    return `${warehouseName} > ${sectionName} > ${trayName}`;
                  })()}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Packing Status</label>
              <p className="text-gray-900">{asset.isPacked ? 'Packed' : 'Unpacked'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Available Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                onClick={() => handleAction('move')}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Move className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Move</span>
              </button>

              <button
                onClick={() => handleAction('status')}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Settings className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Status</span>
              </button>

              <button
                onClick={() => handleAction('pack')}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
              >
                <Package className="h-6 w-6 text-yellow-600" />
                <span className="text-sm font-medium">
                  {asset.isPacked ? 'Unpack' : 'Pack'}
                </span>
              </button>

              <button
                onClick={() => handleAction('dispatch')}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Truck className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">Dispatch</span>
              </button>

              {!asset.childAssetIds.length && (
                <button
                  onClick={() => handleAction('dismantle')}
                  className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                >
                  <Scissors className="h-6 w-6 text-red-600" />
                  <span className="text-sm font-medium">Dismantle</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
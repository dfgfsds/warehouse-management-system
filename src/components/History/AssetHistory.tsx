import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, User, MapPin, Activity } from 'lucide-react';
import { StorageManager } from '../../utils/storage';
import { Asset, AssetEvent, Warehouse } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export const AssetHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [events, setEvents] = useState<AssetEvent[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWarehouses(StorageManager.getWarehouses());
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSelectedAsset(null);
      setEvents([]);
      return;
    }

    setLoading(true);
    const asset = StorageManager.getAssetByQR(searchTerm.trim());
    
    if (asset) {
      setSelectedAsset(asset);
      const assetEvents = StorageManager.getEventsByAssetId(asset.id);
      setEvents(assetEvents);
    } else {
      setSelectedAsset(null);
      setEvents([]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWarehouseInfo = (warehouseId: string, sectionId?: string, trayId?: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const section = warehouse?.sections.find(s => s.id === sectionId);
    const tray = section?.trays.find(t => t.id === trayId);
    
    return {
      warehouseName: warehouse?.name || 'Unknown',
      sectionName: section?.name || 'Unknown',
      trayName: tray?.name || 'Unknown'
    };
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'RECEIVED': return '📦';
      case 'MOVED': return '🚚';
      case 'STATUS_CHANGED': return '🔄';
      case 'PACKED': return '📦';
      case 'UNPACKED': return '📂';
      case 'DISPATCHED': return '🚛';
      case 'DISMANTLED': return '🔧';
      case 'CREATED_FROM_DISMANTLE': return '⚙️';
      default: return '📋';
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const calculateDuration = (events: AssetEvent[], index: number) => {
    if (index === 0) return null;
    
    const currentEvent = events[index];
    const previousEvent = events[index - 1];
    
    const duration = new Date(currentEvent.timestamp).getTime() - new Date(previousEvent.timestamp).getTime();
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return '< 1h';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <History className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Asset History & Traceability</h1>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
              Search Asset by QR Code
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Enter QR code or asset ID"
                autoFocus
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Asset Details */}
      {selectedAsset && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">QR Code</label>
              <p className="text-gray-900 font-mono">{selectedAsset.qrCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Type</label>
              <p className="text-gray-900">{selectedAsset.productType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Status</label>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {selectedAsset.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {events.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Event Timeline</h2>
            <span className="text-sm text-gray-500">({events.length} events)</span>
          </div>

          <div className="space-y-4">
            {events.map((event, index) => {
              const duration = calculateDuration(events, index);
              
              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {index < events.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Event icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      {getEventIcon(event.type)}
                    </div>
                    
                    {/* Event details */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {formatEventType(event.type)}
                          </h3>
                          
                          {/* Location information */}
                          {event.fromLocation && event.toLocation && (
                            <div className="mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  From: {event.fromLocation.warehouseName}  {event.fromLocation.sectionName}  {event.fromLocation.trayName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  To: {event.toLocation.warehouseName}  {event.toLocation.sectionName}  {event.toLocation.trayName}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Status change */}
                          {event.fromStatus && event.toStatus && (
                            <div className="mt-2 text-sm text-gray-600">
                              Status changed from <span className="font-medium">{event.fromStatus}</span> to <span className="font-medium">{event.toStatus}</span>
                            </div>
                          )}
                          
                          {/* Remarks */}
                          {event.remarks && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Remarks:</span> {event.remarks}
                            </div>
                          )}
                          
                          {/* User and device info */}
                          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>User: {event.userId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(event.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Duration badge */}
                        {duration && (
                          <div className="ml-4 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Duration: {duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {searchTerm && !selectedAsset && !loading && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Asset not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No asset found with QR code "{searchTerm}". Please check the code and try again.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!searchTerm && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Search for an asset</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a QR code above to view the complete history and traceability of an asset.
          </p>
        </div>
      )}
    </div>
  );
};
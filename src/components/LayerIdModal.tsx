import React, { useState, useEffect } from 'react';
import { X, Search, Layers, Check } from 'lucide-react';
import { mockApi } from '../utils/mockApi';

interface LayerIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLayerIds: string[];
  onSelectionChange: (layerIds: string[]) => void;
}

const LayerIdModal: React.FC<LayerIdModalProps> = ({
  isOpen,
  onClose,
  selectedLayerIds,
  onSelectionChange
}) => {
  const [availableLayerIds, setAvailableLayerIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLayerIds();
    }
  }, [isOpen]);

  const loadLayerIds = async () => {
    setIsLoading(true);
    try {
      const layerIds = await mockApi.getLayerIds();
      setAvailableLayerIds(layerIds);
    } catch (error) {
      console.error('Failed to load layer IDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLayerIds = availableLayerIds.filter(layerId =>
    layerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLayerIdToggle = (layerId: string) => {
    const isSelected = selectedLayerIds.includes(layerId);
    if (isSelected) {
      onSelectionChange(selectedLayerIds.filter(id => id !== layerId));
    } else {
      onSelectionChange([...selectedLayerIds, layerId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLayerIds.length === filteredLayerIds.length) {
      // Deselect all filtered items
      const remainingSelected = selectedLayerIds.filter(id => !filteredLayerIds.includes(id));
      onSelectionChange(remainingSelected);
    } else {
      // Select all filtered items
      const newSelection = [...new Set([...selectedLayerIds, ...filteredLayerIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const isAllFilteredSelected = filteredLayerIds.length > 0 && 
    filteredLayerIds.every(id => selectedLayerIds.includes(id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Select Layer IDs</h2>
              <p className="text-sm text-gray-600">
                {selectedLayerIds.length} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search layer IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {filteredLayerIds.length} of {availableLayerIds.length} layer IDs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                disabled={filteredLayerIds.length === 0}
                className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAllFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>
              {selectedLayerIds.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Layer ID List */}
          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading layer IDs...
              </div>
            ) : filteredLayerIds.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No layer IDs match your search' : 'No layer IDs available'}
              </div>
            ) : (
              <div className="p-2">
                {filteredLayerIds.map((layerId) => {
                  const isSelected = selectedLayerIds.includes(layerId);
                  return (
                    <label
                      key={layerId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 rounded-lg"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleLayerIdToggle(layerId)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {isSelected && (
                          <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5 pointer-events-none" />
                        )}
                      </div>
                      <span className="text-sm font-mono text-gray-700 flex-1">
                        {layerId}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedLayerIds.length} layer ID{selectedLayerIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerIdModal;
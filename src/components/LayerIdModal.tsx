import React, { useState, useEffect } from 'react';
import { X, Search, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { mockApi } from '../utils/mockApi';

interface LayerIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLayerId: string;
  onSelectionChange: (layerId: string) => void;
}

const LayerIdModal: React.FC<LayerIdModalProps> = ({
  isOpen,
  onClose,
  selectedLayerId,
  onSelectionChange
}) => {
  const [availableLayerIds, setAvailableLayerIds] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
      // Expand all categories by default
      setExpandedCategories(new Set(Object.keys(layerIds)));
    } catch (error) {
      console.error('Failed to load layer IDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!searchTerm) return availableLayerIds;
    
    const filtered: Record<string, string[]> = {};
    Object.entries(availableLayerIds).forEach(([category, items]) => {
      const matchingItems = items.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingItems.length > 0 || category.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[category] = category.toLowerCase().includes(searchTerm.toLowerCase()) ? items : matchingItems;
      }
    });
    return filtered;
  };

  const filteredData = getFilteredData();
  const totalItems = Object.values(filteredData).reduce((sum, items) => sum + items.length, 0);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const isSelectedCategory = (category: string) => {
    return selectedLayerId === category;
  };

  const isSelectedItem = (item: string) => {
    return selectedLayerId === item;
  };

  const getSelectedCategory = () => {
    for (const [category, items] of Object.entries(availableLayerIds)) {
      if (items.includes(selectedLayerId)) {
        return category;
      }
    }
    return selectedLayerId in availableLayerIds ? selectedLayerId : null;
  };

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
                {selectedLayerId ? '1 selected' : 'None selected'}
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
              Showing {totalItems} items in {Object.keys(filteredData).length} categories
            </div>
            <div className="flex items-center gap-2">
              {selectedLayerId && (
                <button
                  onClick={() => onSelectionChange('')}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                >
                  Clear Selection
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
            ) : Object.keys(filteredData).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No layer IDs match your search' : 'No layer IDs available'}
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(filteredData).map(([category, items]) => {
                  const isExpanded = expandedCategories.has(category);
                  const isCategorySelected = isSelectedCategory(category);
                  const selectedCategory = getSelectedCategory();
                  const shouldHighlightCategory = isCategorySelected || selectedCategory === category;
                  
                  return (
                    <div key={category} className="mb-2">
                      {/* Category Header */}
                      <div className={`
                        flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                        ${shouldHighlightCategory 
                          ? 'bg-blue-100 border-blue-300 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }
                      `}>
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="flex items-center gap-2 flex-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <span className={`text-sm font-semibold ${
                            shouldHighlightCategory ? 'text-blue-800' : 'text-gray-700'
                          }`}>
                            {category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            shouldHighlightCategory 
                              ? 'bg-blue-200 text-blue-700' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {items.length}
                          </span>
                        </button>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="layerId"
                            value={category}
                            checked={isCategorySelected}
                            onChange={() => onSelectionChange(category)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                      
                      {/* Category Items */}
                      {isExpanded && (
                        <div className={`
                          mt-2 ml-6 p-3 rounded-lg border-l-2 
                          ${shouldHighlightCategory && isCategorySelected
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-gray-200'
                          }
                        `}>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => {
                              const isItemSelected = isSelectedItem(item);
                              return (
                                <label
                                  key={item}
                                  className={`
                                    inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-150
                                    ${isItemSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                                    }
                                  `}
                                >
                                  <input
                                    type="radio"
                                    name="layerId"
                                    value={item}
                                    checked={isItemSelected}
                                    onChange={() => onSelectionChange(item)}
                                    className={`w-3 h-3 ${
                                      isItemSelected 
                                        ? 'text-white border-white' 
                                        : 'text-blue-600 border-gray-300'
                                    } focus:ring-blue-500`}
                                  />
                                  <span className="text-xs font-mono">
                                    {item}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedLayerId ? '1 layer ID selected' : 'No layer ID selected'}
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
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';

interface PartIdFilterProps {
  availablePartIds: string[];
  selectedPartIds: string[];
  onSelectionChange: (selected: string[]) => void;
}

const PartIdFilter: React.FC<PartIdFilterProps> = ({
  availablePartIds,
  selectedPartIds,
  onSelectionChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePartIdToggle = (partId: string) => {
    const isSelected = selectedPartIds.includes(partId);
    if (isSelected) {
      onSelectionChange(selectedPartIds.filter(id => id !== partId));
    } else {
      onSelectionChange([...selectedPartIds, partId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPartIds.length === availablePartIds.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...availablePartIds]);
    }
  };

  const clearFilters = () => {
    onSelectionChange([]);
  };

  const isAllSelected = selectedPartIds.length === availablePartIds.length;
  const hasActiveFilter = selectedPartIds.length > 0 && selectedPartIds.length < availablePartIds.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors duration-200 ${
          hasActiveFilter 
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <Filter className={`w-3 h-3 ${hasActiveFilter ? 'text-blue-600' : 'text-gray-400'}`} />
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        {hasActiveFilter && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
            {selectedPartIds.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Filter by Part ID</span>
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-gray-50 rounded transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {availablePartIds.map((partId) => (
              <label
                key={partId}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={selectedPartIds.includes(partId)}
                  onChange={() => handlePartIdToggle(partId)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-mono text-gray-700">{partId}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartIdFilter;
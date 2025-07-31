import React from 'react';
import { Search } from 'lucide-react';
import { ValidProduct } from '../utils/mockApi';

interface PartIdSelectorProps {
  validProducts: ValidProduct[];
  selectedPartId: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPartIdSelect: (partId: string) => void;
}

const PartIdSelector: React.FC<PartIdSelectorProps> = ({
  validProducts,
  selectedPartId,
  searchTerm,
  onSearchChange,
  onPartIdSelect
}) => {
  const filteredProducts = validProducts.filter(product =>
    product.part_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Part ID
      </label>
      
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search part IDs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Part ID List */}
      <div className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg">
        {filteredProducts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No part IDs found
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredProducts.map((product) => (
              <button
                key={product.part_id}
                type="button"
                onClick={() => onPartIdSelect(product.part_id)}
                className={`
                  w-full text-left px-3 py-2 rounded-md transition-all duration-150 text-sm font-mono
                  ${selectedPartId === product.part_id
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                  }
                `}
              >
                {product.part_id}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {selectedPartId && (
        <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700">Selected: {selectedPartId}</span>
        </div>
      )}
    </div>
  );
};

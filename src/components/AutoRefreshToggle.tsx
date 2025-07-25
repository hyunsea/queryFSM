import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AutoRefreshToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const AutoRefreshToggle: React.FC<AutoRefreshToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center gap-3">
      <RefreshCw className={`w-4 h-4 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
      <span className="text-sm text-gray-700">Auto-Refresh</span>
      <button
        onClick={() => onToggle(!isEnabled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

export default AutoRefreshToggle;
import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: 'queued' | 'processing' | 'error' | 'finished';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status, className = '' }) => {
  const getProgressConfig = () => {
    switch (status) {
      case 'processing':
        return {
          bgColor: 'bg-blue-200',
          fillColor: 'bg-blue-500',
          showPercentage: true
        };
      case 'finished':
        return {
          bgColor: 'bg-green-200',
          fillColor: 'bg-green-500',
          showPercentage: false
        };
      case 'error':
        return {
          bgColor: 'bg-red-200',
          fillColor: 'bg-red-500',
          showPercentage: false
        };
      default:
        return {
          bgColor: 'bg-gray-200',
          fillColor: 'bg-gray-400',
          showPercentage: false
        };
    }
  };

  const config = getProgressConfig();
  const effectiveProgress = status === 'finished' ? 100 : status === 'error' ? 0 : progress;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 h-2 ${config.bgColor} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${config.fillColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${effectiveProgress}%` }}
        />
      </div>
      {config.showPercentage && (
        <span className="text-xs text-gray-600 font-medium min-w-[3rem] text-right">
          {effectiveProgress}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
import React from 'react';
import { Clock, Play, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'queued' | 'processing' | 'error' | 'finished';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: Clock,
          text: 'Queued',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-500'
        };
      case 'processing':
        return {
          icon: Play,
          text: 'Processing',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-500'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          text: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          iconColor: 'text-red-500'
        };
      case 'finished':
        return {
          icon: CheckCircle,
          text: 'Finished',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          iconColor: 'text-green-500'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      {config.text}
    </span>
  );
};

export default StatusBadge;
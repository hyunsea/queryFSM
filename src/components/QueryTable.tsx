import React from 'react';
import { RotateCcw, Eye } from 'lucide-react';
import { QueryJob } from '../utils/mockApi';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatDateTimeKST } from '../utils/dateUtils';

interface QueryTableProps {
  jobs: QueryJob[];
  onRerun: (jobId: number) => void;
  filteredJobs?: QueryJob[];
  uniqueProcessIds: string[];
  selectedProcessId: string;
  onProcessIdFilter: (processId: string) => void;
}

const QueryTable: React.FC<QueryTableProps> = ({ 
  jobs, 
  onRerun, 
  filteredJobs, 
  uniqueProcessIds, 
  selectedProcessId, 
  onProcessIdFilter 
}) => {
  const displayJobs = filteredJobs || jobs;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Query Status Tracking</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage your data queries</p>
          </div>
          
          {/* Process ID Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by Process ID:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onProcessIdFilter('')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  !selectedProcessId
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {uniqueProcessIds.map((processId) => (
                <button
                  key={processId}
                  onClick={() => onProcessIdFilter(processId)}
                  className={`px-3 py-1.5 text-xs font-medium font-mono rounded-lg transition-all duration-200 ${
                    selectedProcessId === processId
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {processId}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Query ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Process ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <Eye className="w-8 h-8 text-gray-300" />
                    <span>
                      {jobs.length === 0 
                        ? "No queries found. Submit your first query to get started."
                        : selectedProcessId
                          ? `No queries found for process ID: ${selectedProcessId}`
                          : "No queries match the current filter."
                      }
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              displayJobs.map((job, index) => (
                <tr 
                  key={job.id} 
                  className={`hover:bg-gray-50/50 transition-colors duration-150 ${
                    index === 0 && !filteredJobs ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">#{job.id}</span>
                      {index === 0 && !filteredJobs && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Latest
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {job.process_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatPeriod(job.start_date, job.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ minWidth: '180px' }}>
                    <ProgressBar progress={job.progress} status={job.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDateTimeKST(job.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {job.status === 'error' && (
                      <button
                        onClick={() => onRerun(job.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Rerun
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryTable;
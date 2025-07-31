import React from 'react';
import { RotateCcw, Eye, ExternalLink } from 'lucide-react';
import { QueryJob } from '../utils/mockApi';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import PartIdFilter from './ProcessIdFilter';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { formatDateTimeKST } from '../utils/dateUtils';

interface QueryTableProps {
  jobs: QueryJob[];
  onRerun: (jobId: number) => void;
  filteredJobs?: QueryJob[];
  partIdFilter: string[];
  onPartIdFilterChange: (selected: string[]) => void;
}

const QueryTable: React.FC<QueryTableProps> = ({ 
  jobs, 
  onRerun, 
  filteredJobs, 
  partIdFilter, 
  onPartIdFilterChange 
}) => {
  // Apply both status filter (filteredJobs) and part ID filter
  let displayJobs = filteredJobs || jobs;
  
  if (partIdFilter.length > 0) {
    displayJobs = displayJobs.filter(job => partIdFilter.includes(job.part_id));
  }

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    setCurrentPage,
    setPageSize
  } = usePagination({ data: displayJobs, initialPageSize: 10 });

  // Get unique part IDs for the filter
  const availablePartIds = Array.from(new Set(jobs.map(job => job.part_id))).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const handleAirflowLinkClick = (job: QueryJob) => {
    const airflowUrl = `https://test.com/${job.dag_id}/dag_run_id=${job.id}`;
    window.open(airflowUrl, '_blank');
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Query Status Tracking</h2>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage your data queries</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Query ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  Part ID
                  <PartIdFilter
                    availablePartIds={availablePartIds}
                    selectedPartIds={partIdFilter}
                    onSelectionChange={onPartIdFilterChange}
                  />
                </div>
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
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <Eye className="w-8 h-8 text-gray-300" />
                    <span>
                      {jobs.length === 0 
                        ? "No queries found. Submit your first query to get started."
                        : "No queries match the current filters."
                      }
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((job, index) => {
                // Calculate the actual index in the full dataset for highlighting
                const actualIndex = displayJobs.findIndex(j => j.id === job.id);
                return (
                <tr 
                  key={job.id} 
                  className={`hover:bg-gray-50/50 transition-colors duration-150 ${
                    actualIndex === 0 && !filteredJobs ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">#{job.id}</span>
                      {actualIndex === 0 && !filteredJobs && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Latest
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {job.part_id}
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
                    <div className="flex items-center gap-2">
                      {/* Airflow Link - Available for all jobs */}
                      <button
                        onClick={() => handleAirflowLinkClick(job)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200 cursor-pointer"
                        title={`View in Airflow: ${job.dag_id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      
                      {/* Rerun Button - Only for error status */}
                      {job.status === 'error' && (
                        <button
                          onClick={() => onRerun(job.id)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 cursor-pointer"
                          title="Rerun failed query"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {displayJobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={displayJobs.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default QueryTable;
import React, { useState } from 'react';
import { RotateCcw, ChevronRight, ChevronDown, Database, Cpu } from 'lucide-react';
import { QueryJob, GetDataItem, ProcessingItem } from '../utils/mockApi';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import PartIdFilter from './ProcessIdFilter';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { formatDateTimeKST } from '../utils/dateUtils';

interface QueryTableProps {
  jobs: QueryJob[];
  onRerun: (groupId: number) => void;
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
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

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

  const toggleGroupExpansion = (groupId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getOverallStatus = (job: QueryJob): string => {
    return job.status;
  };

  const getOverallProgress = (job: QueryJob): number => {
    const allItems = [...job.getdata_item, ...job.processing_item];
    const itemsWithProgress = allItems.filter(item => item.progress !== undefined);
    
    if (itemsWithProgress.length === 0) return 0;
    
    const totalProgress = itemsWithProgress.reduce((sum, item) => sum + (item.progress || 0), 0);
    return Math.round(totalProgress / itemsWithProgress.length);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const getLatestCreatedAt = (job: QueryJob): string => {
    const allItems = [...job.getdata_item, ...job.processing_item];
    const latestItem = allItems.reduce((latest, item) => 
      new Date(item.created_at) > new Date(latest.created_at) ? item : latest
    );
    return latestItem.created_at;
  };

  const renderSubItems = (job: QueryJob) => {
    if (!expandedGroups.has(job.group_id)) return null;

    return (
      <>
        {/* GetData Items */}
        {job.getdata_item.map((item, index) => (
          <tr key={`getdata-${item.id}`} className="bg-blue-50/30">
            <td className="px-6 py-3 pl-12">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">GetData #{item.id}</span>
              </div>
            </td>
            <td className="px-6 py-3 text-sm text-gray-500">-</td>
            <td className="px-6 py-3 text-sm text-gray-600">
              {item.firstdate ? formatDate(item.firstdate) : '-'}
            </td>
            <td className="px-6 py-3">
              <StatusBadge status={item.status as any} />
            </td>
            <td className="px-6 py-3">
              <ProgressBar 
                progress={item.progress || 0} 
                status={item.status as any} 
              />
            </td>
            <td className="px-6 py-3 text-sm text-gray-600">
              {formatDateTimeKST(item.created_at)}
            </td>
            <td className="px-6 py-3">
              {item.status === 'error' && (
                <button
                  onClick={() => onRerun(job.group_id)}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                  title="Rerun failed item"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}

        {/* Processing Items */}
        {job.processing_item.map((item, index) => (
          <tr key={`processing-${item.id}`} className="bg-green-50/30">
            <td className="px-6 py-3 pl-12">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Processing #{item.id}</span>
              </div>
            </td>
            <td className="px-6 py-3 text-sm text-gray-500">-</td>
            <td className="px-6 py-3 text-sm text-gray-500">-</td>
            <td className="px-6 py-3">
              <StatusBadge status={item.status as any} />
            </td>
            <td className="px-6 py-3">
              <ProgressBar 
                progress={item.progress || 0} 
                status={item.status as any} 
              />
            </td>
            <td className="px-6 py-3 text-sm text-gray-600">
              {formatDateTimeKST(item.created_at)}
            </td>
            <td className="px-6 py-3">
              {item.status === 'error' && (
                <button
                  onClick={() => onRerun(job.group_id)}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                  title="Rerun failed item"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </>
    );
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
                Group ID
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
                    <Database className="w-8 h-8 text-gray-300" />
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
                const isExpanded = expandedGroups.has(job.group_id);
                const overallStatus = getOverallStatus(job);
                const overallProgress = getOverallProgress(job);
                const totalItems = job.getdata_item.length + job.processing_item.length;
                const actualIndex = displayJobs.findIndex(j => j.group_id === job.group_id);
                
                return (
                  <React.Fragment key={job.group_id}>
                    {/* Main Group Row */}
                    <tr 
                      className={`hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer ${
                        actualIndex === 0 && !filteredJobs ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => toggleGroupExpansion(job.group_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-900">#{job.group_id}</span>
                          {actualIndex === 0 && !filteredJobs && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Latest
                            </span>
                          )}
                          {totalItems > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              {totalItems} items
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
                        {formatPeriod(job.startdate, job.enddate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={overallStatus as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ minWidth: '180px' }}>
                        <ProgressBar progress={overallProgress} status={overallStatus as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTimeKST(getLatestCreatedAt(job))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {overallStatus === 'error' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRerun(job.group_id);
                              }}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                              title="Rerun failed query"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Sub Items */}
                    {renderSubItems(job)}
                  </React.Fragment>
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
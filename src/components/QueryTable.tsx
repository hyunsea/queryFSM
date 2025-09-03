import React from 'react';
import { RotateCcw, Eye, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { QueryJob } from '../utils/mockApi';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import PartIdFilter from './ProcessIdFilter';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { formatDateTimeKST } from '../utils/dateUtils';

interface GroupedQueryJob {
  id: number;
  part_id: string;
  start_date: string;
  end_date: string;
  jobs: QueryJob[];
}

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
  const [expandedGroups, setExpandedGroups] = React.useState<Set<number>>(new Set());

  // Apply both status filter (filteredJobs) and part ID filter
  let displayJobs = filteredJobs || jobs;
  
  if (partIdFilter.length > 0) {
    displayJobs = displayJobs.filter(job => partIdFilter.includes(job.part_id));
  }

  // Group jobs by ID
  const groupedJobs = React.useMemo(() => {
    const groups = new Map<number, GroupedQueryJob>();
    
    displayJobs.forEach(job => {
      if (!groups.has(job.id)) {
        groups.set(job.id, {
          id: job.id,
          part_id: job.part_id,
          start_date: job.start_date,
          end_date: job.end_date,
          jobs: []
        });
      }
      groups.get(job.id)!.jobs.push(job);
    });
    
    // Sort jobs within each group by created_at (newest first)
    groups.forEach(group => {
      group.jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
    
    return Array.from(groups.values()).sort((a, b) => b.id - a.id);
  }, [displayJobs]);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    setCurrentPage,
    setPageSize
  } = usePagination({ data: groupedJobs, initialPageSize: 10 });

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

  const getGroupStatus = (jobs: QueryJob[]) => {
    if (jobs.some(job => job.status === 'error')) return 'error';
    if (jobs.some(job => job.status === 'processing')) return 'processing';
    if (jobs.every(job => job.status === 'finished')) return 'finished';
    return 'queued';
  };

  const getGroupProgress = (jobs: QueryJob[]) => {
    const totalProgress = jobs.reduce((sum, job) => sum + job.progress, 0);
    return Math.round(totalProgress / jobs.length);
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
                      {groupedJobs.length === 0 
                        ? "No queries found. Submit your first query to get started."
                        : "No queries match the current filters."
                      }
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((group, groupIndex) => {
                const isExpanded = expandedGroups.has(group.id);
                const groupStatus = getGroupStatus(group.jobs);
                const groupProgress = getGroupProgress(group.jobs);
                const actualGroupIndex = groupedJobs.findIndex(g => g.id === group.id);
                const isLatest = actualGroupIndex === 0 && !filteredJobs;
                
                return (
                  <React.Fragment key={group.id}>
                    {/* Main Group Row */}
                    <tr 
                      className={`hover:bg-gray-50/50 transition-colors duration-150 ${
                        isLatest ? 'bg-blue-50/30' : ''
                      } ${group.jobs.length > 1 ? 'cursor-pointer' : ''}`}
                      onClick={() => group.jobs.length > 1 && toggleGroupExpansion(group.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {group.jobs.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroupExpansion(group.id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors duration-150"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-500" />
                              )}
                            </button>
                          )}
                          <span className="text-sm font-medium text-gray-900">#{group.id}</span>
                          {group.jobs.length > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {group.jobs.length} runs
                            </span>
                          )}
                          {isLatest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Latest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {group.part_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatPeriod(group.start_date, group.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={groupStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ minWidth: '180px' }}>
                        <ProgressBar progress={groupProgress} status={groupStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {group.jobs.length === 1 ? (
                          <div>
                            <div className="font-mono text-xs text-gray-500 mb-1">{group.jobs[0].dag_id}</div>
                            <div>{formatDateTimeKST(group.jobs[0].created_at)}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {group.jobs.length} different DAGs
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {group.jobs.length === 1 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAirflowLinkClick(group.jobs[0]);
                              }}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200 cursor-pointer"
                              title={`View in Airflow: ${group.jobs[0].dag_id}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            
                            {group.jobs[0].status === 'error' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRerun(group.jobs[0].id);
                                }}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 cursor-pointer"
                                title="Rerun failed query"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {isExpanded ? 'Click to collapse' : 'Click to expand'}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Sub-rows */}
                    {isExpanded && group.jobs.length > 1 && group.jobs.map((job, jobIndex) => (
                      <tr 
                        key={`${group.id}-${jobIndex}`}
                        className="bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 ml-6">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">Run {jobIndex + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-500">—</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-500">—</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap" style={{ minWidth: '180px' }}>
                          <ProgressBar progress={job.progress} status={job.status} />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-600">
                          <div>
                            <div className="font-mono text-gray-500 mb-1">{job.dag_id}</div>
                            <div>{formatDateTimeKST(job.created_at)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAirflowLinkClick(job)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200 cursor-pointer"
                              title={`View in Airflow: ${job.dag_id}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            
                            {job.status === 'error' && (
                              <button
                                onClick={() => onRerun(job.id)}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 cursor-pointer"
                                title="Rerun failed query"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {groupedJobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={groupedJobs.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default QueryTable;
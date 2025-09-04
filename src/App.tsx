import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import QueryTable from './components/QueryTable';
import AutoRefreshToggle from './components/AutoRefreshToggle';
import ToastContainer from './components/ToastContainer';
import { mockApi, QueryJob } from './utils/mockApi';
import { useToast } from './hooks/useToast';

type FilterType = 'all' | 'processing' | 'finished' | 'error';
function App() {
  const [jobs, setJobs] = useState<QueryJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [partIdFilter, setPartIdFilter] = useState<string[]>([]);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      const fetchedJobs = await mockApi.getQueryJobs();
      setJobs(fetchedJobs);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Auto-refresh every 60 seconds when enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchJobs, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchJobs, autoRefresh]);

  const handleNewQuery = (newJob: QueryJob) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleRerun = async (jobId: number) => {
    try {
      const newJob = await mockApi.rerunQuery(jobId);
      setJobs(prev => [newJob, ...prev]);
    } catch (error) {
      console.error('Failed to rerun job:', error);
    }
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    fetchJobs();
  };

  const handleSubmitSuccess = () => {
    showSuccess('Query submitted successfully.');
  };

  const handleSubmitError = (message?: string) => {
    showError(message || 'Failed to submit query. Please check parameters and try again.');
  };

  const handlePartIdFilterChange = (selected: string[]) => {
    setPartIdFilter(selected);
  };

  const getFilteredJobs = () => {
    if (activeFilter === 'all') return jobs;
    return jobs.filter(job => job.status === activeFilter);
  };

  const getStatusCounts = () => {
    return {
      total: jobs.length,
      processing: jobs.filter(job => job.status === 'processing').length,
      finished: jobs.filter(job => job.status === 'finished').length,
      error: jobs.filter(job => job.status === 'error').length
    };
  };

  const counts = getStatusCounts();
  const filteredJobs = getFilteredJobs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar 
        onNewQuery={handleNewQuery} 
        onSubmitSuccess={handleSubmitSuccess}
        onSubmitError={handleSubmitError}
      />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <div className="pl-0 transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Query Status Dashboard</h1>
                  <p className="text-gray-600">Monitor and manage your data processing queries</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <AutoRefreshToggle 
                  isEnabled={autoRefresh} 
                  onToggle={setAutoRefresh} 
                />
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => setActiveFilter('all')}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-200 text-left hover:shadow-xl ${
                activeFilter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveFilter('processing')}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-200 text-left hover:shadow-xl ${
                activeFilter === 'processing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{counts.processing}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveFilter('finished')}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-200 text-left hover:shadow-xl ${
                activeFilter === 'finished' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{counts.finished}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveFilter('error')}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-200 text-left hover:shadow-xl ${
                activeFilter === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{counts.error}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-1 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Query Table */}
          <QueryTable 
            jobs={jobs} 
            onRerun={handleRerun} 
            filteredJobs={activeFilter !== 'all' ? filteredJobs : undefined}
            partIdFilter={partIdFilter}
            onPartIdFilterChange={handlePartIdFilterChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
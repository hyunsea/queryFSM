import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import QueryTable from './components/QueryTable';
import { mockApi, QueryJob } from './utils/mockApi';

function App() {
  const [jobs, setJobs] = useState<QueryJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar onNewQuery={handleNewQuery} />
      
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
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {jobs.filter(job => job.status === 'processing').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {jobs.filter(job => job.status === 'finished').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {jobs.filter(job => job.status === 'error').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-1 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Query Table */}
          <QueryTable jobs={jobs} onRerun={handleRerun} />
        </div>
      </div>
    </div>
  );
}

export default App;
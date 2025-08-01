import validProductsData from '../mocks/validProducts.json';
import filelistData from '../mocks/filelist.json';
import queryJobsData from '../mocks/queryJobs.json';

export interface ValidProduct {
  part_id: string;
}

export interface FilelistResponse {
  part_id: string;
  filelist: string[];
}

export interface QueryJob {
  id: number;
  part_id: string;
  dag_id: string;
  start_date: string;
  end_date: string;
  status: 'queued' | 'processing' | 'error' | 'finished';
  progress: number;
  created_at: string;
}

export interface SubmitQueryRequest {
  part_id: string;
  start_date: string;
  end_date: string;
}

// Mock API delay to simulate network requests
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for dynamic data
let mockQueryJobs: QueryJob[] = [...queryJobsData];
let nextJobId = Math.max(...mockQueryJobs.map(job => job.id)) + 1;

export const mockApi = {
  async getValidProducts(): Promise<ValidProduct[]> {
    await mockDelay();
    return validProductsData;
  },

  async getFilelist(processId: string): Promise<FilelistResponse> {
    await mockDelay();
    const data = filelistData as Record<string, FilelistResponse>;
    const result = data[processId];
    if (!result) {
      throw new Error(`No filelist found for part_id: ${processId}`);
    }
    return result;
  },

  async getQueryJobs(): Promise<QueryJob[]> {
    await mockDelay();
    // Simulate some jobs progressing
    mockQueryJobs = mockQueryJobs.map(job => {
      if (job.status === 'processing' && job.progress < 100) {
        const newProgress = Math.min(100, job.progress + Math.random() * 10);
        if (newProgress >= 100) {
          return { ...job, status: 'finished', progress: 100 };
        }
        return { ...job, progress: Math.floor(newProgress) };
      }
      return job;
    });
    
    return [...mockQueryJobs].sort((a, b) => b.id - a.id);
  },

  async submitQuery(request: SubmitQueryRequest): Promise<QueryJob> {
    await mockDelay();
    const newJob: QueryJob = {
      id: nextJobId++,
      part_id: request.part_id,
      start_date: request.start_date,
      end_date: request.end_date,
      status: 'queued',
      progress: 0,
      created_at: new Date().toISOString()
    };
    
    mockQueryJobs.unshift(newJob);
    
    // Simulate job starting after a short delay
    setTimeout(() => {
      const jobIndex = mockQueryJobs.findIndex(job => job.id === newJob.id);
      if (jobIndex !== -1 && mockQueryJobs[jobIndex].status === 'queued') {
        mockQueryJobs[jobIndex] = { ...mockQueryJobs[jobIndex], status: 'processing', progress: 5 };
      }
    }, 2000);
    
    return newJob;
  },

  async rerunQuery(jobId: number): Promise<QueryJob> {
    await mockDelay();
    const existingJob = mockQueryJobs.find(job => job.id === jobId);
    if (!existingJob) {
      throw new Error(`Job with id ${jobId} not found`);
    }

    const newJob: QueryJob = {
      id: nextJobId++,
      part_id: existingJob.part_id,
      start_date: existingJob.start_date,
      end_date: existingJob.end_date,
      status: 'queued',
      progress: 0,
      created_at: new Date().toISOString()
    };
    
    mockQueryJobs.unshift(newJob);
    
    // Simulate job starting after a short delay
    setTimeout(() => {
      const jobIndex = mockQueryJobs.findIndex(job => job.id === newJob.id);
      if (jobIndex !== -1 && mockQueryJobs[jobIndex].status === 'queued') {
        mockQueryJobs[jobIndex] = { ...mockQueryJobs[jobIndex], status: 'processing', progress: 5 };
      }
    }, 2000);
    
    return newJob;
  }
};

/**
 * Mocks fetching process_id candidates for a given part_id.
 * @param {string} partId - The part ID entered by the user.
 * @returns {Promise<Array<{process_id: string, total_count: number}>>}
 */
export const getProcessIdCandidates = (partId: string): Promise<Array<{process_id: string, total_count: number}>> => {
  console.log(`Mock API: Fetching candidates for part_id "${partId}"...`);

  // Simulate a network delay
  return new Promise(resolve => {
    setTimeout(() => {
      // Return a predefined list of candidates for testing
      const mockCandidates = [
        { process_id: 'abc-123-process-alpha', total_count: 1578 },
        { process_id: 'abc-123-process-beta', total_count: 204 }
      ];
      resolve(mockCandidates);
    }, 500); // 0.5 second delay
  });
};

interface RegisterProcessIdPayload {
  part_id: string;
  process_id: string;
}

/**
 * Mocks the registration of a new valid product (part_id + process_id).
 * @param {RegisterProcessIdPayload} payload - The data to register.
 * @returns {Promise<{message: string}>}
 */
export const registerNewProcessId = (payload: RegisterProcessIdPayload): Promise<{message: string}> => {
  console.log('Mock API: Registering new process_id with payload:', payload);

  // Simulate a network delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Conditionally fail for demonstration purposes if needed
      if (!payload.part_id || !payload.process_id) {
        reject({ message: 'Registration failed: Missing required fields.' });
      } else {
        // Add the new part_id to the mock data
        validProductsData.push({ part_id: payload.part_id });
        resolve({ message: 'Part ID registered successfully.' });
      }
    }, 500); // 0.5 second delay
  });
};
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

export interface GetDataItem {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  firstdate?: string;
  progress?: number;
}

export interface ProcessingItem {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  progress?: number;
}

export interface QueryJob {
  group_id: number;
  part_id: string;
  startdate: string;
  enddate: string;
  status: string;
  getdata_item: GetDataItem[];
  processing_item: ProcessingItem[];
}

export interface SubmitQueryRequest {
  part_id: string;
  start_date: string;
  end_date: string;
  emails: string[];
  layer_ids: string[];
}

// Mock API delay to simulate network requests
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for dynamic data
let mockQueryJobs: QueryJob[] = [...queryJobsData];
let nextGroupId = Math.max(...mockQueryJobs.map(job => job.group_id)) + 1;

// Mock layer IDs data
const mockLayerIds = {
  'Temperature': ['temp_surface', 'temp_core', 'temp_ambient', 'temp_exhaust'],
  'Pressure': ['pressure_inlet', 'pressure_outlet', 'pressure_differential'],
  'Flow': ['flow_rate_primary', 'flow_rate_secondary', 'flow_velocity', 'flow_turbulence'],
  'Electrical': ['voltage_ac', 'voltage_dc', 'current_load', 'power_consumption', 'frequency_hz'],
  'Mechanical': ['torque_output', 'rpm_motor', 'vibration_x', 'vibration_y', 'vibration_z'],
  'Chemical': ['ph_level', 'conductivity', 'dissolved_oxygen', 'turbidity']
};

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

  async getLayerIds(): Promise<Record<string, string[]>> {
    await mockDelay();
    return { ...mockLayerIds };
  },
  async getQueryJobs(): Promise<QueryJob[]> {
    await mockDelay();
    // Simulate some jobs progressing
    mockQueryJobs = mockQueryJobs.map(job => ({
      ...job,
      getdata_item: job.getdata_item.map(item => {
        if (item.status === 'processing' && item.progress && item.progress < 100) {
          const newProgress = Math.min(100, item.progress + Math.random() * 10);
          if (newProgress >= 100) {
            return { ...item, status: 'finished', progress: 100, updated_at: new Date().toISOString() };
          }
          return { ...item, progress: Math.floor(newProgress), updated_at: new Date().toISOString() };
        }
        return item;
      }),
      processing_item: job.processing_item.map(item => {
        if (item.status === 'processing' && item.progress && item.progress < 100) {
          const newProgress = Math.min(100, item.progress + Math.random() * 10);
          if (newProgress >= 100) {
            return { ...item, status: 'finished', progress: 100, updated_at: new Date().toISOString() };
          }
          return { ...item, progress: Math.floor(newProgress), updated_at: new Date().toISOString() };
        }
        return item;
      })
    }));
    
    return [...mockQueryJobs].sort((a, b) => b.group_id - a.group_id);
  },

  async submitQuery(request: SubmitQueryRequest): Promise<QueryJob> {
    await mockDelay();
    const newJob: QueryJob = {
      group_id: nextGroupId++,
      part_id: request.part_id,
      startdate: request.start_date,
      enddate: request.end_date,
      getdata_item: [{
        id: 1,
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 0
      }],
      processing_item: [{
        id: 1,
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 0
      }]
    };
    
    mockQueryJobs.unshift(newJob);
    
    // Simulate job starting after a short delay
    setTimeout(() => {
      const jobIndex = mockQueryJobs.findIndex(job => job.group_id === newJob.group_id);
      if (jobIndex !== -1) {
        mockQueryJobs[jobIndex].getdata_item[0] = {
          ...mockQueryJobs[jobIndex].getdata_item[0],
          status: 'processing',
          progress: 5,
          updated_at: new Date().toISOString()
        };
      }
    }, 2000);
    
    return newJob;
  },

  async rerunQuery(groupId: number): Promise<QueryJob> {
    await mockDelay();
    const existingJob = mockQueryJobs.find(job => job.group_id === groupId);
    if (!existingJob) {
      throw new Error(`Job with group_id ${groupId} not found`);
    }

    const newJob: QueryJob = {
      group_id: nextGroupId++,
      part_id: existingJob.part_id,
      startdate: existingJob.startdate,
      enddate: existingJob.enddate,
      getdata_item: [{
        id: 1,
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 0
      }],
      processing_item: [{
        id: 1,
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 0
      }]
    };
    
    mockQueryJobs.unshift(newJob);
    
    // Simulate job starting after a short delay
    setTimeout(() => {
      const jobIndex = mockQueryJobs.findIndex(job => job.group_id === newJob.group_id);
      if (jobIndex !== -1) {
        mockQueryJobs[jobIndex].getdata_item[0] = {
          ...mockQueryJobs[jobIndex].getdata_item[0],
          status: 'processing',
          progress: 5,
          updated_at: new Date().toISOString()
        };
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
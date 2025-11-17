import axios from '../lib/axios';

// API endpoints
const API_ENDPOINTS = {
  OFFLOAD_RECORDS: '/api/offload-records',
  OFFLOAD_RECORD: (id: string) => `/api/offload-records/${id}`,
};

// Offload Management API service
export const offloadService = {
  // Get all offload records
  getAllOffloadRecords: async () => {
    const response = await axios.get(API_ENDPOINTS.OFFLOAD_RECORDS);
    return response.data;
  },

  // Get single offload record
  getOffloadRecord: async (id: string) => {
    const response = await axios.get(API_ENDPOINTS.OFFLOAD_RECORD(id));
    return response.data;
  },

  // Create new offload record
  createOffloadRecord: async (data: any) => {
    const response = await axios.post(API_ENDPOINTS.OFFLOAD_RECORDS, data);
    return response.data;
  },

  // Update offload record
  updateOffloadRecord: async (id: string, data: any) => {
    const response = await axios.put(API_ENDPOINTS.OFFLOAD_RECORD(id), data);
    return response.data;
  },

  // Delete offload record
  deleteOffloadRecord: async (id: string) => {
    const response = await axios.delete(API_ENDPOINTS.OFFLOAD_RECORD(id));
    return response.data;
  },
};

export default offloadService;

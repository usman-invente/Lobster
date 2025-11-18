import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { OffloadRecord } from '../types';
import { Plus, FileText, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'sonner';

export function OffloadManagement() {
  const { currentUser } = useData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [offloadRecords, setOffloadRecords] = useState<OffloadRecord[]>([]);
  
  // Server-side table state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortColumn, setSortColumn] = useState('offloadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState({
    boatName: '',
    offloadDate: new Date().toISOString().split('T')[0],
    tripNumber: '',
    externalFactory: '',
    totalKgOffloaded: 0,
    totalKgReceived: 0,
    totalKgDead: 0,
    totalKgRotten: 0,
    sizeU: 0,
    sizeA: 0,
    sizeB: 0,
    sizeC: 0,
    sizeD: 0,
    sizeE: 0,
  });

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Fetch offload records from database with server-side features
  const fetchOffloadRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/offload-records', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          sort_by: sortColumn,
          sort_direction: sortDirection,
        }
      });
      
      // Handle response - expecting { data: [...], meta: {...} }
      const records = response.data.data || [];
      const pagination = response.data.meta || { total: 0 };
      
      if (!Array.isArray(records)) {
        console.error('Expected array in response.data.data, got:', typeof records);
        setOffloadRecords([]);
        setTotalRecords(0);
        setIsLoading(false);
        return;
      }
      
      // Ensure all numeric fields are numbers, not strings
      const normalizedRecords = records.map((record: any) => ({
        ...record,
        totalKgOffloaded: parseFloat(record.totalKgOffloaded) || 0,
        totalKgReceived: parseFloat(record.totalKgReceived) || 0,
        totalKgDead: parseFloat(record.totalKgDead) || 0,
        totalKgRotten: parseFloat(record.totalKgRotten) || 0,
        totalKgAlive: parseFloat(record.totalKgAlive) || 0,
        sizeU: parseFloat(record.sizeU) || 0,
        sizeA: parseFloat(record.sizeA) || 0,
        sizeB: parseFloat(record.sizeB) || 0,
        sizeC: parseFloat(record.sizeC) || 0,
        sizeD: parseFloat(record.sizeD) || 0,
        sizeE: parseFloat(record.sizeE) || 0,
      }));
      
      setOffloadRecords(normalizedRecords);
      setTotalRecords(pagination.total || normalizedRecords.length);
    } catch (error) {
      console.error('Error fetching offload records:', error);
      toast.error('Failed to load offload records', {
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchOffloadRecords();
  }, [currentPage, perPage, searchQuery, sortColumn, sortDirection]);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalRecords / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, totalRecords);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const totalKgAlive = formData.sizeU + formData.sizeA + formData.sizeB + 
                         formData.sizeC + formData.sizeD + formData.sizeE;

    // Send data to API using axios
    try {
      const response = await axios.post('/api/offload-records', {
        ...formData,
        totalKgAlive,
        deadOnTanks: 0,
        rottenOnTanks: 0,
      });
      
      // Success - refresh data from database and close form
      await fetchOffloadRecords();
      setShowForm(false);
      
      toast.success('Offload record created successfully!', {
        description: `Created record for ${formData.boatName} - Trip #${formData.tripNumber}`,
        duration: 4000,
      });
      
      // Reset form
      setFormData({
        boatName: '',
        offloadDate: new Date().toISOString().split('T')[0],
        tripNumber: '',
        externalFactory: '',
        totalKgOffloaded: 0,
        totalKgReceived: 0,
        totalKgDead: 0,
        totalKgRotten: 0,
        sizeU: 0,
        sizeA: 0,
        sizeB: 0,
        sizeC: 0,
        sizeD: 0,
        sizeE: 0,
      });
    } catch (error: any) {
      console.error('Error creating offload record:', error);
      
      // Check if it's a Laravel validation error (422 status)
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        // Laravel returns arrays of error messages, take the first one for each field
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key]) 
            ? validationErrors[key][0] 
            : validationErrors[key];
        });
        setErrors(formattedErrors);
      } else {
        // For other errors, show toast
        toast.error('Failed to create offload record', {
          description: 'Please check your connection and try again.',
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Boat Offload Records
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Offload
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by boat name, trip number, or factory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="mb-4">Create Offload Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Boat Name</label>
                <input
                  type="text"
                  
                  value={formData.boatName}
                  onChange={(e) => {
                    setFormData({ ...formData, boatName: e.target.value });
                    if (errors.boatName) setErrors({ ...errors, boatName: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.boatName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.boatName && <p className="text-red-600 text-sm mt-1 font-medium">{errors.boatName}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Offload Date</label>
                <input
                  type="date"
                  
                  value={formData.offloadDate}
                  onChange={(e) => {
                    setFormData({ ...formData, offloadDate: e.target.value });
                    if (errors.offloadDate) setErrors({ ...errors, offloadDate: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.offloadDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.offloadDate && <p className="text-red-600 text-sm mt-1 font-medium">{errors.offloadDate}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trip Number</label>
                <input
                  type="text"
                  
                  value={formData.tripNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, tripNumber: e.target.value });
                    if (errors.tripNumber) setErrors({ ...errors, tripNumber: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.tripNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.tripNumber && <p className="text-red-600 text-sm mt-1 font-medium">{errors.tripNumber}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">External Factory</label>
                <input
                  type="text"
                  
                  value={formData.externalFactory}
                  onChange={(e) => {
                    setFormData({ ...formData, externalFactory: e.target.value });
                    if (errors.externalFactory) setErrors({ ...errors, externalFactory: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.externalFactory ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.externalFactory && <p className="text-red-600 text-sm mt-1 font-medium">{errors.externalFactory}</p>}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3">Factory Receiving Breakdown</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Offloaded</label>
                  <input
                    type="number"
                    step="0.01"
                    
                    value={formData.totalKgOffloaded}
                    onChange={(e) => {
                      setFormData({ ...formData, totalKgOffloaded: parseFloat(e.target.value) || 0 });
                      if (errors.totalKgOffloaded) setErrors({ ...errors, totalKgOffloaded: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.totalKgOffloaded ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.totalKgOffloaded && <p className="text-red-600 text-sm mt-1 font-medium">{errors.totalKgOffloaded}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Received</label>
                  <input
                    type="number"
                    step="0.01"
                    
                    value={formData.totalKgReceived}
                    onChange={(e) => {
                      setFormData({ ...formData, totalKgReceived: parseFloat(e.target.value) || 0 });
                      if (errors.totalKgReceived) setErrors({ ...errors, totalKgReceived: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.totalKgReceived ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.totalKgReceived && <p className="text-red-600 text-sm mt-1 font-medium">{errors.totalKgReceived}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Dead</label>
                  <input
                    type="number"
                    step="0.01"
                    
                    value={formData.totalKgDead}
                    onChange={(e) => {
                      setFormData({ ...formData, totalKgDead: parseFloat(e.target.value) || 0 });
                      if (errors.totalKgDead) setErrors({ ...errors, totalKgDead: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.totalKgDead ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.totalKgDead && <p className="text-red-600 text-sm mt-1 font-medium">{errors.totalKgDead}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Rotten</label>
                  <input
                    type="number"
                    step="0.01"
                    
                    value={formData.totalKgRotten}
                    onChange={(e) => {
                      setFormData({ ...formData, totalKgRotten: parseFloat(e.target.value) || 0 });
                      if (errors.totalKgRotten) setErrors({ ...errors, totalKgRotten: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.totalKgRotten ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.totalKgRotten && <p className="text-red-600 text-sm mt-1 font-medium">{errors.totalKgRotten}</p>}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3">Live Lobster by Size</h3>
              <div className="grid grid-cols-6 gap-4">
                {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => {
                  const fieldName = `size${size}` as keyof typeof formData;
                  return (
                    <div key={size}>
                      <label className="block text-sm text-gray-600 mb-1">Size {size} (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        
                        value={formData[fieldName] as number}
                        onChange={(e) => {
                          setFormData({ ...formData, [fieldName]: parseFloat(e.target.value) || 0 });
                          if (errors[fieldName]) setErrors({ ...errors, [fieldName]: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        disabled={isSubmitting}
                      />
                      {errors[fieldName] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[fieldName]}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Offload Record'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('boatName')}
              >
                <div className="flex items-center gap-1">
                  Boat {sortColumn === 'boatName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('offloadDate')}
              >
                <div className="flex items-center gap-1">
                  Date {sortColumn === 'offloadDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tripNumber')}
              >
                <div className="flex items-center gap-1">
                  Trip # {sortColumn === 'tripNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('externalFactory')}
              >
                <div className="flex items-center gap-1">
                  Factory {sortColumn === 'externalFactory' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalKgOffloaded')}
              >
                <div className="flex items-center justify-end gap-1">
                  Offloaded (kg) {sortColumn === 'totalKgOffloaded' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalKgReceived')}
              >
                <div className="flex items-center justify-end gap-1">
                  Received (kg) {sortColumn === 'totalKgReceived' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalKgAlive')}
              >
                <div className="flex items-center justify-end gap-1">
                  Alive (kg) {sortColumn === 'totalKgAlive' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalKgDead')}
              >
                <div className="flex items-center justify-end gap-1">
                  Dead (kg) {sortColumn === 'totalKgDead' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalKgRotten')}
              >
                <div className="flex items-center justify-end gap-1">
                  Rotten (kg) {sortColumn === 'totalKgRotten' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : offloadRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No offload records yet. Click "New Offload" to create one.
                </td>
              </tr>
            ) : (
              offloadRecords.map((record, idx) => (
                <tr key={record.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{record.boatName}</td>
                  <td className="px-4 py-3">{formatDate(record.offloadDate)}</td>
                  <td className="px-4 py-3">{record.tripNumber}</td>
                  <td className="px-4 py-3">{record.externalFactory}</td>
                  <td className="px-4 py-3 text-right">{record.totalKgOffloaded.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{record.totalKgReceived.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{record.totalKgAlive.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{record.totalKgDead.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{record.totalKgRotten.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {offloadRecords.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

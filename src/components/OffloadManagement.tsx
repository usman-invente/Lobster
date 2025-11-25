import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { OffloadRecord } from '../types';
import { Plus, FileText, Loader2, Search, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
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
    totalKgOffloaded: '',
    totalKgReceived: '',
    totalKgDead: '',
    totalKgRotten: '',
    totalLive: '',
    sizeU: '',
    sizeA: '',
    sizeB: '',
    sizeC: '',
    sizeD: '',
    sizeE: '',
    sizeM: '',
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState<OffloadRecord | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printRecord, setPrintRecord] = useState<OffloadRecord | null>(null);

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
      const normalizedRecords = records.map((record: any) => {
        return {
          ...record,
          totalKgOffloaded: parseFloat(record.totalKgOffloaded) || 0,
          totalKgReceived: parseFloat(record.totalKgReceived) || 0,
          totalKgDead: parseFloat(record.totalKgDead) || 0,
          totalKgRotten: parseFloat(record.totalKgRotten) || 0,
          totalKgAlive: parseFloat(record.totalLive) || 0,
          sizeU: parseFloat(record.sizeU) || 0,
          sizeA: parseFloat(record.sizeA) || 0,
          sizeB: parseFloat(record.sizeB) || 0,
          sizeC: parseFloat(record.sizeC) || 0,
          sizeD: parseFloat(record.sizeD) || 0,
          sizeE: parseFloat(record.sizeE) || 0,
          sizeM: parseFloat(record.sizeM) || 0,
        };
      });
      
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

    const totalKgAlive = (parseFloat(formData.sizeU) || 0) + (parseFloat(formData.sizeA) || 0) + (parseFloat(formData.sizeB) || 0) + 
                         (parseFloat(formData.sizeC) || 0) + (parseFloat(formData.sizeD) || 0) + (parseFloat(formData.sizeE) || 0) + (parseFloat(formData.sizeM) || 0);

    // Send data to API using axios
    try {
      const response = await axios.post('/api/offload-records', {
        boatName: formData.boatName,
        offloadDate: formData.offloadDate,
        tripNumber: formData.tripNumber,
        externalFactory: formData.externalFactory,
        totalKgOffloaded: parseFloat(formData.totalKgOffloaded) || 0,
        totalKgReceived: parseFloat(formData.totalKgReceived) || 0,
        totalKgDead: parseFloat(formData.totalKgDead) || 0,
        totalKgRotten: parseFloat(formData.totalKgRotten) || 0,
        totalLive: parseFloat(formData.totalLive) || 0,
        sizeU: parseFloat(formData.sizeU) || 0,
        sizeA: parseFloat(formData.sizeA) || 0,
        sizeB: parseFloat(formData.sizeB) || 0,
        sizeC: parseFloat(formData.sizeC) || 0,
        sizeD: parseFloat(formData.sizeD) || 0,
        sizeE: parseFloat(formData.sizeE) || 0,
        sizeM: parseFloat(formData.sizeM) || 0,
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
        totalKgOffloaded: '',
        totalKgReceived: '',
        totalKgDead: '',
        totalKgRotten: '',
        totalLive: '',
        sizeU: '',
        sizeA: '',
        sizeB: '',
        sizeC: '',
        sizeD: '',
        sizeE: '',
        sizeM: '',
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
    }
  };

  // Delete handler
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`/api/offload-records/${id}`);
      toast.success('Record deleted successfully');
      await fetchOffloadRecords();
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  // Open edit modal and populate form
  const handleEditClick = (record: OffloadRecord) => {
    setEditRecord(record);
    setEditForm({ ...record });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Open print modal
  const handlePrintClick = (record: OffloadRecord) => {
    setPrintRecord(record);
    setShowPrintModal(true);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setIsEditSubmitting(true);
    setEditErrors({});
    const totalKgAlive =
      (parseFloat(editForm.sizeU) || 0) + (parseFloat(editForm.sizeA) || 0) + (parseFloat(editForm.sizeB) || 0) +
      (parseFloat(editForm.sizeC) || 0) + (parseFloat(editForm.sizeD) || 0) + (parseFloat(editForm.sizeE) || 0) + (parseFloat(editForm.sizeM) || 0);
    try {
      await axios.put(`/api/offload-records/${editRecord.id}`, {
        boatName: editForm.boatName,
        offloadDate: editForm.offloadDate,
        tripNumber: editForm.tripNumber,
        externalFactory: editForm.externalFactory,
        totalKgOffloaded: parseFloat(editForm.totalKgOffloaded) || 0,
        totalKgReceived: parseFloat(editForm.totalKgReceived) || 0,
        totalKgDead: parseFloat(editForm.totalKgDead) || 0,
        totalKgRotten: parseFloat(editForm.totalKgRotten) || 0,
        totalLive: parseFloat(editForm.totalLive) || 0,
        sizeU: parseFloat(editForm.sizeU) || 0,
        sizeA: parseFloat(editForm.sizeA) || 0,
        sizeB: parseFloat(editForm.sizeB) || 0,
        sizeC: parseFloat(editForm.sizeC) || 0,
        sizeD: parseFloat(editForm.sizeD) || 0,
        sizeE: parseFloat(editForm.sizeE) || 0,
        sizeM: parseFloat(editForm.sizeM) || 0,
        totalKgAlive,
        deadOnTanks: 0,
        rottenOnTanks: 0,
      });
      toast.success('Offload record updated successfully!');
      setShowEditModal(false);
      setEditRecord(null);
      await fetchOffloadRecords();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        });
        setEditErrors(formattedErrors);
      } else {
        toast.error('Failed to update record');
      }
    } finally {
      setIsEditSubmitting(false);
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
          <div className="flex-1 relative flex items-center group">
         
            <input
              type="text"
              placeholder="Search by boat name, trip number, or factory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:border-gray-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Offloaded</label>
                  <input
                    type="number"
                   
                    value={formData.totalKgOffloaded}
                    onChange={(e) => {
                      setFormData({ ...formData, totalKgOffloaded: e.target.value });
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
                      setFormData({ ...formData, totalKgReceived: e.target.value });
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
                      setFormData({ ...formData, totalKgDead: e.target.value });
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
                      setFormData({ ...formData, totalKgRotten: e.target.value });
                      if (errors.totalKgRotten) setErrors({ ...errors, totalKgRotten: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.totalKgRotten ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.totalKgRotten && <p className="text-red-600 text-sm mt-1 font-medium">{errors.totalKgRotten}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Live (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    
                    value={formData.totalLive}
                    onChange={(e) => {
                      setFormData({ ...formData, totalLive: e.target.value });
                      if (errors.totalLive) setErrors({ ...errors, totalLive: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.totalLive ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.totalLive && <p className="text-red-600 text-sm mt-1 font-medium">{errors.totalLive}</p>}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3">Live Lobster by Size</h3>
              <div className="grid grid-cols-7 gap-4">
                {(['U', 'A', 'B', 'C', 'D', 'E', 'M'] as const).map(size => {
                  const fieldName = `size${size}` as keyof typeof formData;
                  return (
                    <div key={size}>
                      <label className="block text-sm text-gray-600 mb-1">Size {size} (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        
                        value={formData[fieldName]}
                        onChange={(e) => {
                          setFormData({ ...formData, [fieldName]: e.target.value });
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
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
              <th className="px-4 py-3 text-center text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : offloadRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
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
                  <td className="px-4 py-3">{record.totalKgOffloaded.toFixed(2)}</td>
                  <td className="px-4 py-3">{record.totalKgReceived.toFixed(2)}</td>
                  <td className="px-4 py-3">{record.totalKgAlive.toFixed(2)}</td>
                  <td className="px-4 py-3">{record.totalKgDead.toFixed(2)}</td>
                  <td className="px-4 py-3">{record.totalKgRotten.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                    <button
                      title="Print"
                      onClick={() => handlePrintClick(record)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                    <button
                      title="Edit"
                      onClick={() => handleEditClick(record)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-600">
            Showing {offloadRecords.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Offload Record</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { setShowEditModal(false); setEditRecord(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Boat Name</label>
                    <input
                      type="text"
                      value={editForm.boatName || ''}
                      onChange={e => handleEditChange('boatName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.boatName ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.boatName && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.boatName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Offload Date</label>
                    <input
                      type="date"
                      value={editForm.offloadDate || ''}
                      onChange={e => handleEditChange('offloadDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.offloadDate ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.offloadDate && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.offloadDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Trip Number</label>
                    <input
                      type="text"
                      value={editForm.tripNumber || ''}
                      onChange={e => handleEditChange('tripNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.tripNumber ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.tripNumber && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.tripNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">External Factory</label>
                    <input
                      type="text"
                      value={editForm.externalFactory || ''}
                      onChange={e => handleEditChange('externalFactory', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.externalFactory ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.externalFactory && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.externalFactory}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Kg Offloaded</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.totalKgOffloaded || ''}
                      onChange={e => handleEditChange('totalKgOffloaded', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.totalKgOffloaded ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.totalKgOffloaded && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.totalKgOffloaded}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Kg Received</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.totalKgReceived || ''}
                      onChange={e => handleEditChange('totalKgReceived', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.totalKgReceived ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.totalKgReceived && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.totalKgReceived}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Kg Dead</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.totalKgDead || ''}
                      onChange={e => handleEditChange('totalKgDead', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.totalKgDead ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.totalKgDead && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.totalKgDead}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Kg Rotten</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.totalKgRotten || ''}
                      onChange={e => handleEditChange('totalKgRotten', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.totalKgRotten ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.totalKgRotten && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.totalKgRotten}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Live (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.totalLive || ''}
                      onChange={e => handleEditChange('totalLive', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.totalLive ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.totalLive && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.totalLive}</p>}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="mb-3">Live Lobster by Size</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(['U', 'A', 'B', 'C', 'D', 'E', 'M'] as const).map(size => {
                      const fieldName = `size${size}`;
                      return (
                        <div key={size}>
                          <label className="block text-sm text-gray-600 mb-1">Size {size} (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm[fieldName] || ''}
                            onChange={e => handleEditChange(fieldName, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${editErrors[fieldName] ? 'border-red-500' : 'border-gray-300'}`}
                            disabled={isEditSubmitting}
                          />
                          {editErrors[fieldName] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[fieldName]}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  onClick={handleEditSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isEditSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update Record'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isEditSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && printRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col print-modal-content">
            <style>
              {`
                @media print {
                  .print-hide {
                    display: none !important;
                  }
                  .print-modal-content {
                    padding: 0 !important;
                    overflow: visible !important;
                  }
                  body {
                    print-color-adjust: exact;
                  }
                }
              `}
            </style>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b print-hide">
              <h2 className="text-lg font-semibold">Print Offload Record</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Print
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => { setShowPrintModal(false); setPrintRecord(null); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 print:p-0">
              {/* Print Title */}
              <div className="hidden print:block text-center mb-4">
                <h1 className="text-xl font-bold">Offload Record</h1>
              </div>

              {/* Offload Header */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Boat Name:</strong> {printRecord.boatName}
                  </div>
                  <div>
                    <strong>Offload Date:</strong> {formatDate(printRecord.offloadDate)}
                  </div>
                  <div>
                    <strong>Trip Number:</strong> {printRecord.tripNumber}
                  </div>
                  <div>
                    <strong>External Factory:</strong> {printRecord.externalFactory}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Total Kg Offloaded:</strong> {printRecord.totalKgOffloaded.toFixed(2)} kg
                  </div>
                  <div>
                    <strong>Total Kg Received:</strong> {printRecord.totalKgReceived.toFixed(2)} kg
                  </div>
                  <div>
                    <strong>Total Kg Alive:</strong> {printRecord.totalKgAlive.toFixed(2)} kg
                  </div>
                  <div>
                    <strong>Total Kg Dead:</strong> {printRecord.totalKgDead.toFixed(2)} kg
                  </div>
                  <div>
                    <strong>Total Kg Rotten:</strong> {printRecord.totalKgRotten.toFixed(2)} kg
                  </div>
                  <div>
                    <strong>Total Live:</strong> {printRecord.totalKgAlive.toFixed(2)} kg
                  </div>
                </div>
              </div>

              {/* Size Breakdown */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Live Lobster by Size</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><strong>Size U:</strong> {printRecord.sizeU.toFixed(2)} kg</div>
                  <div><strong>Size A:</strong> {printRecord.sizeA.toFixed(2)} kg</div>
                  <div><strong>Size B:</strong> {printRecord.sizeB.toFixed(2)} kg</div>
                  <div><strong>Size C:</strong> {printRecord.sizeC.toFixed(2)} kg</div>
                  <div><strong>Size D:</strong> {printRecord.sizeD.toFixed(2)} kg</div>
                  <div><strong>Size E:</strong> {printRecord.sizeE.toFixed(2)} kg</div>
                  <div><strong>Size M:</strong> {printRecord.sizeM.toFixed(2)} kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

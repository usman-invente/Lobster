import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ReceivingBatch, CrateLineItem, SizeCategory } from '../types';
import { Plus, Trash2, Package, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'sonner';

export function ReceivingManagement() {
  const { currentUser } = useData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receivingBatches, setReceivingBatches] = useState<ReceivingBatch[]>([]);
  const [batchNumber, setBatchNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<Array<{
    boatName: string;
    offloadDate: string;
    crateNumber: number;
    size: SizeCategory;
    kg: number;
  }>>([]);
  
  // Server-side table state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for available boats (from offload records)
  const [availableBoats, setAvailableBoats] = useState<string[]>([]);

  // Available crate numbers (1-300)
  const availableCrates = Array.from({ length: 300 }, (_, i) => i + 1);

  // State for offload records (to populate boat and date dropdowns)
  const [offloadRecords, setOffloadRecords] = useState<any[]>([]);

  // Fetch available boats and offload records for the form
  useEffect(() => {
    const fetchOffloadRecords = async () => {
      try {
        const response = await axios.get('/api/offload-records', {
          params: { per_page: 1000 } // Get all for dropdowns
        });
        const records = response.data.data || [];
        setOffloadRecords(records);
        const boats = Array.from(new Set(records.map((r: any) => r.boatName)));
        setAvailableBoats(boats as string[]);
      } catch (error) {
        console.error('Error fetching offload records:', error);
      }
    };
    
    if (showForm) {
      fetchOffloadRecords();
    }
  }, [showForm]);

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Fetch receiving batches from database with server-side features
  const fetchReceivingBatches = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/receiving-batches', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          sort_by: sortColumn,
          sort_direction: sortDirection,
        }
      });
      
      // Handle response - expecting { data: [...], meta: {...} }
      const batches = response.data.data || [];
      const pagination = response.data.meta || { total: 0 };
      
      if (!Array.isArray(batches)) {
        console.error('Expected array in response.data.data, got:', typeof batches);
        setReceivingBatches([]);
        setTotalRecords(0);
        setIsLoading(false);
        return;
      }
      
      setReceivingBatches(batches);
      setTotalRecords(pagination.total || batches.length);
    } catch (error) {
      console.error('Error fetching receiving batches:', error);
      toast.error('Failed to load receiving batches', {
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchReceivingBatches();
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

  const addLineItem = () => {
    setLineItems([...lineItems, {
      boatName: '',
      offloadDate: '',
      crateNumber: availableCrates[0] || 1,
      size: 'A',
      kg: 0,
    }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error('Please add at least one crate line item');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    // Send data to API using axios
    try {
      const response = await axios.post('/api/receiving-batches', {
        date,
        batchNumber,
        lineItems,
      });
      
      // Success - refresh data from database and close form
      await fetchReceivingBatches();
      setShowForm(false);
      
      toast.success('Receiving batch created successfully!', {
        description: `Created batch #${batchNumber} with ${lineItems.length} crate(s)`,
        duration: 4000,
      });
      
      // Reset form
      setBatchNumber('');
      setDate(new Date().toISOString().split('T')[0]);
      setLineItems([]);
    } catch (error: any) {
      console.error('Error creating receiving batch:', error);
      
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
        toast.error('Failed to create receiving batch', {
          description: 'Please check your connection and try again.',
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          Receiving Batches
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Receiving Batch
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          <h2 className="mb-4">Create Receiving Batch</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors({ ...errors, date: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.date && <p className="text-red-600 text-sm mt-1 font-medium">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => {
                    setBatchNumber(e.target.value);
                    if (errors.batchNumber) setErrors({ ...errors, batchNumber: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.batchNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.batchNumber && <p className="text-red-600 text-sm mt-1 font-medium">{errors.batchNumber}</p>}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3>Crate Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Crate
                </button>
              </div>
              {errors.lineItems && <p className="text-red-600 text-sm mb-2 font-medium">{errors.lineItems}</p>}

              {lineItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No crates added yet</p>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm text-gray-600 mb-1">Boat Name</label>
                        <select
                          required
                          value={item.boatName}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx] = { 
                              ...updated[idx], 
                              boatName: e.target.value,
                              offloadDate: '' // Clear offload date when boat changes
                            };
                            setLineItems(updated);
                            
                            if (errors[`lineItems.${idx}.boatName`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`lineItems.${idx}.boatName`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${errors[`lineItems.${idx}.boatName`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          disabled={isSubmitting}
                        >
                          <option value="">Select boat</option>
                          {availableBoats.map(boat => (
                            <option key={boat} value={boat}>{boat}</option>
                          ))}
                        </select>
                        {errors[`lineItems.${idx}.boatName`] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[`lineItems.${idx}.boatName`]}</p>}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm text-gray-600 mb-1">Offload Date</label>
                        <select
                          required
                          value={item.offloadDate}
                          onChange={(e) => {
                            updateLineItem(idx, 'offloadDate', e.target.value);
                            if (errors[`lineItems.${idx}.offloadDate`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`lineItems.${idx}.offloadDate`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${errors[`lineItems.${idx}.offloadDate`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          disabled={isSubmitting || !item.boatName}
                        >
                          <option value="">Select date</option>
                          {offloadRecords
                            .filter(r => r.boatName === item.boatName)
                            .map(r => {
                              // Extract only the date part (Y-m-d format)
                              const dateOnly = r.offloadDate.split('T')[0];
                              return (
                                <option key={r.id} value={dateOnly}>
                                  {formatDate(r.offloadDate)} - Trip #{r.tripNumber}
                                </option>
                              );
                            })}
                        </select>
                        {errors[`lineItems.${idx}.offloadDate`] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[`lineItems.${idx}.offloadDate`]}</p>}
                      </div>
                      <div className="w-32 flex flex-col">
                        <label className="block text-sm text-gray-600 mb-1">Crate #</label>
                        <select
                          required
                          value={item.crateNumber}
                          onChange={(e) => {
                            updateLineItem(idx, 'crateNumber', parseInt(e.target.value));
                            if (errors[`lineItems.${idx}.crateNumber`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`lineItems.${idx}.crateNumber`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${errors[`lineItems.${idx}.crateNumber`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          disabled={isSubmitting}
                        >
                          {availableCrates.map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                        {errors[`lineItems.${idx}.crateNumber`] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[`lineItems.${idx}.crateNumber`]}</p>}
                      </div>
                      <div className="w-24 flex flex-col">
                        <label className="block text-sm text-gray-600 mb-1">Size</label>
                        <select
                          required
                          value={item.size}
                          onChange={(e) => {
                            updateLineItem(idx, 'size', e.target.value as SizeCategory);
                            if (errors[`lineItems.${idx}.size`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`lineItems.${idx}.size`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${errors[`lineItems.${idx}.size`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          disabled={isSubmitting}
                        >
                          {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        {errors[`lineItems.${idx}.size`] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[`lineItems.${idx}.size`]}</p>}
                      </div>
                      <div className="w-32 flex flex-col">
                        <label className="block text-sm text-gray-600 mb-1">Kg</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.kg}
                          onChange={(e) => {
                            updateLineItem(idx, 'kg', parseFloat(e.target.value) || 0);
                            if (errors[`lineItems.${idx}.kg`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`lineItems.${idx}.kg`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${errors[`lineItems.${idx}.kg`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          disabled={isSubmitting}
                        />
                        {errors[`lineItems.${idx}.kg`] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[`lineItems.${idx}.kg`]}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={isSubmitting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={lineItems.length === 0 || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Receiving Batch'
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by batch number, boat name, or date..."
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Date {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('batchNumber')}
              >
                <div className="flex items-center gap-1">
                  Batch # {sortColumn === 'batchNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Crates</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Created By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading batches...
                  </div>
                </td>
              </tr>
            ) : receivingBatches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No receiving batches yet. Click "New Receiving Batch" to create one.
                </td>
              </tr>
            ) : (
              receivingBatches.map((batch: any, idx) => (
                <tr key={batch.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{formatDate(batch.date)}</td>
                  <td className="px-4 py-3">{batch.batchNumber}</td>
                  <td className="px-4 py-3 text-right">
                    {batch.crates_count || (batch.crates ? batch.crates.length : 0)}
                  </td>
                  <td className="px-4 py-3">{batch.user?.name || batch.createdBy || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {receivingBatches.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
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
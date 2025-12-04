import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ProductRecord } from '../types';
import { Package, Plus, Loader2, Search, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'sonner';

export function ProductManagement() {
  const { currentUser } = useData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productRecords, setProductRecords] = useState<ProductRecord[]>([]);
  
  // Server-side table state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    name: '',
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState<ProductRecord | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Fetch product records from database with server-side features
  const fetchProductRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/products', {
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
        setProductRecords([]);
        setTotalRecords(0);
        setIsLoading(false);
        return;
      }
      
      // Ensure numeric fields are numbers
      const normalizedRecords = records.map((record: any) => {
        return {
          ...record,
          price: parseFloat(record.price) || 0,
          stockQuantity: parseInt(record.stockQuantity) || 0,
        };
      });
      
      setProductRecords(normalizedRecords);
      setTotalRecords(pagination.total || normalizedRecords.length);
    } catch (error) {
      console.error('Error fetching product records:', error);
      toast.error('Failed to load product records', {
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchProductRecords();
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

    // Frontend validation - check required fields
    const requiredFields = ['name'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        missingFields.push(field);
      }
    });
    if (sizes.length === 0) {
      setErrors(prev => ({ ...prev, sizes: 'Add at least one size' }));
      setIsSubmitting(false);
      return;
    }

    if (missingFields.length > 0) {
      const newErrors: Record<string, string> = {};
      missingFields.forEach(field => {
        newErrors[field] = 'This field is required';
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Send data to API using axios
    try {
      const response = await axios.post('/api/products', {
        name: formData.name,
        sizes,
      });
      // Success - refresh data and close form
      await fetchProductRecords();
      setShowForm(false);
      setFormData({ name: '' });
      setSizes([]);
      setSizeInput('');
      toast.success('Product record created successfully!', {
        description: `Created product ${formData.name}`,
      });
    } catch (error: any) {
      console.error('Error creating product record:', error);
      
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
        toast.error('Failed to create product record', {
          description: 'Please check your connection and try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Record deleted successfully');
      await fetchProductRecords();
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  // Open edit modal and populate form
  const handleEditClick = (record: ProductRecord) => {
    setEditRecord(record);
    setEditForm({ ...record, sizes: record.sizes ? [...record.sizes.map((s: any) => (typeof s === 'string' ? s : s.size))] : [] });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };
  const [editSizeInput, setEditSizeInput] = useState('');

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setIsEditSubmitting(true);
    setEditErrors({});

    // Frontend validation - check required fields
    const requiredFields = ['name'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!editForm[field]?.toString().trim()) {
        missingFields.push(field);
      }
    });
    if (!editForm.sizes || editForm.sizes.length === 0) {
      setEditErrors(prev => ({ ...prev, sizes: 'Add at least one size' }));
      setIsEditSubmitting(false);
      return;
    }

    if (missingFields.length > 0) {
      const newErrors: Record<string, string> = {};
      missingFields.forEach(field => {
        newErrors[field] = 'This field is required';
      });
      setEditErrors(newErrors);
      setIsEditSubmitting(false);
      return;
    }

    try {
      await axios.put(`/api/products/${editRecord.id}`, {
        name: editForm.name,
        sizes: editForm.sizes,
      });
      toast.success('Product record updated successfully!');
      setShowEditModal(false);
      setEditRecord(null);
      await fetchProductRecords();
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
          <Package className="w-6 h-6" />
          Product Records
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center group">
         
            <input
              type="text"
              placeholder="Search by product name..."
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
          <h2 className="mb-4">Create Product Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Product Sizes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${errors.sizes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  placeholder="Enter size (e.g. U, A, B, etc.)"
                  maxLength={10}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => {
                    const val = sizeInput.trim();
                    if (val && !sizes.includes(val)) {
                      setSizes([...sizes, val]);
                      setSizeInput('');
                      setErrors(prev => ({ ...prev, sizes: '' }));
                    }
                  }}
                >
                  Add Size
                </button>
              </div>
              {errors.sizes && <p className="text-red-600 text-sm mt-1 font-medium">{errors.sizes}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1">
                    {size}
                    <button
                      type="button"
                      className="ml-1 text-red-500 hover:text-red-700"
                      onClick={() => setSizes(sizes.filter((s, i) => i !== idx))}
                    >
                      &times;
                    </button>
                  </span>
                ))}
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
                  'Create Product Record'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Product Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Date Added {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : productRecords.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No product records yet. Click "New Product" to create one.
                </td>
              </tr>
            ) : (
              productRecords.map((record, idx) => (
                <tr key={record.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{record.name}</td>
                  <td className="px-4 py-3">{formatDate(record.created_at)}</td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
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
            Showing {productRecords.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
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
              <h2 className="text-lg font-semibold">Edit Product Record</h2>
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
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => handleEditChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${editErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isEditSubmitting}
                    placeholder="Enter product name"
                  />
                  {editErrors.name && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Product Sizes</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editSizeInput}
                      onChange={e => setEditSizeInput(e.target.value)}
                      className={`px-3 py-2 border rounded-lg ${editErrors.sizes ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter size (e.g. U, A, B, etc.)"
                      maxLength={10}
                      disabled={isEditSubmitting}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      disabled={isEditSubmitting}
                      onClick={() => {
                        const val = editSizeInput.trim();
                        if (val && !(editForm.sizes || []).includes(val)) {
                          handleEditChange('sizes', [...(editForm.sizes || []), val]);
                          setEditSizeInput('');
                          setEditErrors(prev => ({ ...prev, sizes: '' }));
                        }
                      }}
                    >
                      Add Size
                    </button>
                  </div>
                  {editErrors.sizes && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.sizes}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(editForm.sizes || []).map((size: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1">
                        {size}
                        <button
                          type="button"
                          className="ml-1 text-red-500 hover:text-red-700"
                          disabled={isEditSubmitting}
                          onClick={() => handleEditChange('sizes', (editForm.sizes || []).filter((s: string, i: number) => i !== idx))}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
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

    </div>
  );
}
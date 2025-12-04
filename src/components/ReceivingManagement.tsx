import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ReceivingBatch, CrateLineItem, SizeCategory } from '../types';
import { Plus, Trash2, Package, Loader2, Search, ChevronLeft, ChevronRight, Pencil, Printer } from 'lucide-react';
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
    productId: number;
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

  // State for products
  const [products, setProducts] = useState<any[]>([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBatch, setEditBatch] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    batchNumber: '',
    lineItems: [] as Array<{
      boatName: string;
      offloadDate: string;
      productId: number;
      crateNumber: number;
      size: SizeCategory;
      kg: number;
    }>
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBatch, setPrintBatch] = useState<any>(null);

  // State for sizes of selected product
  const [productSizes, setProductSizes] = useState<string[]>([]);

  // Update productSizes when selected product changes
  useEffect(() => {
    let selectedProductId = null;
    if (lineItems.length > 0) {
      selectedProductId = lineItems[0].productId;
    } else if (editForm.lineItems.length > 0) {
      selectedProductId = editForm.lineItems[0].productId;
    }
    if (selectedProductId && products.length > 0) {
      const selectedProduct = products.find((p: any) => p.id === selectedProductId);
      if (selectedProduct && selectedProduct.sizes) {
        setProductSizes(selectedProduct.sizes.map((s: any) => s.size));
      } else {
        setProductSizes([]);
      }
    } else {
      setProductSizes([]);
    }
  }, [lineItems, products, editForm.lineItems]);

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

    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products', {
          params: { per_page: 'all', with: 'sizes' }
        });
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    if (showForm || showEditModal) {
      fetchOffloadRecords();
      fetchProducts();
    }
  }, [showForm, showEditModal]);

  // Fetch products on component mount for table display
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products', {
          params: { per_page: 'all', with: 'sizes' }
        });
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []);

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

  // Calculate available crate numbers for create form (excluding already used ones)
  const getAvailableCrateNumbersForCreate = () => {
    const usedCrateNumbers = new Set(lineItems.map(item => item.crateNumber));
    return Array.from({ length: 300 }, (_, i) => i + 1).filter(num => !usedCrateNumbers.has(num));
  };

  const addLineItem = () => {
    const availableNumbers = getAvailableCrateNumbersForCreate();
    setLineItems([...lineItems, {
      boatName: '',
      offloadDate: '',
      productId: 0,
      crateNumber: availableNumbers[0] || 1,
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

  // Delete handler
  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this receiving batch?')) return;
    try {
      await axios.delete(`/api/receiving-batches/${id}`);
      toast.success('Receiving batch deleted successfully');
      await fetchReceivingBatches();
    } catch (err) {
      toast.error('Failed to delete receiving batch');
    }
  };

  // Open edit modal and populate form
  const handleEditClick = (batch: any) => {
    setEditBatch(batch);
    setEditForm({
      date: batch.date ? new Date(batch.date).toISOString().split('T')[0] : '',
      batchNumber: batch.batchNumber,
      lineItems: batch.crates || []
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Open print modal
  const handlePrintClick = (batch: any) => {
    setPrintBatch(batch);
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

  // Handle edit line item change
  const handleEditLineItemChange = (index: number, field: string, value: any) => {
    const updated = [...editForm.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm((prev: any) => ({ ...prev, lineItems: updated }));
    if (editErrors[`lineItems.${index}.${field}`]) {
      const newErrors = { ...editErrors };
      delete newErrors[`lineItems.${index}.${field}`];
      setEditErrors(newErrors);
    }
  };

  // Calculate available crate numbers for edit form (excluding already used ones)
  const getAvailableCrateNumbers = () => {
    const usedCrateNumbers = new Set(editForm.lineItems.map((item: any) => item.crateNumber));
    return Array.from({ length: 300 }, (_, i) => i + 1).filter(num => !usedCrateNumbers.has(num));
  };

  // Add line item to edit form
  const addEditLineItem = () => {
    const availableNumbers = getAvailableCrateNumbers();
    setEditForm((prev: any) => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        boatName: '',
        offloadDate: '',
        productId: 0,
        crateNumber: availableNumbers[0] || 1,
        size: 'A',
        kg: 0,
      }]
    }));
  };

  // Remove line item from edit form
  const removeEditLineItem = (index: number) => {
    setEditForm((prev: any) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_: any, i: number) => i !== index)
    }));
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBatch) return;
    if (editForm.lineItems.length === 0) {
      toast.error('Please add at least one crate line item');
      return;
    }
    setIsEditSubmitting(true);
    setEditErrors({});
    try {
      await axios.put(`/api/receiving-batches/${editBatch.id}`, editForm);
      toast.success('Receiving batch updated successfully!');
      setShowEditModal(false);
      setEditBatch(null);
      await fetchReceivingBatches();
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
        toast.error('Failed to update receiving batch');
      }
    } finally {
      setIsEditSubmitting(false);
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
              {/* Show sizes for selected product */}
              {productSizes.length > 0 && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Sizes for selected product: </span>
                  {productSizes.map((size, idx) => (
                    <span key={idx} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 mr-2 mb-1">{size}</span>
                  ))}
                </div>
              )}
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
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm text-gray-600 mb-1">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => {
                            updateLineItem(idx, 'productId', parseInt(e.target.value));
                            if (errors[`lineItems.${idx}.productId`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`lineItems.${idx}.productId`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${errors[`lineItems.${idx}.productId`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          disabled={isSubmitting}
                        >
                          <option value="">Select product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                        {errors[`lineItems.${idx}.productId`] && <p className="text-red-600 text-sm mt-1 font-medium">{errors[`lineItems.${idx}.productId`]}</p>}
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
                          {getAvailableCrateNumbersForCreate().concat(item.crateNumber).sort((a, b) => a - b).map(num => (
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
                          <option value="">Select size</option>
                          {productSizes.map((size, i) => (
                            <option key={i} value={size}>{size}</option>
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
                            updateLineItem(idx, 'kg', parseFloat(e.target.value) || '');
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

      {/* Edit Modal */}
      {showEditModal && editBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Receiving Batch</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { setShowEditModal(false); setEditBatch(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) => {
                        handleEditChange('date', e.target.value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.date && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Batch Number</label>
                    <input
                      type="text"
                      required
                      value={editForm.batchNumber}
                      onChange={(e) => {
                        handleEditChange('batchNumber', e.target.value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.batchNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.batchNumber && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.batchNumber}</p>}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3>Crate Line Items</h3>
                    <button
                      type="button"
                      onClick={addEditLineItem}
                      disabled={isEditSubmitting}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add Crate
                    </button>
                  </div>
                  {/* Show sizes for selected product in edit form */}
                  {productSizes.length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Sizes for selected product: </span>
                      {productSizes.map((size, idx) => (
                        <span key={idx} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 mr-2 mb-1">{size}</span>
                      ))}
                    </div>
                  )}
                  {editErrors.lineItems && <p className="text-red-600 text-sm mb-2 font-medium">{editErrors.lineItems}</p>}

                  {editForm.lineItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No crates added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {editForm.lineItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 flex flex-col">
                            <label className="block text-sm text-gray-600 mb-1">Boat Name</label>
                            <select
                              required
                              value={item.boatName}
                              onChange={(e) => {
                                handleEditLineItemChange(idx, 'boatName', e.target.value);
                                // Clear offload date when boat changes
                                const updated = [...editForm.lineItems];
                                updated[idx] = { ...updated[idx], boatName: e.target.value, offloadDate: '' };
                                setEditForm((prev: any) => ({ ...prev, lineItems: updated }));
                              }}
                              className={`w-full px-3 py-2 border rounded-lg ${editErrors[`lineItems.${idx}.boatName`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                              disabled={isEditSubmitting}
                            >
                              <option value="">Select boat</option>
                              {availableBoats.map(boat => (
                                <option key={boat} value={boat}>{boat}</option>
                              ))}
                            </select>
                            {editErrors[`lineItems.${idx}.boatName`] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[`lineItems.${idx}.boatName`]}</p>}
                          </div>
                          <div className="flex-1 flex flex-col">
                            <label className="block text-sm text-gray-600 mb-1">Offload Date</label>
                            <select
                              required
                              value={item.offloadDate}
                              onChange={(e) => {
                                handleEditLineItemChange(idx, 'offloadDate', e.target.value);
                              }}
                              className={`w-full px-3 py-2 border rounded-lg ${editErrors[`lineItems.${idx}.offloadDate`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                              disabled={isEditSubmitting || !item.boatName}
                            >
                              <option value="">Select date</option>
                              {offloadRecords
                                .filter(r => r.boatName === item.boatName)
                                .map(r => {
                                  const dateOnly = r.offloadDate.split('T')[0];
                                  return (
                                    <option key={r.id} value={dateOnly}>
                                      {formatDate(r.offloadDate)} - Trip #{r.tripNumber}
                                    </option>
                                  );
                                })}
                            </select>
                            {editErrors[`lineItems.${idx}.offloadDate`] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[`lineItems.${idx}.offloadDate`]}</p>}
                          </div>
                          <div className="flex-1 flex flex-col">
                            <label className="block text-sm text-gray-600 mb-1">Product</label>
                            <select
                              required
                              value={item.productId}
                              onChange={(e) => {
                                handleEditLineItemChange(idx, 'productId', parseInt(e.target.value));
                              }}
                              className={`w-full px-3 py-2 border rounded-lg ${editErrors[`lineItems.${idx}.productId`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                              disabled={isEditSubmitting}
                            >
                              <option value="">Select product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                              ))}
                            </select>
                            {editErrors[`lineItems.${idx}.productId`] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[`lineItems.${idx}.productId`]}</p>}
                          </div>
                          <div className="w-32 flex flex-col">
                            <label className="block text-sm text-gray-600 mb-1">Crate #</label>
                            <select
                              required
                              value={item.crateNumber}
                              onChange={(e) => {
                                handleEditLineItemChange(idx, 'crateNumber', parseInt(e.target.value));
                              }}
                              className={`w-full px-3 py-2 border rounded-lg ${editErrors[`lineItems.${idx}.crateNumber`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                              disabled={isEditSubmitting}
                            >
                              {getAvailableCrateNumbers().concat(item.crateNumber).sort((a, b) => a - b).map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                            {editErrors[`lineItems.${idx}.crateNumber`] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[`lineItems.${idx}.crateNumber`]}</p>}
                          </div>
                          <div className="w-24 flex flex-col">
                            <label className="block text-sm text-gray-600 mb-1">Size</label>
                            <select
                              required
                              value={item.size}
                              onChange={(e) => {
                                handleEditLineItemChange(idx, 'size', e.target.value as SizeCategory);
                              }}
                              className={`w-full px-3 py-2 border rounded-lg ${editErrors[`lineItems.${idx}.size`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                              disabled={isEditSubmitting}
                            >
                              <option value="">Select size</option>
                              {productSizes.map((size, i) => (
                                <option key={i} value={size}>{size}</option>
                              ))}
                            </select>
                            {editErrors[`lineItems.${idx}.size`] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[`lineItems.${idx}.size`]}</p>}
                          </div>
                          <div className="w-32 flex flex-col">
                            <label className="block text-sm text-gray-600 mb-1">Kg</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={item.kg}
                              onChange={(e) => {
                                handleEditLineItemChange(idx, 'kg', parseFloat(e.target.value) || '');
                              }}
                              className={`w-full px-3 py-2 border rounded-lg ${editErrors[`lineItems.${idx}.kg`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                              disabled={isEditSubmitting}
                            />
                            {editErrors[`lineItems.${idx}.kg`] && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors[`lineItems.${idx}.kg`]}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEditLineItem(idx)}
                            disabled={isEditSubmitting}
                            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isEditSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.lineItems.length === 0 || isEditSubmitting}
                  onClick={handleEditSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isEditSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update Batch'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center group">
            
            <input
              type="text"
              placeholder="Search by batch number, boat name, or date..."
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
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
              <th className="px-4 py-3 text-left text-sm text-gray-600">Products</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Crates</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Created By</th>
              <th className="px-4 py-3 text-center text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading batches...
                  </div>
                </td>
              </tr>
            ) : receivingBatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No receiving batches yet. Click "New Receiving Batch" to create one.
                </td>
              </tr>
            ) : (
              receivingBatches.map((batch: any, idx) => (
                <tr key={batch.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{formatDate(batch.date)}</td>
                  <td className="px-4 py-3">{batch.batchNumber}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      // Get unique product IDs from the batch's crates/line items
                      const productIds = batch.crates 
                        ? [...new Set(batch.crates.map((crate: any) => crate.productId).filter(Boolean))]
                        : [];
                      // Get product names
                      const productNames = productIds
                        .map(id => products.find(p => p.id === id)?.name)
                        .filter(Boolean)
                        .join(', ');
                      return productNames || '-';
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {batch.crates_count || (batch.crates ? batch.crates.length : 0)}
                  </td>
                  <td className="px-4 py-3">{batch.user?.name || batch.createdBy || '-'}</td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                    <button
                      title="Edit"
                      onClick={() => handleEditClick(batch)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Print"
                      onClick={() => handlePrintClick(batch)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Printer className="h-4 w-4 inline" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteBatch(batch.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
            Showing {receivingBatches.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
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
      {/* Print Modal */}
      {showPrintModal && printBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col print-modal-content">
            <style>{`
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
            `}</style>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b print-hide">
              <h2 className="text-lg font-semibold">Print Receiving Batch</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Print
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => { setShowPrintModal(false); setPrintBatch(null); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 print:p-0">
              {/* Print Title */}
              <div className="hidden print:block text-center mb-4">
                <h1 className="text-xl font-bold">Receiving Batch</h1>
              </div>

              {/* Batch Header */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Date:</strong> {formatDate(printBatch.date)}
                  </div>
                  <div>
                    <strong>Batch Number:</strong> {printBatch.batchNumber}
                  </div>
                  <div>
                    <strong>Created By:</strong> {printBatch.user?.name || printBatch.createdBy || '-'}
                  </div>
                  <div>
                    <strong>Crates:</strong> {printBatch.crates_count || (printBatch.crates ? printBatch.crates.length : 0)}
                  </div>
                </div>
              </div>

              {/* Crate Line Items */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Crate Line Items ({(printBatch.crates || printBatch.lineItems || []).length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1 text-left">Boat Name</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Offload Date</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Product</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Crate #</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Size</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(printBatch.crates || printBatch.lineItems || []).map((item: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-1">{item.boatName}</td>
                          <td className="border border-gray-300 px-2 py-1">{formatDate(item.offloadDate)}</td>
                          <td className="border border-gray-300 px-2 py-1">{products.find((p: any) => p.id === item.productId)?.name || '-'}</td>
                          <td className="border border-gray-300 px-2 py-1">{item.crateNumber}</td>
                          <td className="border border-gray-300 px-2 py-1">{item.size}</td>
                          <td className="border border-gray-300 px-2 py-1 text-right">{item.kg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
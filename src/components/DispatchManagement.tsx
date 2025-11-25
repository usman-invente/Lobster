import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Send, Plus, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Pencil, Check, Printer } from 'lucide-react';
import { toast } from 'sonner';

export function DispatchManagement() {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [tankStock, setTankStock] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [dispatchType, setDispatchType] = useState<'export' | 'regrade'>('export');
  const [clientAwb, setClientAwb] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Server-side table state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortColumn, setSortColumn] = useState('dispatchDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDispatch, setEditDispatch] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    dispatchDate: '',
    dispatchType: 'export' as 'export' | 'regrade',
    clientAwb: '',
    lineItems: [] as any[]
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSelectedItems, setEditSelectedItems] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDispatch, setPrintDispatch] = useState<any>(null);

  // Fetch dispatches with server-side features
  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/dispatches', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          sort_by: sortColumn,
          sort_direction: sortDirection,
        }
      });
      
      const data = response.data.data || [];
      const pagination = response.data.meta || { total: 0 };
      
      setDispatches(data);
      setTotalRecords(pagination.total || data.length);
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      toast.error('Failed to load dispatches', {
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tank stock
  const fetchTankStock = async () => {
    try {
      const response = await axios.get('/api/tank-stock');
      setTankStock(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tank stock:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDispatches();
  }, [currentPage, perPage, searchQuery, sortColumn, sortDirection]);

  // Load tank stock on mount
  useEffect(() => {
    fetchTankStock();
  }, []);

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

  const addItem = (
    tankId: string,
    tankNumber: number,
    crateId: string | undefined,
    looseStockId: string | undefined,
    size: string,
    maxKg: number,
    crateNumber?: number
  ) => {
    const item = {
      id: `dispatch-item-${Date.now()}-${Math.random()}`,
      tankId,
      tankNumber,
      crateId,
      looseStockId,
      size,
      kg: parseFloat(maxKg.toString()) || 0,
      crateNumber,
      isLoose: !crateId,
    };
    setSelectedItems([...selectedItems, item]);
    if (errors.lineItems) setErrors(prev => ({...prev, lineItems: ''}));
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
    if (errors.lineItems) setErrors(prev => ({...prev, lineItems: ''}));
  };

  const updateItemKg = (id: string, kg: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.id === id ? { ...item, kg: parseFloat(kg.toString()) || 0 } : item
    ));
  };

  // Helper function to check if a crate is already selected
  const isItemSelected = (crateId?: string, looseStockId?: string) => {
    return selectedItems.some(item => 
      (crateId && item.crateId === crateId) || 
      (looseStockId && item.looseStockId === looseStockId)
    );
  };

  // Helper function to check if an item is already selected in edit modal
  const isEditItemSelected = (crateId?: string, looseStockId?: string) => {
    const allItems = [...editForm.lineItems, ...editSelectedItems];
    return allItems.some(item => 
      (crateId && item.crateId === crateId) || 
      (looseStockId && item.looseStockId === looseStockId)
    );
  };

  // Edit modal item management
  const addEditItem = (
    tankId: string,
    tankNumber: number,
    crateId: string | undefined,
    looseStockId: string | undefined,
    size: string,
    maxKg: number,
    crateNumber?: number
  ) => {
    const item = {
      id: `edit-dispatch-item-${Date.now()}-${Math.random()}`,
      tankId,
      tankNumber,
      crateId,
      looseStockId,
      size,
      kg: parseFloat(maxKg.toString()) || 0,
      crateNumber,
      isLoose: !crateId,
    };
    setEditSelectedItems([...editSelectedItems, item]);
  };

  const removeEditItem = (id: string) => {
    setEditSelectedItems(editSelectedItems.filter(item => item.id !== id));
  };

  const calculateSummary = () => {
    const summary: Record<string, number> = { U: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
    selectedItems.forEach(item => {
      const kg = parseFloat(item.kg) || 0;
      summary[item.size] += kg;
    });
    return summary;
  };

  // Save new dispatch via API
  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const summary = calculateSummary();
      const totalKg = selectedItems.reduce((sum, item) => sum + (parseFloat(item.kg) || 0), 0);
      await axios.post('/api/dispatches', {
        type: dispatchType,
        clientAwb,
        dispatchDate,
        lineItems: selectedItems,
        totalKg,
        sizeU: summary.U,
        sizeA: summary.A,
        sizeB: summary.B,
        sizeC: summary.C,
        sizeD: summary.D,
        sizeE: summary.E,
      });
      setShowForm(false);
      setClientAwb('');
      setDispatchDate(new Date().toISOString().split('T')[0]);
      setSelectedItems([]);
      fetchDispatches();
      fetchTankStock(); // Refresh tank stock data after dispatching
      toast.success('Dispatch created successfully!');
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        });
        setErrors(formattedErrors);
        toast.error('Please fix the validation errors below.');
      } else {
        toast.error('Failed to create dispatch.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteDispatch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dispatch?')) return;
    try {
      await axios.delete(`/api/dispatches/${id}`);
      toast.success('Dispatch deleted successfully');
      fetchDispatches();
    } catch (err) {
      toast.error('Failed to delete dispatch');
    }
  };

  // Open edit modal and populate form
  const handleEditClick = async (dispatch: any) => {
    try {
      // Fetch the full dispatch details including lineItems
      const response = await axios.get(`/api/dispatches/${dispatch.id}`);
      const fullDispatch = response.data.data || response.data;
      
      setEditDispatch(fullDispatch);
      setEditForm({
        dispatchDate: fullDispatch.dispatchDate ? new Date(fullDispatch.dispatchDate).toISOString().split('T')[0] : '',
        dispatchType: fullDispatch.type,
        clientAwb: fullDispatch.clientAwb,
        lineItems: fullDispatch.line_items || []
      });
      setEditSelectedItems([]);
      setEditErrors({});
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching dispatch details:', error);
      toast.error('Failed to load dispatch details');
    }
  };

  // Handle print click
  const handlePrintClick = async (dispatch: any) => {
    try {
      // Fetch the full dispatch details including lineItems
      const response = await axios.get(`/api/dispatches/${dispatch.id}`);
      const fullDispatch = response.data.data || response.data;
      
      setPrintDispatch(fullDispatch);
      setShowPrintModal(true);
    } catch (error) {
      console.error('Error fetching dispatch details:', error);
      toast.error('Failed to load dispatch details for printing');
    }
  };

  // Handle edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDispatch) return;
    const allLineItems = [...editForm.lineItems, ...editSelectedItems];
    if (allLineItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    setIsEditSubmitting(true);
    setEditErrors({});
    try {
      const editData = {
        ...editForm,
        lineItems: allLineItems
      };
      await axios.put(`/api/dispatches/${editDispatch.id}`, editData);
      toast.success('Dispatch updated successfully!');
      setShowEditModal(false);
      setEditDispatch(null);
      fetchDispatches();
      fetchTankStock(); // Refresh tank stock data after dispatching
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
        toast.error('Failed to update dispatch');
      }
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="flex items-center gap-2">
          <Send className="w-6 h-6" />
          Dispatch Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Dispatch
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {showForm && (
            <div className="space-y-6 mb-6">
              {/* Dispatch Header */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="mb-4">Create Dispatch</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Type</label>
                    <select
                      value={dispatchType}
                      onChange={(e) => {
                        setDispatchType(e.target.value as 'export' | 'regrade');
                        if (errors.type) setErrors(prev => ({...prev, type: ''}));
                      }}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.type ? 'border-red-500' : ''}`}
                    >
                      <option value="export">Export</option>
                      <option value="regrade">Regrade</option>
                    </select>
                    {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Client / AWB</label>
                    <input
                      type="text"
                      required
                      value={clientAwb}
                      onChange={(e) => {
                        setClientAwb(e.target.value);
                        if (errors.clientAwb) setErrors(prev => ({...prev, clientAwb: ''}));
                      }}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.clientAwb ? 'border-red-500' : ''}`}
                    />
                    {errors.clientAwb && <p className="text-red-600 text-sm mt-1">{errors.clientAwb}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Dispatch Date</label>
                    <input
                      type="date"
                      required
                      value={dispatchDate}
                      onChange={(e) => {
                        setDispatchDate(e.target.value);
                        if (errors.dispatchDate) setErrors(prev => ({...prev, dispatchDate: ''}));
                      }}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.dispatchDate ? 'border-red-500' : ''}`}
                    />
                    {errors.dispatchDate && <p className="text-red-600 text-sm mt-1">{errors.dispatchDate}</p>}
                  </div>
                </div>
              </div>

              {/* Select Stock */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="mb-4">Select Stock to Dispatch</h3>
                {tankStock.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No stock available in tanks.</p>
                    <p className="text-sm mt-2">Please add stock through Recheck & Store process first.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {tankStock.map(tank => {
                      const hasStock = tank.crates.length > 0 || tank.looseStock.length > 0;
                      if (!hasStock) return null;

                      return (
                        <div key={tank.tankId} className="border rounded-lg p-4">
                          <h4 className="mb-3">{tank.tankName} ({Number(tank.summary.totalKg ?? 0).toFixed(2)} kg)</h4>
                          {/* Crates */}
                          {tank.crates.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">Crates:</p>
                              <div className="space-y-1">
                                {tank.crates.map(crate => {
                                  const selected = isItemSelected(crate.id);
                                  return (
                                    <div key={crate.id} className={`flex justify-between items-center p-2 rounded ${selected ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                      <div className="flex items-center gap-2">
                                        {selected && <Check className="w-4 h-4 text-green-600" />}
                                        <span className={`text-sm ${selected ? 'text-green-800' : ''}`}>
                                          Crate #{crate.crateNumber} - Size {crate.size} - {Number(crate.kg ?? 0).toFixed(2)} kg
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => addItem(tank.tankId, tank.tankNumber, crate.id, undefined, crate.size, crate.kg, crate.crateNumber)}
                                        disabled={selected}
                                        className={`px-3 py-1 rounded text-sm ${
                                          selected 
                                            ? 'bg-green-600 text-white cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                      >
                                        {selected ? 'Added' : 'Add'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {/* Loose Stock */}
                          {tank.looseStock.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Loose Stock:</p>
                              <div className="space-y-1">
                                {tank.looseStock.map(stock => {
                                  const selected = isItemSelected(undefined, stock.id);
                                  return (
                                    <div key={stock.id} className={`flex justify-between items-center p-2 rounded ${selected ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                      <div className="flex items-center gap-2">
                                        {selected && <Check className="w-4 h-4 text-green-600" />}
                                        <span className={`text-sm ${selected ? 'text-green-800' : ''}`}>
                                          Loose - Size {stock.size} - {Number(stock.kg ?? 0).toFixed(2)} kg
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => addItem(tank.tankId, tank.tankNumber, undefined, stock.id, stock.size, stock.kg)}
                                        disabled={selected}
                                        className={`px-3 py-1 rounded text-sm ${
                                          selected 
                                            ? 'bg-green-600 text-white cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                      >
                                        {selected ? 'Added' : 'Add'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Items */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="mb-4">Selected Items ({selectedItems.length})</h3>
                {errors.lineItems && <p className="text-red-600 text-sm mb-2">{errors.lineItems}</p>}
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">
                            Tank {item.tankNumber} - 
                            {item.isLoose ? ' Loose' : ` Crate #${item.crateNumber}`} - 
                            Size {item.size}
                          </p>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={item.kg}
                            onChange={(e) => updateItemKg(item.id, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {(() => {
                const summary = calculateSummary();
                const totalKg = selectedItems.reduce((sum, item) => sum + item.kg, 0);
                return (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="mb-4">Dispatch Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Total</p>
                        <p>{Number(totalKg).toFixed(2)} kg</p>
                      </div>
                      {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                        <div key={size} className="p-3 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Size {size}</p>
                          <p>{Number(summary[size]).toFixed(2)} kg</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedItems.length === 0 || !clientAwb.trim() || submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Dispatch ({selectedItems.length} items)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedItems([]);
                    setClientAwb('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative flex items-center group">
              
                <input
                  type="text"
                  placeholder="Search by type, client/AWB, or date..."
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

          {/* Dispatch History */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="p-4 border-b">Dispatch History</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dispatchDate')}
                    >
                      <div className="flex items-center gap-1">
                        Date {sortColumn === 'dispatchDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        Type {sortColumn === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('clientAwb')}
                    >
                      <div className="flex items-center gap-1">
                        Client/AWB {sortColumn === 'clientAwb' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalKg')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total Kg {sortColumn === 'totalKg' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Items</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading dispatches...
                        </div>
                      </td>
                    </tr>
                  ) : dispatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No dispatches yet. Click "New Dispatch" to create one.
                      </td>
                    </tr>
                  ) : (
                    dispatches.map((dispatch, idx) => (
                      <tr key={dispatch.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">{dispatch.dispatchDate ? new Date(dispatch.dispatchDate).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            dispatch.type === 'export' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {dispatch.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">{dispatch.clientAwb}</td>
                        <td className="px-4 py-3">{Number(dispatch.totalKg ?? 0).toFixed(2)}</td>
                        <td className="px-4 text-right py-3">{dispatch.line_items?.length || 0}</td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                          <button
                            title="Print"
                            onClick={() => handlePrintClick(dispatch)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleEditClick(dispatch)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDeleteDispatch(dispatch.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
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
                Showing {dispatches.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
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
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && editDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Dispatch</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { setShowEditModal(false); setEditDispatch(null); }}
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
                      value={editForm.dispatchDate}
                      onChange={(e) => handleEditChange('dispatchDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.dispatchDate ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    />
                    {editErrors.dispatchDate && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.dispatchDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Type</label>
                    <select
                      required
                      value={editForm.dispatchType}
                      onChange={(e) => handleEditChange('dispatchType', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${editErrors.dispatchType ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isEditSubmitting}
                    >
                      <option value="export">Export</option>
                      <option value="regrade">Regrade</option>
                    </select>
                    {editErrors.dispatchType && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.dispatchType}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Client/AWB</label>
                  <input
                    type="text"
                    required
                    value={editForm.clientAwb}
                    onChange={(e) => handleEditChange('clientAwb', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${editErrors.clientAwb ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isEditSubmitting}
                  />
                  {editErrors.clientAwb && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.clientAwb}</p>}
                </div>
                <div className="border-t pt-4">
                  <h3 className="mb-3">Existing Items ({editForm.lineItems.length})</h3>
                  {editForm.lineItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No existing items</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editForm.lineItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            Tank {item.tankNumber} - Size {item.size} - {item.kg}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {editSelectedItems.length > 0 && (
                    <>
                      <h3 className="mb-3 mt-4">New Items ({editSelectedItems.length})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {editSelectedItems.map((item: any, idx: number) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                            <span className="text-sm">
                              Tank {item.tankNumber} - Size {item.size} - {item.kg}kg
                            </span>
                            <button
                              type="button"
                              onClick={() => removeEditItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="border-t pt-4">
                  <h3 className="mb-3">Add More Crates</h3>
                  {tankStock.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No stock available in tanks.</p>
                      <p className="text-sm mt-2">Please add stock through Recheck & Store process first.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {tankStock.map(tank => {
                        const hasStock = tank.crates.length > 0 || tank.looseStock.length > 0;
                        if (!hasStock) return null;

                        return (
                          <div key={tank.tankId} className="border rounded-lg p-4">
                            <h4 className="mb-3">{tank.tankName} ({Number(tank.summary.totalKg ?? 0).toFixed(2)} kg)</h4>
                            {/* Crates */}
                            {tank.crates.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-2">Crates:</p>
                                <div className="space-y-1">
                                  {tank.crates.map(crate => {
                                    const selected = isEditItemSelected(crate.id);
                                    return (
                                      <div key={crate.id} className={`flex justify-between items-center p-2 rounded ${selected ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                          {selected && <Check className="w-4 h-4 text-green-600" />}
                                          <span className={`text-sm ${selected ? 'text-green-800' : ''}`}>
                                            Crate #{crate.crateNumber} - Size {crate.size} - {Number(crate.kg ?? 0).toFixed(2)} kg
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => addEditItem(tank.tankId, tank.tankNumber, crate.id, undefined, crate.size, crate.kg, crate.crateNumber)}
                                          disabled={selected}
                                          className={`px-3 py-1 rounded text-sm ${
                                            selected 
                                              ? 'bg-green-600 text-white cursor-not-allowed' 
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                        >
                                          {selected ? 'Added' : 'Add'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Loose Stock */}
                            {tank.looseStock.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Loose Stock:</p>
                                <div className="space-y-1">
                                  {tank.looseStock.map(stock => {
                                    const selected = isEditItemSelected(undefined, stock.id);
                                    return (
                                      <div key={stock.id} className={`flex justify-between items-center p-2 rounded ${selected ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                          {selected && <Check className="w-4 h-4 text-green-600" />}
                                          <span className={`text-sm ${selected ? 'text-green-800' : ''}`}>
                                            Loose - Size {stock.size} - {Number(stock.kg ?? 0).toFixed(2)} kg
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => addEditItem(tank.tankId, tank.tankNumber, undefined, stock.id, stock.size, stock.kg)}
                                          disabled={selected}
                                          className={`px-3 py-1 rounded text-sm ${
                                            selected 
                                              ? 'bg-green-600 text-white cursor-not-allowed' 
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                        >
                                          {selected ? 'Added' : 'Add'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                    'Update Dispatch'
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
      {showPrintModal && printDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Dispatch Report</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => { setShowPrintModal(false); setPrintDispatch(null); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Printable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Dispatch Header */}
                <div className="border-b pb-3">
                  <h1 className="text-xl font-bold mb-2">Dispatch Report</h1>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><strong>Date:</strong> {printDispatch.dispatchDate ? new Date(printDispatch.dispatchDate).toLocaleDateString() : ''}</div>
                    <div><strong>Type:</strong> {printDispatch.type}</div>
                    <div><strong>Client/AWB:</strong> {printDispatch.clientAwb}</div>
                    <div><strong>Total Weight:</strong> {Number(printDispatch.totalKg ?? 0).toFixed(2)} kg</div>
                  </div>
                </div>

                {/* Size Breakdown */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Size Breakdown</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded"><span className="text-gray-600">U:</span> {Number(printDispatch.sizeU ?? 0).toFixed(2)} kg</div>
                    <div className="bg-green-50 p-2 rounded"><span className="text-gray-600">A:</span> {Number(printDispatch.sizeA ?? 0).toFixed(2)} kg</div>
                    <div className="bg-yellow-50 p-2 rounded"><span className="text-gray-600">B:</span> {Number(printDispatch.sizeB ?? 0).toFixed(2)} kg</div>
                    <div className="bg-purple-50 p-2 rounded"><span className="text-gray-600">C:</span> {Number(printDispatch.sizeC ?? 0).toFixed(2)} kg</div>
                    <div className="bg-pink-50 p-2 rounded"><span className="text-gray-600">D:</span> {Number(printDispatch.sizeD ?? 0).toFixed(2)} kg</div>
                    <div className="bg-indigo-50 p-2 rounded"><span className="text-gray-600">E:</span> {Number(printDispatch.sizeE ?? 0).toFixed(2)} kg</div>
                  </div>
                </div>

                {/* Items Summary */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Items ({printDispatch.lineItems?.length || 0})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-2 py-1 text-left">Tank</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Size</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Type</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printDispatch.line_items?.slice(0, 10).map((item: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-2 py-1">T{item.tankNumber}</td>
                            <td className="border border-gray-300 px-2 py-1">{item.size}</td>
                            <td className="border border-gray-300 px-2 py-1">
                              {item.isLoose ? 'Loose' : 'Crate'}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              {Number(item.kg ?? 0).toFixed(1)} kg
                            </td>
                          </tr>
                        ))}
                        {printDispatch.line_items?.length > 10 && (
                          <tr className="bg-gray-100">
                            <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center text-gray-600">
                              ... and {printDispatch.line_items.length - 10} more items
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-semibold">
                              {Number(printDispatch.totalKg ?? 0).toFixed(1)} kg
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-2 text-center text-xs text-gray-600">
                  <p>Generated {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
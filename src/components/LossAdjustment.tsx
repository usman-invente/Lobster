import React, { useState } from 'react';
import axios from '../lib/axios';
import { Loss as BaseLoss, SizeCategory } from '../types';
import { AlertTriangle, Plus, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// Extend Loss type to include reason and string id
type Loss = BaseLoss & { id: string; reason?: string };
  import { useSelector } from 'react-redux';
  import { RootState } from '../store';

  // ...existing code...

  export function LossAdjustment() {
  // Validation state for edit modal
  const [editFormErrors, setEditFormErrors] = useState<any>({});
  // Validation state for add form
  const [formErrors, setFormErrors] = useState<any>({});


    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoss, setEditLoss] = useState<any>(null);

    // Separate state for crates in edit modal
    const [editCrates, setEditCrates] = useState<any[]>([]);
    const [editCratesLoading, setEditCratesLoading] = useState(false);

    // Fetch crates for edit modal tank selection
    React.useEffect(() => {
      if (!editModalOpen || !editLoss?.tankId) {
        setEditCrates([]);
        return;
      }
      setEditCratesLoading(true);
      axios.get(`/api/tanks/${editLoss.tankId}/crates`)
        .then(res => setEditCrates(res.data.data || []))
        .catch(() => setEditCrates([]))
        .finally(() => setEditCratesLoading(false));
    }, [editModalOpen, editLoss?.tankId]);

    // Open edit modal
    const handleEditLoss = (loss: any) => {
      setEditLoss(loss);
      setEditModalOpen(true);
    };

    // Handle edit form change
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditLoss((prev: any) => ({ ...prev, [name]: value }));
    };

    // Submit edit
    const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editLoss) return;
      const errors: any = {};
      // Frontend validation matching Laravel rules (sometimes)
      if (editLoss.date && new Date(editLoss.date) > new Date()) errors.date = 'Date cannot be in the future.';
      if (editLoss.tankId && isNaN(Number(editLoss.tankId))) errors.tankId = 'Tank is required.';
      if (editLoss.type && !['dead','rotten','lost'].includes(editLoss.type)) errors.type = 'Invalid type.';
      if (editLoss.size && !['U','A','B','C','D','E','M'].includes(editLoss.size)) errors.size = 'Invalid size.';
      if (editLoss.kg && (isNaN(Number(editLoss.kg)) || Number(editLoss.kg) < 0.01)) errors.kg = 'Kg must be at least 0.01.';
      if (editLoss.kg && Number(editLoss.kg) > 9999.99) errors.kg = 'Kg must be less than 9999.99.';
      if (editLoss.reason && editLoss.reason.length > 500) errors.reason = 'Notes must be 500 characters or less.';
      if (editLoss.crateId && isNaN(Number(editLoss.crateId))) errors.crateId = 'Crate is required.';
      setEditFormErrors(errors);
      if (Object.keys(errors).length > 0) return;
      setIsLoading(true);
      try {
        await axios.put(`/api/loss-adjustments/${editLoss.id}`, editLoss);
        setLosses(prev => prev.map(l => l.id === editLoss.id ? { ...l, ...editLoss } : l));
        toast.success('Loss record updated.');
        setEditModalOpen(false);
        setEditLoss(null);
        setEditFormErrors({});
      } catch (err: any) {
        toast.error('Failed to update loss record.');
      } finally {
        setIsLoading(false);
      }
    };
  const [showForm, setShowForm] = useState(false);
  const [lossType, setLossType] = useState<'dead' | 'rotten' | 'lost'>('dead');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTank, setSelectedTank] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    crateId?: string;
    size: SizeCategory;
    maxKg: number;
    looseStockId?: string;
  } | null>(null);
  const [crates, setCrates] = useState<any[]>([]);
  const [cratesLoading, setCratesLoading] = useState(false);
  const [kg, setKg] = useState(0);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [losses, setLosses] = useState<Loss[]>([]);
  const [allTankStock, setAllTankStock] = useState<any[]>([]); // still used for tank list
  const currentUser = useSelector((state: RootState) => state.user.user);
  // Table features
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);



  const handleDeleteLoss = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this loss record?')) return;
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      await axios.delete(`/api/loss-adjustments/${id}`);
      setLosses(prev => prev.filter(l => l.id !== id));
      toast.success('Loss record deleted.');
    } catch (err: any) {
      toast.error('Failed to delete loss record.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search (local filtering for now)
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Sorting handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter, sort, and paginate losses
  const filteredLosses = losses.filter(loss => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (loss.date && loss.date.toLowerCase().includes(q)) ||
      (loss.type && loss.type.toLowerCase().includes(q)) ||
      (loss.size && loss.size.toLowerCase().includes(q)) ||
      (loss.reason && typeof loss.reason === 'string' && loss.reason.toLowerCase().includes(q)) ||
      (loss.createdBy && loss.createdBy.toLowerCase().includes(q))
    );
  });
  const sortedLosses = [...filteredLosses].sort((a, b) => {
    let aVal = a[sortColumn as keyof Loss];
    let bVal = b[sortColumn as keyof Loss];
    if (sortColumn === 'kg') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }
    if (aVal === undefined || bVal === undefined) return 0;
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  const totalRecords = sortedLosses.length;
  const totalPages = Math.ceil(totalRecords / perPage) || 1;
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, totalRecords);
  const pagedLosses = sortedLosses.slice((currentPage - 1) * perPage, currentPage * perPage);

  React.useEffect(() => {
    // Fetch losses and tanks on mount
    axios.get('/api/loss-adjustments').then(res => setLosses(res.data.data || []));
    axios.get('/api/tanks').then(res => setAllTankStock(res.data.data || []));
  }, []);


  // Fetch crates for selected tank
  React.useEffect(() => {
    if (!selectedTank) {
      setCrates([]);
      return;
    }
    setCratesLoading(true);
    axios.get(`/api/tanks/${selectedTank}/crates`)
      .then(res => setCrates(res.data.data || []))
      .catch(() => setCrates([]))
      .finally(() => setCratesLoading(false));
  }, [selectedTank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    // Frontend validation matching Laravel rules
    if (!date) errors.date = 'Date is required.';
    else if (new Date(date) > new Date()) errors.date = 'Date cannot be in the future.';
    if (!selectedTank) errors.tankId = 'Tank is required.';
    if (!lossType) errors.type = 'Type is required.';
    if (!selectedItem || !selectedItem.size) errors.size = 'Size is required.';
    else if (!['U','A','B','C','D','E'].includes(selectedItem.size)) errors.size = 'Invalid size.';
    if (!kg || isNaN(kg)) errors.kg = 'Kg is required.';
    else if (kg < 0.01) errors.kg = 'Kg must be at least 0.01.';
    else if (kg > 9999.99) errors.kg = 'Kg must be less than 9999.99.';
    if (reason && reason.length > 500) errors.reason = 'Notes must be 500 characters or less.';
    if (!selectedItem || !selectedItem.crateId) errors.crateId = 'Crate is required.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!currentUser || !selectedItem) return;
    setSubmitting(true);
    try {
      await axios.post('/api/loss-adjustments', {
        date,
        type: lossType,
        tankId: selectedTank,
        crateId: selectedItem.crateId, // ensure crateId is sent
        looseStockId: selectedItem.looseStockId,
        size: selectedItem.size,
        kg,
        reason,
        createdBy: currentUser.id,
      });
      setShowForm(false);
      setSelectedTank('');
      setSelectedItem(null);
      setKg(0);
      setReason('');
      setFormErrors({});
      // Refresh losses if needed
    } catch (err: any) {
      // Try to extract server message and error
      const message = err?.response?.data?.message;
      const errorDetail = err?.response?.data?.error;
      toast.info(message || 'Failed to save loss adjustment.', {
        description: errorDetail,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Edit Modal */}
      {editModalOpen && editLoss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => { setEditModalOpen(false); setEditLoss(null); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Loss Record</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={editLoss.date ? editLoss.date.substring(0, 10) : ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                {editFormErrors.date && <div className="text-red-600 text-xs mt-1">{editFormErrors.date}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tank</label>
                <select
                  name="tankId"
                  value={editLoss.tankId || ''}
                  onChange={e => {
                    handleEditChange(e);
                    setEditLoss((prev: any) => ({ ...prev, crateId: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select tank</option>
                  {allTankStock.map((tank: any) => (
                    <option key={tank.id} value={tank.id}>{tank.tankName}</option>
                  ))}
                </select>
                {editFormErrors.tankId && <div className="text-red-600 text-xs mt-1">{editFormErrors.tankId}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Crate</label>
                <select
                  name="crateId"
                  value={editLoss.crateId || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={editCratesLoading}
                >
                  <option value="">{editCratesLoading ? 'Loading crates...' : 'Select crate'}</option>
                  {editCrates.map((crate: any) => (
                    <option key={crate.id} value={crate.id}>
                      Crate #{crate.crateNumber} - Size {crate.size} ({crate.kg} kg)
                    </option>
                  ))}
                </select>
                {editFormErrors.crateId && <div className="text-red-600 text-xs mt-1">{editFormErrors.crateId}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  name="type"
                  value={editLoss.type}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="dead">Dead</option>
                  <option value="rotten">Rotten</option>
                  <option value="lost">Lost</option>
                </select>
                {editFormErrors.type && <div className="text-red-600 text-xs mt-1">{editFormErrors.type}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Size</label>
                <input
                  type="text"
                  name="size"
                  value={editLoss.size}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                {editFormErrors.size && <div className="text-red-600 text-xs mt-1">{editFormErrors.size}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Kg</label>
                <input
                  type="number"
                  name="kg"
                  step="0.01"
                  value={editLoss.kg}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                {editFormErrors.kg && <div className="text-red-600 text-xs mt-1">{editFormErrors.kg}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea
                  name="reason"
                  value={editLoss.reason || ''}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {editFormErrors.reason && <div className="text-red-600 text-xs mt-1">{editFormErrors.reason}</div>}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditModalOpen(false); setEditLoss(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Loss Adjustments
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Record Loss
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="mb-4">Record Loss</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {formErrors.date && <div className="text-red-600 text-xs mt-1">{formErrors.date}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Loss Type</label>
                <select
                  value={lossType}
                  onChange={(e) => setLossType(e.target.value as 'dead' | 'rotten' | 'lost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="dead">Dead</option>
                  <option value="rotten">Rotten</option>
                  <option value="lost">Lost</option>
                </select>
                {formErrors.type && <div className="text-red-600 text-xs mt-1">{formErrors.type}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tank</label>
                <select
                  required
                  value={selectedTank}
                  onChange={(e) => {
                    setSelectedTank(e.target.value);
                    setSelectedItem(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select tank</option>
                  {allTankStock.map(tank => (
                    <option key={tank.id} value={tank.id}>
                      {tank.tankName}
                    </option>
                  ))}
                </select>
                {formErrors.tankId && <div className="text-red-600 text-xs mt-1">{formErrors.tankId}</div>}
              </div>
            </div>

            {selectedTank && (
              <div className="border-t pt-4">
                <h3 className="mb-3">Select Crate</h3>
                {cratesLoading ? (
                  <div className="text-gray-500">Loading crates...</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {crates.length === 0 ? (
                      <div className="text-gray-500">No crates found for this tank.</div>
                    ) : (
                      crates.map((crate: any) => (
                        <div
                          key={crate.id}
                          onClick={() => setSelectedItem({
                            crateId: crate.id,
                            size: crate.size,
                            maxKg: crate.kg,
                          })}
                          className={`p-3 border rounded-lg cursor-pointer ${selectedItem?.crateId === crate.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300'
                            }`}
                        >
                          <div className="flex justify-between">
                            <span>Crate #{crate.crateNumber} - Size {crate.size}</span>
                            <span>{crate.kg?.toFixed ? crate.kg.toFixed(2) : crate.kg} kg</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {formErrors.crateId && <div className="text-red-600 text-xs mt-1">{formErrors.crateId}</div>}
              </div>
            )}

            {selectedItem !== null && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Loss Amount (kg) - Max: {typeof selectedItem.maxKg === 'number' && !isNaN(selectedItem.maxKg) ? selectedItem.maxKg.toFixed(2) : selectedItem.maxKg}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      max={selectedItem.maxKg}
                      value={kg}
                      onChange={(e) => setKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {formErrors.kg && <div className="text-red-600 text-xs mt-1">{formErrors.kg}</div>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Size</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.size}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    {formErrors.size && <div className="text-red-600 text-xs mt-1">{formErrors.size}</div>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {formErrors.reason && <div className="text-red-600 text-xs mt-1">{formErrors.reason}</div>}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedItem || kg <= 0 || submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Record Loss
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

      {/* Loss History - with search, sort, pagination, loading */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
        <h3 className="p-4 border-b">Loss History</h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-2">
          {/* <div className="relative w-full md:w-64">
            <span className="absolute left-3 top-2.5 text-gray-400"><Search className="w-4 h-4" /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search losses..."
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div> */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
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
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Type {sortColumn === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center gap-1">
                    Size {sortColumn === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('kg')}
                >
                  <div className="flex items-center gap-1">
                    Kg {sortColumn === 'kg' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Notes</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Recorded By</th>
                {/* <th className="px-4 py-3 text-center text-sm text-gray-600">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading losses...
                    </div>
                  </td>
                </tr>
              ) : pagedLosses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No losses recorded yet.
                  </td>
                </tr>
              ) : (
                pagedLosses.map((loss, idx) => (
                  <tr key={loss.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">{
                      loss.date && typeof loss.date === 'string'
                        ? (loss.date.length >= 10 ? loss.date.substring(0, 10) : loss.date)
                        : '-'
                    }</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${loss.type === 'dead' ? 'bg-red-100 text-red-800' :
                        loss.type === 'rotten' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                        {loss.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{loss.size}</td>
                    <td className="px-4 py-3">{
                      (typeof loss.kg === 'number' && isFinite(loss.kg))
                        ? loss.kg.toFixed(2)
                        : (typeof loss.kg === 'string' && !isNaN(Number(loss.kg)) && (loss.kg as string).trim() !== ''
                            ? Number(loss.kg).toFixed(2)
                            : '-')
                    }</td>
                    <td className="px-4 py-3">{loss.reason || '-'}</td>
                    <td className="px-4 py-3">{loss.createdBy}</td>
                    {/* <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                      <button
                        title="Edit"
                        onClick={() => handleEditLoss(loss)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDeleteLoss(loss.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-600">
            Showing {pagedLosses.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
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
    </div>
    </>
  );
}
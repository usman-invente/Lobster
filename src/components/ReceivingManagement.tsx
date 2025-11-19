import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ReceivingBatch, CrateLineItem, SizeCategory } from '../types';
import { Plus, Trash2, Package } from 'lucide-react';

export function ReceivingManagement() {
  const { currentUser, offloadRecords, receivingBatches, addReceivingBatch, getAvailableCrates } = useData();
  const [showForm, setShowForm] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<Array<{
    boatName: string;
    offloadDate: string;
    crateNumber: number;
    size: SizeCategory;
    kg: number;
  }>>([]);

  const availableCrates = getAvailableCrates();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || lineItems.length === 0) return;

    const batch: ReceivingBatch = {
      id: `batch-${Date.now()}`,
      date,
      batchNumber,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const crates: CrateLineItem[] = lineItems.map((item, idx) => ({
      id: `crate-${Date.now()}-${idx}`,
      receivingBatchId: batch.id,
      boatName: item.boatName,
      offloadDate: item.offloadDate,
      crateNumber: item.crateNumber,
      size: item.size,
      kg: item.kg,
      originalKg: item.kg,
      originalSize: item.size,
      status: 'received',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    }));

    addReceivingBatch(batch, crates);
    setShowForm(false);
    setBatchNumber('');
    setDate(new Date().toISOString().split('T')[0]);
    setLineItems([]);
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
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3>Crate Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Crate
                </button>
              </div>

              {lineItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No crates added yet</p>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Boat Name</label>
                        <select
                          required
                          value={item.boatName}
                          onChange={(e) => updateLineItem(idx, 'boatName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select boat</option>
                          {Array.from(new Set(offloadRecords.map(r => r.boatName))).map(boat => (
                            <option key={boat} value={boat}>{boat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Offload Date</label>
                        <select
                          required
                          value={item.offloadDate}
                          onChange={(e) => updateLineItem(idx, 'offloadDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select date</option>
                          {offloadRecords
                            .filter(r => !item.boatName || r.boatName === item.boatName)
                            .map(r => (
                              <option key={r.id} value={r.offloadDate}>{r.offloadDate}</option>
                            ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-sm text-gray-600 mb-1">Crate #</label>
                        <select
                          required
                          value={item.crateNumber}
                          onChange={(e) => updateLineItem(idx, 'crateNumber', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {availableCrates.map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-sm text-gray-600 mb-1">Size</label>
                        <select
                          required
                          value={item.size}
                          onChange={(e) => updateLineItem(idx, 'size', e.target.value as SizeCategory)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-sm text-gray-600 mb-1">Kg</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.kg}
                          onChange={(e) => updateLineItem(idx, 'kg', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                disabled={lineItems.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Create Receiving Batch
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
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Batch #</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Crates</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Created By</th>
            </tr>
          </thead>
          <tbody>
            {receivingBatches.map((batch, idx) => (
              <tr key={batch.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3">{batch.date}</td>
                <td className="px-4 py-3">{batch.batchNumber}</td>
                <td className="px-4 py-3 text-right">
                  {/* We would count crates here, but for simplicity showing batch info */}
                  -
                </td>
                <td className="px-4 py-3">{batch.createdBy}</td>
              </tr>
            ))}
            {receivingBatches.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No receiving batches yet. Click "New Receiving Batch" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
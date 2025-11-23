import React, { useState } from 'react';
import axios from '../lib/axios';
import { Loss, SizeCategory } from '../types';
import { AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
export function LossAdjustment() {
  const [showForm, setShowForm] = useState(false);
  const [lossType, setLossType] = useState<'dead' | 'rotten' | 'lost'>('dead');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTank, setSelectedTank] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    crateId?: string;
    size: SizeCategory;
    maxKg: number;
  } | null>(null);
  const [crates, setCrates] = useState<any[]>([]);
  const [cratesLoading, setCratesLoading] = useState(false);
  const [kg, setKg] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [losses, setLosses] = useState<Loss[]>([]);
  const [allTankStock, setAllTankStock] = useState<any[]>([]); // still used for tank list
  const currentUser = useSelector((state: RootState) => state.user.user);

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
  if (!currentUser || !selectedItem) return;
    setSubmitting(true);
    try {
      await axios.post('/api/loss-adjustments', {
        date,
        type: lossType,
        tankId: selectedTank,
        crateId: selectedItem.crateId,
        looseStockId: selectedItem.looseStockId,
        size: selectedItem.size,
        kg,
        notes,
  createdBy: currentUser.id,
      });
      setShowForm(false);
      setSelectedTank('');
      setSelectedItem(null);
      setKg(0);
      setNotes('');
      // Refresh losses if needed
    } catch (err: any) {
      // Try to extract server message and error
      const message = err?.response?.data?.message;
      const errorDetail = err?.response?.data?.error;
      toast.info(message || 'Failed to save loss adjustment.', {
        description: errorDetail,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
                    <option key={tank.tankId} value={tank.id}>
                      {tank.tankName}
                    </option>
                  ))}
                </select>
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
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Size</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.size}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
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

      {/* Loss History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="p-4 border-b">Loss History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Size</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600">Kg</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Notes</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {losses.map((loss, idx) => (
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
                  <td className="px-4 py-3 text-right">{
                    (typeof loss.kg === 'number' && isFinite(loss.kg))
                      ? loss.kg.toFixed(2)
            : (typeof loss.kg === 'string' && !isNaN(Number(loss.kg)) && (loss.kg as string).trim() !== ''
              ? Number(loss.kg).toFixed(2)
              : '-')
                  }</td>
                  <td className="px-4 py-3">{loss.notes || '-'}</td>
                  <td className="px-4 py-3">{loss.createdBy}</td>
                </tr>
              ))}
              {losses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No losses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
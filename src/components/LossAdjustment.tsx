import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Loss, SizeCategory } from '../types';
import { AlertTriangle, Plus } from 'lucide-react';

export function LossAdjustment() {
  const { currentUser, losses, getAllTankStock, addLoss } = useData();
  const [showForm, setShowForm] = useState(false);
  const [lossType, setLossType] = useState<'dead' | 'rotten' | 'lost'>('dead');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTank, setSelectedTank] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    crateId?: string;
    looseStockId?: string;
    size: SizeCategory;
    maxKg: number;
  } | null>(null);
  const [kg, setKg] = useState(0);
  const [notes, setNotes] = useState('');

  const allTankStock = getAllTankStock();
  const tankStock = selectedTank 
    ? allTankStock.find(t => t.tankId === selectedTank)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedItem) return;

    const loss: Loss = {
      id: `loss-${Date.now()}`,
      date,
      type: lossType,
      tankId: selectedTank,
      crateId: selectedItem.crateId,
      looseStockId: selectedItem.looseStockId,
      size: selectedItem.size,
      kg,
      notes,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    addLoss(loss);
    setShowForm(false);
    setSelectedTank('');
    setSelectedItem(null);
    setKg(0);
    setNotes('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
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
            <div className="grid grid-cols-3 gap-4">
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
                    <option key={tank.tankId} value={tank.tankId}>
                      {tank.tankName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {tankStock && (
              <div className="border-t pt-4">
                <h3 className="mb-3">Select Item</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {/* Crates */}
                  {tankStock.crates.map(crate => (
                    <div
                      key={crate.id}
                      onClick={() => setSelectedItem({
                        crateId: crate.id,
                        size: crate.size,
                        maxKg: crate.kg,
                      })}
                      className={`p-3 border rounded-lg cursor-pointer ${
                        selectedItem?.crateId === crate.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Crate #{crate.crateNumber} - Size {crate.size}</span>
                        <span>{crate.kg.toFixed(2)} kg</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loose Stock */}
                  {tankStock.looseStock.map(stock => (
                    <div
                      key={stock.id}
                      onClick={() => setSelectedItem({
                        looseStockId: stock.id,
                        size: stock.size,
                        maxKg: stock.kg,
                      })}
                      className={`p-3 border rounded-lg cursor-pointer ${
                        selectedItem?.looseStockId === stock.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Loose Stock - Size {stock.size}</span>
                        <span>{stock.kg.toFixed(2)} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Loss Amount (kg) - Max: {selectedItem.maxKg.toFixed(2)}
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
                disabled={!selectedItem || kg <= 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
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
                  <td className="px-4 py-3">{loss.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      loss.type === 'dead' ? 'bg-red-100 text-red-800' :
                      loss.type === 'rotten' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loss.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{loss.size}</td>
                  <td className="px-4 py-3 text-right">{loss.kg.toFixed(2)}</td>
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

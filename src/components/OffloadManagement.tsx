import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { OffloadRecord } from '../types';
import { Plus, FileText } from 'lucide-react';

export function OffloadManagement() {
  const { currentUser, offloadRecords, addOffloadRecord } = useData();
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const totalKgAlive = formData.sizeU + formData.sizeA + formData.sizeB + 
                         formData.sizeC + formData.sizeD + formData.sizeE;

    const record: OffloadRecord = {
      id: `offload-${Date.now()}`,
      ...formData,
      totalKgAlive,
      deadOnTanks: 0,
      rottenOnTanks: 0,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    addOffloadRecord(record);
    setShowForm(false);
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

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="mb-4">Create Offload Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Boat Name</label>
                <input
                  type="text"
                  required
                  value={formData.boatName}
                  onChange={(e) => setFormData({ ...formData, boatName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Offload Date</label>
                <input
                  type="date"
                  required
                  value={formData.offloadDate}
                  onChange={(e) => setFormData({ ...formData, offloadDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trip Number</label>
                <input
                  type="text"
                  required
                  value={formData.tripNumber}
                  onChange={(e) => setFormData({ ...formData, tripNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">External Factory</label>
                <input
                  type="text"
                  required
                  value={formData.externalFactory}
                  onChange={(e) => setFormData({ ...formData, externalFactory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
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
                    required
                    value={formData.totalKgOffloaded}
                    onChange={(e) => setFormData({ ...formData, totalKgOffloaded: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Received</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalKgReceived}
                    onChange={(e) => setFormData({ ...formData, totalKgReceived: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Dead</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalKgDead}
                    onChange={(e) => setFormData({ ...formData, totalKgDead: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Kg Rotten</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalKgRotten}
                    onChange={(e) => setFormData({ ...formData, totalKgRotten: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3">Live Lobster by Size</h3>
              <div className="grid grid-cols-6 gap-4">
                {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                  <div key={size}>
                    <label className="block text-sm text-gray-600 mb-1">Size {size} (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData[`size${size}`]}
                      onChange={(e) => setFormData({ ...formData, [`size${size}`]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Offload Record
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
              <th className="px-4 py-3 text-left text-sm text-gray-600">Boat</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Trip #</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Factory</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Offloaded</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Received</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Alive</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Dead</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600">Rotten</th>
            </tr>
          </thead>
          <tbody>
            {offloadRecords.map((record, idx) => (
              <tr key={record.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3">{record.boatName}</td>
                <td className="px-4 py-3">{record.offloadDate}</td>
                <td className="px-4 py-3">{record.tripNumber}</td>
                <td className="px-4 py-3">{record.externalFactory}</td>
                <td className="px-4 py-3 text-right">{record.totalKgOffloaded.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{record.totalKgReceived.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{record.totalKgAlive.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{record.totalKgDead.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{record.totalKgRotten.toFixed(2)}</td>
              </tr>
            ))}
            {offloadRecords.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No offload records yet. Click "New Offload" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

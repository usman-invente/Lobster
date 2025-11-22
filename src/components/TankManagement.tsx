import axios from '../lib/axios';
import { Database, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export function TankManagement() {
  const [tanks, setTanks] = useState<any[]>([]);
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTanks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/tanks');
        // Handle Laravel resource structure: { data: [...] }
        const tanksData = Array.isArray(response.data.data) ? response.data.data : response.data;
        setTanks(tanksData);
      } catch (err: any) {
        setError('Failed to load tanks');
      } finally {
        setLoading(false);
      }
    };
    fetchTanks();
  }, []);

  // Find selected tank from already-fetched tanks
  const selectedTank = selectedTankId
    ? Array.isArray(tanks) && tanks.find((t: any) => String(t.id) === String(selectedTankId))
    : null;

  return (
    <div className="p-4 md:p-6">
      <h1 className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6" />
        Tank Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="mb-4">Active Tanks</h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto min-h-[120px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-4">{error}</div>
            ) : Array.isArray(tanks) && tanks.length > 0 ? (
              tanks.map(tank => (
                <div
                  key={tank.id}
                  onClick={() => setSelectedTankId(tank.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTankId === tank.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p>{tank.tankName}</p>
                      {/* Add more tank info here if available from API */}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tanks found</p>
            )}
          </div>
        </div>
        {/* Tank Details */}
        <div className="lg:col-span-2">
          {selectedTankId && selectedTank ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h2 className="text-lg font-semibold mb-4">{selectedTank.tankName || selectedTank.name} - Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Total Weight</span>
                    <span className="text-2xl font-bold">{selectedTank.totalWeight?.toFixed ? selectedTank.totalWeight.toFixed(2) : (selectedTank.totalWeight ?? '0.00')} kg</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Crates</span>
                    <span className="text-2xl font-bold">{selectedTank.crates_count ?? 0}</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Loose Stock Items</span>
                    <span className="text-2xl font-bold">{selectedTank.loose_count ?? 0}</span>
                  </div>
                </div>
                {/* Per-size weights (example, adjust as needed) */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {['U','A','B','C','D','E'].map(size => (
                    <div key={size} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-500">Size {size}</span>
                      <span className="font-semibold">{selectedTank[`size${size}_kg`] ?? '0.00'} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crates Table */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h3 className="mb-3 flex items-center gap-2"><span role="img" aria-label="crate">📦</span> Crates in Tank</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Crate #</th>
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Boat</th>
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Offload Date</th>
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Size</th>
                      <th className="px-4 py-2 text-right text-sm text-gray-600">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedTank.crates) && selectedTank.crates.length > 0 ? (
                      selectedTank.crates.map((crate: any) => (
                        <tr key={crate.id}>
                          <td className="px-4 py-2">{crate.crateNumber}</td>
                          <td className="px-4 py-2">{crate.boat}</td>
                          <td className="px-4 py-2">{crate.offloadDate}</td>
                          <td className="px-4 py-2">{crate.size}</td>
                          <td className="px-4 py-2 text-right">{crate.kg?.toFixed ? crate.kg.toFixed(2) : crate.kg}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-4">No crates in this tank.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Loose Stock Table */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="mb-3 flex items-center gap-2"><span role="img" aria-label="loose">💧</span> Loose Stock in Tank</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Size</th>
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Boat</th>
                      <th className="px-4 py-2 text-left text-sm text-gray-600">Offload Date</th>
                      <th className="px-4 py-2 text-right text-sm text-gray-600">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedTank.looseStock) && selectedTank.looseStock.length > 0 ? (
                      selectedTank.looseStock.map((stock: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{stock.size}</td>
                          <td className="px-4 py-2">{stock.boat}</td>
                          <td className="px-4 py-2">{stock.offloadDate}</td>
                          <td className="px-4 py-2 text-right">{stock.kg?.toFixed ? stock.kg.toFixed(2) : stock.kg}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="text-center text-gray-500 py-4">No loose stock in this tank.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-96">
              <p className="text-gray-500">Select a tank to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
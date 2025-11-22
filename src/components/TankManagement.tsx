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
        <div className="lg:col-span-2 space-y-6">
          {selectedTankId ? (
            <div className="bg-white p-6 rounded-lg shadow-md min-h-[200px]">
              {selectedTank ? (
                <div>
                  <h2 className="text-xl mb-2">{selectedTank.tankName || selectedTank.name}</h2>
                  <p className="mb-1 text-gray-700">Tank Number: {selectedTank.tankNumber}</p>
                  <p className="mb-1 text-gray-700">Status: {selectedTank.status === 1 ? 'Active' : 'Inactive'}</p>
                  <p className="mb-1 text-gray-700">Created: {selectedTank.created_at ? new Date(selectedTank.created_at).toLocaleDateString() : '-'}</p>
                  <p className="mb-1 text-gray-700">Updated: {selectedTank.updated_at ? new Date(selectedTank.updated_at).toLocaleDateString() : '-'}</p>
                  <p className="mb-1 text-gray-700">Creates: {typeof selectedTank.crates_count === 'number' ? selectedTank.crates_count : (selectedTank.crates_count ?? 'N/A')}</p>
                  {/* Add more tank details here as needed */}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">No details found for this tank.</div>
              )}
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
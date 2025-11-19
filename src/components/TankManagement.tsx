import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Database, Package, Droplet } from 'lucide-react';
import { SizeCategory } from '../types';

export function TankManagement() {
  const { tanks, getAllTankStock } = useData();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const allTankStock = getAllTankStock();

  const selectedTankStock = selectedTankId 
    ? allTankStock.find(t => t.tankId === selectedTankId)
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
          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {allTankStock.map(tank => (
              <div
                key={tank.tankId}
                onClick={() => setSelectedTankId(tank.tankId)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTankId === tank.tankId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p>{tank.tankName}</p>
                    <p className="text-sm text-gray-600">
                      {tank.crates.length} crates + {tank.looseStock.length} loose
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{tank.summary.totalKg.toFixed(2)} kg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tank Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTankStock ? (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="mb-4">{selectedTankStock.tankName} - Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <p className="text-2xl">{selectedTankStock.summary.totalKg.toFixed(2)} kg</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Crates</p>
                    <p className="text-2xl">{selectedTankStock.crates.length}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Loose Stock Items</p>
                    <p className="text-2xl">{selectedTankStock.looseStock.length}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                    <div key={size} className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-sm text-gray-600">Size {size}</p>
                      <p>{selectedTankStock.summary[`size${size}`].toFixed(2)} kg</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crates in Tank */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5" />
                  Crates in Tank
                </h3>
                {selectedTankStock.crates.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No crates in this tank</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Crate #</th>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Boat</th>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Offload Date</th>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Size</th>
                          <th className="px-4 py-2 text-right text-sm text-gray-600">Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTankStock.crates.map((crate, idx) => (
                          <tr key={crate.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2">{crate.crateNumber}</td>
                            <td className="px-4 py-2">{crate.boatName}</td>
                            <td className="px-4 py-2">{crate.offloadDate}</td>
                            <td className="px-4 py-2">{crate.size}</td>
                            <td className="px-4 py-2 text-right">{crate.kg.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Loose Stock in Tank */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="flex items-center gap-2 mb-4">
                  <Droplet className="w-5 h-5" />
                  Loose Stock in Tank
                </h3>
                {selectedTankStock.looseStock.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No loose stock in this tank</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Size</th>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Boat</th>
                          <th className="px-4 py-2 text-left text-sm text-gray-600">Offload Date</th>
                          <th className="px-4 py-2 text-right text-sm text-gray-600">Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTankStock.looseStock.map((stock, idx) => (
                          <tr key={stock.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2">{stock.size}</td>
                            <td className="px-4 py-2">{stock.boatName || '-'}</td>
                            <td className="px-4 py-2">{stock.offloadDate || '-'}</td>
                            <td className="px-4 py-2 text-right">{stock.kg.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
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
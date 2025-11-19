import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CrateLineItem, LooseStock, SizeCategory } from '../types';
import { CheckCircle, Package } from 'lucide-react';

export function RecheckProcess() {
  const { currentUser, crates, tanks, updateCrate, addLooseStock } = useData();
  const [selectedCrate, setSelectedCrate] = useState<CrateLineItem | null>(null);
  const [storageType, setStorageType] = useState<'crate' | 'loose'>('crate');
  const [selectedTank, setSelectedTank] = useState('');
  const [editedKg, setEditedKg] = useState(0);
  const [editedSize, setEditedSize] = useState<SizeCategory>('A');

  const receivedCrates = crates.filter(c => c.status === 'received' || c.status === 'rechecked');

  const handleSelectCrate = (crate: CrateLineItem) => {
    setSelectedCrate(crate);
    setEditedKg(crate.kg);
    setEditedSize(crate.size);
    setSelectedTank('');
  };

  const handleRecheck = () => {
    if (!selectedCrate || !currentUser) return;

    const updated: CrateLineItem = {
      ...selectedCrate,
      kg: editedKg,
      size: editedSize,
      status: 'rechecked',
      modifiedBy: currentUser.id,
      modifiedAt: new Date().toISOString(),
    };

    updateCrate(updated);
    setSelectedCrate(updated);
  };

  const handleStore = () => {
    if (!selectedCrate || !selectedTank || !currentUser) return;

    if (storageType === 'crate') {
      // Store as crate in tank
      const updated: CrateLineItem = {
        ...selectedCrate,
        tankId: selectedTank,
        status: 'stored',
        modifiedBy: currentUser.id,
        modifiedAt: new Date().toISOString(),
      };
      updateCrate(updated);
    } else {
      // Empty crate into loose stock
      const looseStock: LooseStock = {
        id: `loose-${Date.now()}`,
        tankId: selectedTank,
        size: selectedCrate.size,
        kg: selectedCrate.kg,
        fromCrateId: selectedCrate.id,
        boatName: selectedCrate.boatName,
        offloadDate: selectedCrate.offloadDate,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      addLooseStock(looseStock);

      // Mark crate as emptied
      const updated: CrateLineItem = {
        ...selectedCrate,
        tankId: selectedTank,
        status: 'emptied',
        modifiedBy: currentUser.id,
        modifiedAt: new Date().toISOString(),
      };
      updateCrate(updated);
    }

    setSelectedCrate(null);
    setSelectedTank('');
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="flex items-center gap-2 mb-6">
        <CheckCircle className="w-6 h-6" />
        Recheck & Store Crates
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Crates List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="mb-4">Received Crates</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {receivedCrates.map(crate => (
              <div
                key={crate.id}
                onClick={() => handleSelectCrate(crate)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCrate?.id === crate.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Crate #{crate.crateNumber}</span>
                      {crate.status === 'rechecked' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Rechecked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {crate.boatName} - {crate.offloadDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>Size {crate.size}</p>
                    <p className="text-sm text-gray-600">{crate.kg.toFixed(2)} kg</p>
                  </div>
                </div>
              </div>
            ))}
            {receivedCrates.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No crates to recheck. Create a receiving batch first.
              </p>
            )}
          </div>
        </div>

        {/* Recheck & Store Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {selectedCrate ? (
            <div className="space-y-4">
              <h2>Crate #{selectedCrate.crateNumber}</h2>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Original Data</p>
                <p>Boat: {selectedCrate.boatName}</p>
                <p>Offload Date: {selectedCrate.offloadDate}</p>
                <p>Original Size: {selectedCrate.originalSize}</p>
                <p>Original Weight: {selectedCrate.originalKg.toFixed(2)} kg</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3">Recheck Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Size</label>
                    <select
                      value={editedSize}
                      onChange={(e) => setEditedSize(e.target.value as SizeCategory)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedKg}
                      onChange={(e) => setEditedKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleRecheck}
                  className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Update Recheck Data
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3">Storage</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Storage Type</label>
                    <select
                      value={storageType}
                      onChange={(e) => setStorageType(e.target.value as 'crate' | 'loose')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="crate">Store as Crate</option>
                      <option value="loose">Empty into Loose Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tank</label>
                    <select
                      value={selectedTank}
                      onChange={(e) => setSelectedTank(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select tank</option>
                      {tanks.filter(t => t.active).map(tank => (
                        <option key={tank.id} value={tank.id}>
                          {tank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleStore}
                    disabled={!selectedTank}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {storageType === 'crate' ? 'Store Crate in Tank' : 'Empty into Tank'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a crate to recheck and store
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
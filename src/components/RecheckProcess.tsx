import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { CrateLineItem, LooseStock, SizeCategory } from '../types';
import { CheckCircle, Package, Loader2 } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'sonner';

export function RecheckProcess() {
  const { currentUser } = useData();
  const [selectedCrate, setSelectedCrate] = useState<CrateLineItem | null>(null);
  const [storageType, setStorageType] = useState<'crate' | 'loose'>('crate');
  const [selectedTank, setSelectedTank] = useState('');
  const [editedKg, setEditedKg] = useState(0);
  const [editedSize, setEditedSize] = useState<SizeCategory>('A');
  const [receivedCrates, setReceivedCrates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStoring, setIsStoring] = useState(false);
  const [tanks, setTanks] = useState<any[]>([]);

  // Fetch tanks from API
  const fetchTanks = async () => {
    try {
      const response = await axios.get('/api/tanks');
      setTanks(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching tanks:', error);
      toast.error('Failed to load tanks');
    }
  };

  // Fetch received crates from API
  const fetchReceivedCrates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/crates', {
        params: {
          status: 'received,rechecked', // Fetch crates with received or rechecked status
          per_page: 1000
        }
      });
      
      const crates = response.data.data || [];
      setReceivedCrates(crates);
    } catch (error) {
      console.error('Error fetching received crates:', error);
      toast.error('Failed to load received crates', {
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load tanks and crates on component mount
  useEffect(() => {
    fetchTanks();
    fetchReceivedCrates();
  }, []);

  const handleSelectCrate = (crate: CrateLineItem) => {
    setSelectedCrate(crate);
    setEditedKg(crate.kg);
    setEditedSize(crate.size);
    setSelectedTank('');
  };

  const handleRecheck = async () => {
    if (!selectedCrate || !currentUser) return;

    try {
      const response = await axios.put(`/api/crates/${selectedCrate.id}`, {
        kg: editedKg,
        size: editedSize,
        status: 'rechecked',
      });

      const updated = response.data;
      setSelectedCrate(updated);
      
      // Refresh the crates list
      await fetchReceivedCrates();
      
      toast.success('Crate rechecked successfully!', {
        description: `Crate #${selectedCrate.crateNumber} has been updated.`,
      });
    } catch (error) {
      console.error('Error rechecking crate:', error);
      toast.error('Failed to recheck crate', {
        description: 'Please try again.',
      });
    }
  };

  const handleStore = async () => {
    if (!selectedCrate || !selectedTank || !currentUser) return;

    setErrors({}); // Clear previous errors
    setIsStoring(true);
    try {
      if (storageType === 'crate') {
        // Store as crate in tank
        await axios.put(`/api/crates/${selectedCrate.id}`, {
          tankId: selectedTank,
          status: 'stored',
        });
        toast.success('Crate stored successfully!', {
          description: `Crate #${selectedCrate.crateNumber} has been stored in the tank.`,
        });
      } else {
        // Empty crate into loose stock
        await axios.post('/api/loose-stock', {
          tankId: selectedTank,
          size: selectedCrate.size,
          kg: selectedCrate.kg,
          fromCrateId: selectedCrate.id,
          boatName: selectedCrate.boatName,
          offloadDate: selectedCrate.offloadDate,
        });
        // Mark crate as emptied
        await axios.put(`/api/crates/${selectedCrate.id}`, {
          tankId: selectedTank,
          status: 'emptied',
        });
        toast.success('Crate emptied successfully!', {
          description: `Crate #${selectedCrate.crateNumber} has been emptied into loose stock.`,
        });
      }
      // Refresh the crates list
      await fetchReceivedCrates();
      setSelectedCrate(null);
      setSelectedTank('');
    } catch (error: any) {
      console.error('Error storing crate:', error);
      // Check if it's a Laravel validation error (422 status)
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        // Laravel returns arrays of error messages, take the first one for each field
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key]) 
            ? validationErrors[key][0] 
            : validationErrors[key];
        });
        setErrors(formattedErrors);
      } else {
        toast.error('Failed to store crate', {
          description: 'Please try again.',
        });
      }
    } finally {
      setIsStoring(false);
    }
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading crates...</span>
              </div>
            ) : receivedCrates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No crates to recheck. Create a receiving batch first.
              </p>
            ) : (
              receivedCrates.map(crate => (
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
                      <p className="text-sm text-gray-600">{parseFloat(crate.kg).toFixed(2)} kg</p>
                    </div>
                  </div>
                </div>
              ))
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
                <p>Original Weight: {(typeof selectedCrate.originalKg === 'number' ? selectedCrate.originalKg : parseFloat(selectedCrate.originalKg)).toFixed(2)} kg</p>
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
                      onChange={(e) => {
                        setSelectedTank(e.target.value);
                        if (errors.tankId) {
                          const newErrors = { ...errors };
                          delete newErrors.tankId;
                          setErrors(newErrors);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg ${errors.tankId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select tank</option>
                      {tanks.filter(t => t.status == 1).map(tank => (
                        <option key={tank.id} value={tank.id}>
                          {tank.tankName}
                        </option>
                      ))}
                    </select>
                    {errors.tankId && <p className="text-red-600 text-sm mt-1 font-medium">{errors.tankId}</p>}
                  </div>
                  <button
                    onClick={handleStore}
                    disabled={!selectedTank || isStoring}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center"
                  >
                    {isStoring ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {storageType === 'crate' ? 'Storing...' : 'Emptying...'}
                      </>
                    ) : (
                      storageType === 'crate' ? 'Store Crate in Tank' : 'Empty into Tank'
                    )}
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
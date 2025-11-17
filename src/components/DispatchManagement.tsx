import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Dispatch, DispatchLineItem, SizeCategory } from '../types';
import { Send, Plus, Trash2 } from 'lucide-react';
import axios from '../lib/axios';

export function DispatchManagement() {
  const { currentUser, dispatches, getAllTankStock, addDispatch } = useData();
  const [showForm, setShowForm] = useState(false);
  const [dispatchType, setDispatchType] = useState<'export' | 'regrade'>('export');
  const [clientAwb, setClientAwb] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItems, setSelectedItems] = useState<DispatchLineItem[]>([]);

  const allTankStock = getAllTankStock();

  const addItem = (
    tankId: string,
    tankNumber: number,
    crateId: string | undefined,
    looseStockId: string | undefined,
    size: SizeCategory,
    maxKg: number,
    crateNumber?: number
  ) => {
    const item: DispatchLineItem = {
      id: `dispatch-item-${Date.now()}-${Math.random()}`,
      tankId,
      tankNumber,
      crateId,
      looseStockId,
      size,
      kg: maxKg,
      crateNumber,
      isLoose: !crateId,
    };
    setSelectedItems([...selectedItems, item]);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const updateItemKg = (id: string, kg: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, kg } : item
    ));
  };

  const calculateSummary = () => {
    const summary: Record<string, number> = {
      U: 0, A: 0, B: 0, C: 0, D: 0, E: 0
    };
    selectedItems.forEach(item => {
      summary[item.size] += item.kg;
    });
    return summary;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || selectedItems.length === 0) return;

    const summary = calculateSummary();
    const totalKg = selectedItems.reduce((sum, item) => sum + item.kg, 0);

    const dispatch: Dispatch = {
      id: `dispatch-${Date.now()}`,
      type: dispatchType,
      clientAwb,
      dispatchDate,
      lineItems: selectedItems,
      totalKg,
      sizeU: summary.U,
      sizeA: summary.A,
      sizeB: summary.B,
      sizeC: summary.C,
      sizeD: summary.D,
      sizeE: summary.E,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    // Send data to API using axios
    try {
      await axios.post('/api/dispatches', {
        type: dispatchType,
        clientAwb,
        dispatchDate,
        lineItems: selectedItems,
        totalKg,
        sizeU: summary.U,
        sizeA: summary.A,
        sizeB: summary.B,
        sizeC: summary.C,
        sizeD: summary.D,
        sizeE: summary.E,
      });
    } catch (error) {
      console.error('Error creating dispatch:', error);
    }

    addDispatch(dispatch);
    setShowForm(false);
    setClientAwb('');
    setDispatchDate(new Date().toISOString().split('T')[0]);
    setSelectedItems([]);
  };

  const summary = calculateSummary();
  const totalKg = selectedItems.reduce((sum, item) => sum + item.kg, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-2">
          <Send className="w-6 h-6" />
          Dispatch Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Dispatch
        </button>
      </div>

      {showForm && (
        <div className="space-y-6 mb-6">
          {/* Dispatch Header */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="mb-4">Create Dispatch</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={dispatchType}
                  onChange={(e) => setDispatchType(e.target.value as 'export' | 'regrade')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="export">Export</option>
                  <option value="regrade">Regrade</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Client / AWB</label>
                <input
                  type="text"
                  required
                  value={clientAwb}
                  onChange={(e) => setClientAwb(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dispatch Date</label>
                <input
                  type="date"
                  required
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Select Stock */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="mb-4">Select Stock to Dispatch</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {allTankStock.map(tank => (
                <div key={tank.tankId} className="border rounded-lg p-4">
                  <h4 className="mb-3">{tank.tankName} ({tank.summary.totalKg.toFixed(2)} kg)</h4>
                  
                  {/* Crates */}
                  {tank.crates.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Crates:</p>
                      <div className="space-y-1">
                        {tank.crates.map(crate => (
                          <div key={crate.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              Crate #{crate.crateNumber} - Size {crate.size} - {crate.kg.toFixed(2)} kg
                            </span>
                            <button
                              type="button"
                              onClick={() => addItem(tank.tankId, tank.tankNumber, crate.id, undefined, crate.size, crate.kg, crate.crateNumber)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loose Stock */}
                  {tank.looseStock.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Loose Stock:</p>
                      <div className="space-y-1">
                        {tank.looseStock.map(stock => (
                          <div key={stock.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              Loose - Size {stock.size} - {stock.kg.toFixed(2)} kg
                            </span>
                            <button
                              type="button"
                              onClick={() => addItem(tank.tankId, tank.tankNumber, undefined, stock.id, stock.size, stock.kg)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="mb-4">Selected Items ({selectedItems.length})</h3>
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items selected</p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">
                        Tank {item.tankNumber} - 
                        {item.isLoose ? ' Loose' : ` Crate #${item.crateNumber}`} - 
                        Size {item.size}
                      </p>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        step="0.01"
                        value={item.kg}
                        onChange={(e) => updateItemKg(item.id, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="mb-4">Dispatch Summary</h3>
            <div className="grid grid-cols-7 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p>{totalKg.toFixed(2)} kg</p>
              </div>
              {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                <div key={size} className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Size {size}</p>
                  <p>{summary[size].toFixed(2)} kg</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Create Dispatch
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedItems([]);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dispatch History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="p-4 border-b">Dispatch History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600">Client/AWB</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600">Total Kg</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600">Items</th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((dispatch, idx) => (
                <tr key={dispatch.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{dispatch.dispatchDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      dispatch.type === 'export' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {dispatch.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{dispatch.clientAwb}</td>
                  <td className="px-4 py-3 text-right">{dispatch.totalKg.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{dispatch.lineItems.length}</td>
                </tr>
              ))}
              {dispatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No dispatches yet. Click "New Dispatch" to create one.
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

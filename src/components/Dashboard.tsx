import React from 'react';
import { useData } from '../context/DataContext';
import { Package, Database, Send, AlertTriangle, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { offloadRecords, receivingBatches, dispatches, losses, getStockBySize, getAllTankStock } = useData();
  
  const stockBySize = getStockBySize();
  const allTankStock = getAllTankStock();
  const totalCrates = allTankStock.reduce((sum, tank) => sum + tank.crates.length, 0);
  const totalLooseItems = allTankStock.reduce((sum, tank) => sum + tank.looseStock.length, 0);
  const totalLosses = losses.reduce((sum, loss) => sum + loss.kg, 0);
  const totalDispatched = dispatches.reduce((sum, dispatch) => sum + dispatch.totalKg, 0);

  return (
    <div className="p-6">
      <h1 className="mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Stock</p>
          </div>
          <p className="text-2xl">{stockBySize.totalKg.toFixed(2)} kg</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Offload Records</p>
          </div>
          <p className="text-2xl">{offloadRecords.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Crates in Tanks</p>
          </div>
          <p className="text-2xl">{totalCrates}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Send className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Dispatched</p>
          </div>
          <p className="text-2xl">{totalDispatched.toFixed(2)} kg</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Total Losses</p>
          </div>
          <p className="text-2xl">{totalLosses.toFixed(2)} kg</p>
        </div>
      </div>

      {/* Stock by Size */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="mb-4">Current Stock by Size</h2>
        <div className="grid grid-cols-6 gap-4">
          {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
            <div key={size} className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Size {size}</p>
              <p className="text-xl">{stockBySize[`size${size}`].toFixed(2)} kg</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stockBySize[`size${size}`] / stockBySize.totalKg) * 100 || 0).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tank Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="mb-4">Tank Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          {allTankStock.slice(0, 8).map(tank => (
            <div key={tank.tankId} className="p-4 border rounded-lg">
              <p className="mb-2">{tank.tankName}</p>
              <p className="text-sm text-gray-600">
                {tank.summary.totalKg.toFixed(2)} kg
              </p>
              <p className="text-xs text-gray-500">
                {tank.crates.length} crates, {tank.looseStock.length} loose
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Offloads */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="mb-4">Recent Offloads</h3>
          <div className="space-y-2">
            {offloadRecords.slice(-5).reverse().map(record => (
              <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p>{record.boatName}</p>
                    <p className="text-sm text-gray-600">Trip {record.tripNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{record.totalKgAlive.toFixed(2)} kg</p>
                    <p className="text-xs text-gray-500">{record.offloadDate}</p>
                  </div>
                </div>
              </div>
            ))}
            {offloadRecords.length === 0 && (
              <p className="text-gray-500 text-center py-4">No offloads yet</p>
            )}
          </div>
        </div>

        {/* Recent Dispatches */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="mb-4">Recent Dispatches</h3>
          <div className="space-y-2">
            {dispatches.slice(-5).reverse().map(dispatch => (
              <div key={dispatch.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p>{dispatch.clientAwb}</p>
                    <p className="text-sm text-gray-600">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        dispatch.type === 'export' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {dispatch.type}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{dispatch.totalKg.toFixed(2)} kg</p>
                    <p className="text-xs text-gray-500">{dispatch.dispatchDate}</p>
                  </div>
                </div>
              </div>
            ))}
            {dispatches.length === 0 && (
              <p className="text-gray-500 text-center py-4">No dispatches yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

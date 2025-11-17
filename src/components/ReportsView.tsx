import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart3 } from 'lucide-react';

type ReportType = 'stock-by-tank' | 'stock-by-size' | 'stock-by-boat';

export function ReportsView() {
  const { getAllTankStock, getStockBySize, getBoatTripStock } = useData();
  const [reportType, setReportType] = useState<ReportType>('stock-by-tank');

  const tankStock = getAllTankStock();
  const stockBySize = getStockBySize();
  const boatTripStock = getBoatTripStock();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Reports
        </h1>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="stock-by-tank">Stock by Tank</option>
          <option value="stock-by-size">Stock by Size</option>
          <option value="stock-by-boat">Stock by Boat/Trip</option>
        </select>
      </div>

      {reportType === 'stock-by-tank' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="mb-4">Stock Summary by Tank</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Tank</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Total Kg</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Size U</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Size A</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Size B</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Size C</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Size D</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Size E</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Crates</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-600">Loose</th>
                  </tr>
                </thead>
                <tbody>
                  {tankStock.map((tank, idx) => (
                    <tr key={tank.tankId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">{tank.tankName}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.totalKg.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.sizeU.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.sizeA.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.sizeB.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.sizeC.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.sizeD.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.summary.sizeE.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{tank.crates.length}</td>
                      <td className="px-4 py-3 text-right">{tank.looseStock.length}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.totalKg, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.sizeU, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.sizeA, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.sizeB, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.sizeC, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.sizeD, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.summary.sizeE, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.crates.length, 0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tankStock.reduce((sum, t) => sum + t.looseStock.length, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'stock-by-size' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="mb-4">Factory-Wide Stock by Size</h2>
            <div className="grid grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl">{stockBySize.totalKg.toFixed(2)} kg</p>
              </div>
              {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                <div key={size} className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Size {size}</p>
                  <p className="text-2xl">{stockBySize[`size${size}`].toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((stockBySize[`size${size}`] / stockBySize.totalKg) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="mb-4">Size Distribution Chart</h3>
            <div className="h-64 flex items-end gap-4">
              {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => {
                const percentage = (stockBySize[`size${size}`] / stockBySize.totalKg) * 100 || 0;
                return (
                  <div key={size} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="mt-2">Size {size}</p>
                    <p className="text-sm text-gray-600">{stockBySize[`size${size}`].toFixed(1)} kg</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {reportType === 'stock-by-boat' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="mb-4">Stock by Boat/Trip</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Boat</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Offload Date</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Trip #</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Live</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Dead</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Rotten</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Lost</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Dispatched</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {boatTripStock.map((trip, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">{trip.boatName}</td>
                    <td className="px-4 py-3">{trip.offloadDate}</td>
                    <td className="px-4 py-3">{trip.tripNumber}</td>
                    <td className="px-4 py-3 text-right">{trip.totalLive.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{trip.totalDead.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{trip.totalRotten.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{trip.totalLost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{trip.totalDispatched.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{trip.remaining.totalKg.toFixed(2)}</td>
                  </tr>
                ))}
                {boatTripStock.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No boat trips recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {boatTripStock.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4">Remaining Stock by Size per Boat</h3>
              <div className="space-y-3">
                {boatTripStock.map((trip, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-2">
                      {trip.boatName} - {trip.offloadDate} (Trip {trip.tripNumber})
                    </p>
                    <div className="grid grid-cols-7 gap-2">
                      <div className="text-center p-2 bg-white rounded">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-sm">{trip.remaining.totalKg.toFixed(2)}</p>
                      </div>
                      {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                        <div key={size} className="text-center p-2 bg-white rounded">
                          <p className="text-xs text-gray-600">Size {size}</p>
                          <p className="text-sm">{trip.remaining[`size${size}`].toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

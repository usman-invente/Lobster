
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { BarChart3, Loader2 } from 'lucide-react';

type ReportType = 'stock-by-tank' | 'stock-by-size' | 'stock-by-boat';

export function ReportsView() {
  const [reportType, setReportType] = useState<ReportType>('stock-by-tank');
  const [tankStock, setTankStock] = useState<any[]>([]);
  const [stockBySize, setStockBySize] = useState<any>({ totalKg: 0, sizeU: 0, sizeA: 0, sizeB: 0, sizeC: 0, sizeD: 0, sizeE: 0 });
  const [boatTripStock, setBoatTripStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (reportType === 'stock-by-tank') {
      axios.get('/api/reports/stock-by-tanks')
        .then(res => {
          setTankStock(res.data.data || []);
        })
        .catch(() => {
          setTankStock([]);
          setError('Failed to load stock by tanks.');
        })
        .finally(() => setIsLoading(false));
    } else if (reportType === 'stock-by-size') {
      axios.get('/api/reports/stock-by-size')
        .then(res => {
          setStockBySize(res.data.data || { totalKg: 0, sizeU: 0, sizeA: 0, sizeB: 0, sizeC: 0, sizeD: 0, sizeE: 0 });
        })
        .catch(() => {
          setStockBySize({ totalKg: 0, sizeU: 0, sizeA: 0, sizeB: 0, sizeC: 0, sizeD: 0, sizeE: 0 });
          setError('Failed to load stock by size.');
        })
        .finally(() => setIsLoading(false));
    } else if (reportType === 'stock-by-boat') {
      axios.get('/api/reports/stock-by-boat')
        .then(res => {
          setBoatTripStock(res.data.data || []);
        })
        .catch(() => {
          setBoatTripStock([]);
          setError('Failed to load stock by boat/trip.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [reportType]);

  // Helper to format date (YYYY-MM-DD)
  function formatDate(dateString: string) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toISOString().slice(0, 10);
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Reports
      </h1>

      <div className="space-y-6">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="stock-by-tank">Stock by Tank</option>
          <option value="stock-by-size">Stock by Size</option>
          <option value="stock-by-boat">Stock by Boat/Trip</option>
        </select>

        {reportType === 'stock-by-tank' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="mb-4">Stock Summary by Tank</h2>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </div>
              ) : error ? (
                <div className="text-red-500 py-8 text-center">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Tank</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Total Kg</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Crates</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Loose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tankStock.map((tank, idx) => (
                        <tr key={tank.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3">{tank.name}</td>
                          <td className="px-4 py-3 text-right">{Number(tank.totalKg).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{tank.crates ? tank.crates : 0}</td>
                          <td className="px-4 py-3 text-right">{tank.loose_stock ? tank.loose_stock : 0}</td>
                        </tr>
                      ))}
                      {tankStock.length > 0 && (
                        <tr className="bg-blue-50">
                          <td className="px-4 py-3">TOTAL</td>
                          <td className="px-4 py-3 text-right">
                            {tankStock.reduce((sum, t) => sum + Number(t.totalKg), 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {tankStock.reduce((sum, t) => sum + (t.crates ? t.crates : 0), 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {tankStock.reduce((sum, t) => sum + (t.loose_stock ? t.loose_stock : 0), 0)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {reportType === 'stock-by-size' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="mb-4">Factory-Wide Stock by Size</h2>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </div>
              ) : error ? (
                <div className="text-red-500 py-8 text-center">{error}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl">{Number(stockBySize.totalKg).toFixed(2)} kg</p>
                  </div>
                  {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                    <div key={size} className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Size {size}</p>
                      <p className="text-2xl">{Number(stockBySize[`size${size}`]).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((Number(stockBySize[`size${size}`]) / (Number(stockBySize.totalKg) || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="mb-4">Size Distribution Chart</h3>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </div>
              ) : error ? (
                <div className="text-red-500 py-8 text-center">{error}</div>
              ) : (
                <div className="h-64 flex items-end gap-4">
                  {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => {
                    const percentage = (Number(stockBySize[`size${size}`]) / (Number(stockBySize.totalKg) || 1)) * 100;
                    return (
                      <div key={size} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all"
                            style={{ height: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="mt-2">Size {size}</p>
                        <p className="text-sm text-gray-600">{Number(stockBySize[`size${size}`]).toFixed(1)} kg</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {reportType === 'stock-by-boat' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="mb-4">Stock by Boat/Trip</h2>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
              </div>
            ) : error ? (
              <div className="text-red-500 py-8 text-center">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Boat</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Offload Date</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Trip #</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Live</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Stored</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Empty</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Dispatched</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boatTripStock.map((trip, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3">{trip.boatName}</td>
                          <td className="px-4 py-3">{formatDate(trip.offloadDate)}</td>
                          <td className="px-4 py-3">{trip.tripNumber}</td>
                          <td className="px-4 py-3 text-right">{Number(trip.totalLive).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{Number(trip.totalStored).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{Number(trip.totalEmptied).toFixed(2)}</td>

                          <td className="px-4 py-3 text-right">{Number(trip.totalDispatched).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{Number(trip.remaining.totalKg).toFixed(2)}</td>
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
                            {trip.boatName} - {formatDate(trip.offloadDate)} (Trip {trip.tripNumber})
                          </p>
                          <div className="grid grid-cols-7 gap-2">
                            <div className="text-center p-2 bg-white rounded">
                              <p className="text-xs text-gray-600">Total</p>
                              <p className="text-sm">{Number(trip.remaining.totalKg).toFixed(2)}</p>
                            </div>
                            {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
                              <div key={size} className="text-center p-2 bg-white rounded">
                                <p className="text-xs text-gray-600">Size {size}</p>
                                <p className="text-sm">{Number(trip.remaining[`size${size}`]).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Package, Database, Send, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/dashboard-stats');
        setStats(response.data);
      } catch (err: any) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6">Dashboard</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-gray-200" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-12">{error}</div>
      ) : stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Total Stock</p>
              </div>
             <p className="text-2xl">{Number(stats.total_stock_kg ?? 0).toFixed(2)} kg</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Offload Records</p>
              </div>
              <p className="text-2xl">{stats.total_offloads ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Crates in Tanks</p>
              </div>
              <p className="text-2xl">{stats.crates_stored ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Send className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Dispatched</p>
              </div>
              <p className="text-2xl">{stats.total_dispatched?.toFixed(2) ?? '0.00'} kg</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-600">Total Loss</p>
              </div>
             <p className="text-2xl">{Number(stats.total_loss_stock ?? 0).toFixed(2)} kg</p>
            </div>
          </div>
        </>
      )}

      {/* Stock by Size */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="mb-4">Current Stock by Size</h2>
        {stats && stats.size_breakdown ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {(['U', 'A', 'B', 'C', 'D', 'E'] as const).map(size => (
              <div key={size} className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Size {size}</p>
                <p className="text-xl">{(stats.size_breakdown[size] ?? 0).toFixed(2)} kg</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_stock ? (((stats.size_breakdown[size] ?? 0) / stats.total_stock) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No size breakdown data available.</div>
        )}
      </div>

      {/* Tank Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="mb-4">Tank Summary</h2>
        {stats && stats.tank_summary && stats.tank_summary.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.tank_summary.slice(0, 8).map((tank: any) => (
              <div key={tank.tankId || tank.id} className="p-4 border rounded-lg">
                <p className="mb-2">{tank.tankName}</p>
                <p className="text-sm text-gray-600">
                 {Number(tank.totalKg ?? 0).toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-500">
                  {tank.crates_count ?? 0} crates, {tank.looseStock ?? 0} loose
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No tank summary data available.</div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Offloads */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="mb-4">Recent Offloads</h3>
          <div className="space-y-2">
            {stats && stats.recent_offloads && stats.recent_offloads.length > 0 ? (
              stats.recent_offloads.map((record: any) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p>{record.boatName}</p>
                      <p className="text-sm text-gray-600">Trip {record.tripNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{(record.totalKgAlive ?? 0).toFixed(2)} kg</p>
                      <p className="text-xs text-gray-500">
                        {record.offloadDate ? new Date(record.offloadDate).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No offloads yet</p>
            )}
          </div>
        </div>

        {/* Recent Dispatches */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="mb-4">Recent Dispatches</h3>
          <div className="space-y-2">
            {stats && stats.recent_dispatches && stats.recent_dispatches.length > 0 ? (
              stats.recent_dispatches.map((dispatch: any) => (
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
                      <p className="text-sm">{(dispatch.totalKg ?? 0).toFixed(2)} kg</p>
                      <p className="text-xs text-gray-500">{dispatch.dispatchDate}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No dispatches yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
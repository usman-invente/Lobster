import React, { useState } from 'react';
import { UserCreateForm } from './UserCreateForm';
import axios from '../lib/axios';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { User, Tank } from '../types';
import { Settings, Plus, UserCircle, Database } from 'lucide-react';

export function SettingsView() {
  const { currentUser, users, tanks, addUser, addTank, updateTank } = useData();
  const [activeTab, setActiveTab] = useState<'users' | 'tanks'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [usersFromApi, setUsersFromApi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showTankForm, setShowTankForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'operator'>('operator');
  const [tankNumber, setTankNumber] = useState(0);
  const [tankName, setTankName] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: `user-${Date.now()}`,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString(),
    };
    addUser(user);
    setShowUserForm(false);
    setUserName('');
    setUserRole('operator');
  };

  const handleAddTank = (e: React.FormEvent) => {
    e.preventDefault();
    const tank: Tank = {
      id: `tank-${Date.now()}`,
      number: tankNumber,
      name: tankName,
      active: true,
    };
    addTank(tank);
    setShowTankForm(false);
    setTankNumber(0);
    setTankName('');
  };

  const handleToggleTank = (tank: Tank) => {
    updateTank({ ...tank, active: !tank.active });
  };

  // Fetch users from API
  React.useEffect(() => {
    setIsLoading(true);
    axios.get('/api/users', {
      params: {
        page: currentPage,
        per_page: perPage,
        search: searchQuery,
        sort_by: sortColumn,
        sort_direction: sortDirection,
      }
    }).then(res => {
      setUsersFromApi(res.data.data || []);
      setTotalRecords(res.data.meta?.total || (res.data.data ? res.data.data.length : 0));
    }).catch(() => {
      setUsersFromApi([]);
      setTotalRecords(0);
    }).finally(() => setIsLoading(false));
  }, [refreshUsers, currentPage, perPage, searchQuery, sortColumn, sortDirection]);

  const totalPages = Math.ceil(totalRecords / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, totalRecords);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings
      </h1>

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tanks')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'tanks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Tanks
            </div>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2>User Management</h2>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {showUserForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="mb-4">Add New User</h3>
                <UserCreateForm onUserCreated={() => { setShowUserForm(false); setRefreshUsers(r => r + 1); }} />
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Email</th>
                    <th
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-1">
                        Role {sortColumn === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Permissions</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : usersFromApi.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    usersFromApi.map((user, idx) => (
                      <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          {user.name}
                          {currentUser?.id === user.id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {Array.isArray(user.permissions)
                            ? user.permissions.map((p: string) => (
                                <span key={p} className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                                  {p}
                                </span>
                              ))
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {usersFromApi.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tanks Tab */}
        {activeTab === 'tanks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2>Tank Management</h2>
              <button
                onClick={() => setShowTankForm(!showTankForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Tank
              </button>
            </div>

            {showTankForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="mb-4">Add New Tank</h3>
                <form onSubmit={handleAddTank} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tank Number</label>
                      <input
                        type="number"
                        required
                        value={tankNumber}
                        onChange={(e) => setTankNumber(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tank Name</label>
                      <input
                        type="text"
                        required
                        value={tankName}
                        onChange={(e) => setTankName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Tank
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTankForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Number</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.sort((a, b) => a.number - b.number).map((tank, idx) => (
                    <tr key={tank.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">{tank.number}</td>
                      <td className="px-4 py-3">{tank.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tank.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tank.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleTank(tank)}
                          className={`px-3 py-1 rounded text-xs ${
                            tank.active
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {tank.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
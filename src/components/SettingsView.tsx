import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Tank } from '../types';
import { Settings, Plus, UserCircle, Database } from 'lucide-react';

export function SettingsView() {
  const { currentUser, users, tanks, addUser, addTank, updateTank } = useData();
  const [activeTab, setActiveTab] = useState<'users' | 'tanks'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
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
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Role</label>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as 'admin' | 'operator')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add User
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserForm(false)}
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
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Role</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        {user.name}
                        {currentUser?.id === user.id && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </td>
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
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
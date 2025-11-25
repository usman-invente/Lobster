import React, { useState, useEffect } from 'react';
import { UserCreateForm } from './UserCreateForm';
import axios from '../lib/axios';
import { Loader2, ChevronLeft, ChevronRight, Search, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { User, Tank } from '../types';
import { Settings, Plus, UserCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

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
  const [tanksFromApi, setTanksFromApi] = useState<any[]>([]);
  const [isTanksLoading, setIsTanksLoading] = useState(false);
  const [tankErrors, setTankErrors] = useState<Record<string, string>>({});
  const [isTankSubmitting, setIsTankSubmitting] = useState(false);

  // Server-side table state for tanks
  const [tanksSearchQuery, setTanksSearchQuery] = useState('');
  const [tanksCurrentPage, setTanksCurrentPage] = useState(1);
  const [tanksPerPage, setTanksPerPage] = useState(10);
  const [tanksTotalRecords, setTanksTotalRecords] = useState(0);
  const [tanksSortColumn, setTanksSortColumn] = useState('number');
  const [tanksSortDirection, setTanksSortDirection] = useState<'asc' | 'desc'>('asc');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'operator' as 'admin' | 'operator',
    password: ''
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Tank edit modal state
  const [showTankEditModal, setShowTankEditModal] = useState(false);
  const [editTank, setEditTank] = useState<any>(null);
  const [editTankForm, setEditTankForm] = useState({
    number: 0,
    name: '',
    active: true
  });
  const [isTankEditSubmitting, setIsTankEditSubmitting] = useState(false);
  const [editTankErrors, setEditTankErrors] = useState<Record<string, string>>({});

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

  // Fetch tanks from API with server-side features
  const fetchTanks = async () => {
    setIsTanksLoading(true);
    try {
      const response = await axios.get('/api/tanks?page=thanks', {
        params: {
          page: tanksCurrentPage,
          per_page: tanksPerPage,
          search: tanksSearchQuery,
          sort_by: tanksSortColumn,
          sort_direction: tanksSortDirection,
        }
      });

      // Handle response - expecting { data: [...], meta: {...} }
      const tanks = response.data.data || [];
      const pagination = response.data.meta || { total: 0 };

      if (!Array.isArray(tanks)) {
        console.error('Expected array in response.data.data, got:', typeof tanks);
        setTanksFromApi([]);
        setTanksTotalRecords(0);
        setIsTanksLoading(false);
        return;
      }

      setTanksFromApi(tanks);
      setTanksTotalRecords(pagination.total || tanks.length);
    } catch (error) {
      console.error('Error fetching tanks:', error);
      toast.error('Failed to load tanks');
    } finally {
      setIsTanksLoading(false);
    }
  };

  // Load tanks on component mount and when filters change
  useEffect(() => {
    if (activeTab === 'tanks') {
      fetchTanks();
    }
  }, [activeTab, tanksCurrentPage, tanksPerPage, tanksSearchQuery, tanksSortColumn, tanksSortDirection]);

  // Handle tanks search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setTanksCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [tanksSearchQuery]);

  // Handle add tank via API
  const handleAddTank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTankSubmitting(true);
    setTankErrors({});

    try {
      await axios.post('/api/tanks', {
        number: tankNumber,
        name: tankName,
      });

      toast.success('Tank added successfully!');
      setShowTankForm(false);
      setTankNumber(0);
      setTankName('');
      fetchTanks(); // Refresh the list
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        });
        setTankErrors(formattedErrors);
      } else {
        toast.error('Failed to add tank');
      }
    } finally {
      setIsTankSubmitting(false);
    }
  };

  // Handle toggle tank status via API
  const handleToggleTank = async (tank: any) => {
    try {
      await axios.patch(`/api/tanks/${tank.id}/toggle`);
      toast.success(`Tank ${tank.status == 1 ? 'deactivated' : 'activated'} successfully!`);
      fetchTanks(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update tank status');
    }
  };

  // Open tank edit modal and populate form
  const handleEditTankClick = (tank: any) => {
    setEditTank(tank);
    setEditTankForm({
      number: tank.tankNumber || tank.number,
      name: tank.tankName || tank.name,
      active: tank.status == 1 || tank.active
    });
    setEditTankErrors({});
    setShowTankEditModal(true);
  };

  // Handle tank edit form change
  const handleEditTankChange = (field: string, value: any) => {
    setEditTankForm((prev: any) => ({ ...prev, [field]: value }));
    if (editTankErrors[field]) setEditTankErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Submit tank edit
  const handleEditTankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTank) return;
    setIsTankEditSubmitting(true);
    setEditTankErrors({});
    
    try {
      await axios.put(`/api/tanks/${editTank.id}`, editTankForm);
      toast.success('Tank updated successfully!');
      setShowTankEditModal(false);
      setEditTank(null);
      fetchTanks();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        });
        setEditTankErrors(formattedErrors);
      } else {
        toast.error('Failed to update tank');
      }
    } finally {
      setIsTankEditSubmitting(false);
    }
  };

  // Handle tanks sort
  const handleTanksSort = (column: string) => {
    if (tanksSortColumn === column) {
      setTanksSortDirection(tanksSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setTanksSortColumn(column);
      setTanksSortDirection('asc');
    }
  };

  // Calculate tanks pagination
  const tanksTotalPages = Math.ceil(tanksTotalRecords / tanksPerPage);
  const tanksStartRecord = (tanksCurrentPage - 1) * tanksPerPage + 1;
  const tanksEndRecord = Math.min(tanksCurrentPage * tanksPerPage, tanksTotalRecords);

  // Handle tank delete
  const handleDeleteTank = async (tank: any) => {
    if (!window.confirm(`Are you sure you want to delete tank "${tank.tankName || tank.name}"? This action cannot be undone.`)) return;

    try {
      await axios.delete(`/api/tanks/${tank.id}`);
      toast.success('Tank deleted successfully!');
      fetchTanks();
    } catch (error) {
      toast.error('Failed to delete tank');
    }
  };

  // Open edit modal and populate form
  const handleEditClick = (user: any) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsEditSubmitting(true);
    setEditErrors({});
    
    // Prepare data to send - only include password if it's not empty
    const updateData = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      ...(editForm.password && { password: editForm.password })
    };
    
    try {
      await axios.put(`/api/users/${editUser.id}`, updateData);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setEditUser(null);
      setRefreshUsers(r => r + 1);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        });
        setEditErrors(formattedErrors);
      } else {
        toast.error('Failed to update user');
      }
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('User deleted successfully');
      setRefreshUsers(r => r + 1);
    } catch (err) {
      toast.error('Failed to delete user');
    }
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

  // Handle search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative flex items-center group">
                  {/* <div className="absolute left-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                    <Search className="w-5 h-5" />
                  </div> */}
                  <input
                    type="text"
                    placeholder="Search by name, email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:border-gray-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full min-w-max">
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
                    <th 
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Permissions</th>
                    <th 
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Created {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm text-gray-600">Actions</th>
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
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                          <button
                            title="Edit"
                            onClick={() => handleEditClick(user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Showing {usersFromApi.length > 0 ? startRecord : 0} to {endRecord} of {totalRecords} records
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="flex items-center gap-2">
                <Database className="w-6 h-6" />
                Tank Management
              </h2>
              <button
                onClick={() => setShowTankForm(!showTankForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Tank
              </button>
            </div>

            {/* Search and Filters for Tanks */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative flex items-center group">
                  {/* <Search className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" /> */}
                  <input
                    type="text"
                    placeholder="Search by tank number or name..."
                    value={tanksSearchQuery}
                    onChange={(e) => setTanksSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:border-gray-300"
                  />
                  {tanksSearchQuery && (
                    <button
                      onClick={() => setTanksSearchQuery('')}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={tanksPerPage}
                    onChange={(e) => {
                      setTanksPerPage(Number(e.target.value));
                      setTanksCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
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
                        onChange={(e) => {
                          setTankNumber(parseInt(e.target.value));
                          if (tankErrors.number) setTankErrors((prev) => ({ ...prev, number: '' }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${tankErrors.number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        disabled={isTankSubmitting}
                      />
                      {tankErrors.number && <p className="text-red-600 text-sm mt-1 font-medium">{tankErrors.number}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tank Name</label>
                      <input
                        type="text"
                        required
                        value={tankName}
                        onChange={(e) => {
                          setTankName(e.target.value);
                          if (tankErrors.name) setTankErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${tankErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        disabled={isTankSubmitting}
                      />
                      {tankErrors.name && <p className="text-red-600 text-sm mt-1 font-medium">{tankErrors.name}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isTankSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isTankSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Tank'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTankForm(false)}
                      disabled={isTankSubmitting}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <th
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleTanksSort('number')}
                    >
                      <div className="flex items-center gap-1">
                        Number {tanksSortColumn === 'number' && (tanksSortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleTanksSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name {tanksSortColumn === 'name' && (tanksSortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleTanksSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status {tanksSortColumn === 'status' && (tanksSortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isTanksLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading tanks...
                        </div>
                      </td>
                    </tr>
                  ) : tanksFromApi.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No tanks found.
                      </td>
                    </tr>
                  ) : (
                    tanksFromApi.map((tank: any, idx: number) => (
                      <tr key={tank.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">{tank.tankNumber}</td>
                        <td className="px-4 py-3">{tank.tankName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tank.status == 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tank.status == 1  ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              title="Edit Tank"
                              onClick={() => handleEditTankClick(tank)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              title="Delete Tank"
                              onClick={() => handleDeleteTank(tank)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleTank(tank)}
                              className={`px-3 py-1 rounded text-xs ml-2 ${
                                tank.status == 1
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {tank.status == 1 ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Tanks Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Showing {tanksFromApi.length > 0 ? tanksStartRecord : 0} to {tanksEndRecord} of {tanksTotalRecords} records
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
                  <button
                    onClick={() => setTanksCurrentPage(1)}
                    disabled={tanksCurrentPage === 1}
                    className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setTanksCurrentPage(Math.max(1, tanksCurrentPage - 1))}
                    disabled={tanksCurrentPage === 1}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, tanksTotalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(tanksTotalPages - 4, tanksCurrentPage - 2)) + i;
                    if (pageNum > tanksTotalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setTanksCurrentPage(pageNum)}
                        className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${
                          tanksCurrentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setTanksCurrentPage(Math.min(tanksTotalPages, tanksCurrentPage + 1))}
                    disabled={tanksCurrentPage === tanksTotalPages}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTanksCurrentPage(tanksTotalPages)}
                    disabled={tanksCurrentPage === tanksTotalPages}
                    className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { setShowEditModal(false); setEditUser(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${editErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isEditSubmitting}
                  />
                  {editErrors.name && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${editErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isEditSubmitting}
                  />
                  {editErrors.email && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Password <span className="text-gray-400 text-xs">(leave empty to keep current)</span></label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => handleEditChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${editErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isEditSubmitting}
                    placeholder="Enter new password"
                  />
                  {editErrors.password && <p className="text-red-600 text-sm mt-1 font-medium">{editErrors.password}</p>}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  onClick={handleEditSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isEditSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update User'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isEditSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tank Edit Modal */}
      {showTankEditModal && editTank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Tank</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { setShowTankEditModal(false); setEditTank(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditTankSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tank Number</label>
                  <input
                    type="number"
                    required
                    value={editTankForm.number}
                    onChange={(e) => handleEditTankChange('number', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg ${editTankErrors.number ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isTankEditSubmitting}
                  />
                  {editTankErrors.number && <p className="text-red-600 text-sm mt-1 font-medium">{editTankErrors.number}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tank Name</label>
                  <input
                    type="text"
                    required
                    value={editTankForm.name}
                    onChange={(e) => handleEditTankChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${editTankErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isTankEditSubmitting}
                  />
                  {editTankErrors.name && <p className="text-red-600 text-sm mt-1 font-medium">{editTankErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={editTankForm.active ? 'active' : 'inactive'}
                    onChange={(e) => handleEditTankChange('active', e.target.value === 'active')}
                    className={`w-full px-3 py-2 border rounded-lg ${editTankErrors.active ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isTankEditSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {editTankErrors.active && <p className="text-red-600 text-sm mt-1 font-medium">{editTankErrors.active}</p>}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isTankEditSubmitting}
                  onClick={handleEditTankSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isTankEditSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update Tank'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTankEditModal(false)}
                  disabled={isTankEditSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
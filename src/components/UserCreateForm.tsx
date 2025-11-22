import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { toast } from 'sonner';

export function UserCreateForm({ onUserCreated }: { onUserCreated?: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');
  const [menus, setMenus] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    axios.get('/api/sidebar-menus').then(res => {
      setMenus(res.data.menus || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await axios.post('/api/users', {
        name,
        email,
        password,
        role,
        permissions: selectedMenus,
      });
      toast.success('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
      setRole('operator');
      setSelectedMenus([]);
      if (onUserCreated) onUserCreated();
    } catch (err: any) {
      if (err?.response?.status === 422 && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuChange = (menu: string) => {
    setSelectedMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {errors.name && errors.name.map((msg, i) => (
            <div key={i} className="text-xs text-red-600 mt-1">{msg}</div>
          ))}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {errors.email && errors.email.map((msg, i) => (
            <div key={i} className="text-xs text-red-600 mt-1">{msg}</div>
          ))}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {errors.password && errors.password.map((msg, i) => (
            <div key={i} className="text-xs text-red-600 mt-1">{msg}</div>
          ))}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'admin' | 'operator')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="operator">Operator</option>
            {/* <option value="admin">Admin</option> */}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Sidebar Menus (Permissions)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {menus.map(menu => (
            <label key={menu} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMenus.includes(menu)}
                onChange={() => handleMenuChange(menu)}
                className="form-checkbox"
              />
              <span className="capitalize">{menu.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Add User'}
        </button>
      </div>
    </form>
  );
}

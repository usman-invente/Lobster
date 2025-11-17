import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { OffloadManagement } from './components/OffloadManagement';
import { ReceivingManagement } from './components/ReceivingManagement';
import { RecheckProcess } from './components/RecheckProcess';
import { TankManagement } from './components/TankManagement';
import { DispatchManagement } from './components/DispatchManagement';
import { ReportsView } from './components/ReportsView';
import { LossAdjustment } from './components/LossAdjustment';
import { SettingsView } from './components/SettingsView';
import { authService } from './services/authService';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  CheckCircle, 
  Database, 
  Send, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  LogOut
} from 'lucide-react';

type Page = 
  | 'dashboard' 
  | 'offload' 
  | 'receiving' 
  | 'recheck' 
  | 'tanks' 
  | 'dispatch' 
  | 'reports' 
  | 'losses' 
  | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const handleLogin = (username: string, password: string) => {
    // Authentication is handled in Login component via authService
    // This callback is called after successful API login
    if (username && password) {
      setIsAuthenticated(true);
      setCurrentUser(username);
    }
  };

  const handleLogout = async () => {
    try {
      // Call Laravel Sanctum logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setIsAuthenticated(false);
      setCurrentUser('');
      setCurrentPage('dashboard');
      localStorage.removeItem('user');
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'offload' as Page, label: 'Offload Records', icon: FileText },
    { id: 'receiving' as Page, label: 'Receiving', icon: Package },
    { id: 'recheck' as Page, label: 'Recheck & Store', icon: CheckCircle },
    { id: 'tanks' as Page, label: 'Tank Management', icon: Database },
    { id: 'dispatch' as Page, label: 'Dispatch', icon: Send },
    { id: 'reports' as Page, label: 'Reports', icon: BarChart3 },
    { id: 'losses' as Page, label: 'Loss Adjustment', icon: AlertTriangle },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'offload':
        return <OffloadManagement />;
      case 'receiving':
        return <ReceivingManagement />;
      case 'recheck':
        return <RecheckProcess />;
      case 'tanks':
        return <TankManagement />;
      case 'dispatch':
        return <DispatchManagement />;
      case 'reports':
        return <ReportsView />;
      case 'losses':
        return <LossAdjustment />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-xl text-blue-600">Lobster Stock</h1>
            <p className="text-sm text-gray-600">Management System</p>
          </div>
          
          {/* User Info */}
          <div className="px-6 py-3 border-t border-b border-gray-200 mb-2">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-700">{currentUser}</p>
          </div>

          <nav className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>
    </DataProvider>
  );
}

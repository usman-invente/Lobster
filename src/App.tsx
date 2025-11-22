import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { DataProvider } from './context/DataContext';
import { Login } from './components/Login';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { Dashboard } from './components/Dashboard';
import { OffloadManagement } from './components/OffloadManagement';
import { ReceivingManagement } from './components/ReceivingManagement';
import { RecheckProcess } from './components/RecheckProcess';
import { TankManagement } from './components/TankManagement';
import { DispatchManagement } from './components/DispatchManagement';
import { ReportsView } from './components/ReportsView';
import { LossAdjustment } from './components/LossAdjustment';
import { SettingsView } from './components/SettingsView';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
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
  LogOut,
  User as UserIcon,
  Menu,
  X
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

function MainApp() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = store.dispatch;
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingUser, setCheckingUser] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      setCheckingUser(true);
      import('./lib/auth').then(({ fetchCurrentUser }) => {
        fetchCurrentUser()
          .then(userData => {
            dispatch({
              type: 'user/setUser',
              payload: { ...userData, token },
            });
            setCheckingUser(false);
          })
          .catch(() => {
            localStorage.removeItem('token');
            window.location.reload();
          });
      });
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!user) {
    const token = localStorage.getItem('token');
    if (token || checkingUser) {
      // Show a subtle, centered loader
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-7 w-7 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        </div>
      );
    }
    return <Login />;
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
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        w-64 bg-white shadow-lg flex flex-col
        transition-transform duration-300 ease-in-out
        z-40 h-full
      `}>
        <div className="p-6">
          <h1 className="text-xl text-blue-600">Lobster Stock</h1>
          <p className="text-sm text-gray-600">Management System</p>
        </div>
        
        <nav className="px-3 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
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

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role || user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <DataProvider>
          <MainApp />
          <Toaster position="top-right" richColors />
        </DataProvider>
      </BrowserRouter>
    </Provider>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Inventory from '../Inventory/page';

// Add type definitions at the top after imports
interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
      ]
    },
    {
      title: 'INVENTORY MANAGEMENT',
      items: [
        { id: 'inventory', label: 'Inventory', icon: '📦', badge: '24' },
        { id: 'products', label: 'Products', icon: '🏷️' },
        { id: 'categories', label: 'Categories', icon: '📋' },
        { id: 'stock-levels', label: 'Stock Levels', icon: '📊' },
      ]
    },
    {
      title: 'PURCHASE ORDERS',
      items: [
        { id: 'purchase-orders', label: 'Purchase Orders', icon: '🛒', badge: '5' },
        { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
        { id: 'po-approval', label: 'PO Approval', icon: '✅', badge: '3' },
        { id: 'receiving', label: 'Receiving', icon: '📥' },
      ]
    },
    {
      title: 'WAREHOUSE',
      items: [
        { id: 'locations', label: 'Locations', icon: '📍' },
        { id: 'picking', label: 'Picking', icon: '📋' },
        { id: 'shipping', label: 'Shipping', icon: '🚚' },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'inventory-reports', label: 'Inventory Reports', icon: '📊' },
        { id: 'po-reports', label: 'PO Reports', icon: '📈' },
        { id: 'warehouse-reports', label: 'Warehouse Reports', icon: '📋' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'permissions', label: 'Permissions', icon: '🔐' },
        { id: 'system-settings', label: 'System Settings', icon: '⚙️' },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl">📦</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl">🛒</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending POs</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl">⚠️</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl">🚚</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Shipments</p>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'inventory':
  return (
    <div className="p-6">
      <iframe 
        src="/inventory" 
        style={{
          width: '100%',
          height: 'calc(100vh - 120px)',
          border: 'none',
          borderRadius: '8px'
        }}
      />
    </div>
  );

      case 'purchase-orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Purchase order management features coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection.replace('-', ' ')}</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${sidebarOpen ? 'block' : 'hidden'} md:hidden`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-blue-800 to-blue-600 text-white z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-xl font-bold text-center">Head-Prints</h1>
          <p className="text-sm text-blue-200 text-center mt-1">PO & WMS System</p>
        </div>
        
        <nav className="mt-6">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <div className="px-6 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                {section.title}
              </div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center px-6 py-3 text-sm cursor-pointer transition-colors border-l-4 ${
                    activeSection === item.id 
                      ? 'bg-blue-700 border-yellow-400 text-white' 
                      : 'border-transparent hover:bg-blue-700 hover:border-blue-400 text-blue-100'
                  }`}
                  onClick={() => handleSectionClick(item.id)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Header */}
      <div className={`bg-white shadow-sm transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-64'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 md:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900 capitalize">
                {activeSection.replace('-', ' ')}
              </h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`transition-all duration-300 p-6 ${sidebarOpen ? 'md:ml-64' : 'md:ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
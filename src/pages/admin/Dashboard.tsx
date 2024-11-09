import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  BuildingStorefrontIcon, 
  CalendarIcon, 
  TagIcon,
  UserGroupIcon,
  BellIcon,
  ChartBarIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

import BusinessManagement from './BusinessManagement';
import EventManagement from './EventManagement';
import DiscountManagement from './DiscountManagement';
import UserManagement from './UserManagement';
import AlertManagement from './AlertManagement';
import Analytics from './Analytics';

const adminNavigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Businesses', href: '/admin/businesses', icon: BuildingStorefrontIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon },
  { name: 'Discounts', href: '/admin/discounts', icon: TagIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Alerts', href: '/admin/alerts', icon: BellIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    // Redirect to businesses page if we're at the root admin route
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/businesses');
    }
  }, [location.pathname, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    setSidebarOpen(false);
                    if (item.href === '/') {
                      navigate('/');
                    }
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-shrink-0 items-center px-4 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {adminNavigation.slice(1).map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/businesses" replace />} />
            <Route path="businesses/*" element={<BusinessManagement />} />
            <Route path="events/*" element={<EventManagement />} />
            <Route path="discounts/*" element={<DiscountManagement />} />
            <Route path="users/*" element={<UserManagement />} />
            <Route path="alerts/*" element={<AlertManagement />} />
            <Route path="analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
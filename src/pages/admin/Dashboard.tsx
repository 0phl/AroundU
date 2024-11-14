import React, { useState } from 'react';
import { Link, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  TagIcon,
  UserGroupIcon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import BusinessManagement from './BusinessManagement';
import EventManagement from './EventManagement';
import DiscountManagement from './DiscountManagement';
import UserManagement from './UserManagement';
import AlertManagement from './AlertManagement';
import Analytics from './Analytics';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const adminNavigation = [
  { name: 'Businesses', href: '/admin/businesses', icon: BuildingStorefrontIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon },
  { name: 'Discounts', href: '/admin/discounts', icon: TagIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Alerts', href: '/admin/alerts', icon: BellIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <Link to="/" className="text-xl font-bold ml-2 md:ml-0">
                AroundU
              </Link>
            </div>

            {/* Right side - Profile Menu */}
            <div className="flex items-center">
              {user && (
                <Menu as="div" className="relative ml-3">
                  <Menu.Button className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Menu.Button>
                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <div className="flex">
        {/* Mobile Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } fixed inset-0 z-40 md:hidden`}
        >
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-20 pb-4 overflow-y-auto">
              <div className="flex items-center px-4">
                <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname.includes(item.href)
                        ? 'bg-gray-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 flex-shrink-0 ${
                        location.pathname.includes(item.href)
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
              </div>
              <div className="flex-1 mt-5 px-3 space-y-1">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname.includes(item.href)
                        ? 'bg-gray-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        location.pathname.includes(item.href)
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <div className="flex-1 p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/admin/businesses" replace />} />
              <Route path="businesses/*" element={<BusinessManagement />} />
              <Route path="events/*" element={<EventManagement />} />
              <Route path="discounts/*" element={
                <ErrorBoundary>
                  <DiscountManagement />
                </ErrorBoundary>
              } />
              <Route path="users/*" element={<UserManagement />} />
              <Route path="alerts/*" element={<AlertManagement />} />
              <Route path="analytics" element={<Analytics />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
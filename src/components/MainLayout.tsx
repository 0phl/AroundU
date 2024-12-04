import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../hooks/useAuth';
import NavigationButtons from './NavigationButtons';
import { Bars3Icon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.svg';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');

  // Fetch user's profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user?.id) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfilePicture(userData.profilePicture || '');
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };
    fetchProfilePicture();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/businesses', label: 'Businesses' },
    { to: '/discounts', label: 'Discounts' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and nav links */}
            <div className="flex items-center">
              {/* Logo and Title - Now with more left margin */}
              <Link to="/" className="flex items-center space-x-2 mr-12">
                <img src={logo} alt="AroundU Logo" className="w-8 h-8" />
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-xl font-extrabold tracking-tight">
                    Around<span className="text-blue-300">U</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-blue-200 sm:ml-2 font-medium tracking-wider whitespace-nowrap">
                    DISCOVER LOCAL BUSINESS
                  </span>
                </div>
              </Link>
              
              {/* Navigation Links - Now with proper spacing */}
              <div className="hidden sm:flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === link.to ? 'text-white' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - Profile Menu and Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Profile Menu - Only show on desktop */}
              <div className="hidden sm:block">
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {user.firstName?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                          </span>
                        )}
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        {user.role === 'admin' && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin"
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block px-4 py-2 text-sm text-gray-700`}
                              >
                                Admin Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        )}
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
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    to="/login"
                    className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-md hover:bg-blue-500 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition
          show={isMobileMenuOpen}
          enter="transition ease-out duration-100 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.to
                      ? 'text-white bg-blue-500'
                      : 'text-blue-100 hover:text-white hover:bg-blue-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-500"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-500"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-500"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </Transition>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="w-full">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <NavigationButtons />
    </div>
  );
}
    import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { Menu } from '@headlessui/react';
    import { useAuth } from '../hooks/useAuth';
    import NavigationButtons from './NavigationButtons';

    interface MainLayoutProps {
    children: React.ReactNode;
    }

    export default function MainLayout({ children }: MainLayoutProps) {
    const { user, signOut } = useAuth();
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                {/* Left side - Logo and nav links */}
                <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold">
                    AroundU
                </Link>
                <div className="hidden sm:flex space-x-4">
                    <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/' ? 'text-white' : 'text-blue-100 hover:text-white'
                    }`}
                    >
                    Home
                    </Link>
                    <Link
                    to="/businesses"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/businesses' ? 'text-white' : 'text-blue-100 hover:text-white'
                    }`}
                    >
                    Businesses
                    </Link>
                    <Link
                    to="/discounts"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/discounts' ? 'text-white' : 'text-blue-100 hover:text-white'
                    }`}
                    >
                    Discounts
                    </Link>
                </div>
                </div>

                {/* Right side - Profile Menu */}
                <div className="flex items-center">
                {user ? (
                    <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                            {user.email?.[0].toUpperCase()}
                        </span>
                        </div>
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                        {({ active }) => (
                            <Link
                            to="/profile"
                            className={`${
                                active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                            >
                            Profile
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
                            onClick={() => signOut()}
                            className={`${
                                active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                            Sign Out
                            </button>
                        )}
                        </Menu.Item>
                    </Menu.Items>
                    </Menu>
                ) : (
                    <Link
                    to="/login"
                    className="text-sm font-medium text-blue-100 hover:text-white"
                    >
                    Sign In
                    </Link>
                )}
                </div>
            </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
            {children}
        </main>

        {/* Bottom Navigation */}
        <NavigationButtons />
        </div>
    );
    } 
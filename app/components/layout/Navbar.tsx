'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCart } from '@/app/providers/CartProvider';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold">ChainBazzar</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Home
                </Link>
                <Link href="/products" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Products
                </Link>
                {user && (
                  <Link href="/orders" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    My Orders
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Link href="/cart" className="p-1 rounded-full relative mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <button 
                      onClick={logout}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link 
                    href="/login" 
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              Home
            </Link>
            <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              Products
            </Link>
            {user && (
              <Link href="/orders" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                My Orders
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <Link href="/cart" className="p-1 rounded-full relative mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              {user ? (
                <button
                  onClick={logout}
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <div className="ml-auto flex space-x-2">
                  <Link 
                    href="/login" 
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
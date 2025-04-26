'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-blue-600">ChainBazzar</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/' ? 'border-blue-500' : 'border-transparent'} ${isActive('/')}`}>
                Home
              </Link>
              <Link href="/products" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/products' ? 'border-blue-500' : 'border-transparent'} ${isActive('/products')}`}>
                Products
              </Link>
              <Link href="/about" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/about' ? 'border-blue-500' : 'border-transparent'} ${isActive('/about')}`}>
                About
              </Link>
              <Link href="/blockchain" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/blockchain' ? 'border-blue-500' : 'border-transparent'} ${isActive('/blockchain')}`}>
                Blockchain
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link href="/cart" className="p-2 text-gray-600 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            <Link href="/account" className="ml-4 p-2 text-gray-600 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" 
              className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} text-base font-medium ${isActive('/')}`}
              onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" 
              className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/products' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} text-base font-medium ${isActive('/products')}`}
              onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link href="/about" 
              className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/about' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} text-base font-medium ${isActive('/about')}`}
              onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/blockchain" 
              className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/blockchain' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} text-base font-medium ${isActive('/blockchain')}`}
              onClick={() => setMobileMenuOpen(false)}>
              Blockchain
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Your Account</div>
                <div className="text-sm font-medium text-gray-500">Manage your profile</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/account"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>
              <Link
                href="/cart"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
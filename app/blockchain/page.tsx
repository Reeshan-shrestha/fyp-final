'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BlockchainPage = () => {
  const router = useRouter();

  const navigateToDashboard = () => {
    router.push('/blockchain/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Blockchain Insights</h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore blockchain transactions and analytics on the ChainBazzar platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-semibold mb-2">Blockchain Dashboard</h2>
            <p>Access real-time blockchain analytics and monitor transactions</p>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-6">
              The ChainBazzar blockchain dashboard provides comprehensive insights into on-chain activities including:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time transaction monitoring</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Network statistics across multiple blockchains</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Detailed gas analytics and transaction costs</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Interactive charts and visualization tools</span>
              </li>
            </ul>
            <div className="text-center">
              <button 
                onClick={navigateToDashboard}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Open Blockchain Dashboard
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Transaction Transparency</h3>
            <p className="text-gray-600 mb-4">
              All marketplace transactions are recorded on the blockchain, providing immutable proof of ownership and transaction history.
            </p>
            <Link 
              href="/blockchain/dashboard" 
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              View transactions
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Security</h3>
            <p className="text-gray-600 mb-4">
              ChainBazzar uses multiple blockchain networks to ensure the highest level of security and reliability for your digital assets.
            </p>
            <Link 
              href="/blockchain/dashboard" 
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              Explore security features
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPage; 
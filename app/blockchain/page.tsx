'use client';

import { useState, useEffect } from 'react';
import blockchainService from '../services/blockchainService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  walletAddress: string;
  timestamp: string;
  amount: string;
  status: string;
  blockNumber: number | null;
}

const BlockchainDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    verifiedTransactions: 0,
    pendingTransactions: 0,
    uniqueWallets: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [dailyStats, setDailyStats] = useState([]);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        setLoading(true);
        
        // Use our service to fetch real data
        const [statsData, dailyStatsData, transactionsData] = await Promise.all([
          blockchainService.getBlockchainStats(),
          blockchainService.getDailyStats(),
          blockchainService.getRecentTransactions(10)
        ]);
        
        setStats(statsData);
        setDailyStats(dailyStatsData);
        setRecentTransactions(transactionsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
        
        // If the API fails, use mock data for demonstration
        setTimeout(() => {
          // Mock statistics
          setStats({
            totalTransactions: 126,
            verifiedTransactions: 98,
            pendingTransactions: 28,
            uniqueWallets: 42,
          });

          // Mock transactions
          setRecentTransactions([
            {
              id: '0x7834abc1789def2345678901234567890abcdef1',
              type: 'Purchase',
              walletAddress: '0x1234...5678',
              timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
              amount: '0.015 ETH',
              status: 'Verified',
              blockNumber: 18456234
            },
            {
              id: '0x6723bcd8976abc3456789012345678901abcdef2',
              type: 'Product Listing',
              walletAddress: '0x8765...4321',
              timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
              amount: '0.001 ETH',
              status: 'Verified',
              blockNumber: 18456200
            },
            {
              id: '0x9812def3456781234567890123456abcde789013',
              type: 'Purchase',
              walletAddress: '0x2468...1357',
              timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
              amount: '0.023 ETH',
              status: 'Pending',
              blockNumber: null
            },
            {
              id: '0x3456def7890123456789012345678901abcdef4',
              type: 'Verification',
              walletAddress: '0x9753...8642',
              timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
              amount: '0.002 ETH',
              status: 'Verified',
              blockNumber: 18456150
            },
            {
              id: '0x6789abc1234567890123456789012345abcdef5',
              type: 'Purchase',
              walletAddress: '0x1596...3578',
              timestamp: new Date(Date.now() - 480 * 60000).toISOString(),
              amount: '0.018 ETH',
              status: 'Verified',
              blockNumber: 18456100
            }
          ]);

          // Mock daily statistics for the chart
          setDailyStats([
            { name: 'Mon', transactions: 18, verified: 15 },
            { name: 'Tue', transactions: 22, verified: 19 },
            { name: 'Wed', transactions: 25, verified: 20 },
            { name: 'Thu', transactions: 19, verified: 16 },
            { name: 'Fri', transactions: 26, verified: 22 },
            { name: 'Sat', transactions: 12, verified: 4 },
            { name: 'Sun', transactions: 4, verified: 2 },
          ]);

          setLoading(false);
        }, 800);
      }
    };

    fetchBlockchainData();
  }, []);

  // Data for pie chart
  const statusData = [
    { name: 'Verified', value: stats.verifiedTransactions },
    { name: 'Pending', value: stats.pendingTransactions },
  ];
  const COLORS = ['#4caf50', '#ff9800'];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return address.length > 15 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address;
  };

  const getTransactionUrl = (txHash: string) => {
    return blockchainService.getEtherscanUrl(txHash);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Blockchain Activity Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Real-time overview of blockchain transactions and activity on ChainBazzar
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Total Transactions</p>
              <div className="flex items-center mt-2">
                <div className="rounded-full bg-blue-100 p-2 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">{stats.totalTransactions}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Verified Transactions</p>
              <div className="flex items-center mt-2">
                <div className="rounded-full bg-green-100 p-2 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">{stats.verifiedTransactions}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Pending Transactions</p>
              <div className="flex items-center mt-2">
                <div className="rounded-full bg-orange-100 p-2 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">{stats.pendingTransactions}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Unique Wallets</p>
              <div className="flex items-center mt-2">
                <div className="rounded-full bg-purple-100 p-2 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">{stats.uniqueWallets}</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-5 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Transaction Status</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="lg:col-span-7 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Daily Transaction Volume</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyStats}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transactions" fill="#8884d8" name="Total Transactions" />
                    <Bar dataKey="verified" fill="#82ca9d" name="Verified Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Recent Blockchain Transactions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {truncateAddress(tx.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.walletAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.blockNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                        <a 
                          href={getTransactionUrl(tx.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-900"
                        >
                          View
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlockchainDashboard; 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  userId: string;
  itemId: string;
  quantity: number;
  price: number;
  status: string;
  orderDate: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Transaction {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  blockchainTxId?: string;
}

// Combined type for activity display
type Activity = (Order | Transaction) & {
  type: 'order' | 'transaction';
  activityDate: string;
};

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    ordersFulfilled: 0
  });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Update the API endpoints to match your backend
        const [itemsResponse, ordersResponse, transactionsResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:3005/api/products', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3005/api/billing', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3005/api/billing', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3005/api/auth/check-users', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const itemsData = itemsResponse.data || [];
        const ordersData = ordersResponse.data || [];
        const transactionsData = transactionsResponse.data || [];
        const usersData = usersResponse.data?.users || [];

        setItems(itemsData);
        setOrders(ordersData);
        setTransactions(transactionsData);
        setUsers(usersData);

        // Process activities (combine orders and transactions)
        const allActivities: Activity[] = [
          ...ordersData.map((order: Order) => ({
            ...order,
            type: 'order' as const,
            activityDate: order.orderDate || new Date().toISOString()
          })),
          ...transactionsData.map((tx: Transaction) => ({
            ...tx,
            type: 'transaction' as const,
            activityDate: tx.createdAt
          }))
        ];

        // Sort by date, newest first
        allActivities.sort((a, b) => 
          new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
        );

        setActivities(allActivities.slice(0, 10)); // Get 10 most recent activities

        // Calculate statistics
        setStats({
          totalUsers: usersData.length,
          totalOrders: ordersData.length,
          totalRevenue: ordersData.reduce((sum: number, order: Order) => 
            sum + (order.price * order.quantity), 0),
          ordersFulfilled: ordersData.filter((order: Order) => 
            order.status === 'completed').length
        });

      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/admin/login');
        } else {
          setError('Failed to fetch data');
          console.error('Error fetching data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Orders Fulfilled</h3>
          <p className="text-2xl font-bold">{stats.ordersFulfilled}</p>
        </div>
      </div>
      
      {/* Recent Activities */}
      <section className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activities</h2>
        {activities.length === 0 ? (
          <p className="text-gray-500">No recent activities found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {activity.type === 'order' ? 'Order' : 'Transaction'}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(activity.activityDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {activity.type === 'order' 
                        ? (activity.user?.name || (activity as Order).userId || 'Unknown') 
                        : activity.user?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      ${activity.type === 'order' 
                        ? ((activity as Order).price * (activity as Order).quantity).toFixed(2)
                        : (activity as Transaction).totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      
      {/* Users Section */}
      <section className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Verified</th>
                <th className="px-4 py-2 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'seller'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {user.isVerified ? 
                      <span className="text-green-500">✓</span> : 
                      <span className="text-red-500">✗</span>}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* Orders Section */}
      <section className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{order._id.substring(0, 8)}...</td>
                  <td className="px-4 py-2">{order.user?.name || order.userId}</td>
                  <td className="px-4 py-2">{order.itemId}</td>
                  <td className="px-4 py-2">{order.quantity}</td>
                  <td className="px-4 py-2">${order.price}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
} 
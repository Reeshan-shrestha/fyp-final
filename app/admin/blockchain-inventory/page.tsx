'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  countInStock: number;
  price: number;
  category: string;
  blockchainManaged: boolean;
  blockchainTxHash?: string;
  blockchainInventoryLastSync?: string;
}

export default function BlockchainInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [blockchainStatus, setBlockchainStatus] = useState<{ connected: boolean, networkId?: string }>(
    { connected: false }
  );

  useEffect(() => {
    fetchProducts();
    checkBlockchainStatus();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3006/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
      setLoading(false);
    }
  };

  const checkBlockchainStatus = async () => {
    try {
      // This endpoint doesn't exist yet - would need to be added to the backend
      const response = await axios.get('http://localhost:3006/api/blockchain/status');
      setBlockchainStatus({
        connected: response.data.connected,
        networkId: response.data.networkId
      });
    } catch (error) {
      console.error('Error checking blockchain status:', error);
      setBlockchainStatus({ connected: false });
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.countInStock);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      setMessage(null);

      // Update stock via API
      const response = await axios.patch(
        `http://localhost:3006/api/products/${selectedProduct.id}/stock`,
        { stock: newStock }
      );

      // Update products list
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, countInStock: newStock, blockchainManaged: response.data.onChain } 
          : p
      ));

      setMessage({ 
        type: 'success', 
        text: `Stock for ${selectedProduct.name} updated successfully${
          response.data.onChain ? ' (on blockchain)' : ''
        }` 
      });
      
      setSelectedProduct(null);
      setLoading(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      setMessage({ type: 'error', text: 'Failed to update stock' });
      setLoading(false);
    }
  };

  const handleEnableBlockchain = async (productId: string) => {
    try {
      setLoading(true);
      setMessage(null);

      // Enable blockchain for this product
      const response = await axios.post(
        `http://localhost:3006/api/products/${productId}/enable-blockchain`
      );

      // Update products list
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, blockchainManaged: true } 
          : p
      ));

      setMessage({ 
        type: 'success', 
        text: `Product ${response.data.product.name} is now managed on blockchain` 
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error enabling blockchain:', error);
      setMessage({ type: 'error', text: 'Failed to enable blockchain inventory' });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blockchain Inventory Management</h1>
      
      {/* Blockchain Status */}
      <div className={`p-4 mb-6 rounded-lg ${blockchainStatus.connected ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="font-semibold text-lg">
          Blockchain Status: {blockchainStatus.connected ? 'Connected' : 'Disconnected'}
        </h2>
        {blockchainStatus.connected && blockchainStatus.networkId && (
          <p>Network ID: {blockchainStatus.networkId}</p>
        )}
        {!blockchainStatus.connected && (
          <p className="text-red-700 mt-2">
            Warning: Blockchain connection is not available. On-chain inventory management will not work.
          </p>
        )}
      </div>
      
      {/* Alert message */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      {/* Product List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blockchain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="animate-pulse">Loading products...</div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">ID: {product.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.countInStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.blockchainManaged ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        On-Chain
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Off-Chain
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleSelectProduct(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Update Stock
                    </button>
                    {!product.blockchainManaged && (
                      <button
                        onClick={() => handleEnableBlockchain(product.id)}
                        className="text-green-600 hover:text-green-900"
                        disabled={!blockchainStatus.connected}
                      >
                        Enable Blockchain
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Stock Update Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update Stock for {selectedProduct.name}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock: {selectedProduct.countInStock}
              </label>
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            {selectedProduct.blockchainManaged && (
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-700">
                  This product's inventory is managed on the blockchain. Changes will be recorded on-chain.
                </p>
                {selectedProduct.blockchainTxHash && (
                  <p className="text-xs text-blue-500 mt-1">
                    Last Transaction: {selectedProduct.blockchainTxHash.substring(0, 10)}...
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStock}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Back to admin dashboard */}
      <div className="mt-6">
        <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
} 
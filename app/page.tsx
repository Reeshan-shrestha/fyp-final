'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Item {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  stock?: number;
  description: string;
  image?: string;
  imageUrl?: string;
  ipfsCid?: string;
  ipfsUrl?: string;
  seller?: {
    username?: string;
    _id?: string;
  };
  sellerName?: string;
  category?: string;
  verified?: boolean;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/products');
        
        // Process the items to standardize the data structure
        const processedItems = response.data.map((item: any) => ({
          id: item._id || item.id,
          _id: item._id || item.id,
          name: item.name,
          price: item.price,
          stock: item.stock || 10, // Default stock if not provided
          description: item.description,
          image: item.imageUrl || item.image,
          imageUrl: item.imageUrl || item.image,
          ipfsCid: item.ipfsCid,
          ipfsUrl: item.ipfsUrl,
          seller: item.seller,
          sellerName: typeof item.seller === 'string' ? item.seller : item.seller?.username || item.sellerName,
          verified: item.verified
        }));
        
        setItems(processedItems);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">ChainBazzar</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/cart" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Cart
              </Link>
              <Link 
                href="/admin/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Welcome to ChainBazzar
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your trusted marketplace for secure and transparent transactions
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full min-h-80 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                  {item.image || item.imageUrl ? (
                    <img
                      src={item.image || item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                      onError={(e) => {
                        // If image fails to load, replace with a category-specific placeholder
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loops
                        
                        // Category-specific fallbacks using professional Unsplash photos
                        const categoryFallbacks: Record<string, string> = {
                          'electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=500&q=60',
                          'clothing': 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=500&q=60',
                          'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=60',
                          'other': 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60'
                        };
                        
                        const category = (item.category || 'other').toLowerCase();
                        target.src = categoryFallbacks[category] || 
                          'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  
                  {/* Display IPFS Badge if the image is stored on IPFS */}
                  {item.ipfsCid && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 19h20L12 2zm0 4l7 11H5l7-11z" />
                      </svg>
                      IPFS
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href={`/product/${item.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {item.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    <p className="mt-1 text-xs text-indigo-600">
                      Seller: {item.sellerName || (typeof item.seller === 'string' ? item.seller : item.seller?.username) || 'ChainBazzar'}
                      {item.verified && <span className="ml-1 text-green-500">✓</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.stock ?? 'In'} in stock</p>
                  </div>
                </div>
                <button
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={() => {
                    alert('Adding to cart will be implemented soon!');
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">No products available</div>
          </div>
        )}
      </main>

      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">&copy; 2024 ChainBazzar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
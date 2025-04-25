'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  stock?: number;
  description: string;
  image?: string;
  imageUrl?: string;
  seller?: any;
  sellerName?: string;
  category?: string;
  verified?: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/products');
        
        // Process the products to standardize the data structure
        const processedProducts = response.data.map((item: any) => ({
          id: item._id || item.id,
          _id: item._id || item.id,
          name: item.name,
          price: item.price,
          stock: item.stock || 10, // Default stock if not provided
          description: item.description,
          image: item.imageUrl || item.image,
          imageUrl: item.imageUrl || item.image,
          seller: typeof item.seller === 'string' ? item.seller : item.seller?.username || item.sellerName,
          category: item.category || 'other',
          verified: item.verified
        }));
        
        setProducts(processedProducts);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(product => product.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome to ChainBazzar</span>
              <span className="block text-indigo-200 text-3xl mt-3">Blockchain-Powered Marketplace</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your trusted marketplace for secure and transparent transactions
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="form-input py-3 px-4 block w-full rounded-md transition ease-in-out duration-150 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 pb-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (category === 'All' && !selectedCategory) || selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedCategory(category === 'All' ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
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
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id || ''}
                name={product.name}
                price={product.price}
                description={product.description}
                image={product.image}
                seller={typeof product.seller === 'string' ? product.seller : product.seller?.username}
                category={product.category}
                verified={product.verified}
                stock={product.stock}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-lg text-gray-600 mb-4">No products found</div>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm('');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* Featured Categories Section */}
      <section className="bg-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {['electronics', 'clothing', 'food', 'other'].map((category) => (
              <div 
                key={category}
                className="group relative bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${category === 'electronics' 
                      ? '1550009158-9ebf69173e03'
                      : category === 'clothing'
                      ? '1542060748-10c28b62716f'
                      : category === 'food'
                      ? '1498837167922-ddd27525d352'
                      : '1523381294911-8d3cead13475'
                    }?auto=format&fit=crop&w=500&q=60`}
                    alt={category}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 capitalize">
                    {category}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose ChainBazzar</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Verification</h3>
              <p className="text-gray-600">Products are verified on the blockchain, ensuring authenticity and transparency.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">All transactions are secure and protected by advanced encryption technology.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery options to get your products as soon as possible.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 
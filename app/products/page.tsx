'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('default');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

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
        
        // Set max price range based on products
        if (processedProducts.length > 0) {
          const maxPrice = Math.max(...processedProducts.map(product => product.price));
          setPriceRange([0, Math.ceil(maxPrice)]);
        }
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on all filters
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesVerified = !showVerifiedOnly || product.verified;
    
    return matchesCategory && matchesSearch && matchesPrice && matchesVerified;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-to-high':
        return a.price - b.price;
      case 'price-high-to-low':
        return b.price - a.price;
      case 'name-a-to-z':
        return a.name.localeCompare(b.name);
      case 'name-z-to-a':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(product => product.category)))];

  // Get unique sellers from products
  const sellers = Array.from(new Set(products.map(product => product.seller)));

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseFloat(e.target.value);
    setPriceRange(newPriceRange as [number, number]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Explore Products
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg">
            Find authenticated and verified products from trusted sellers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        id={`category-${category}`}
                        type="radio"
                        name="category"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        checked={(category === 'All' && !selectedCategory) || selectedCategory === category}
                        onChange={() => setSelectedCategory(category === 'All' ? null : category)}
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(100, Math.ceil(Math.max(...products.map(p => p.price))))}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Verified Filter */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="verified-only"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  />
                  <label htmlFor="verified-only" className="ml-2 text-sm text-gray-700">
                    Verified products only
                  </label>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="mb-6">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  id="sort"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Recommended</option>
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="name-a-to-z">Name: A to Z</option>
                  <option value="name-z-to-a">Name: Z to A</option>
                </select>
              </div>
              
              {/* Reset Filters Button */}
              <button
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                  setPriceRange([0, Math.ceil(Math.max(...products.map(p => p.price)))]);
                  setSortBy('default');
                  setShowVerifiedOnly(false);
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
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
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedProducts.map((product) => (
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
                
                {sortedProducts.length === 0 && (
                  <div className="flex flex-col justify-center items-center h-64">
                    <div className="text-lg text-gray-600 mb-4">No products found matching your filters</div>
                    <button 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchTerm('');
                        setPriceRange([0, Math.ceil(Math.max(...products.map(p => p.price)))]);
                        setSortBy('default');
                        setShowVerifiedOnly(false);
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 
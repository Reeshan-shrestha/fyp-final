'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../hooks/useCart';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  ipfsCid?: string;
  ipfsUrl?: string;
  seller?: string;
  category?: string;
  verified?: boolean;
  stock?: number;
}

// Helper function to truncate description
const truncateDescription = (text: string, maxLength: number = 60) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function ProductCard({ 
  id, 
  name, 
  price, 
  description, 
  image, 
  ipfsCid,
  ipfsUrl,
  seller, 
  category, 
  verified, 
  stock 
}: ProductProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id,
      name,
      price,
      image,
      seller,
      stock
    });

    // Could show a toast notification here
  };

  // Function to navigate to product detail page
  const navigateToDetail = () => {
    router.push(`/product/${id}`);
  };

  return (
    <div 
      className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-transform duration-300 cursor-pointer ${
        isHovered ? 'transform scale-[1.02] shadow-md' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={navigateToDetail}
    >
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : ipfsUrl ? (
          <img
            src={ipfsUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}

        {verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Verified
          </div>
        )}

        {ipfsCid && (
          <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
            IPFS
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
          <p className="text-lg font-bold text-indigo-600">${price.toFixed(2)}</p>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">{truncateDescription(description)}</p>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-500">
            {seller && (
              <div className="flex items-center">
                <span>Seller: {seller}</span>
                {verified && <span className="ml-1 text-green-500">✓</span>}
              </div>
            )}
            {stock !== undefined && (
              <div className={`text-xs ${stock < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                {stock} in stock
              </div>
            )}
          </div>
          
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
              isHovered 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-100 text-indigo-700'
            }`}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 
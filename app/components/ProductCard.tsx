'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [imageError, setImageError] = useState(false);

  // Category-specific fallbacks using professional Unsplash photos
  const categoryFallbacks: Record<string, string> = {
    'electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=500&q=60',
    'clothing': 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=500&q=60',
    'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=60',
    'other': 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60'
  };

  const fallbackImage = category && category in categoryFallbacks 
    ? categoryFallbacks[category] 
    : 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60';

  const handleImageError = () => {
    setImageError(true);
  };

  // Determine which image to display with IPFS support
  const getImageUrl = () => {
    if (imageError) return fallbackImage;
    
    // If we have an IPFS URL that's not in ipfs:// protocol format, use it directly
    if (image && image.includes('/ipfs/')) return image;
    
    // If we have an IPFS CID, convert it to a gateway URL
    if (ipfsCid) return `https://ipfs.io/ipfs/${ipfsCid}`;
    
    // Otherwise use the provided image URL or fallback
    return image || fallbackImage;
  };

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // IPFS badge to show when content is on IPFS
  const IpfsBadge = () => {
    if (!ipfsCid) return null;
    
    return (
      <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 19h20L12 2zm0 4l7 11H5l7-11z" />
        </svg>
        IPFS
      </div>
    );
  };

  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`}>
        <div className="relative h-64 overflow-hidden">
          <img
            src={getImageUrl()}
            alt={name}
            className={`w-full h-full object-cover transform transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onError={handleImageError}
          />
          {verified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Verified
            </div>
          )}
          {stock && stock < 5 && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Low stock
            </div>
          )}
          <IpfsBadge />
        </div>
      </Link>

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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to cart functionality
              alert('Adding to cart will be implemented soon!');
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 
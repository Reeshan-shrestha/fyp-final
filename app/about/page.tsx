'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            About ChainBazzar
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transforming e-commerce with blockchain technology
          </p>
        </div>
      </div>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At ChainBazzar, we're on a mission to revolutionize online shopping by combining the 
                convenience of e-commerce with the security and transparency of blockchain technology.
              </p>
              <p className="text-gray-600 mb-4">
                We believe that by leveraging blockchain, we can create a marketplace where buyers 
                can trust the authenticity of products, and sellers can reach customers without 
                exorbitant fees.
              </p>
              <p className="text-gray-600">
                Our platform ensures every transaction is secure, verifiable, and transparent, 
                giving you peace of mind with every purchase.
              </p>
            </div>
            <div className="relative h-96 overflow-hidden rounded-lg shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80" 
                alt="Blockchain technology" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Blockchain for E-commerce?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Product Authenticity</h3>
              <p className="text-gray-600">
                With blockchain verification, you can be sure that the products you purchase are authentic and 
                not counterfeit. Every product's journey from manufacturer to your doorstep is recorded and verifiable.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Transactions</h3>
              <p className="text-gray-600">
                Blockchain technology ensures that all transactions are secure and immutable. Your payment information 
                is protected, and the transaction records cannot be altered once completed.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Fair Trade</h3>
              <p className="text-gray-600">
                Blockchain's transparency allows for fair trade practices. Buyers and sellers can see the entire 
                supply chain, ensuring ethical sourcing and fair pricing for all parties involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How ChainBazzar Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600">
                Explore our marketplace for a wide range of verified products from trusted sellers.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Purchase Securely</h3>
              <p className="text-gray-600">
                Make your purchase using secure payment methods, with each transaction recorded on the blockchain.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Verify Authenticity</h3>
              <p className="text-gray-600">
                Check your product's blockchain verification to ensure its authenticity and origin.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2">Receive Your Items</h3>
              <p className="text-gray-600">
                Get your products delivered to your doorstep with the assurance of quality and authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80"
                  alt="Team Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">John Doe</h3>
                <p className="text-indigo-600 mb-3">Founder & CEO</p>
                <p className="text-gray-600">
                  With over 10 years in blockchain technology, John leads our vision for a transparent marketplace.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"
                  alt="Team Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Alex Smith</h3>
                <p className="text-indigo-600 mb-3">CTO</p>
                <p className="text-gray-600">
                  Alex brings extensive experience in blockchain development and security to our platform.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                  alt="Team Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Sarah Johnson</h3>
                <p className="text-indigo-600 mb-3">Head of Operations</p>
                <p className="text-gray-600">
                  Sarah ensures our marketplace runs smoothly, focusing on seller and buyer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:py-16 md:px-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Join the ChainBazzar Community
              </h2>
              <p className="text-indigo-100 mb-8 max-w-3xl mx-auto">
                Be part of the future of e-commerce. Whether you're a buyer looking for authentic products or a seller 
                wanting to reach a broader audience, ChainBazzar has something for you.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <a href="/register" className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Sign Up Today
                </a>
                <a href="#" className="inline-block px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-indigo-500 transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 
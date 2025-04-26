'use client';

import BlockchainDashboard from './dashboard/page';

const BlockchainPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Blockchain Analytics</h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore real-time blockchain transactions and activity on ChainBazzar
        </p>
      </div>
      
      <BlockchainDashboard />
    </div>
  );
};

export default BlockchainPage; 
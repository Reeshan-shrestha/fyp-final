import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BlockchainStats {
  totalTransactions: number;
  verifiedTransactions: number;
  pendingTransactions: number;
  uniqueWallets: number;
}

interface DailyStats {
  name: string;
  transactions: number;
  verified: number;
}

interface Transaction {
  id: string;
  type: string;
  walletAddress: string;
  timestamp: string;
  amount: string;
  status: string;
  blockNumber: number | null;
}

class BlockchainService {
  async getBlockchainStats(): Promise<BlockchainStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
      // Return default values if API fails
      return {
        totalTransactions: 0,
        verifiedTransactions: 0,
        pendingTransactions: 0,
        uniqueWallets: 0
      };
    }
  }

  async getDailyStats(): Promise<DailyStats[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/daily-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      // Return empty array if API fails
      return [];
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/transactions`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return empty array if API fails
      return [];
    }
  }

  // Function to get Etherscan URL for a transaction
  getEtherscanUrl(txHash: string, network: string = 'mainnet'): string {
    const baseUrl = network === 'mainnet' 
      ? 'https://etherscan.io' 
      : `https://${network}.etherscan.io`;
    
    return `${baseUrl}/tx/${txHash}`;
  }
}

// Create a singleton instance
const blockchainService = new BlockchainService();
export default blockchainService; 
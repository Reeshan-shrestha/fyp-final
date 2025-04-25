import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BlockchainStats {
  totalTransactions: number;
  verifiedTransactions: number;
  pendingTransactions: number;
  uniqueWallets: number;
  avgTransactionValue: number;
  totalGasUsed: number;
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
  gasUsed?: string;
  gasPrice?: string;
}

interface NetworkInfo {
  name: string;
  currentGasPrice: string;
  blockHeight: number;
  networkHashrate?: string;
  difficulty?: string;
}

interface TransactionType {
  name: string;
  value: number;
}

interface TimeBasedStat {
  hour: string;
  transactions: number;
  gasPrice: number;
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
        uniqueWallets: 0,
        avgTransactionValue: 0,
        totalGasUsed: 0
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

  async getNetworkInfo(network: string = 'mainnet'): Promise<NetworkInfo> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/network-info`, {
        params: { network }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching network info:', error);
      // Return default values if API fails
      return {
        name: network === 'mainnet' ? 'Ethereum Mainnet' : `Ethereum ${network.charAt(0).toUpperCase() + network.slice(1)}`,
        currentGasPrice: '0 Gwei',
        blockHeight: 0,
        networkHashrate: '0',
        difficulty: '0'
      };
    }
  }

  async getTransactionTypeBreakdown(): Promise<TransactionType[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/transaction-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction types:', error);
      // Return empty array if API fails
      return [];
    }
  }

  async getTimeBasedAnalytics(): Promise<TimeBasedStat[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/time-analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time-based analytics:', error);
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
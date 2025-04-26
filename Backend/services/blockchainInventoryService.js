const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Contract ABI and address
// In a production environment, these would be compiled and deployed separately
// For this implementation, we'll assume the contract is already deployed
const CONTRACT_ADDRESS = process.env.INVENTORY_CONTRACT_ADDRESS || '0x123456789abcdef123456789abcdef123456789';
const CONTRACT_ABI_PATH = path.join(__dirname, '../contracts/compiled/InventoryContract.json');

// Initialize Web3
let web3;
let inventoryContract;

// Read contract ABI
let contractABI;
try {
  // Check if the compiled contract exists
  if (fs.existsSync(CONTRACT_ABI_PATH)) {
    const compiledContract = JSON.parse(fs.readFileSync(CONTRACT_ABI_PATH, 'utf8'));
    contractABI = compiledContract.abi;
  } else {
    // If no compiled contract exists yet, use a placeholder ABI
    // This should be replaced with the actual ABI after contract compilation
    contractABI = [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "productId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "initialStock",
            "type": "uint256"
          }
        ],
        "name": "addProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "productId",
            "type": "string"
          }
        ],
        "name": "getStock",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "productId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "reserveStock",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "productId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "newStockCount",
            "type": "uint256"
          }
        ],
        "name": "updateStock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
  }
} catch (error) {
  console.error('Error loading contract ABI:', error);
  // Fallback to empty ABI
  contractABI = [];
}

// Initialize the blockchain connection
const initializeBlockchain = async () => {
  try {
    // Check if web3 provider is specified
    const provider = process.env.WEB3_PROVIDER || 'http://localhost:8545';
    web3 = new Web3(provider);
    
    // Create contract instance
    inventoryContract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
    
    // Test connection
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    
    console.log(`Connected to blockchain network ID: ${networkId}`);
    console.log(`Default account: ${accounts[0]}`);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize blockchain connection:', error);
    return false;
  }
};

// Check if blockchain is connected
const isConnected = async () => {
  try {
    if (!web3) {
      await initializeBlockchain();
    }
    return web3.eth.net.isListening();
  } catch (error) {
    console.error('Blockchain connection error:', error);
    return false;
  }
};

// Get default account (admin account)
const getDefaultAccount = async () => {
  try {
    if (!web3) {
      await initializeBlockchain();
    }
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  } catch (error) {
    console.error('Error getting default account:', error);
    return null;
  }
};

// Add product to blockchain inventory
const addProductToBlockchain = async (productId, name, initialStock) => {
  try {
    if (!web3 || !inventoryContract) {
      await initializeBlockchain();
    }
    
    const accounts = await web3.eth.getAccounts();
    const gasEstimate = await inventoryContract.methods
      .addProduct(productId, name, initialStock)
      .estimateGas({ from: accounts[0] });
    
    const result = await inventoryContract.methods
      .addProduct(productId, name, initialStock)
      .send({
        from: accounts[0],
        gas: Math.floor(gasEstimate * 1.1) // Add 10% more gas as buffer
      });
    
    console.log(`Product ${productId} added to blockchain inventory. Transaction hash: ${result.transactionHash}`);
    return {
      success: true,
      transactionHash: result.transactionHash
    };
  } catch (error) {
    console.error(`Error adding product ${productId} to blockchain:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update product stock on blockchain
const updateProductStock = async (productId, newStockCount) => {
  try {
    if (!web3 || !inventoryContract) {
      await initializeBlockchain();
    }
    
    const accounts = await web3.eth.getAccounts();
    const gasEstimate = await inventoryContract.methods
      .updateStock(productId, newStockCount)
      .estimateGas({ from: accounts[0] });
    
    const result = await inventoryContract.methods
      .updateStock(productId, newStockCount)
      .send({
        from: accounts[0],
        gas: Math.floor(gasEstimate * 1.1)
      });
    
    console.log(`Stock updated for product ${productId}. New stock: ${newStockCount}. Transaction hash: ${result.transactionHash}`);
    return {
      success: true,
      transactionHash: result.transactionHash,
      newStock: newStockCount
    };
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Reserve stock during checkout
const reserveProductStock = async (productId, quantity) => {
  try {
    if (!web3 || !inventoryContract) {
      await initializeBlockchain();
    }
    
    const accounts = await web3.eth.getAccounts();
    const gasEstimate = await inventoryContract.methods
      .reserveStock(productId, quantity)
      .estimateGas({ from: accounts[0] });
    
    const result = await inventoryContract.methods
      .reserveStock(productId, quantity)
      .send({
        from: accounts[0],
        gas: Math.floor(gasEstimate * 1.1)
      });
    
    console.log(`Reserved ${quantity} units of product ${productId}. Transaction hash: ${result.transactionHash}`);
    return {
      success: true,
      transactionHash: result.transactionHash,
      quantity: quantity
    };
  } catch (error) {
    console.error(`Error reserving stock for product ${productId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get current stock from blockchain
const getProductStock = async (productId) => {
  try {
    if (!web3 || !inventoryContract) {
      await initializeBlockchain();
    }
    
    const stock = await inventoryContract.methods
      .getStock(productId)
      .call();
    
    return {
      success: true,
      stock: parseInt(stock)
    };
  } catch (error) {
    console.error(`Error getting stock for product ${productId}:`, error);
    return {
      success: false,
      error: error.message,
      stock: 0
    };
  }
};

// Initialize blockchain on module load
initializeBlockchain().then(success => {
  if (success) {
    console.log('Blockchain inventory service initialized successfully');
  } else {
    console.warn('Blockchain inventory service initialization failed');
  }
});

module.exports = {
  initializeBlockchain,
  isConnected,
  addProductToBlockchain,
  updateProductStock,
  reserveProductStock,
  getProductStock,
  getDefaultAccount
}; 
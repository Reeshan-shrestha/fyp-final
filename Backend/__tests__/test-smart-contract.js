const { ethers } = require('ethers');
const SmartContractWrapper = require('../services/SmartContractWrapper');

// Mock contract address
const MOCK_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const MOCK_PRODUCT_ID = '123';
const MOCK_BUYER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44f';

// Mock deployment transaction
const mockDeploymentTransaction = {
  hash: '0xmocktxhash',
  from: MOCK_WALLET_ADDRESS,
  nonce: ethers.BigNumber.from('0'),
  gasLimit: ethers.BigNumber.from('3000000'),
  gasPrice: ethers.BigNumber.from('1000000000'),
  data: '0x',
  value: ethers.BigNumber.from('0'),
  chainId: 1,
  creates: MOCK_CONTRACT_ADDRESS,
  wait: jest.fn().mockResolvedValue({ status: 1, contractAddress: MOCK_CONTRACT_ADDRESS })
};

// Mock transaction for regular contract calls
const mockTransaction = {
  hash: '0xmocktxhash',
  from: MOCK_WALLET_ADDRESS,
  to: MOCK_CONTRACT_ADDRESS,
  nonce: ethers.BigNumber.from('0'),
  gasLimit: ethers.BigNumber.from('3000000'),
  gasPrice: ethers.BigNumber.from('1000000000'),
  data: '0x',
  value: ethers.BigNumber.from('0'),
  chainId: 1,
  wait: jest.fn().mockResolvedValue({ status: 1 })
};

// Mock provider with event handling and name resolution
const mockProvider = {
  getSigner: jest.fn(() => mockSigner),
  on: jest.fn(),
  removeListener: jest.fn(),
  listenerCount: jest.fn(),
  listeners: jest.fn(),
  off: jest.fn(),
  removeAllListeners: jest.fn(),
  getNetwork: jest.fn(() => Promise.resolve({ chainId: 1 })),
  getCode: jest.fn(() => Promise.resolve('0x')),
  resolveName: jest.fn((name) => Promise.resolve(name)),
  waitForTransaction: jest.fn(() => Promise.resolve({ status: 1 })),
  _events: [],
  _eventsCount: 0,
  _maxListeners: 0,
  formatter: {
    formats: []
  },
  lookupAddress: jest.fn((address) => Promise.resolve(null)),
  getResolver: jest.fn(() => ({
    resolveName: jest.fn((name) => Promise.resolve(MOCK_CONTRACT_ADDRESS))
  }))
};

// Mock signer
const mockSigner = {
  getAddress: jest.fn(() => Promise.resolve(MOCK_WALLET_ADDRESS)),
  signMessage: jest.fn(),
  sendTransaction: jest.fn((tx) => {
    const transaction = {
      ...tx,
      from: MOCK_WALLET_ADDRESS,
      value: ethers.BigNumber.from(tx.value || '0'),
      nonce: ethers.BigNumber.from(tx.nonce || '0'),
      gasLimit: ethers.BigNumber.from(tx.gasLimit || '3000000'),
      gasPrice: ethers.BigNumber.from(tx.gasPrice || '1000000000'),
      wait: jest.fn().mockResolvedValue({ status: 1 })
    };
    return Promise.resolve(transaction);
  }),
  connect: jest.fn(),
  _isSigner: true,
  provider: mockProvider
};

// Mock deployed contract instance
const mockDeployedContract = {
  address: MOCK_CONTRACT_ADDRESS,
  deployTransaction: mockDeploymentTransaction,
  provider: mockProvider,
  signer: mockSigner,
  filters: {},
  purchase: jest.fn().mockImplementation((productId, buyer) => {
    if (mockDeployedContract.listeners('Purchase').length > 0) {
      mockDeployedContract.listeners('Purchase')[0]({
        productId,
        buyer,
        event: 'Purchase'
      });
    }
    return Promise.resolve(mockTransaction);
  }),
  on: jest.fn().mockImplementation((eventName, listener) => {
    mockDeployedContract._listeners = mockDeployedContract._listeners || {};
    mockDeployedContract._listeners[eventName] = mockDeployedContract._listeners[eventName] || [];
    mockDeployedContract._listeners[eventName].push(listener);
    return mockDeployedContract;
  }),
  listeners: jest.fn().mockImplementation((eventName) => {
    return (mockDeployedContract._listeners && mockDeployedContract._listeners[eventName]) || [];
  }),
  removeListener: jest.fn().mockImplementation((eventName, listener) => {
    if (mockDeployedContract._listeners && mockDeployedContract._listeners[eventName]) {
      mockDeployedContract._listeners[eventName] = mockDeployedContract._listeners[eventName].filter(l => l !== listener);
    }
    return mockDeployedContract;
  }),
  interface: {
    events: {
      Purchase: {
        name: 'Purchase',
        anonymous: false,
        inputs: [
          { name: 'productId', type: 'string', indexed: true },
          { name: 'buyer', type: 'address', indexed: true }
        ]
      }
    },
    fragments: [],
    _abiCoder: { encode: jest.fn(), decode: jest.fn() },
    deploy: {
      inputs: []
    }
  },
  functions: {},
  callStatic: {},
  estimateGas: {},
  populateTransaction: {},
  resolvedAddress: Promise.resolve(MOCK_CONTRACT_ADDRESS)
};

// Mock contract factory
const mockContractFactory = {
  deploy: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      ...mockDeployedContract,
      address: MOCK_CONTRACT_ADDRESS,
      deployTransaction: {
        ...mockDeploymentTransaction,
        wait: jest.fn().mockResolvedValue({
          status: 1,
          contractAddress: MOCK_CONTRACT_ADDRESS,
          events: []
        })
      }
    });
  }),
  getDeployTransaction: jest.fn().mockImplementation(() => {
    return mockDeploymentTransaction;
  }),
  interface: mockDeployedContract.interface,
  bytecode: '0x',
  signer: mockSigner,
  connect: jest.fn().mockReturnThis()
};

// Mock ethers
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ...original,
    Contract: jest.fn().mockImplementation(() => mockDeployedContract),
    ContractFactory: jest.fn().mockImplementation(() => mockContractFactory),
    providers: {
      ...original.providers,
      JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider)
    }
  };
});

describe('Smart Contract Deployment', () => {
  let smartContractWrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    smartContractWrapper = new SmartContractWrapper(mockProvider);
  });

  test('should deploy contract and return valid address', async () => {
    const contractAddress = await smartContractWrapper.deploy();
    expect(contractAddress).toBe(MOCK_CONTRACT_ADDRESS);
    expect(mockContractFactory.deploy).toHaveBeenCalled();
  });

  test('should handle deployment failure gracefully', async () => {
    const error = new Error('Deployment failed');
    mockContractFactory.deploy.mockRejectedValueOnce(error);
    await expect(smartContractWrapper.deploy()).rejects.toThrow(error);
  });

  test('should initialize contract with correct parameters', async () => {
    const contract = await smartContractWrapper.getContract(MOCK_CONTRACT_ADDRESS);
    expect(contract.address).toBe(MOCK_CONTRACT_ADDRESS);
    expect(mockProvider.getSigner).toHaveBeenCalled();
  });

  test('should emit Purchase event with correct parameters', async () => {
    const contract = await smartContractWrapper.getContract(MOCK_CONTRACT_ADDRESS);
    
    const eventPromise = new Promise((resolve) => {
      contract.on('Purchase', (event) => {
        resolve(event);
      });
    });

    await contract.purchase(MOCK_PRODUCT_ID, MOCK_BUYER_ADDRESS);
    const event = await eventPromise;

    expect(event.productId).toBe(MOCK_PRODUCT_ID);
    expect(event.buyer).toBe(MOCK_BUYER_ADDRESS);
    expect(event.event).toBe('Purchase');

    contract.removeListener('Purchase', eventPromise);
  });
}); 
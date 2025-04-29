const { Buffer } = require('buffer');
const ipfsService = require('../services/ipfsService');

// Mock the IPFS client
jest.mock('ipfs-http-client', () => ({
  create: () => ({
    add: ({ path, content }) => {
      if (!content) return Promise.resolve(null);
      return Promise.resolve({
        cid: {
          toString: () => 'QmTest123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL'
        }
      });
    }
  })
}));

// Mock node-fetch
jest.mock('node-fetch');

describe('IPFS Service', () => {
  let fetch;

  beforeAll(() => {
    // Reset environment variables
    process.env.IPFS_PROJECT_ID = 'test-project-id';
    process.env.IPFS_PROJECT_SECRET = 'test-project-secret';
    process.env.IPFS_API_URL = 'https://ipfs.infura.io:5001';
    
    // Set up fetch mock
    fetch = require('node-fetch');
    fetch.mockImplementation((url) => {
      if (url === 'https://example.com/test-image.jpg') {
        return Promise.reject(new Error('Failed to fetch image: Not Found'));
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3, 4]).buffer)
      });
    });

    // Re-initialize IPFS service
    ipfsService.isIPFSAvailable();
  });

  test('should upload file buffer and return valid IPFS hash', async () => {
    // Create a sample file buffer
    const content = 'Hello, this is a test file content';
    const fileBuffer = Buffer.from(content);
    const fileName = 'test.txt';

    // Upload the file buffer to IPFS
    const result = await ipfsService.uploadToIPFS(fileBuffer, fileName);

    // Verify the result
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
    expect(result).toBe('QmTest123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL');
  });

  test('should handle file upload from path', async () => {
    // Create a temporary test file
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, 'temp');
    const filePath = path.join(tempDir, 'test-upload.txt');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Create test file
    const content = 'Test content for file upload';
    fs.writeFileSync(filePath, content);

    try {
      // Upload the file
      const result = await ipfsService.uploadFileFromPath(filePath);

      // Verify the result
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result).toBe('QmTest123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL');
    } finally {
      // Clean up
      fs.unlinkSync(filePath);
      fs.rmdirSync(tempDir);
    }
  });

  test('should convert HTTP URL to IPFS', async () => {
    const testUrl = 'https://example.com/test-image.jpg';
    const result = await ipfsService.convertUrlToIPFS(testUrl);

    // Since the fetch will fail for our test URL, it should return the original URL
    expect(result).toBe(testUrl);

    // Test with a valid URL
    const validUrl = 'https://example.com/valid-image.jpg';
    const validResult = await ipfsService.convertUrlToIPFS(validUrl);
    expect(validResult).toBe('QmTest123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL');
  });

  test('should generate correct IPFS URL', () => {
    const testCid = 'QmTest123';
    const url = ipfsService.getIPFSUrl(testCid);
    
    expect(url).toBeDefined();
    expect(url).toBe('https://ipfs.infura.io:5001/QmTest123');
  });

  test('should handle null/undefined inputs gracefully', async () => {
    // Test with null/undefined file buffer
    const result1 = await ipfsService.uploadToIPFS(null, 'test.txt');
    expect(result1).toBeNull();

    const result2 = await ipfsService.uploadToIPFS(undefined, 'test.txt');
    expect(result2).toBeNull();

    // Test with null/undefined CID for URL generation
    const url1 = ipfsService.getIPFSUrl(null);
    expect(url1).toBeNull();

    const url2 = ipfsService.getIPFSUrl(undefined);
    expect(url2).toBeNull();
  });
}); 
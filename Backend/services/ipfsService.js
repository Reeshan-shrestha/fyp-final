/**
 * Service for handling IPFS interactions in ChainBazzar
 * 
 * This service provides methods to upload images to IPFS 
 * and retrieve them using their CIDs.
 */

const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

// Get the IPFS configuration from environment variables
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET;
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

// Set up authentication for Infura IPFS
const auth = INFURA_PROJECT_ID && INFURA_PROJECT_SECRET
  ? 'Basic ' + Buffer.from(INFURA_PROJECT_ID + ':' + INFURA_PROJECT_SECRET).toString('base64')
  : '';

// Create IPFS client if credentials are available, otherwise initialize as null
let ipfs = null;

try {
  if (INFURA_PROJECT_ID && INFURA_PROJECT_SECRET) {
    ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    });
    console.log('IPFS client initialized successfully');
  } else {
    console.warn('IPFS credentials not found in environment variables. Some features may be limited.');
  }
} catch (error) {
  console.error('Error initializing IPFS client:', error);
}

/**
 * Upload a file to IPFS
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @returns {Promise<string>} - The IPFS CID
 */
async function uploadToIPFS(fileBuffer, fileName) {
  if (!ipfs) {
    throw new Error('IPFS client not initialized. Check your INFURA credentials.');
  }

  try {
    // Add file to IPFS
    const { cid } = await ipfs.add({
      path: fileName,
      content: fileBuffer
    }, {
      progress: (prog) => console.log(`IPFS upload progress: ${prog}`)
    });

    console.log(`File uploaded to IPFS with CID: ${cid.toString()}`);
    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}

/**
 * Upload a file from a local path to IPFS
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string>} - The IPFS CID
 */
async function uploadFileFromPath(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    return await uploadToIPFS(fileBuffer, fileName);
  } catch (error) {
    console.error('Error reading file for IPFS upload:', error);
    throw new Error(`Failed to read file for IPFS upload: ${error.message}`);
  }
}

/**
 * Get the full IPFS URL for a CID
 * @param {string} cid - The IPFS CID
 * @returns {string} - The full IPFS URL
 */
function getIPFSUrl(cid) {
  if (!cid) return null;
  
  // Remove 'ipfs://' prefix if present
  const cleanCid = cid.replace(/^ipfs:\/\//, '');
  return `${IPFS_GATEWAY}${cleanCid}`;
}

/**
 * Convert a regular HTTP URL to IPFS if possible
 * @param {string} url - The URL to convert
 * @returns {Promise<string>} - The IPFS CID or original URL if conversion failed
 */
async function convertUrlToIPFS(url) {
  if (!url || !ipfs) return url;
  
  try {
    // Check if already an IPFS URL
    if (url.includes('/ipfs/') || url.startsWith('ipfs://')) {
      return url;
    }
    
    // Fetch the image from the URL
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    const fileName = path.basename(url.split('?')[0]); // Remove query params
    
    // Upload to IPFS
    const cid = await uploadToIPFS(Buffer.from(buffer), fileName);
    return cid;
  } catch (error) {
    console.error('Error converting URL to IPFS:', error);
    return url; // Return original URL if conversion fails
  }
}

/**
 * Check if IPFS service is properly configured
 * @returns {boolean} - Whether IPFS is available
 */
function isIPFSAvailable() {
  return !!ipfs;
}

module.exports = {
  uploadToIPFS,
  uploadFileFromPath,
  getIPFSUrl,
  convertUrlToIPFS,
  isIPFSAvailable
}; 
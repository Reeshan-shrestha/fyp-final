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

// Load environment variables
dotenv.config();

// IPFS configuration
const IPFS_PROJECT_ID = process.env.IPFS_PROJECT_ID;
const IPFS_PROJECT_SECRET = process.env.IPFS_PROJECT_SECRET;
const IPFS_API_URL = process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001';

// Flag to track if IPFS is available
let ipfsAvailable = false;
let ipfs = null;

// Initialize IPFS client if credentials are available
const initializeIpfs = () => {
  try {
    if (!IPFS_PROJECT_ID || !IPFS_PROJECT_SECRET) {
      console.warn('IPFS credentials not found in environment variables. IPFS features will be disabled.');
      return false;
    }

    const auth = 'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64');

    ipfs = create({
      host: IPFS_API_URL.replace(/^https?:\/\//, '').split(':')[0],
      port: IPFS_API_URL.includes(':') ? parseInt(IPFS_API_URL.split(':').pop()) : 5001,
      protocol: IPFS_API_URL.startsWith('https') ? 'https' : 'http',
      headers: {
        authorization: auth,
      },
    });

    ipfsAvailable = true;
    console.log('IPFS client initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing IPFS client:', error);
    ipfsAvailable = false;
    return false;
  }
};

/**
 * Upload a file to IPFS
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @returns {Promise<string>} - The IPFS CID
 */
async function uploadToIPFS(fileBuffer, fileName) {
  if (!ipfsAvailable && !initializeIpfs()) {
    console.warn('IPFS not available. Skipping upload.');
    return null;
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
    return null;
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
  return `${IPFS_API_URL}/${cleanCid}`;
}

/**
 * Convert a regular HTTP URL to IPFS if possible
 * @param {string} url - The URL to convert
 * @returns {Promise<string>} - The IPFS CID or original URL if conversion failed
 */
async function convertUrlToIPFS(url) {
  if (!ipfsAvailable && !initializeIpfs()) {
    return url; // Return original URL if IPFS is not available
  }
  
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
  if (!ipfsAvailable) {
    initializeIpfs();
  }
  return ipfsAvailable;
}

// Initialize IPFS on module load
initializeIpfs();

module.exports = {
  uploadToIPFS,
  uploadFileFromPath,
  getIPFSUrl,
  convertUrlToIPFS,
  isIPFSAvailable
}; 
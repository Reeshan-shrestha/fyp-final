/**
 * Middleware to handle file uploads to IPFS
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToIPFS } = require('../services/ipfsService');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename including the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Middleware to upload a file to IPFS
 * It first saves the file locally using multer, then uploads to IPFS
 * Adds ipfsCid to the request body
 */
const uploadToIpfsMiddleware = (fieldName = 'image') => {
  return [
    // First use multer to handle the file upload
    upload.single(fieldName),
    
    // Then process the uploaded file and upload to IPFS
    async (req, res, next) => {
      try {
        // If no file was uploaded, continue without IPFS
        if (!req.file) {
          return next();
        }
        
        const filePath = req.file.path;
        
        // Read the file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Upload to IPFS
        const cid = await uploadToIPFS(fileBuffer, req.file.originalname);
        
        // Add IPFS CID to the request body
        req.body.ipfsCid = cid;
        
        // Also provide the IPFS gateway URL
        req.body.ipfsUrl = `ipfs://${cid}`;
        
        // Clean up the temporary file
        fs.unlinkSync(filePath);
        
        // Continue to the next middleware or route handler
        next();
      } catch (error) {
        console.error('Error processing file upload to IPFS:', error);
        // Clean up the temporary file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({ 
          error: 'Error uploading file to IPFS',
          details: error.message 
        });
      }
    }
  ];
};

module.exports = { uploadToIpfsMiddleware }; 
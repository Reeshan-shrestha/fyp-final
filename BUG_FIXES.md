# Bug Fixes for ChainBazzar Project

This document outlines the bugs that have been fixed in the ChainBazzar project.

## Issues Fixed

1. **Server.js Structure Issue**
   - Problem: The `server.js` file in the Backend directory was incomplete, only containing route imports without proper Express initialization.
   - Solution: Restructured `server.js` to properly initialize Express, apply middleware, and start the server.

2. **Web3 Constructor Error**
   - Problem: The blockchain inventory service was using an outdated Web3 import syntax (`const Web3 = require('web3')`) which is incompatible with Web3.js v4.
   - Solution: Updated the import to use the correct syntax for Web3.js v4: `const { Web3 } = require('web3')`.

3. **IPFS Credentials Handling**
   - Problem: The application was failing when IPFS credentials were not available in environment variables.
   - Solution: Enhanced the IPFS service to gracefully handle missing credentials and provide fallback functionality.

4. **Blockchain Service Resilience**
   - Problem: The blockchain inventory service would fail completely if the blockchain connection wasn't available.
   - Solution: Added mock functionality to allow the application to run even when the blockchain connection is unavailable, with graceful degradation.

## New Helper Scripts

1. **startproject.sh**
   - A comprehensive startup script that:
     - Creates a `.env` file in the Backend directory if missing
     - Checks and installs dependencies if needed
     - Starts both frontend and backend servers

2. **update-dependencies.sh**
   - Updates the Web3.js package to a compatible version (4.1.1)
   - Ensures all dependencies are correctly installed

## How to Use

1. To start the project with all fixes applied:
   ```
   ./startproject.sh
   ```

2. If you encounter issues with Web3 compatibility:
   ```
   ./update-dependencies.sh
   ```

3. To run only the backend server:
   ```
   cd Backend
   node index.js
   ```

4. To run only the frontend:
   ```
   npm run dev
   ```

## Environment Configuration

For the blockchain and IPFS functionality to work properly, you need to set up the following environment variables in the Backend/.env file:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chainbazzar

# IPFS Configuration
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
IPFS_API_URL=https://ipfs.infura.io:5001

# Blockchain Configuration
WEB3_PROVIDER=http://localhost:8545
INVENTORY_CONTRACT_ADDRESS=your_contract_address

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_here
TOKEN_EXPIRATION=24h

# Server Port
PORT=3006
```

Replace the placeholder values with your actual credentials. 
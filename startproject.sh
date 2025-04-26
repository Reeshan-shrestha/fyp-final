#!/bin/bash

echo "Starting ChainBazzar..."

# Check if .env file exists in Backend directory
if [ ! -f ./Backend/.env ]; then
  echo "Creating .env file in Backend directory..."
  cat > ./Backend/.env << EOF
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chainbazzar

# IPFS Configuration
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
IPFS_API_URL=https://ipfs.infura.io:5001

# Blockchain Configuration
WEB3_PROVIDER=http://localhost:8545
INVENTORY_CONTRACT_ADDRESS=0x123456789abcdef123456789abcdef123456789

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_here
TOKEN_EXPIRATION=24h

# Server Port
PORT=3006
EOF
  echo ".env file created. Please update with your actual credentials."
fi

# Check if node_modules are installed
if [ ! -d "./node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

if [ ! -d "./Backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd Backend && npm install && cd ..
fi

# Start the application using npm scripts
echo "Starting the application..."
npm run start:all

echo "ChainBazzar started successfully!" 
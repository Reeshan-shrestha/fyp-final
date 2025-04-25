#!/bin/bash

# Script to set up IPFS configuration for ChainBazzar

echo "Setting up IPFS configuration for ChainBazzar..."

# Check if .env file exists
if [ -f Backend/.env ]; then
  echo "Existing .env file found. Do you want to update it? (y/n)"
  read -r update_env
  if [ "$update_env" != "y" ]; then
    echo "Skipping .env update."
    exit 0
  fi
fi

# Prompt for Infura Project ID
echo "Please enter your Infura Project ID (or leave empty to skip IPFS setup):"
read -r infura_project_id

# Prompt for Infura Project Secret
echo "Please enter your Infura Project Secret (or leave empty to skip IPFS setup):"
read -r infura_project_secret

# Create or update .env file
cat > Backend/.env << EOF
# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/VerityDB

# JWT Secret
JWT_SECRET=ChainBazzarJWTSecretKey2024

# Port
PORT=3006

# IPFS Configuration (Infura)
INFURA_PROJECT_ID=$infura_project_id
INFURA_PROJECT_SECRET=$infura_project_secret
IPFS_GATEWAY=https://ipfs.io/ipfs/
EOF

echo "IPFS configuration saved to Backend/.env file."

# Create uploads directory if it doesn't exist
mkdir -p Backend/uploads
echo "Created uploads directory for temporary storage."

# Information on getting Infura credentials
if [ -z "$infura_project_id" ] || [ -z "$infura_project_secret" ]; then
  echo ""
  echo "============================================================"
  echo "NOTE: You did not provide Infura credentials."
  echo "To use IPFS features, you'll need to sign up at https://infura.io/"
  echo "and create a new IPFS project to get your credentials."
  echo ""
  echo "Once you have them, update the Backend/.env file manually."
  echo "============================================================"
fi

echo "Setup complete!"
echo "To migrate existing product images to IPFS, run:"
echo "node Backend/scripts/migrateImagesToIPFS.js" 
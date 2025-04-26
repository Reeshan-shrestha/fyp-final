#!/bin/bash

echo "Updating dependencies..."

# Navigate to Backend directory
cd Backend

# Update web3 package to latest compatible version
echo "Updating web3 package..."
npm uninstall web3
npm install web3@4.1.1

# Return to root directory
cd ..

echo "Dependencies updated successfully!" 
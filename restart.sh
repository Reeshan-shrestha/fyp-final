#!/bin/bash

# Kill all Node.js processes
echo "Killing all Node.js processes..."
pkill -f node

# Check if MongoDB is running, start if needed
if ! pgrep -x mongod > /dev/null; then
  echo "Starting MongoDB..."
  sudo mongod --config /opt/homebrew/etc/mongod.conf --fork
fi

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 2

# Start the backend in a new terminal window
echo "Starting backend..."
cd Backend/ChainBazzar-Server/backend
npm start &

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start the frontend in a new terminal window
echo "Starting frontend..."
cd ../../Frontend/ChainBazzar-Client
npm start &

echo "Services started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3005"
echo ""
echo "Test Login Credentials:"
echo "- Admin User: username=admin, password=admin123"
echo "- Regular User: username=testuser1, password=password123" 
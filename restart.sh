#!/bin/bash

# Kill all existing Node.js processes to ensure ports are free
echo "Stopping all Node.js processes..."
pkill -f node || echo "No Node.js processes found"
sleep 3

# Check if MongoDB is running, start if needed
if ! pgrep -x mongod > /dev/null; then
  echo "Starting MongoDB..."
  mongod --config /opt/homebrew/etc/mongod.conf --fork || echo "MongoDB may already be running"
fi

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 2

# Copy environment setup to Backend
echo "Setting up environment variables..."
cat env-setup.txt > Backend/.env

# Start the backend
echo "Starting backend..."
cd Backend
node index.js &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 7

# Check if backend actually started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "ERROR: Backend failed to start. Check logs for details."
  echo "You may need to manually kill any Node.js processes and try again."
  echo "Try: pkill -f node"
  exit 1
fi

# Start the React frontend
echo "Starting React frontend..."
cd ../Frontend
npm start &
FRONTEND_PID=$!

# Return to project root
cd ..

echo ""
echo "Services started!"
echo "React frontend: http://localhost:3000"
echo "Backend API: http://localhost:3006"
echo ""
echo "Services are running in the background with PIDs:"
echo "Backend: $BACKEND_PID"
echo "Frontend: $FRONTEND_PID"
echo ""
echo "To stop the services, run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Test Login Credentials:"
echo "- Admin User: username=admin, password=admin123"
echo "- Regular User: username=testuser1, password=password123" 
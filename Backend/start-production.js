const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Start the server with PM2 (if available) or Node
try {
  // Check if PM2 is installed
  exec('npx pm2 -v', (error) => {
    if (error) {
      console.log('Starting server with Node.js...');
      require('./index.js');
    } else {
      console.log('Starting server with PM2...');
      exec('npx pm2 start index.js --name chainbazzar-backend', (err, stdout) => {
        if (err) {
          console.error('Error starting with PM2:', err);
          // Fallback to regular Node
          require('./index.js');
        } else {
          console.log(stdout);
        }
      });
    }
  });
} catch (err) {
  console.error('Error starting server:', err);
  process.exit(1);
}

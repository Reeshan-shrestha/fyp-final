# ChainBazzar Deployment Instructions

## Frontend Deployment

The frontend has been built and is ready for deployment. The built files are in:
```
.next/
```

### Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Follow the Vercel deployment wizard

### Deploy to another hosting service

1. Copy the `.next/` folder to your host
2. Set up a Node.js server to serve the application
3. Use a process manager like PM2 to keep the application running

## Backend Deployment

The backend is ready for deployment. To start it in production:

```
cd Backend
node start-production.js
```

### Required Environment Variables

Make sure to set these in your hosting environment:

- MONGODB_URI: Connection string for MongoDB
- JWT_SECRET: Secret key for JWT tokens
- IPFS_PROJECT_ID: Your Infura/Pinata IPFS project ID
- IPFS_PROJECT_SECRET: Your Infura/Pinata IPFS project secret
- WEB3_PROVIDER: Ethereum network provider URL

## Database Setup

Ensure MongoDB is running and accessible from your server.

## HTTPS Configuration

For production, enable HTTPS using a reverse proxy like Nginx or a service 
like Cloudflare.

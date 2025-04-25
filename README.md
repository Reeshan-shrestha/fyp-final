# 🌐 ChainBazzar - Decentralized E-commerce Platform
ChainBazzar is a full-stack Web3-enabled e-commerce platform that combines traditional web technologies with blockchain features for secure, transparent, and decentralized shopping experiences. Built with **Next.js**, **Node.js**, **MongoDB**, and **Solidity**, it also uses **IPFS** for decentralized file storage and **MetaMask** for blockchain wallet integration.
---
## 🚀 Features
### ✅ Web Application
- Modern **Next.js** frontend with **Tailwind CSS**
- Component-based architecture with **TypeScript**
- MetaMask integration for wallet connection
- Secure authentication (bcrypt)
- Interactive, responsive UI/UX
### ✅ Blockchain Integration
- Ethereum smart contracts using **Solidity** & **OpenZeppelin**
- Web3.js for smart contract interaction
- MetaMask wallet integration
- File uploads via **IPFS**
### ✅ Backend API
- **Node.js** with **Express**
- MVC structure (`controllers`, `routes`, `models`, `middleware`, `services`)
- MongoDB database via **Mongoose**
- RESTful API for data handling and blockchain communication
---
## 🧱 Tech Stack

| Layer        | Tech Stack                                  |
|--------------|----------------------------------------------|
| Frontend     | Next.js, React, Tailwind CSS, TypeScript     |
| Backend      | Node.js, Express.js, MongoDB, Mongoose       |
| Blockchain   | Solidity, OpenZeppelin, Hardhat, Web3.js     |
| Storage      | IPFS (via Pinata or Infura)                  |
| Auth         | MetaMask (Web3 login), bcrypt                |
| Tools        | ESLint, Prettier, dotenv, Git, Hardhat       |

---
## 📁 Project Structure
```
📦chainbazzar
 ┣ 📂backend
 ┃ ┣ 📂controllers
 ┃ ┣ 📂models
 ┃ ┣ 📂routes
 ┃ ┣ 📂middleware
 ┃ ┣ 📂services
 ┣ 📂frontend
 ┃ ┣ 📂components
 ┃ ┣ 📂pages
 ┃ ┣ 📂styles
 ┃ ┣ 📂utils
 ┣ 📂contracts
 ┃ ┗ 📜 Contract.sol
 ┣ 📂scripts
 ┣ 📜 hardhat.config.js
 ┣ 📜 README.md
 ┣ 📜 .env
 ┣ 📜 package.json
```
---
## 🛠️ Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/chainbazzar.git
   cd chainbazzar
   ```

2. **Set up environment variables:**
   Create `.env` files in both frontend and backend with appropriate keys:
   ```env
   MONGODB_URI=
   INFURA_PROJECT_ID=
   PRIVATE_KEY=
   CONTRACT_ADDRESS=
   ```

3. **Install dependencies (frontend & backend):**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

4. **Compile & deploy smart contracts:**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network <network>
   ```

5. **Run both servers:**
   ```bash
   # Run frontend
   cd frontend
   npm run dev

   # Run backend
   cd ../backend
   npm start
   ```

---

## 🧪 Testing Smart Contracts

Use Hardhat for testing:

```bash
npx hardhat test
```

---

## 🌍 Live Demo

> 🚧 **Coming Soon**  
> Deploying to Vercel (frontend) and Render/Heroku (backend) or using IPFS for full decentralization.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web3.js](https://web3js.readthedocs.io/)
- [IPFS](https://ipfs.io/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Hardhat](https://hardhat.org/)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- MetaMask wallet (for blockchain interactions)
- IPFS account (Infura recommended)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chainbazzar.git
   cd chainbazzar
   ```

2. Install dependencies:
   ```
   npm install
   cd Backend && npm install
   ```

3. Configure environment variables:
   ```
   # Run the IPFS setup script 
   ./setup-ipfs.sh
   ```
   Follow the prompts to set up your IPFS configuration.

4. Start the application:
   ```
   # Run the restart script to start all services
   ./restart.sh
   ```

## IPFS Integration

ChainBazzar uses IPFS (InterPlanetary File System) for decentralized product image storage. This provides several benefits:

1. **Immutability**: Once uploaded to IPFS, product images cannot be altered, ensuring genuine product representation.
2. **Decentralization**: Images are stored across a distributed network rather than on centralized servers.
3. **Persistence**: Content on IPFS remains available as long as at least one node in the network has it.
4. **Content Addressing**: Images are referenced by their content hash (CID) rather than location, ensuring integrity.

### Setting Up IPFS

1. Create an account on [Infura](https://infura.io/) (or other IPFS service provider)
2. Create a new IPFS project to get your Project ID and Secret
3. Run the setup script:
   ```
   ./setup-ipfs.sh
   ```
4. Enter your Infura credentials when prompted

### Migrating Existing Images to IPFS

To migrate all existing product images to IPFS:
```
node Backend/scripts/migrateImagesToIPFS.js
```

### Adding New Products with IPFS Images

When creating new products, images are automatically uploaded to IPFS and stored with their content identifiers (CIDs).

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Sign up for an account (or use the test credentials)
3. Browse products, create listings, or make purchases

### Test Credentials

- Admin User: username=admin, password=admin123
- Regular User: username=testuser1, password=password123
```

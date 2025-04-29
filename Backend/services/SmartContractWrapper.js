const { ethers } = require('ethers');
const contractABI = require('../contracts/abi.json');
const bytecodeJson = require('../contracts/bytecode.json');

class SmartContractWrapper {
  constructor(provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
  }

  async deploy() {
    try {
      // Get bytecode from JSON
      const bytecode = bytecodeJson.bytecode || bytecodeJson;

      // Create contract factory
      const factory = new ethers.ContractFactory(
        contractABI,
        bytecode,
        this.signer
      );

      // Deploy the contract
      const contract = await factory.deploy();
      
      // Return the contract address immediately
      return contract.address;
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw error;
    }
  }

  async getContract(address) {
    try {
      return new ethers.Contract(address, contractABI, this.signer);
    } catch (error) {
      console.error('Error getting contract instance:', error);
      throw error;
    }
  }

  async purchase(contractAddress, productId, buyer) {
    try {
      const contract = await this.getContract(contractAddress);
      const tx = await contract.purchase(productId, buyer);
      await tx.wait(); // Wait for transaction to be mined
      return tx.hash;
    } catch (error) {
      console.error('Error executing purchase:', error);
      throw error;
    }
  }
}

module.exports = SmartContractWrapper; 
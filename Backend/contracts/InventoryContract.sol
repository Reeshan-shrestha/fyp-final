// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title InventoryContract
 * @dev Manages product inventory on-chain for ChainBazzar
 */
contract InventoryContract {
    address public owner;
    
    struct ProductInventory {
        uint256 productId;        // Product ID (matches MongoDB ID)
        uint256 stockCount;       // Current stock level
        uint256 lastUpdated;      // Timestamp of last update
        address updatedBy;        // Address that last updated the stock
        bool exists;              // Flag to check if product exists
        string productName;       // Product name for reference
    }
    
    // Maps product IDs to their inventory records
    mapping(string => ProductInventory) public inventory;
    
    // Array to keep track of all product IDs
    string[] public productIds;
    
    // Events
    event StockUpdated(string indexed productId, uint256 oldStock, uint256 newStock, address updatedBy);
    event ProductAdded(string indexed productId, string name, uint256 initialStock, address addedBy);
    event StockReserved(string indexed productId, uint256 quantity, address reservedBy);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier productExists(string memory productId) {
        require(inventory[productId].exists, "Product does not exist in inventory");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add a new product to the inventory
     * @param productId The unique ID of the product (MongoDB ID as string)
     * @param name Product name
     * @param initialStock Initial stock count
     */
    function addProduct(string memory productId, string memory name, uint256 initialStock) public onlyOwner {
        require(!inventory[productId].exists, "Product already exists");
        
        inventory[productId] = ProductInventory({
            productId: productIds.length, // Use array index as numeric ID
            stockCount: initialStock,
            lastUpdated: block.timestamp,
            updatedBy: msg.sender,
            exists: true,
            productName: name
        });
        
        productIds.push(productId);
        
        emit ProductAdded(productId, name, initialStock, msg.sender);
    }
    
    /**
     * @dev Update stock count for an existing product
     * @param productId The unique ID of the product
     * @param newStockCount New stock level
     */
    function updateStock(string memory productId, uint256 newStockCount) public productExists(productId) {
        uint256 oldStock = inventory[productId].stockCount;
        inventory[productId].stockCount = newStockCount;
        inventory[productId].lastUpdated = block.timestamp;
        inventory[productId].updatedBy = msg.sender;
        
        emit StockUpdated(productId, oldStock, newStockCount, msg.sender);
    }
    
    /**
     * @dev Reserve stock during checkout (reduce stock)
     * @param productId The unique ID of the product
     * @param quantity Quantity to reserve
     * @return success Whether the stock reservation was successful
     */
    function reserveStock(string memory productId, uint256 quantity) public productExists(productId) returns (bool) {
        ProductInventory storage product = inventory[productId];
        
        // Check if enough stock is available
        require(product.stockCount >= quantity, "Insufficient stock");
        
        // Update stock
        uint256 oldStock = product.stockCount;
        product.stockCount -= quantity;
        product.lastUpdated = block.timestamp;
        product.updatedBy = msg.sender;
        
        emit StockReserved(productId, quantity, msg.sender);
        emit StockUpdated(productId, oldStock, product.stockCount, msg.sender);
        
        return true;
    }
    
    /**
     * @dev Get current stock for a product
     * @param productId The unique ID of the product
     * @return Current stock count
     */
    function getStock(string memory productId) public view productExists(productId) returns (uint256) {
        return inventory[productId].stockCount;
    }
    
    /**
     * @dev Get inventory details for a product
     * @param productId The unique ID of the product
     * @return Product inventory details
     */
    function getProductInventory(string memory productId) public view productExists(productId) returns (
        uint256 productNumericId,
        string memory name,
        uint256 stock,
        uint256 lastUpdatedTime,
        address lastUpdatedBy
    ) {
        ProductInventory storage product = inventory[productId];
        return (
            product.productId,
            product.productName,
            product.stockCount,
            product.lastUpdated,
            product.updatedBy
        );
    }
    
    /**
     * @dev Get all product IDs in inventory
     * @return Array of product IDs
     */
    function getAllProductIds() public view returns (string[] memory) {
        return productIds;
    }
    
    /**
     * @dev Get count of products in inventory
     * @return Number of products
     */
    function getProductCount() public view returns (uint256) {
        return productIds.length;
    }
} 
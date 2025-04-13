// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductVerification {
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address seller;
        bool isVerified;
        string ipfsHash;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;
    mapping(address => bool) public verifiedSellers;
    
    event ProductAdded(uint256 indexed id, string name, address seller);
    event ProductVerified(uint256 indexed id, address verifier);
    
    modifier onlyVerifiedSeller() {
        require(verifiedSellers[msg.sender], "Seller not verified");
        _;
    }
    
    function addProduct(
        string memory _name,
        string memory _description,
        uint256 _price,
        string memory _ipfsHash
    ) public onlyVerifiedSeller returns (uint256) {
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            _price,
            msg.sender,
            false,
            _ipfsHash,
            block.timestamp
        );
        
        emit ProductAdded(productCount, _name, msg.sender);
        return productCount;
    }
    
    function verifyProduct(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        require(!products[_productId].isVerified, "Product already verified");
        
        products[_productId].isVerified = true;
        emit ProductVerified(_productId, msg.sender);
    }
    
    function verifySeller(address _seller) public {
        verifiedSellers[_seller] = true;
    }
    
    function getProduct(uint256 _productId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 price,
        address seller,
        bool isVerified,
        string memory ipfsHash,
        uint256 timestamp
    ) {
        Product memory product = products[_productId];
        return (
            product.id,
            product.name,
            product.description,
            product.price,
            product.seller,
            product.isVerified,
            product.ipfsHash,
            product.timestamp
        );
    }
} 
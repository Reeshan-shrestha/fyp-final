// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ChainBazzar {
    string public name = "ChainBazzar";
    address public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 price;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
        uint256 quantity;
        string paymentId;
        string status;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 price, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId, string paymentId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _price,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _price,
            _rating,
            _stock
        );

        items[_id] = item;

        emit List(_name, _price, _stock);
    }

    function recordPurchase(
        uint256 _id,
        string memory _paymentId,
        uint256 _price
    ) public {
        // Get item
        Item memory item = items[_id];

        // Create order
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = Order(
            block.timestamp,
            item,
            1,
            _paymentId,
            "completed"
        );

        // Emit event
        emit Buy(msg.sender, orderCount[msg.sender], _id, _paymentId);
    }
} 
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const newProducts = [
  // TechVision Electronics
  {
    name: "MacBook Pro M2",
    description: "Latest MacBook Pro with M2 chip, 16GB RAM, 512GB SSD, featuring incredible performance and battery life",
    price: 1299.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "TechVision",
    verified: true,
    stock: 10
  },
  {
    name: "Sony WH-1000XM5",
    description: "Next-gen noise cancelling headphones with exceptional sound quality and 30-hour battery life",
    price: 399.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "TechVision",
    verified: true,
    stock: 15
  },

  // SportStyle Athletics
  {
    name: "Nike Air Max 2023",
    description: "Premium running shoes with revolutionary air cushioning and breathable mesh design",
    price: 179.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "SportStyle",
    verified: true,
    stock: 25
  },
  {
    name: "Adidas Pro Training Set",
    description: "Complete training outfit including moisture-wicking shirt, shorts, and compression wear",
    price: 89.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "SportStyle",
    verified: false,
    stock: 20
  },

  // GourmetDelights
  {
    name: "Artisanal Coffee Collection",
    description: "Premium single-origin coffee beans from Ethiopia, Colombia, and Guatemala",
    price: 49.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "GourmetDelights",
    verified: true,
    stock: 30
  },
  {
    name: "Luxury Chocolate Box",
    description: "Handcrafted Belgian chocolates with assorted flavors and fillings",
    price: 39.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "GourmetDelights",
    verified: true,
    stock: 25
  },

  // FashionFusion
  {
    name: "Designer Sunglasses Collection",
    description: "Premium UV-protected sunglasses with Italian design and polarized lenses",
    price: 159.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "FashionFusion",
    verified: true,
    stock: 15
  },
  {
    name: "Leather Weekend Bag",
    description: "Handcrafted genuine leather travel bag with premium metal hardware",
    price: 199.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "FashionFusion",
    verified: false,
    stock: 10
  },

  // SmartHome Solutions
  {
    name: "Smart Home Hub Pro",
    description: "Advanced home automation system with voice control and mobile app integration",
    price: 299.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1558089687-db5ff4d84dd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "SmartHome",
    verified: true,
    stock: 20
  },
  {
    name: "Security Camera System",
    description: "4K wireless security cameras with night vision and two-way audio",
    price: 449.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "SmartHome",
    verified: true,
    stock: 12
  },

  // OrganicEats
  {
    name: "Organic Tea Selection",
    description: "Premium organic teas including green, black, and herbal varieties",
    price: 34.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "OrganicEats",
    verified: true,
    stock: 40
  },
  {
    name: "Healthy Snack Box",
    description: "Curated selection of organic nuts, dried fruits, and healthy snacks",
    price: 45.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    seller: "OrganicEats",
    verified: false,
    stock: 35
  }
];

const addProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chainbazzar', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Add products
    const result = await Product.insertMany(newProducts);
    console.log('Successfully added', result.length, 'products from different sellers');

    // Print summary by seller
    const sellerSummary = {};
    result.forEach(product => {
      if (!sellerSummary[product.seller]) {
        sellerSummary[product.seller] = {
          total: 0,
          categories: new Set(),
          verified: 0
        };
      }
      sellerSummary[product.seller].total++;
      sellerSummary[product.seller].categories.add(product.category);
      if (product.verified) sellerSummary[product.seller].verified++;
    });

    console.log('\nSeller Summary:');
    Object.entries(sellerSummary).forEach(([seller, stats]) => {
      console.log(`\n${seller}:`);
      console.log(`- Total Products: ${stats.total}`);
      console.log(`- Categories: ${Array.from(stats.categories).join(', ')}`);
      console.log(`- Verified Products: ${stats.verified}`);
    });

  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
addProducts(); 
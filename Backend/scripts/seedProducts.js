const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  // Electronics Category - TechStore
  {
    name: "Apple Watch Series 7",
    description: "Advanced smartwatch with always-on Retina display, ECG monitoring, and fitness tracking",
    price: 399.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop",
    seller: "TechStore",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 15
  },
  {
    name: "Sony WH-1000XM4 Headphones",
    description: "Premium noise-cancelling headphones with exceptional sound quality and 30-hour battery life",
    price: 349.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e1822709e1?q=80&w=1000&auto=format&fit=crop",
    seller: "TechStore",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 8
  },
  {
    name: "MacBook Pro M2",
    description: "Powerful laptop with Apple M2 chip, Retina display, and all-day battery life",
    price: 1999.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
    seller: "TechStore",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 5
  },
  
  // Electronics Category - GadgetWorld
  {
    name: "Samsung Galaxy S22",
    description: "Flagship smartphone with high-resolution camera, fast processor and vibrant display",
    price: 799.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1553808376-8c63c868ff01?q=80&w=1000&auto=format&fit=crop",
    seller: "GadgetWorld",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 12
  },
  {
    name: "Nintendo Switch OLED",
    description: "Enhanced gaming console with 7-inch OLED screen, improved audio, and wider adjustable stand",
    price: 349.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=1000&auto=format&fit=crop",
    seller: "GadgetWorld",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 7
  },
  
  // Clothing Category - FashionHub
  {
    name: "Ray-Ban Aviator Classic",
    description: "Iconic aviator sunglasses with gold frame and crystal green lenses",
    price: 169.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop",
    seller: "FashionHub",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 20
  },
  {
    name: "Designer Leather Jacket",
    description: "Premium leather jacket with stylish design and comfortable fit",
    price: 299.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
    seller: "FashionHub",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 10
  },
  {
    name: "Silk Evening Gown",
    description: "Elegant evening gown made from premium silk with intricate embroidery",
    price: 499.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8cb?q=80&w=1000&auto=format&fit=crop",
    seller: "FashionHub",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 5
  },
  
  // Clothing Category - SportsWorld
  {
    name: "Nike Air Zoom Pegasus 38",
    description: "Versatile running shoes with responsive foam cushioning and breathable mesh upper",
    price: 129.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    seller: "SportsWorld",
    verified: false,
    countInStock: 15
  },
  {
    name: "Athletic Training Set",
    description: "Complete training outfit for gym workouts and outdoor exercises",
    price: 89.99,
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1518310952931-b1de897abd40?q=80&w=1000&auto=format&fit=crop",
    seller: "SportsWorld",
    verified: false,
    countInStock: 8
  },
  
  // Food Category - OrganicHarvest
  {
    name: "Organic Honey Collection",
    description: "Set of premium organic honey varieties from different flower sources",
    price: 49.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=1000&auto=format&fit=crop",
    seller: "OrganicHarvest",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 25
  },
  {
    name: "Artisanal Cheese Basket",
    description: "Selection of handcrafted cheeses from small-batch producers",
    price: 79.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=1000&auto=format&fit=crop",
    seller: "OrganicHarvest",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 10
  },
  {
    name: "Premium Spice Collection",
    description: "Set of 12 exotic spices in glass jars for gourmet cooking",
    price: 59.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=1000&auto=format&fit=crop",
    seller: "OrganicHarvest",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 15
  },
  
  // Food Category - GourmetDirect
  {
    name: "Single-Origin Coffee Set",
    description: "Collection of premium coffee beans from renowned growing regions",
    price: 45.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop",
    seller: "GourmetDirect",
    verified: false,
    countInStock: 20
  },
  {
    name: "Luxury Chocolate Box",
    description: "Assortment of handmade chocolates with exotic flavors and fillings",
    price: 39.99,
    category: "food",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop",
    seller: "GourmetDirect",
    verified: false,
    countInStock: 15
  },
  
  // Other Category - HomeEssentials
  {
    name: "Scented Candle Collection",
    description: "Set of 6 premium scented candles in elegant glass containers",
    price: 69.99,
    category: "other",
    imageUrl: "https://images.unsplash.com/photo-1603189950883-bdbbee729004?q=80&w=1000&auto=format&fit=crop",
    seller: "HomeEssentials",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 30
  },
  {
    name: "Luxury Bedding Set",
    description: "Complete bedding set with premium cotton sheets, duvet cover, and pillow cases",
    price: 199.99,
    category: "other",
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=1000&auto=format&fit=crop",
    seller: "HomeEssentials",
    verified: true,
    verifiedAt: new Date(),
    countInStock: 8
  },
  
  // Other Category - ArtisanCrafts
  {
    name: "Handcrafted Ceramic Vase",
    description: "Unique handmade ceramic vase with artistic glazing techniques",
    price: 89.99,
    category: "other",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop",
    seller: "ArtisanCrafts",
    verified: false,
    countInStock: 5
  },
  {
    name: "Artisan Wooden Cutting Board",
    description: "Handcrafted wooden cutting board made from sustainable hardwood",
    price: 59.99,
    category: "other",
    imageUrl: "https://images.unsplash.com/photo-1597528662465-55ece5734101?q=80&w=1000&auto=format&fit=crop",
    seller: "ArtisanCrafts",
    verified: false,
    countInStock: 12
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Seeded products successfully');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

seedProducts(); 
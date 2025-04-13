const mongoose = require('mongoose');
const Item = require('../models/Item');

const items = [
  {
    id: "1",
    name: "Sony Alpha A7 III Camera",
    category: "Electronics",
    image: "/images/sony-a7iii.jpg",
    price: 199900,
    rating: 5,
    stock: 5,
    description: "Professional mirrorless camera with exceptional image quality"
  },
  {
    id: "2",
    name: "MacBook Pro 16-inch",
    category: "Electronics",
    image: "/images/macbook-pro.jpg",
    price: 239900,
    rating: 5,
    stock: 3,
    description: "Powerful laptop for professionals with Retina display"
  },
  {
    id: "3",
    name: "iPhone 14 Pro",
    category: "Electronics",
    image: "/images/iphone-14-pro.jpg",
    price: 99900,
    rating: 4,
    stock: 10,
    description: "Latest iPhone with advanced camera system"
  },
  {
    id: "4",
    name: "DJI Mavic Air 2 Drone",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=1000&auto=format&fit=crop",
    price: 79999, // $799.99
    rating: 5,
    stock: 6,
    description: "Compact yet powerful drone with 4K/60fps video, 48MP photos, and 34-minute flight time. Includes obstacle avoidance and intelligent shooting modes."
  },
  {
    id: "5",
    name: "Sony WH-1000XM4 Headphones",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
    price: 34999, // $349.99
    rating: 5,
    stock: 15,
    description: "Industry-leading noise canceling headphones with exceptional sound quality. Features multipoint pairing, adaptive sound control, and 30-hour battery life."
  },
  {
    id: "6",
    name: "Nike Air Zoom Pegasus 38",
    category: "clothing",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    price: 12999, // $129.99
    rating: 5,
    stock: 20,
    description: "Versatile running shoes with responsive foam cushioning and breathable mesh upper. Perfect for daily training and casual wear."
  },
  {
    id: "7",
    name: "Ray-Ban Aviator Classic",
    category: "clothing",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop",
    price: 16999, // $169.99
    rating: 4,
    stock: 12,
    description: "Iconic aviator sunglasses with gold frame and crystal green lenses. 100% UV protection and premium quality construction."
  },
  {
    id: "8",
    name: "Apple Watch Series 7",
    category: "clothing",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop",
    price: 39999, // $399.99
    rating: 5,
    stock: 10,
    description: "Advanced smartwatch with always-on Retina display, ECG monitoring, and fitness tracking. Water-resistant and available in multiple colors."
  },
  {
    id: "9",
    name: "GAN 356 X Speed Cube",
    category: "toys",
    image: "https://images.unsplash.com/photo-1577367521253-2db5a60fba92?q=80&w=1000&auto=format&fit=crop",
    price: 5999, // $59.99
    rating: 4,
    stock: 15,
    description: "Professional-grade speed cube with customizable magnets and tension system. Perfect for competitions and serious cubers."
  },
  {
    id: "10",
    name: "LEGO Creator Expert Train Set",
    category: "toys",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1000&auto=format&fit=crop",
    price: 19999, // $199.99
    rating: 5,
    stock: 5,
    description: "Detailed replica of a classic steam locomotive with powered functions. Includes track pieces and minifigures for an immersive building experience."
  },
  {
    id: "11",
    name: "LEGO MINDSTORMS Robot Inventor",
    category: "toys",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=1000&auto=format&fit=crop",
    price: 35999, // $359.99
    rating: 5,
    stock: 8,
    description: "Advanced robotics kit with 949 pieces to build 5 unique robots. Includes intelligent hub, motors, and color sensor for coding adventures."
  },
  {
    id: "12",
    name: "Patagonia Down Sweater",
    category: "clothing",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
    price: 22999, // $229.99
    rating: 4,
    stock: 12,
    description: "Premium down jacket with recycled materials, water-repellent finish, and excellent warmth-to-weight ratio. Perfect for outdoor adventures."
  },
  {
    id: "13",
    name: "Nintendo Switch OLED",
    category: "toys",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=1000&auto=format&fit=crop",
    price: 34999, // $349.99
    rating: 5,
    stock: 10,
    description: "Enhanced gaming console with 7-inch OLED screen, improved audio, and wider adjustable stand. Includes white Joy-Con controllers and 64GB storage."
  }
];

async function seedItems() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ChainBazzarDB');
    console.log('Connected to database');

    // Clear existing items
    await Item.deleteMany({});
    console.log('Cleared existing items');

    // Add new items
    await Item.insertMany(items);
    console.log('Added sample items');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedItems(); 
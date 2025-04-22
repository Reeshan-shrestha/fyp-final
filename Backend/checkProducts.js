const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/chainbazzar';

async function checkProducts() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const productsCollection = db.collection('products');
    
    // Get all products
    const products = await productsCollection.find({}).toArray();
    
    // Get stats
    let verifiedCount = 0;
    let belowStockThreshold = 0;
    
    products.forEach(product => {
      if (product.verified) verifiedCount++;
      if (product.countInStock < 50) belowStockThreshold++;
    });
    
    console.log(`Total products: ${products.length}`);
    console.log(`Verified products: ${verifiedCount}`);
    console.log(`Products with stock < 50: ${belowStockThreshold}`);
    
    // Show a few samples
    console.log('\nSample products:');
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const p = products[i];
      console.log(`${i+1}. ${p.name} - Verified: ${p.verified} - Stock: ${p.countInStock}`);
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts(); 
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/chainbazzar';

async function updateProducts() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const productsCollection = db.collection('products');
    
    // First set all products to be verified
    const verifyResult = await productsCollection.updateMany(
      {},
      { 
        $set: { 
          verified: true, 
          verifiedAt: new Date() 
        } 
      }
    );
    console.log(`Set ${verifyResult.modifiedCount} products to verified`);
    
    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products to update stock`);
    
    // Update each product with random stock >= 50
    let updatedCount = 0;
    for (const product of products) {
      const randomStock = Math.floor(Math.random() * 100) + 50; // Random between 50-149
      await productsCollection.updateOne(
        { _id: product._id },
        { $set: { countInStock: randomStock } }
      );
      updatedCount++;
    }
    console.log(`Updated ${updatedCount} products with random stock values >= 50`);
    
    // Confirm updates
    const updatedProducts = await productsCollection.find({}).toArray();
    console.log('Sample updated product:');
    if (updatedProducts.length > 0) {
      const sample = updatedProducts[0];
      console.log({
        name: sample.name,
        verified: sample.verified,
        countInStock: sample.countInStock
      });
    } else {
      console.log('No products found');
    }
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateProducts(); 
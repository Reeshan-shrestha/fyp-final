const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const supplyChainEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipfsCid: {
    type: String
  },
  details: {
    type: Object
  },
  transactionHash: {
    type: String
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'food', 'other']
  },
  imageUrl: {
    type: String,
    required: true
  },
  // IPFS content identifier for the product image
  ipfsCid: {
    type: String
  },
  seller: {
    type: String,
    required: true,
    // Can be either the MongoDB ObjectId of the seller as a string,
    // or the seller's username string - both formats are supported
    // This is used to link products to their respective sellers
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  supplyChainHistory: [supplyChainEventSchema],
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  // Blockchain transaction hash that verified this product 
  verificationTxHash: {
    type: String
  },
  // Blockchain inventory management fields
  blockchainManaged: {
    type: Boolean,
    default: false
  },
  blockchainTxHash: {
    type: String
  },
  blockchainInventoryLastSync: {
    type: Date
  },
  // Blockchain stock history
  stockHistory: [{
    previousStock: Number,
    newStock: Number,
    transactionHash: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add virtual for full IPFS URL
productSchema.virtual('ipfsUrl').get(function() {
  if (!this.ipfsCid) return null;
  return `ipfs://${this.ipfsCid}`;
});

// Add virtual to check if stock is managed on blockchain
productSchema.virtual('onChainInventory').get(function() {
  return this.blockchainManaged === true;
});

// Configure toJSON to include virtuals and remove _id
productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema); 
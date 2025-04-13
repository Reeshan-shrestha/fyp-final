const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    items: [{
        itemId: String,
        name: String,
        quantity: Number,
        price: Number,
        subtotal: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    billDate: {
        type: Date,
        default: Date.now
    },
    billNumber: {
        type: String,
        required: true,
        unique: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    blockchainTxHash: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('Bill', billSchema); 
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'paypal', 'crypto']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    trackingNumber: {
        type: String
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });

// Minimum time between status changes (in hours)
const MIN_STATUS_CHANGE_TIME = {
    'pending': 0,
    'processing': 1,
    'shipped': 24,
    'delivered': 48,
    'cancelled': 0
};

// Validate status changes
orderSchema.methods.canChangeStatus = function(newStatus) {
    const currentStatus = this.status;
    const lastStatusChange = this.statusHistory[this.statusHistory.length - 1];
    const now = new Date();
    
    // Check if status change is valid
    const validTransitions = {
        'pending': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [],
        'cancelled': []
    };
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
        return false;
    }
    
    // Check minimum time requirement
    if (lastStatusChange) {
        const timeSinceLastChange = (now - lastStatusChange.timestamp) / (1000 * 60 * 60); // hours
        if (timeSinceLastChange < MIN_STATUS_CHANGE_TIME[newStatus]) {
            return false;
        }
    }
    
    return true;
};

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        if (!this.statusHistory) {
            this.statusHistory = [];
        }
        
        // Add new status to history
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            notes: `Status changed to ${this.status}`
        });
        
        // Update delivery dates if needed
        if (this.status === 'shipped') {
            // Set estimated delivery date (3-7 days from shipping)
            const deliveryDays = Math.floor(Math.random() * 5) + 3;
            this.estimatedDeliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
        } else if (this.status === 'delivered') {
            this.actualDeliveryDate = new Date();
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    assignedBaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    deliveryDate: {
        type: String,
        required: true
    },
    specialInstructions: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    images: [{
        fileId: String,
        filename: String,
        caption: String
    }],
});

module.exports = mongoose.model('Order', orderSchema);
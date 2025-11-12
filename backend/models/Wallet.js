const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0
  },
  firstConnected: {
    type: Date,
    default: Date.now
  },
  lastConnected: {
    type: Date,
    default: Date.now
  },
  connectionCount: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Update lastConnected and increment connectionCount before saving
walletSchema.pre('save', function(next) {
  if (this.isNew) {
    this.firstConnected = new Date();
    this.lastConnected = new Date();
    this.connectionCount = 1;
  } else if (this.isModified('walletAddress')) {
    this.lastConnected = new Date();
    this.connectionCount = (this.connectionCount || 0) + 1;
  }
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;


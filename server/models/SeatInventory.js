const mongoose = require('mongoose');

const seatInventorySchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID reference is required'],
      index: true,
    },
    seatNumber: {
      type: String, // e.g. "A1", "C5"
      required: [true, 'Seat number is required'],
      trim: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['regular', 'premium', 'recliner'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'held', 'booked'],
      default: 'available',
      index: true,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
    holdToken: {
      type: String,
      default: null,
      index: true,
    },
    heldByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL REQUIREMENT: A seat can only exist once per show!
seatInventorySchema.index({ showId: 1, seatNumber: 1 }, { unique: true });
seatInventorySchema.index({ showId: 1, status: 1 });
seatInventorySchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'held' } });

const SeatInventory = mongoose.model('SeatInventory', seatInventorySchema);
module.exports = SeatInventory;

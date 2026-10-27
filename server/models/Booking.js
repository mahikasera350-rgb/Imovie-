const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
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
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true,
    },
    seats: [bookedSeatSchema],
    seatNumbers: {
      type: [String],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    convenienceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxes: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    idempotencyKey: {
      type: String,
      index: true,
    },
    holdToken: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

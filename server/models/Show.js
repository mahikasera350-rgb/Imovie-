const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
    },
    screenName: {
      type: String,
      default: 'Audi 1',
    },
    showDate: {
      type: String, // YYYY-MM-DD for straightforward day querying
      required: [true, 'Show date (YYYY-MM-DD) is required'],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Show start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'Show end time is required'],
      index: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    format: {
      type: String,
      default: 'Standard 2D',
    },
    seatPricing: {
      regular: {
        type: Number, // In whole currency or cents (e.g., 12.00)
        required: [true, 'Regular seat price is required'],
        min: 0,
      },
      premium: {
        type: Number,
        required: [true, 'Premium seat price is required'],
        min: 0,
      },
      recliner: {
        type: Number,
        required: [true, 'Recliner seat price is required'],
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help check overlapping shows and fast show lookup
showSchema.index({ theatreId: 1, screenNumber: 1, startTime: 1, endTime: 1 });
showSchema.index({ movieId: 1, showDate: 1, status: 1 });

const Show = mongoose.model('Show', showSchema);
module.exports = Show;

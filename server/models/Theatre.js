const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  format: {
    type: String,
    enum: ['Standard 2D', '3D', 'IMAX', '4DX', 'Dolby Cinema'],
    default: 'Standard 2D',
  },
  soundSystem: {
    type: String,
    default: 'Dolby Atmos 7.1',
  },
  seatLayout: {
    rows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
    seatsPerRow: {
      type: Number,
      default: 12,
    },
    categoryMap: {
      recliner: {
        type: [String],
        default: ['A'],
      },
      premium: {
        type: [String],
        default: ['B', 'C', 'D'],
      },
      regular: {
        type: [String],
        default: ['E', 'F', 'G', 'H'],
      },
    },
    aisleIndices: {
      type: [Number],
      default: [3, 9], // gaps after seat 3 and seat 9
    },
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Theatre address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    screens: [screenSchema],
    facilities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Food & Beverages', 'Wheelchair Accessible', 'Parking'],
    },
    phone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

theatreSchema.index({ city: 1, name: 1 });

const Theatre = mongoose.model('Theatre', theatreSchema);
module.exports = Theatre;

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: '',
      trim: true,
    },
    trailerUrl: {
      type: String,
      default: '',
      trim: true,
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one genre must be specified',
      },
    },
    languages: {
      type: [String],
      required: [true, 'At least one language is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one language must be specified',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      required: [true, 'Director name is required'],
      trim: true,
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG', 'PG-13', 'R'],
      default: 'UA',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [10, 'Rating cannot exceed 10'],
      default: 8.0,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ status: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ languages: 1 });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;

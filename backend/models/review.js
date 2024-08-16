import mongoose from "mongoose";



// Define the Review Schema
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  userName: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
  },
  {
    timestamps: true,
  },
);

// Create the Review model
const Review = mongoose.model('Review', reviewSchema);
export default Review;
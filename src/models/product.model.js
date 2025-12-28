import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    oneLineDescription: {
      type: String,
      trim: true
    },
    shortDescription: {
      type: String,
      required: true
    },
    detailedDescription: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      required: true
    },
    videos: {
      type: [String],
      default: []
    },
    youtubeLinks: {
      type: [String],
      default: []
    },
    articleLinks: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'products'
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;

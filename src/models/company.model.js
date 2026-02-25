import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    document: {
      url: {
        type: String
      },
      public_id: {
        type: String
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
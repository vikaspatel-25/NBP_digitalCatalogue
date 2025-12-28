import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    passwordHash: {
      type: String,
      required: true
    },
    passwordUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    collection: 'nbpAdmin'
  }
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

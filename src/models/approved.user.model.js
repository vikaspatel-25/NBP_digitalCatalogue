import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  userName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  mobile: { type: String, required: true, trim: true },
  document: {
    url: { type: String, default: '' },
    public_id: { type: String, default: '' }
  },
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordUpdatedAt: { type: Date },
  passKey: { type: String, default: '' },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
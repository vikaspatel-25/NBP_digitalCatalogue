import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String },
    document: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" }
    },
    userId: { type: String },
    password: { type: String },
    passKey: { type: String },
    role: { type: String, default: "user" },
    status: { type: String, default: "active" },

    passwordUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema, "users");

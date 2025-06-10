import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "agent", "seller"],
    default: "user",
  },
  agentRequestPending: { type: Boolean, default: false },
  agentRequestData: {
    type: Object,
    default: null,
  },
  sellerRequestPending: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpire: { type: Date },
});

const User = mongoose.model("User", UserSchema);

export default User;

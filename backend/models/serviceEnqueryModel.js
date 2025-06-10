import mongoose from "mongoose";

const serviceEnquirySchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    name: String,
    email: String,
    phone: String,
    message: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceEnquiry", serviceEnquirySchema);
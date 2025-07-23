import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: [String], required: true },
    beds: { type: Number }, // not required
    baths: { type: Number }, // not required
    sqft: { type: Number, required: true },
    type: { type: String, required: true },
    availability: { type: String, required: true },
    description: { type: String, required: true },
    amenities: { type: [String], required: true },
    phone: { type: String, required: true },

    // 👤 Reference to seller user
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // ✅ Approval logic
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 📌 Status tracking (e.g., "pending", "approved", "rejected")
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🧑‍💼 Assigned agent (for admin assignment)
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
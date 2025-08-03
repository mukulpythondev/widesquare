import express from "express";
import {
  addproperty,
  listproperty,
  removeproperty,
  updateproperty,
  singleproperty,
  getPendingProperties,
  myProperties,
} from "../controller/productcontroller.js";
import { isAdmin, protect } from "../middleware/authmiddleware.js";
import { approveProperty, assignedProperties, rejectProperty } from "../controller/adminController.js";
import Property from "../models/propertymodel.js"; // <-- Add this line

const propertyrouter = express.Router();

// propertyrouter.get("/agent", protect, agentProperties);
// propertyrouter.get("/agent-requests", getPendingAgentProperties);
// ProductRouter.js
propertyrouter.put("/approve/:id", protect, isAdmin, approveProperty);
propertyrouter.put("/reject/:id", protect, isAdmin, rejectProperty);
propertyrouter.get("/requests", getPendingProperties);
// propertyrouter.get("/agent-approved", getApprovedAgentProperties);

propertyrouter.post(
  "/add",
  protect,
  addproperty
);

propertyrouter.get("/list", listproperty);
propertyrouter.post("/remove", removeproperty);
propertyrouter.post(
  "/update",
  protect,
  updateproperty
);
propertyrouter.get("/single/:id", singleproperty);
propertyrouter.get("/my-properties", protect, myProperties);
propertyrouter.get("/agent/assigned-properties", protect, assignedProperties);

propertyrouter.delete("/seller/property/:id", protect, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
    });
    if (!property) {
      return res.status(404).json({ message: "Property not found", success: false });
    }
    res.json({ message: "Property deleted", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", success: false });
  }
});

export default propertyrouter;
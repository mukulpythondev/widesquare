import express from "express";
import multer from "multer";
import {
  addService,
  updateService,
  deleteService,
  listServices,
  serviceEnquiry,
  listServiceEnquiries,
} from "../controller/serviceController.js";
import { isAdmin, protect } from "../middleware/authmiddleware.js";

const upload = multer({ dest: "uploads/services/" });
const router = express.Router();
// Admin routes
router.post("/add", protect, isAdmin, upload.single("image"), addService);
router.post("/update", protect, isAdmin, upload.single("image"), updateService);
router.delete("/delete/:id", protect, isAdmin, deleteService);
router.get("/enquiries", protect, isAdmin, listServiceEnquiries);
router.put("/enquiry-status", protect, isAdmin, async (req, res) => {
  try {
    const { enquiryId, status } = req.body;
    await ServiceEnquiry.findByIdAndUpdate(enquiryId, { status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

// Public
router.get("/list", listServices);
router.post("/enquiry", serviceEnquiry);

export default router;
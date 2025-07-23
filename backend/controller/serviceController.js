import servicemodel from "../models/serviceModel.js";
import ServiceEnquiry from "../models/serviceEnqueryModel.js";
import imagekit from "../config/imagekit.js";
import fs from "fs";
import transporter from "../config/nodemailer.js";

export const addService = async (req, res) => {
  try {
    const { title, description } = req.body;
    let imageObj = {};
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: fs.readFileSync(req.file.path),
        fileName: req.file.originalname,
        folder: "Services"
      });
      imageObj = { url: uploadResponse.url, fileId: uploadResponse.fileId };
      fs.unlinkSync(req.file.path);
    }
    const service = await servicemodel.create({
      title,
      description,
      image: imageObj,
      createdBy: req.user._id,
    });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding service" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id, title, description } = req.body;
    let update = { title, description };
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: fs.readFileSync(req.file.path),
        fileName: req.file.originalname,
        folder: "Services"
      });
      update.image = uploadResponse.url;
      fs.unlinkSync(req.file.path);
    }
    const service = await servicemodel.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating service" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await servicemodel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Delete image from ImageKit using fileId
    if (service.image && service.image.fileId) {
      try {
        await imagekit.deleteFile(service.image.fileId);
      } catch (err) {
        console.error("Error deleting service image from ImageKit:", err.message);
      }
    }

    await servicemodel.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting service" });
  }
};

export const listServices = async (req, res) => {
  try {
    const services = await servicemodel.find().sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching services" });
  }
};

// User: Enquire about a service
export const serviceEnquiry = async (req, res) => {
  try {
    const { serviceId, name, email, phone, message } = req.body;
    const enquiry = await ServiceEnquiry.create({ service: serviceId, name, email, phone, message });

    // Fetch the service to get its title
    const service = await servicemodel.findById(serviceId);

    // Send email to admin
    await transporter.sendMail({
      from: process.env.ADMIN_EMAILS,
      to: process.env.ADMIN_EMAILS, // or process.env.ADMIN_EMAILS if you have multiple, comma-separated
      subject: "New Service Enquiry Received",
      html: `
        <h2>New Service Enquiry</h2>
        <p><strong>Service:</strong> ${service ? service.title : serviceId}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
      `,
    });

    res.json({ success: true, message: "Enquiry submitted" });
  } catch (err) {
    console.error("Service enquiry error:", err);
    res.status(500).json({ success: false, message: "Error submitting enquiry" });
  }
};

export const listServiceEnquiries = async (req, res) => {
  try {
    const enquiries = await ServiceEnquiry.find().populate("service");
    res.json({ success: true, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching enquiries" });
  }
};


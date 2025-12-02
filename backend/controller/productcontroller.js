import fs from "fs";
import imagekit from "../config/imagekit.js";
import Property from "../models/propertymodel.js";
import User from "../models/Usermodel.js";
import { sendEmail } from "../services/sendEmail.js";

// Helper to parse amenities safely
function parseAmenities(amenities) {
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === "string") {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [amenities];
    }
  }
  return [];
}

// 1. Add property (for user, agent, admin)
const addproperty = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      beds,
      baths,
      sqft,
      type,
      availability,
      description,
      amenities,
      phone,
      socialMediaLink,
      image // Array of Cloudinary-secure URLs
    } = req.body;

    // Validate required fields
    if (!image || !Array.isArray(image) || image.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image URL is required' });
    }

    const parsedAmenities = parseAmenities(amenities);

    // Determine user roles
    const user = await User.findById(req.user._id);
    let isAgent = user.role === 'agent';
    let isAdmin = user.role === 'admin';
    let isSeller = user.role === 'seller';

    if (!isAgent && !isAdmin && !isSeller) {
      user.role = 'seller';
      await user.save();
      isSeller = true;
    }

    // Approval logic
    let isApproved = isAdmin;
    const status = isAdmin ? 'approved' : 'pending';
    const approvedBy = isAdmin ? req.user._id : null;

    // Prepare property data
    const propertyData = {
      title,
      location,
      price,
      sqft,
      type,
      availability,
      description,
      amenities: parsedAmenities,
      image,
      phone,
      seller: req.user._id,
      isApproved,
      status,
      approvedBy,
      socialMediaLink
    };

    if (type !== 'Plot') {
      propertyData.beds = beds;
      propertyData.baths = baths;
    }

    // Save property
    const property = new Property(propertyData);
    await property.save();

    // Notifications
    if (isAgent || isSeller) {
      await sendEmail({
        to: user.email,
        subject: 'Property Submitted for Approval',
        html: `<p>Your property \"${title}\" has been sent to admin for approval.</p>`,
      });
      await sendEmail({
        to: process.env.ADMIN_EMAILS,
        subject: 'New Property Pending Approval',
        html: `<p>User ${user.name} (${user.email}) submitted a new property: \"${title}\".</p>`,
      });
    }

    return res.json({
      message: isApproved ? 'Property added successfully' : 'Property submitted for approval',
      success: true,
    });
  } catch (error) {
    console.error('Error adding property:', error);
    return res.status(500).json({ message: 'Server Error', success: false });
  }
};

// 2. List all approved properties (for website)
const listproperty = async (req, res) => {
  try {
    const property = await Property.find({ status: "approved" }).populate(
      "seller",
      "name email role"
    );
    res.json({ property, success: true });
  } catch (error) {
    console.log("Error listing products: ", error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

// 3. Remove property (not recommended for seller, use DELETE route below)
const removeproperty = async (req, res) => {
  try {
    const property = await Property.findById(req.body.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found", success: false });
    }

    // Delete images from ImageKit using fileId
    if (property.image && property.image.length > 0) {
      for (const img of property.image) {
        if (img.fileId) {
          try {
            await imagekit.deleteFile(img.fileId);
          } catch (err) {
            console.error("Error deleting image from ImageKit:", err.message);
          }
        }
      }
    }

    await Property.findByIdAndDelete(req.body.id);

    return res.json({
      message: "Property and images removed successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error removing product: ", error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

// 4. Update property (only creator or admin can update)
const updateproperty = async (req, res) => {
  try {
    const {
      id,
      title,
      location,
      price,
      beds,
      baths,
      sqft,
      type,
      availability,
      description,
      amenities,
      socialMediaLink,
      phone,
      image // Optional array of new Cloudinary URLs
    } = req.body;

    const parsedAmenities = parseAmenities(amenities);
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found', success: false });
    }

    // Authorization checks
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated', success: false });
    }
    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized', success: false });
    }

    // Update text fields
    property.title = title;
    property.location = location;
    property.price = price;
    property.sqft = sqft;
    property.type = type;
    property.availability = availability;
    property.description = description;
    property.amenities = parsedAmenities;
    property.phone = phone;
    if (socialMediaLink !== undefined) {
  property.socialMediaLink = socialMediaLink;
}
    if (type !== 'Plot') {
      property.beds = beds;
      property.baths = baths;
    } else {
      property.beds = undefined;
      property.baths = undefined;
    }

    // Replace images if new URLs provided
    if (image && Array.isArray(image) && image.length > 0) {
      property.image = image;
    }

    await property.save();

    return res.json({ message: 'Property updated successfully', success: true });
  } catch (error) {
    console.error('Error updating property:', error);
    return res.status(500).json({ message: 'Server Error', success: false });
  }
};
const singleproperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found", success: false });
    }
    res.json({ property, success: true });
  } catch (error) {
    console.log("Error fetching property:", error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

const myProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id });
    res.json({ properties, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", success: false });
  }
};

const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: "pending" }).populate(
      "seller",
      "name email role"
    );
    res.json({ property: properties, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", success: false });
  }
};

export {
  addproperty,
  listproperty,
  removeproperty,
  updateproperty,
  singleproperty,
  myProperties,
  getPendingProperties,
};
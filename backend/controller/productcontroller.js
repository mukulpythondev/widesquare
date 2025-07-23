import fs from "fs";
import imagekit from "../config/imagekit.js";
import Property from "../models/propertymodel.js";
import User from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";

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
    } = req.body;

    const parsedAmenities = parseAmenities(amenities);

    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(Boolean);

    // Save both url and fileId for each image
    const imageObjs = await Promise.all(
      images.map(async (item) => {
        const result = await imagekit.upload({
          file: fs.readFileSync(item.path),
          fileName: item.originalname,
          folder: "Property",
        });
        fs.unlink(item.path, (err) => {
          if (err) console.log("Error deleting the file: ", err);
        });
        return { url: result.url, fileId: result.fileId };
      })
    );

    const user = await User.findById(req.user._id);
    let isAgent = user.role === "agent";
    let isAdmin = user.role === "admin";
    let isSeller = user.role === "seller";

    if (!isAgent && !isAdmin && !isSeller) {
      user.role = "seller";
      await user.save();
      isSeller = true;
    }

    let isApproved = false;
    let status = "pending";
    let approvedBy = null;

    if (isAdmin) {
      isApproved = true;
      status = "approved";
      approvedBy = req.user._id;
    } else if (isAgent) {
      isApproved = false;
      status = "pending";
    } else if (isSeller) {
      isApproved = false;
      status = "pending";
    }

    const propertyData = {
      title,
      location,
      price,
      sqft,
      type,
      availability,
      description,
      amenities: parsedAmenities,
      image: imageObjs,
      phone,
      seller: req.user._id,
      isApproved,
      status,
      approvedBy,
    };
    if (type !== "Plot") {
      propertyData.beds = beds;
      propertyData.baths = baths;
    }

    const property = new Property(propertyData);

    await property.save();

    if (isAgent || isSeller) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Property Submitted for Approval",
        html: `<p>Your property "${title}" has been sent to admin for approval.</p>`,
      });
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAILS,
        subject: "New Property Pending Approval",
        html: `<p>User ${user.name} (${user.email}) submitted a new property: "${title}".</p>`,
      });
    }

    res.json({
      message: isApproved
        ? "Property added successfully"
        : "Property submitted for approval",
      success: true,
    });
  } catch (error) {
    console.log("Error adding product: ", error);
    res.status(500).json({ message: "Server Error", success: false });
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
      phone,
    } = req.body;

    const parsedAmenities = parseAmenities(amenities);

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found", success: false });
    }

    if (!property.seller) {
      return res.status(400).json({ message: "Property has no seller", success: false });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated", success: false });
    }

    if (
      property.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized", success: false });
    }

    // If no new images are provided, update only the text fields
    if (!req.files || Object.keys(req.files).length === 0) {
      property.title = title;
      property.location = location;
      property.price = price;
      property.sqft = sqft;
      property.type = type;
      property.availability = availability;
      property.description = description;
      property.amenities = parsedAmenities;
      property.phone = phone;
      if (type !== "Plot") {
        property.beds = beds;
        property.baths = baths;
      } else {
        property.beds = undefined;
        property.baths = undefined;
      }
      await property.save();
      return res.json({
        message: "Property updated successfully",
        success: true,
      });
    }

    // Handle new images if provided
    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(Boolean);

    // Delete old images from ImageKit
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

    // Upload new images to ImageKit and delete after upload
    const imageObjs = await Promise.all(
      images.map(async (item) => {
        const result = await imagekit.upload({
          file: fs.readFileSync(item.path),
          fileName: item.originalname,
          folder: "Property",
        });
        fs.unlink(item.path, (err) => {
          if (err) console.log("Error deleting the file: ", err);
        });
        return { url: result.url, fileId: result.fileId };
      })
    );

    property.title = title;
    property.location = location;
    property.price = price;
    property.sqft = sqft;
    property.type = type;
    property.availability = availability;
    property.description = description;
    property.amenities = parsedAmenities;
    property.image = imageObjs;
    property.phone = phone;
    if (type !== "Plot") {
      property.beds = beds;
      property.baths = baths;
    } else {
      property.beds = undefined;
      property.baths = undefined;
    }

    await property.save();
    res.json({ message: "Property updated successfully", success: true });
  } catch (error) {
    console.log("Error updating product: ", error);
    res.status(500).json({ message: "Server Error", success: false });
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
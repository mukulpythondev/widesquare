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

    // Parse amenities to always be an array of strings
    const parsedAmenities = parseAmenities(amenities);

    // Handle images
    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(Boolean);

    // Upload images to ImageKit and delete after upload
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await imagekit.upload({
          file: fs.readFileSync(item.path),
          fileName: item.originalname,
          folder: "Property",
        });
        fs.unlink(item.path, (err) => {
          if (err) console.log("Error deleting the file: ", err);
        });
        return result.url;
      })
    );

    const user = await User.findById(req.user._id);
    let isAgent = user.role === "agent";
    let isAdmin = user.role === "admin";
    let isSeller = user.role === "seller";

    // If user is not agent or admin, make them seller
    if (!isAgent && !isAdmin && !isSeller) {
      user.role = "seller";
      await user.save();
      isSeller = true;
    }

    // Set approval and status logic
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

    // Only add beds/baths if not Plot type
    const propertyData = {
      title,
      location,
      price,
      sqft,
      type,
      availability,
      description,
      amenities: parsedAmenities,
      image: imageUrls,
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

    // Notify user/admin if needed
    if (isAgent || isSeller) {
      // Notify user
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Property Submitted for Approval",
        html: `<p>Your property "${title}" has been sent to admin for approval.</p>`,
      });
      // Notify admin
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
    const property = await Property.findByIdAndDelete(req.body.id);
    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found", success: false });
    }
    return res.json({
      message: "Property removed successfully",
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

    // Parse amenities to always be an array of strings
    const parsedAmenities = parseAmenities(amenities);

    // Find the property by ID
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found", success: false });
    }

    // Defensive check for seller
    if (!property.seller) {
      return res.status(400).json({ message: "Property has no seller", success: false });
    }

    // Defensive check for user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated", success: false });
    }

    // Only allow update if the logged-in user is the seller or admin
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
      // Only update beds/baths if not Plot type
      if (type !== "Plot") {
        property.beds = beds;
        property.baths = baths;
      } else {
        property.beds = undefined;
        property.baths = undefined;
      }
      // Keep existing images
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

    // Upload images to ImageKit and delete after upload
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await imagekit.upload({
          file: fs.readFileSync(item.path),
          fileName: item.originalname,
          folder: "Property",
        });
        fs.unlink(item.path, (err) => {
          if (err) console.log("Error deleting the file: ", err);
        });
        return result.url;
      })
    );

    // Update all fields including images
    property.title = title;
    property.location = location;
    property.price = price;
    property.sqft = sqft;
    property.type = type;
    property.availability = availability;
    property.description = description;
    property.amenities = parsedAmenities;
    property.image = imageUrls;
    property.phone = phone;
    // Only update beds/baths if not Plot type
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
// 5. Get single property
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

// 6. Seller/Agent: Get my properties
const myProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id });
    res.json({ properties, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", success: false });
  }
};

// 7. Admin: Get all pending property requests
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
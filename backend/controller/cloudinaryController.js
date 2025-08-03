import { generateSignedUrl } from "../services/cloudinary.js";

export const getSignedUrl = async (req, res) => {
  try {
    const userId = req.params?.userId || "guest";
    const resourceType = req.query?.resourceType || "image";

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const signedUrlData = await generateSignedUrl(userId, resourceType);
    return res.status(200).json({
      success: true,
      data: signedUrlData,
      message: "Signed URL generated successfully",
    });
  } catch (error) {
    console.error("Signed URL generation failed:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

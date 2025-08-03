import axios from "axios";
import { backendurl } from "../config";

export const uploadToCloudinary = async (file) => {
  try {
    // Get signed URL data from backend
    const { data: signatureRes } = await axios.get(
      `${backendurl}/api/signedUrl/guest`
    );


    // Check if the response is successful
    if (!signatureRes.success) {
      throw new Error(signatureRes.message || "Failed to get signed URL");
    }

    // Extract the nested data - THIS WAS THE BUG!
    const { signature, timestamp, folder, api_key, url } = signatureRes.data;

    // Validate required fields
    if (!signature || !timestamp || !api_key || !url) {
      console.error("Missing required fields:", { signature, timestamp, api_key, url });
      throw new Error("Invalid signature response - missing required fields");
    }

    // Use the URL from the response directly
    const uploadUrl = url;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("folder", folder);


    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Upload failed:", data);
      throw new Error(data?.error?.message || `Upload failed with status: ${response.status}`);
    }

    return data.secure_url;

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
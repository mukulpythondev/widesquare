import News from "../models/newsmodel.js";
import dotenv from "dotenv";
import { getEmailTemplate, getNewsletterTemplate } from "../email.js";
import { sendEmail } from "../services/sendEmail.js";

const submitNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    const newNewsletter = new News({
      email,
    });

    const savedNewsletter = await newNewsletter.save();

    
    await sendEmail({
      to: email,
      subject: "Welcome to BuildEstate Newsletter! 🏠",
      html: getNewsletterTemplate(email),
    });

    res.json({ message: "Newsletter submitted successfully" });
  } catch (error) {
    console.error("Error saving newsletter data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { submitNewsletter };

import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getWelcomeTemplate } from "../email.js";
import { getPasswordResetTemplate } from "../email.js";

const backendurl = process.env.BACKEND_URL;

const createtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Registeruser = await userModel.findOne({ email });
    if (!Registeruser) {
      return res.json({ message: "Email not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, Registeruser.password);
    if (isMatch) {
      const token = createtoken(Registeruser._id);
      return res.json({
        token,
        user: { name: Registeruser.name, email: Registeruser.email },
        success: true,
      });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          message: "User already exists with this email",
          success: false,
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate token
    const token = createtoken(newUser._id);

    // Send welcome email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to BuildEstate - Your Account Has Been Created",
      html: getWelcomeTemplate(name),
    };
    await transporter.sendMail(mailOptions);

    // Return success response
    return res.status(201).json({
      token,
      user: { name: newUser.name, email: newUser.email },
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.email) {
      return res
        .status(409)
        .json({ message: "Email already registered", success: false });
    }

    // Generic server error
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset - BuildEstate Security",
      html: getPasswordResetTemplate(resetUrl),
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    return res
      .status(200)
      .json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({ token, success: true });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const logout = async (req, res) => {
  try {
    return res.json({ message: "Logged out", success: true });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

const requestAgent = async (req, res) => {
  try {
    const { phone, experience, licenseNumber, about, agency, location } =
      req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.agentRequestPending)
      return res.status(400).json({ message: "Request already pending" });

    user.agentRequestPending = true;
    user.agentRequestData = {
      phone,
      experience,
      licenseNumber,
      about,
      agency,
      location,
    };
    await user.save();

    // Send confirmation to user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Agent Application Received",
      html: `<p>Your request to become an agent has been received. We will review and notify you soon.</p>`,
    });

    // Notify admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAILS,
      subject: "New Agent Request",
      html: `<p>${user.name} (${user.email}) wants to become an agent.<br>
      <b>Phone:</b> ${phone}<br>
      <b>Experience:</b> ${experience}<br>
      <b>License Number:</b> ${licenseNumber}<br>
      <b>Agency:</b> ${agency}<br>
      <b>Location:</b> ${location}<br>
      <b>About:</b> ${about}</p>`,
    });

    res.json({ success: true, message: "Agent request submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const requestSeller = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.sellerRequestPending = true;
  await user.save();

  // Send admin notification (email logic here)
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: "New Seller Request",
    html: `<p>${user.name} (${user.email}) wants to become a seller.</p>`,
  });

  res.json({ success: true, message: "Seller request submitted" });
};

// get name and email

const getname = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

export {
  login,
  register,
  forgotpassword,
  resetpassword,
  adminlogin,
  logout,
  getname,
  requestAgent,
  requestSeller,
};

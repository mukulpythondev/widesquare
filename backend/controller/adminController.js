import Stats from "../models/statsModel.js";
import Property from "../models/propertymodel.js";
import Appointment from "../models/appointmentModel.js";
import User from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getEmailTemplate } from "../email.js";

const formatRecentProperties = (properties) => {
  return properties.map((property) => ({
    type: "property",
    description: `New property listed: ${property.title}`,
    timestamp: property.createdAt,
  }));
};

const formatRecentAppointments = (appointments) => {
  return appointments.map((appointment) => ({
    type: "appointment",
    description:
      appointment.userId && appointment.propertyId
        ? `${appointment.userId.name} scheduled viewing for ${appointment.propertyId.title}`
        : "Appointment scheduled",
    timestamp: appointment.createdAt,
  }));
};

// Add these helper functions before the existing exports
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      pendingAppointments,
      recentActivity,
      viewsData,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      User.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      getRecentActivity(),
      getViewsData(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        pendingAppointments,
        recentActivity,
        viewsData,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
    });
  }
};

const getRecentActivity = async () => {
  try {
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("propertyId", "title")
      .populate("userId", "name");

    // Filter out appointments with missing user or property data
    const validAppointments = recentAppointments.filter(
      (appointment) => appointment.userId && appointment.propertyId
    );

    return [
      ...formatRecentProperties(recentProperties),
      ...formatRecentAppointments(validAppointments),
    ].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
};

const getViewsData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Stats.aggregate([
      {
        $match: {
          endpoint: /^\/api\/products\/single\//,
          method: "GET",
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate dates for last 30 days
    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      labels.push(dateString);

      const stat = stats.find((s) => s._id === dateString);
      data.push(stat ? stat.count : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: "Property Views",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error("Error generating chart data:", error);
    return {
      labels: [],
      datasets: [
        {
          label: "Property Views",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }
};

// Add these new controller functions
// export const getAllAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find()
//       .populate({
//         path: "propertyId",
//         populate: [
//           { path: "assignedAgent", select: "name email" },
//           { path: "seller", select: "name email" },
//         ],
//       })
//       .populate("userId", "name email")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       appointments,
//     });
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching appointments",
//     });
//   }
// };

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate("propertyId userId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Send email notification using the template from email.js
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: appointment.userId.email,
      subject: `Viewing Appointment ${
        status.charAt(0).toUpperCase() + status.slice(1)
      } - BuildEstate`,
      html: getEmailTemplate(appointment, status),
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
    });
  }
};

// Become an agent request handling

export const getAgentRequests = async (req, res) => {
  try {
    const requests = await User.find(
      { agentRequestPending: true },
      "name email agentRequestData"
    );
    res.json({ success: true, requests });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching agent requests" });
  }
};

export const approveAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.agentRequestPending)
      return res.status(400).json({ message: "Invalid request" });

    user.role = "agent";
    user.agentRequestPending = false;
    user.agentRequestData = null;
    await user.save();

    // Notify user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Agent Application Approved",
      html: `<p>Congratulations! Your agent application has been approved.</p>`,
    });

    res.json({ success: true, message: "Agent approved" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.agentRequestPending)
      return res.status(400).json({ message: "Invalid request" });

    user.agentRequestPending = false;
    user.agentRequestData = null;
    await user.save();

    // Notify user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Agent Application Rejected",
      html: `<p>Sorry, your agent application was not approved at this time.</p>`,
    });

    res.json({ success: true, message: "Agent request rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const allAgents = async (req, res) => {
  try {
    // Find all agents and populate assigned properties
    const agents = await User.find({ role: "agent" }, "name email phone createdAt")
      .lean();

    // For each agent, find assigned properties
    const Property = (await import("../models/propertymodel.js")).default;
    const agentsWithProps = await Promise.all(
      agents.map(async (agent) => {
        const assignedProperties = await Property.find(
          { assignedAgent: agent._id },
          "title _id"
        ).lean();
        return { ...agent, assignedProperties };
      })
    );

    res.json({ success: true, agents: agentsWithProps });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching agents" });
  }
};
// become an agent property approval handling

export const assignPropertyToAgent = async (req, res) => {
  try {
    const { propertyId, agentId } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found", success: false });
    }
    property.assignedAgent = agentId;
    await property.save();
    res.json({
      message: "Property assigned to agent",
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", success: false });
  }
};

// Admin: Approve property
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId).populate(
      "seller"
    );
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    property.isApproved = true;
    property.status = "approved";
    property.approvedBy = req.user._id;
    await property.save();

    // Notify seller (agent or normal user)
    if (property.seller && property.seller.email) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: property.seller.email,
        subject: "Property Approved",
        html: `<p>Your property "${property.title}" has been approved and is now live on the website.</p>`,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Property approved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Reject property
export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId).populate(
      "seller"
    );
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    property.isApproved = false;
    property.status = "rejected";
    await property.save();

    // Notify seller (agent or normal user)
    if (property.seller && property.seller.email) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: property.seller.email,
        subject: "Property Rejected",
        html: `<p>Your property "${property.title}" was not approved by admin.</p>`,
      });
    }

    res.status(200).json({ success: true, message: "Property rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Get all assigned properties with agent info
export const assignedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      assignedAgent: { $ne: null },
    }).populate("assignedAgent", "name email");
    res.json({ properties, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", success: false });
  }
};

export const removeAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "agent") {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }
    user.role = "user";
    await user.save();
    res.json({ success: true, message: "Agent removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

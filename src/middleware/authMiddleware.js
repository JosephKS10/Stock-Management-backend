const jwt = require("jsonwebtoken");
const Admin = require('../models/adminModel');
const Site = require('../models/siteModel'); // Assuming you have a model for the site

// Combined function to authenticate both site and admin based on token type
const authenticateToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied. Invalid token format." });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a site token
    if (decoded.site_id) {
      const site = await Site.findById(decoded.site_id);
      if (!site) {
        return res.status(401).json({ message: "Invalid site token" });
      }
      req.site_id = decoded.site_id; // Attach site ID
      return next(); // Proceed with site authentication
    }

    // Check if it's an admin token
    if (decoded.admin_id) {
      const admin = await Admin.findById(decoded.admin_id);
      if (!admin) {
        return res.status(401).json({ message: "Invalid admin token" });
      }
      req.admin_id = decoded.admin_id; // Attach admin ID
      return next(); // Proceed with admin authentication
    }

    // If the token does not match either site or admin, return an error
    return res.status(401).json({ message: "Invalid token" });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = { authenticateToken };

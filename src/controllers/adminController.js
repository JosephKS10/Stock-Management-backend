const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create a new admin
    const newAdmin = new Admin({
      username,
      password,
    });

    // Save the admin
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: error.message });
  }
};

// Admin login (for generating JWT token)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { admin_id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: error.message });
  }
};

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Route to create a new admin
router.post("/create", adminController.createAdmin);

// Route for admin login (for generating JWT token)
router.post("/login", adminController.loginAdmin);

module.exports = router;

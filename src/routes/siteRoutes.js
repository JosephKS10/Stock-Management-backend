const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authenticate, getSiteData, createSite } = require("../controllers/siteController");
const router = express.Router();

router.post("/authenticate", authenticate);
router.get("/:site_id", authenticateToken, getSiteData);
router.post("/", createSite);

module.exports = router;
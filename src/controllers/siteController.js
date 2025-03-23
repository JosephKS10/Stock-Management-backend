const Site = require("../models/siteModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.authenticate = async (req, res) => {
  const { site_name, password } = req.body;

  try {
    // Normalize input: Convert site_name to lowercase and remove extra spaces
    const normalizedSiteName = site_name.trim().toLowerCase();

    // Find the site with case-insensitive search
    const site = await Site.findOne({ site_name: { $regex: new RegExp(`^${normalizedSiteName}$`, "i") } });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const isMatch = await bcrypt.compare(password, site.site_password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ site_id: site._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Authentication successful",
      auth_token: token,
      site_id: site._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSiteData = async (req, res) => {
  try {
    const site = await Site.findById(req.params.site_id).populate("product_list");
    if (!site) return res.status(404).json({ message: "Site not found" });

    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSite = async (req, res) => {
  try {
    const { site_password, organization_name, site_name, location, product_list } = req.body;
    
    // Normalize input to avoid case and space issues
    const normalizedSiteName = site_name.trim().toLowerCase();
    const normalizedOrgName = organization_name.trim().toLowerCase();

    // Check if a site with the same name already exists in the same organization
    const existingSite = await Site.findOne({
      site_name: { $regex: new RegExp(`^${normalizedSiteName}$`, "i") },
      organization_name: { $regex: new RegExp(`^${normalizedOrgName}$`, "i") }
    });

    if (existingSite) {
      return res.status(400).json({ message: "A site with this name already exists in the organization. Please enter a different site name." });
    }

    const hashedPassword = await bcrypt.hash(site_password, 10);

    const newSite = await Site.create({
      site_password: hashedPassword,
      organization_name,
      site_name,
      location,
      product_list,
    });

    res.status(201).json({
      message: "Site created successfully",
      site_id: newSite._id,
      site_name: newSite.site_name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mongoose = require("mongoose");
require("./productModel");

const siteSchema = new mongoose.Schema({
  site_password: { type: String, required: true },
  organization_name: { type: String, required: true },
  site_name: { type: String, required: true },
  location: { type: String, required: true },
  product_list: [{ type: String, required: true }] 
});

module.exports = mongoose.model("Site", siteSchema);
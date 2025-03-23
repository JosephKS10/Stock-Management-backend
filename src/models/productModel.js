const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique product IDs

const productSchema = new mongoose.Schema({
  product_id: { type: String, unique: true, default: uuidv4 }, // Custom product ID
  product_name: { type: String, required: true },
  product_image: { type: String }, 
  product_type: { type: String, enum: ["consumable", "others"], required: true }
});

// Ensure `product_id` is indexed for fast lookups
productSchema.index({ product_id: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);

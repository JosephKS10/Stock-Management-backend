const Product = require("../models/productModel");

// ✅ Create New Product API
exports.createProduct = async (req, res) => {
  try {
    const { product_name, product_image, product_type, product_id } = req.body;

    if (!product_name || !product_type || !product_id || !product_image) {
      return res.status(400).json({ message: "All information about the product is required" });
    }

    const newProduct = new Product({
      product_id,
      product_name,
      product_image,
      product_type
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Product List API (by product_id list)
exports.getProductList = async (req, res) => {
  try {
    const { product_ids } = req.body; 

    if (!product_ids || !Array.isArray(product_ids)) {
      return res.status(400).json({ message: "Invalid product ID list" });
    }

    const products = await Product.find({ product_id: { $in: product_ids } });

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Product API (by product_id)
exports.getSingleProduct = async (req, res) => {
  try {
    const { query } = req.params; // Expecting a product_id
    console.log(`Searching for product with product_id: ${query}`);

    const product = await Product.findOne({ product_id: query });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

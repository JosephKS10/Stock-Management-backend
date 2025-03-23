const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

router.post("/create", authenticateToken, productController.createProduct);
router.post("/list", authenticateToken, productController.getProductList);
router.get("/:query", authenticateToken, productController.getSingleProduct);

module.exports = router;

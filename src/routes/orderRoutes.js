const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// ✅ Protected API - Requires Auth Token
router.get("/active", authenticateToken, orderController.getActiveOrders);
router.get("/completed", authenticateToken, orderController.getCompletedOrders);
router.get("/:orderNumber", authenticateToken, orderController.getOrderById); // Get a single order

router.post("/create", authenticateToken, orderController.createOrder); // Create a new order
router.post("/last-three-orders", authenticateToken, orderController.getLastThreeOrders); // Get last 3 orders


router.put("/update-status", authenticateToken, orderController.updateOrderStatus); // Update order status
router.put("/update-delivery-date", authenticateToken, orderController.updateDeliveryDate);
router.put("/update-notes", authenticateToken, orderController.updateNotes);


module.exports = router;

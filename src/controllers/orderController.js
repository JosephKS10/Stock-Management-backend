const Order = require("../models/orderModel");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { site_info, cleaner_email, order_items, cleaner_room_photos } = req.body;

    // Validate required fields
    if (!site_info || !site_info.site_id || !cleaner_email || !order_items || order_items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!cleaner_room_photos || cleaner_room_photos.length !== 5) {
      return res.status(400).json({ message: "Exactly 5 cleaner room photos are required" });
    }

    // Validate all photos are S3 URLs
    const isValidUrl = (url) => url.startsWith('https://') && url.includes('.amazonaws.com');
    
    if (!cleaner_room_photos.every(isValidUrl)) {
      return res.status(400).json({ message: "Invalid room photo URLs" });
    }

    for (const item of order_items) {
      if (!item.product_id || !item.product_name || !item.quantity || 
          !item.item_photos || !item.item_photos.every(isValidUrl)) {
        return res.status(400).json({ message: "Each order item must have a valid structure with S3 URLs" });
      }
    }

    // Create new order
    const newOrder = new Order({
      site_info,
      cleaner_email,
      order_items,
      cleaner_room_photos
    });

    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all orders with "new order", "pending order", or "set delivery date" status
exports.getActiveOrders = async (req, res) => {
    try {
      const activeOrders = await Order.find({
        order_status: { $in: ["new order", "pending order", "set delivery date"] },
      }).sort({ order_date: -1 });
  
      res.status(200).json(activeOrders);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get all orders with "accepted" or "rejected" status
  exports.getCompletedOrders = async (req, res) => {
    try {
      const completedOrders = await Order.find({
        order_status: { $in: ["accepted", "rejected"] },
      }).sort({ order_date: -1 });
  
      res.status(200).json(completedOrders);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // get a single order by order number
  exports.getOrderById = async (req, res) => {
    try {
      const { orderNumber } = req.params;
  
      // Find order by order_number
      const order = await Order.findOne({ order_number: orderNumber });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: error.message });
    }
  };


  // Get last 3 orders for the same site based on order date
    exports.getLastThreeOrders = async (req, res) => {
    try {
      const { site_id, order_date } = req.body; // Expect site_id and order_date in request body
  
      if (!site_id || !order_date) {
        return res.status(400).json({ message: "Site ID and Order Date are required" });
      }
  
      // Convert order_date to a Date object
      const orderDate = new Date(order_date);
  
      // Find last 3 orders before or on the given date for the same site
      const lastOrders = await Order.find({
        "site_info.site_id": site_id,
        order_date: { $lt: orderDate } // Orders strictly before the given date
      })
        .sort({ order_date: -1 }) // Sort by latest order date
        .limit(3); // Get last 3 orders
  
      res.status(200).json(lastOrders);
    } catch (error) {
      console.error("Error fetching last 3 orders:", error);
      res.status(500).json({ message: error.message });
    }
  };


    // PUT REQUEST Update order status based on reason
    exports.updateOrderStatus = async (req, res) => {
    try {
      const { order_id, reason, delivery_date } = req.body;
  
      if (!order_id || !reason) {
        return res.status(400).json({ message: "Order ID and reason are required" });
      }
  
      // Define the status updates based on the reason
      let updatedFields = {};
  
      if (reason === "viewed") {
        updatedFields.order_status = "pending order";
      } else if (reason === "accepted" && !delivery_date) {
        updatedFields.order_status = "set delivery date";
      } else if (reason === "accepted" && delivery_date) {
        updatedFields.order_status = "accepted";
        updatedFields.delivery_date = new Date(delivery_date);
      } else if (reason === "rejected") {
        updatedFields.order_status = "rejected";
      } else {
        return res.status(400).json({ message: "Invalid reason provided" });
      }
  
      // Find and update the order
      const updatedOrder = await Order.findByIdAndUpdate(
        order_id,
        { $set: updatedFields },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: error.message });
    }
  };

    // Update order delivery date based on order number
    exports.updateDeliveryDate = async (req, res) => {
    try {
      const { order_number, delivery_date } = req.body;
  
      if (!order_number || !delivery_date) {
        return res.status(400).json({ message: "Order number and delivery date are required" });
      }
  
      // Find and update only the delivery date
      const updatedOrder = await Order.findOneAndUpdate(
        { order_number },
        { $set: { delivery_date: new Date(delivery_date) } }, // Only updating the delivery date
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json({ message: "Order delivery date updated successfully", order: updatedOrder });
    } catch (error) {
      console.error("Error updating delivery date:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Update order notes when rejected by admin
exports.updateNotes = async (req, res) => {
    try {
      const { order_number, notes } = req.body;
  
      if (!order_number || !notes) {
        return res.status(400).json({ message: "Order number and notes are required" });
      }
  
      // Find the order and update the notes
      const updatedOrder = await Order.findOneAndUpdate(
        { order_number },
        { $set: { notes } }, // Only updating the notes field
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json({ message: "Order notes updated successfully", order: updatedOrder });
    } catch (error) {
      console.error("Error updating order notes:", error);
      res.status(500).json({ message: error.message });
    }
  };
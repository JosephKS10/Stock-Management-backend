const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_number: { type: String, unique: true }, // Custom serial number
  site_info: {
    site_id: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
    organization_name: { type: String, required: true },
    site_name: { type: String, required: true },
    location: { type: String, required: true }
  },
  order_date: { type: Date, default: Date.now },
  cleaner_email: { type: String, required: true },
  order_items: [
    {
      product_id: { type: String, required: true },
      product_name: { type: String, required: true },
      product_image: { type: String },
      product_type: { type: String, enum: ["consumable", "others"], required: true },
      quantity: { type: Number, required: true },
      item_already_on_site: { type: Boolean, required: true },
      item_available_on_site: { type: Number, required: true },
      item_photos: { type: [String], validate: arr => arr.length === 2 } // Two image links
    }
  ],
  cleaner_room_photos: { type: [String], validate: arr => arr.length === 5 }, // Five image links
  order_status: { 
    type: String, 
    enum: ["new order", "pending order", "set delivery date", "accepted", "rejected"], 
    default: "new order"
  },
  delivery_date: { type: Date, default: null },
  notes: { type: String, default: "" }
});

orderSchema.pre("save", async function (next) {
  if (!this.order_number) {
    const lastOrder = await this.constructor.findOne().sort({ order_number: -1 });

    if (lastOrder && lastOrder.order_number) {
      const lastNumber = parseInt(lastOrder.order_number, 10);
      this.order_number = String(lastNumber + 1).padStart(5, "0");
    } else {
      this.order_number = "00001"; 
    }
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

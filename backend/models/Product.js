const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "General", trim: true },
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      enum: ["pkt", "kg", "ltr", "pcs", "btl", "can", "jar"],
      default: "pkt",
    },
    emoji: { type: String, default: "🛒" },
    img: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);

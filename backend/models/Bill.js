const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    customerName: { type: String, default: "Walk-in customer" },
    customerPhone: { type: String, default: "" },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        mrp: { type: Number, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true }
      }
    ],
    paymentMode: { type: String, enum: ["Cash", "UPI", "Card"], required: true },
    mrpTotal: { type: Number, required: true },
    savings: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);

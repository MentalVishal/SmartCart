const express = require("express");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { customerPhone, customerName, items, paymentMode } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: "Bill cannot be empty" });

    let customer = null;
    if (customerPhone && customerPhone.length === 10) {
      customer = await Customer.findOne({ phone: customerPhone });
      if (!customer && customerName && customerName.trim()) {
        customer = await Customer.create({
          name: customerName.trim(),
          phone: customerPhone,
          address: ""
        });
      }
    }

    const verifiedItems = [];
    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (!prod || prod.stock < item.qty) {
        return res.status(400).json({ message: `Only ${prod ? prod.stock : 0} in stock for ${item.name}` });
      }
      verifiedItems.push({
        productId: prod._id,
        name: prod.name,
        mrp: prod.mrp || prod.price,
        price: prod.price,
        qty: Number(item.qty)
      });
    }

    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
    }

    const mrpTotal = verifiedItems.reduce((a, i) => a + i.mrp * i.qty, 0);
    const total = verifiedItems.reduce((a, i) => a + i.price * i.qty, 0);
    const savings = Math.max(0, mrpTotal - total);

    const count = await Bill.countDocuments();
    const billNo = `SC-${1001 + count}`;

    const bill = await Bill.create({
      billNo,
      customerId: customer ? customer._id : null,
      customerName: customer ? customer.name : (customerName?.trim() || "Walk-in customer"),
      customerPhone: customer ? customer.phone : (customerPhone || ""),
      items: verifiedItems,
      paymentMode: paymentMode || "Cash",
      mrpTotal,
      savings,
      total
    });

    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

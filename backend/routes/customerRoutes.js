const express = require("express");
const Customer = require("../models/Customer");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a name and a 10 digit mobile number." });
    }
    const exists = await Customer.findOne({ phone });
    if (exists) return res.status(400).json({ message: "A customer with this mobile number already exists." });
    const customer = await Customer.create({
      name: name.trim(),
      phone,
      address: address?.trim() || ""
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

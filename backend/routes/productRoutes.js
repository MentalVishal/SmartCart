const express = require("express");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { name, category, mrp, price, stock, unit, emoji, img } = req.body;
    const sellPrice = Number(price);
    const mrpPrice = mrp !== "" && mrp !== undefined ? Number(mrp) : sellPrice;

    if (!name || !(sellPrice > 0) || !(mrpPrice >= sellPrice) || stock === "" || Number(stock) < 0) {
      return res.status(400).json({
        message: "Enter a name, valid prices (MRP must be equal to or greater than Selling Price), and stock."
      });
    }
    const product = await Product.create({
      name: name.trim(),
      category: category?.trim() || "General",
      mrp: mrpPrice,
      price: sellPrice,
      stock: Number(stock),
      unit: unit || "pkt",
      emoji: emoji?.trim() || "🛒",
      img: img || ""
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { name, category, mrp, price, stock, unit, emoji, img } = req.body;
    const sellPrice = Number(price);
    const mrpPrice = mrp !== "" && mrp !== undefined ? Number(mrp) : sellPrice;

    if (!name || !(sellPrice > 0) || !(mrpPrice >= sellPrice) || stock === "" || Number(stock) < 0) {
      return res.status(400).json({
        message: "Enter a name, valid prices (MRP must be equal to or greater than Selling Price), and stock."
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        category: category?.trim() || "General",
        mrp: mrpPrice,
        price: sellPrice,
        stock: Number(stock),
        unit: unit || "pkt",
        emoji: emoji?.trim() || "🛒",
        img: img !== undefined ? img : ""
      },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/stock", protect, async (req, res) => {
  try {
    const { mode, qty } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const q = Number(qty) || 0;
    const newStock = mode === "add" ? product.stock + q : mode === "rem" ? product.stock - q : q;
    if (newStock < 0) {
      return res.status(400).json({ message: "Stock cannot go below 0. Enter a smaller quantity." });
    }
    product.stock = newStock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Enter your email and password." });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "No account found with this email. Create an account first." });
    if (!user.active) return res.status(403).json({ message: "This account is deactivated. Please contact the admin." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: genToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || (password && password.length < 6)) {
      return res.status(400).json({ message: "Enter your name, a valid email and a password of 6 or more characters." });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "An account with this email already exists. Sign in instead." });
    const hashedPassword = await bcrypt.hash(password || "demo123", 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "Staff",
      active: true
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      token: genToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/users", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Enter a name and a valid email." });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "This email is already registered." });
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "Staff",
      active: true
    });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, active: user.active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/users/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.active = !user.active;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

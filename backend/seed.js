require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Bill = require("./models/Bill");
const seedProducts = require("./seedProducts.json");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Customer.deleteMany(),
      Bill.deleteMany()
    ]);

    const pw = await bcrypt.hash("demo123", 10);
    await User.insertMany([
      { name: "Shop Owner", email: "admin@smartcart.in", password: pw, role: "Admin", active: true },
      { name: "Rohit Sharma", email: "rohit@smartcart.in", password: pw, role: "Staff", active: true },
      { name: "Neha Singh", email: "neha@smartcart.in", password: pw, role: "Staff", active: true },
      { name: "Karan Mehta", email: "karan@smartcart.in", password: pw, role: "Staff", active: false }
    ]);

    const products = await Product.insertMany(seedProducts);

    const customers = await Customer.insertMany([
      { name: "Ramesh Kumar", phone: "9876500011", address: "12, Boring Road" },
      { name: "Sunita Devi", phone: "9876500022", address: "45, Kankarbagh" },
      { name: "Amit Singh", phone: "9876500033", address: "8, Rajendra Nagar" },
      { name: "Pooja Verma", phone: "9876500044", address: "21, Patliputra Colony" },
      { name: "Rakesh Yadav", phone: "9876500055", address: "3, Danapur Road" }
    ]);

    let bn = 1000;
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const modes = ["Cash", "UPI", "Cash", "UPI", "Card"];
    const bills = [];

    for (let d = 6; d >= 0; d--) {
      const k = 4 + Math.floor(rnd() * 4);
      for (let j = 0; j < k; j++) {
        const items = [];
        const m = 1 + Math.floor(rnd() * 4);
        for (let t = 0; t < m; t++) {
          const p = products[Math.floor(rnd() * products.length)];
          if (!items.find((x) => x.productId.equals(p._id))) {
            items.push({
              productId: p._id,
              name: p.name,
              mrp: p.mrp,
              price: p.price,
              qty: 1 + Math.floor(rnd() * 3)
            });
          }
        }
        const c = rnd() < 0.65 ? customers[Math.floor(rnd() * customers.length)] : null;
        const pay = modes[Math.floor(rnd() * modes.length)];
        const mrpTotal = items.reduce((a, i) => a + i.mrp * i.qty, 0);
        const total = items.reduce((a, i) => a + i.price * i.qty, 0);
        const savings = Math.max(0, mrpTotal - total);

        bills.push({
          billNo: `SC-${++bn}`,
          customerId: c ? c._id : null,
          customerName: c ? c.name : "Walk-in customer",
          customerPhone: c ? c.phone : "",
          items,
          paymentMode: pay,
          mrpTotal,
          savings,
          total,
          createdAt: new Date(Date.now() - d * 864e5 - j * 36e5)
        });
      }
    }

    await Bill.insertMany(bills);
    console.log("Database seeded successfully with Shubh Kirana Store data!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();

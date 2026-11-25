import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Warehouse,
  Users,
  FileText,
  ShieldCheck,
  ShoppingCart,
  LogOut,
  Moon,
  Plus,
  Camera,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import api from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import ReceiptModal from "./components/ReceiptModal";
import {
  SHOP,
  fm,
  dt,
  ini,
  hue,
  stockStatus,
  payChip,
  offPct,
  resizeImage,
} from "./utils/helpers";
import "./App.css";

const TITLES = {
  dashboard: ["Dashboard", "Namaste! Today’s sales and stock at a glance"],
  billing: ["Billing", "Tap products, set quantity and make the bill"],
  products: [
    "Products",
    "Add, update or delete items, MRP, selling price and photos",
  ],
  inventory: [
    "Inventory",
    "Monitor stock of atta, dal, tel and everything else",
  ],
  customers: ["Customers", "Everyone who has purchased from your store"],
  sales: [
    "Sales records",
    "Billing history with customer savings stored in database",
  ],
  users: ["User management", "Admin panel: control who can access SmartCart"],
};

function MainApp() {
  const { user, logoutUser } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [users, setUsers] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  // Filters
  const [prodSearch, setProdSearch] = useState("");
  const [prodCat, setProdCat] = useState("All");
  const [invSearch, setInvSearch] = useState("");
  const [invStatus, setInvStatus] = useState("All");
  const [salesSearch, setSalesSearch] = useState("");
  const [salesPay, setSalesPay] = useState("All");

  // Modals
  const [prodModal, setProdModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [custModal, setCustModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "", address: "" });
  const [custHistoryModal, setCustHistoryModal] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Staff",
  });
  const [modalErr, setModalErr] = useState("");

  const notify = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  };

  const refreshData = async () => {
    if (!user) return;
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get("/products"),
        api.get("/customers"),
        api.get("/bills"),
      ]);
      setProducts(pRes.data);
      setCustomers(cRes.data);
      setBills(bRes.data);
      if (user.role === "Admin") {
        const uRes = await api.get("/auth/users");
        setUsers(uRes.data);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403)
        logoutUser();
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (TITLES[tab]) document.title = `${TITLES[tab][0]} – SmartCart`;
  }, [tab]);

  if (!user) return <Login />;

  const lowCount = products.filter((p) => p.stock <= 10).length;

  const navItems = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["billing", Receipt, "Billing"],
    ["products", Package, "Products"],
    ["inventory", Warehouse, "Inventory"],
    ["customers", Users, "Customers"],
    ["sales", FileText, "Sales records"],
    ...(user.role === "Admin" ? [["users", ShieldCheck, "Users"]] : []),
  ];

  const toggleTheme = () => {
    const r = document.documentElement;
    const isDark = r.dataset.theme
      ? r.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme:dark)").matches;
    r.dataset.theme = isDark ? "light" : "dark";
  };

  const filteredProducts = products.filter(
    (p) =>
      (prodCat === "All" || p.category === prodCat) &&
      p.name.toLowerCase().includes(prodSearch.toLowerCase()),
  );

  const filteredInventory = products.filter(
    (p) =>
      (invStatus === "All" || stockStatus(p)[0] === invStatus) &&
      p.name.toLowerCase().includes(invSearch.toLowerCase()),
  );

  const filteredSales = bills.filter(
    (b) =>
      (salesPay === "All" || b.paymentMode === salesPay) &&
      (b.billNo + b.customerName)
        .toLowerCase()
        .includes(salesSearch.toLowerCase()),
  );

  return (
    <div className="app">
      <aside>
        <div className="shubh-tag">
          卐 शुभ &nbsp;·&nbsp; ॥ श्री गणेशाय नमः ॥ &nbsp;·&nbsp; लाभ 卐
        </div>
        <div className="logo">
          <span className="lgo">
            <ShoppingCart size={18} />
          </span>
          <span>
            SmartCart
            <small
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: 11,
                color: "#fde68a",
              }}
            >
              {SHOP}
            </small>
          </span>
        </div>

        {navItems.map(([key, Icon, label]) => (
          <a
            key={key}
            href={`#${key}`}
            className={tab === key ? "on" : ""}
            onClick={(e) => {
              e.preventDefault();
              setTab(key);
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
            {key === "inventory" && lowCount > 0 && (
              <span className="nb">{lowCount}</span>
            )}
          </a>
        ))}

        <div className="me">
          <span className="av">{ini(user.name)}</span>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
          <button
            className="lo"
            onClick={logoutUser}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main>
        <div className="hd">
          <div>
            <h1>{TITLES[tab][0]}</h1>
            <p>{TITLES[tab][1]}</p>
          </div>
          <div className="ac">
            {tab === "products" && (
              <button
                className="btn p"
                onClick={() => {
                  setModalErr("");
                  setProdModal({
                    name: "",
                    category: "",
                    mrp: "",
                    price: "",
                    stock: "",
                    unit: "pkt",
                    emoji: "",
                    img: "",
                  });
                }}
              >
                <Plus size={16} /> Add product
              </button>
            )}
            {tab === "customers" && (
              <button
                className="btn p"
                onClick={() => {
                  setModalErr("");
                  setNewCust({ name: "", phone: "", address: "" });
                  setCustModal(true);
                }}
              >
                <Plus size={16} /> Add customer
              </button>
            )}
            {tab === "users" && (
              <button
                className="btn p"
                onClick={() => {
                  setModalErr("");
                  setNewUser({ name: "", email: "", role: "Staff" });
                  setUserModal(true);
                }}
              >
                <Plus size={16} /> Add user
              </button>
            )}
            {tab !== "billing" &&
              tab !== "products" &&
              tab !== "customers" &&
              tab !== "users" && (
                <button className="btn p" onClick={() => setTab("billing")}>
                  <Plus size={16} /> New bill
                </button>
              )}
            <button
              className="btn ib"
              onClick={toggleTheme}
              aria-label="Switch light or dark theme"
            >
              <Moon size={16} />
            </button>
          </div>
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <Dashboard
            products={products}
            bills={bills}
            onSelectBill={(b) => setSelectedBill(b)}
            onOpenStock={(p) => {
              setModalErr("");
              setStockModal({ product: p, mode: "add", qty: 0 });
            }}
          />
        )}

        {/* BILLING */}
        {tab === "billing" && (
          <Billing
            products={products}
            customers={customers}
            bills={bills}
            refreshData={refreshData}
            notify={notify}
          />
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <>
            <div className="tb">
              <input
                className="in"
                placeholder="Search products"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
              />
              <select
                className="in"
                value={prodCat}
                onChange={(e) => setProdCat(e.target.value)}
              >
                {["All", ...new Set(products.map((p) => p.category))].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="card wrap" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="r">MRP</th>
                    <th className="r">Selling Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length ? (
                    filteredProducts.map((p) => {
                      const pct = offPct(p.mrp, p.price);
                      return (
                        <tr key={p._id}>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              {p.img ? (
                                <img className="th" src={p.img} alt={p.name} />
                              ) : (
                                <div
                                  className="th ph"
                                  style={{ "--h": hue(p.category) }}
                                >
                                  {p.emoji || "🛒"}
                                </div>
                              )}
                              <b style={{ fontWeight: 500 }}>{p.name}</b>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td className="r">
                            {p.mrp > p.price ? (
                              <span className="mrp" style={{ fontSize: 13 }}>
                                {fm(p.mrp)}
                              </span>
                            ) : (
                              fm(p.mrp || p.price)
                            )}
                          </td>
                          <td className="r">
                            <b>{fm(p.price)}</b>{" "}
                            {pct > 0 && (
                              <span
                                className="ch2 ok"
                                style={{ marginLeft: 4 }}
                              >
                                {pct}% off
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`ch2 ${stockStatus(p)[1]}`}>
                              {p.stock} {p.unit}
                            </span>
                          </td>
                          <td className="r">
                            <button
                              className="btn sm"
                              onClick={() => {
                                setModalErr("");
                                setProdModal({ ...p, mrp: p.mrp || p.price });
                              }}
                            >
                              Edit
                            </button>{" "}
                            <button
                              className="btn sm d"
                              onClick={() => setDeleteModal(p)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="mu">
                        No products match.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* INVENTORY */}
        {tab === "inventory" && (
          <>
            <div className="kp kp3">
              {[
                ["In stock", "ok", "Healthy"],
                ["Low stock", "wn", "10 or fewer"],
                ["Out of stock", "er", "Reorder now"],
              ].map(([label, cls, desc]) => (
                <div className="card" key={label} style={{ display: "block" }}>
                  <small>{label}</small>
                  <b>
                    {products.filter((p) => stockStatus(p)[0] === label).length}
                  </b>
                  <span className={`ch2 ${cls}`}>{desc}</span>
                </div>
              ))}
            </div>
            <div className="tb">
              <input
                className="in"
                placeholder="Search products"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
              />
              <select
                className="in"
                value={invStatus}
                onChange={(e) => setInvStatus(e.target.value)}
              >
                {["All", "In stock", "Low stock", "Out of stock"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="card wrap" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock level</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length ? (
                    filteredInventory.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            {p.img ? (
                              <img className="th" src={p.img} alt={p.name} />
                            ) : (
                              <div
                                className="th ph"
                                style={{ "--h": hue(p.category) }}
                              >
                                {p.emoji || "🛒"}
                              </div>
                            )}
                            <b style={{ fontWeight: 500 }}>{p.name}</b>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <span className="pb">
                            <i
                              className={stockStatus(p)[1]}
                              style={{
                                width: `${Math.min(100, (p.stock / 60) * 100)}%`,
                              }}
                            />
                          </span>
                          <b>{p.stock}</b> {p.unit}
                        </td>
                        <td>
                          <span className={`ch2 ${stockStatus(p)[1]}`}>
                            {stockStatus(p)[0]}
                          </span>
                        </td>
                        <td className="r">
                          <button
                            className="btn sm"
                            onClick={() => {
                              setModalErr("");
                              setStockModal({
                                product: p,
                                mode: "add",
                                qty: 0,
                              });
                            }}
                          >
                            Update stock
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="mu">
                        No products match.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CUSTOMERS */}
        {tab === "customers" && (
          <div className="card wrap" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th className="r">Bills</th>
                  <th className="r">Total spent</th>
                  <th>Last purchase</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const cBills = bills.filter((b) => b.customerId === c._id);
                  return (
                    <tr
                      key={c._id}
                      className="k"
                      onClick={() => setCustHistoryModal(c)}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <span
                            className="av"
                            style={{ width: 30, height: 30, fontSize: 12 }}
                          >
                            {ini(c.name)}
                          </span>
                          <b style={{ fontWeight: 500 }}>{c.name}</b>
                        </div>
                      </td>
                      <td>{c.phone}</td>
                      <td>{c.address || "-"}</td>
                      <td className="r">{cBills.length}</td>
                      <td className="r">
                        <b>{fm(cBills.reduce((a, b) => a + b.total, 0))}</b>
                      </td>
                      <td>{cBills[0] ? dt(cBills[0].createdAt) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SALES RECORDS */}
        {tab === "sales" && (
          <>
            <div className="tb">
              <input
                className="in"
                placeholder="Search bill number or customer"
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
              />
              <select
                className="in"
                value={salesPay}
                onChange={(e) => setSalesPay(e.target.value)}
              >
                {["All", "Cash", "UPI", "Card"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="mu" style={{ marginLeft: "auto" }}>
                {filteredSales.length} bills,{" "}
                {fm(filteredSales.reduce((a, b) => a + b.total, 0))}
              </span>
            </div>
            <div className="card wrap" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Bill no</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th className="r">Customer Saved</th>
                    <th className="r">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length ? (
                    filteredSales.map((b) => (
                      <tr
                        key={b._id}
                        className="k"
                        onClick={() => setSelectedBill(b)}
                      >
                        <td>
                          <b>{b.billNo}</b>
                        </td>
                        <td>{dt(b.createdAt)}</td>
                        <td>{b.customerName}</td>
                        <td>{b.items.reduce((a, i) => a + i.qty, 0)}</td>
                        <td>
                          <span className={`ch2 ${payChip(b.paymentMode)}`}>
                            {b.paymentMode}
                          </span>
                        </td>
                        <td className="r">
                          {b.savings > 0 ? (
                            <span className="ch2 ok">{fm(b.savings)}</span>
                          ) : (
                            <span className="mu">-</span>
                          )}
                        </td>
                        <td className="r">
                          <b>{fm(b.total)}</b>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="mu">
                        No bills found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* USERS (ADMIN ONLY) */}
        {tab === "users" && user.role === "Admin" && (
          <div className="card wrap" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="av"
                          style={{ width: 30, height: 30, fontSize: 12 }}
                        >
                          {ini(u.name)}
                        </span>
                        <b style={{ fontWeight: 500 }}>{u.name}</b>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`ch2 ${u.role === "Admin" ? "in2" : "nt"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`ch2 ${u.active ? "ok" : "er"}`}>
                        {u.active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="r">
                      {u._id === user._id ? (
                        <small>This is you</small>
                      ) : (
                        <button
                          className={`btn sm ${u.active ? "d" : ""}`}
                          onClick={async () => {
                            await api.patch(`/auth/users/${u._id}/toggle`);
                            await refreshData();
                            notify(
                              `${u.name} ${u.active ? "deactivated" : "activated"}`,
                            );
                          }}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ADD/EDIT PRODUCT MODAL */}
      {prodModal && (
        <div
          className="md"
          onClick={(e) =>
            e.target.classList.contains("md") && setProdModal(null)
          }
        >
          <div className="bx" style={{ maxWidth: 440 }}>
            <h2>{prodModal._id ? "Edit product" : "Add product"}</h2>
            <label className="upl" htmlFor="up">
              <span className="pv">
                {prodModal.img ? (
                  <img src={prodModal.img} alt="" />
                ) : (
                  <Camera size={24} />
                )}
              </span>
              <span>
                <b>Upload product photo</b>
                <small style={{ display: "block" }}>
                  JPG or PNG, resized automatically. Optional, an emoji is used
                  otherwise.
                </small>
              </span>
            </label>
            <input
              type="file"
              id="up"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                if (!f.type.startsWith("image/")) {
                  setModalErr("Please choose an image file (JPG or PNG).");
                  return;
                }
                resizeImage(f, (dataUrl) => {
                  setProdModal({ ...prodModal, img: dataUrl });
                  setModalErr("");
                });
              }}
            />
            <label>Product name</label>
            <input
              className="in"
              value={prodModal.name}
              onChange={(e) =>
                setProdModal({ ...prodModal, name: e.target.value })
              }
            />
            <label>Category</label>
            <input
              className="in"
              list="catlist"
              value={prodModal.category}
              onChange={(e) =>
                setProdModal({ ...prodModal, category: e.target.value })
              }
            />
            <datalist id="catlist">
              {[...new Set(products.map((x) => x.category))].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <div className="two">
              <div>
                <label>MRP (₹)</label>
                <input
                  className="in"
                  type="number"
                  min="0"
                  placeholder="Printed MRP"
                  value={prodModal.mrp}
                  onChange={(e) =>
                    setProdModal({ ...prodModal, mrp: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Selling Price (₹)</label>
                <input
                  className="in"
                  type="number"
                  min="0"
                  placeholder="Discounted rate"
                  value={prodModal.price}
                  onChange={(e) =>
                    setProdModal({ ...prodModal, price: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="two">
              <div>
                <label>Stock quantity</label>
                <input
                  className="in"
                  type="number"
                  min="0"
                  value={prodModal.stock}
                  onChange={(e) =>
                    setProdModal({ ...prodModal, stock: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Unit</label>
                <select
                  className="in"
                  value={prodModal.unit}
                  onChange={(e) =>
                    setProdModal({ ...prodModal, unit: e.target.value })
                  }
                >
                  {["pkt", "kg", "ltr", "pcs", "btl"].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label>Emoji (optional)</label>
            <input
              className="in"
              maxLength={4}
              placeholder="🛒"
              value={prodModal.emoji}
              onChange={(e) =>
                setProdModal({ ...prodModal, emoji: e.target.value })
              }
            />
            <p className="er2">{modalErr}</p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={() => setProdModal(null)}>
                Cancel
              </button>
              <button
                className="btn p"
                onClick={async () => {
                  try {
                    if (prodModal._id) {
                      await api.put(`/products/${prodModal._id}`, prodModal);
                      notify("Product updated");
                    } else {
                      await api.post("/products", prodModal);
                      notify("Product added");
                    }
                    setProdModal(null);
                    await refreshData();
                  } catch (err) {
                    setModalErr(
                      err.response?.data?.message || "Failed to save product",
                    );
                  }
                }}
              >
                Save product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT MODAL */}
      {deleteModal && (
        <div
          className="md"
          onClick={(e) =>
            e.target.classList.contains("md") && setDeleteModal(null)
          }
        >
          <div className="bx" style={{ maxWidth: 400 }}>
            <h2>Delete this product?</h2>
            <p className="mu">
              {deleteModal.name} will be removed from the product list. Past
              bills stay unchanged.
            </p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={() => setDeleteModal(null)}>
                Keep product
              </button>
              <button
                className="btn p"
                onClick={async () => {
                  await api.delete(`/products/${deleteModal._id}`);
                  setDeleteModal(null);
                  await refreshData();
                  notify("Product deleted");
                }}
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STOCK MODAL */}
      {stockModal && (
        <div
          className="md"
          onClick={(e) =>
            e.target.classList.contains("md") && setStockModal(null)
          }
        >
          <div className="bx" style={{ maxWidth: 420 }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              {stockModal.product.img ? (
                <img className="th" src={stockModal.product.img} alt="" />
              ) : (
                <div
                  className="th ph"
                  style={{ "--h": hue(stockModal.product.category) }}
                >
                  {stockModal.product.emoji || "🛒"}
                </div>
              )}
              <div>
                <b>{stockModal.product.name}</b>
                <div className="mu">
                  Current stock: {stockModal.product.stock}{" "}
                  {stockModal.product.unit}
                </div>
              </div>
            </div>
            <div className="seg">
              {[
                ["add", "Add stock"],
                ["rem", "Remove stock"],
                ["set", "Set quantity"],
              ].map(([m, lbl]) => (
                <button
                  key={m}
                  className={stockModal.mode === m ? "on" : ""}
                  onClick={() => setStockModal({ ...stockModal, mode: m })}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <label>Quantity</label>
            <input
              className="in"
              type="number"
              min="0"
              value={stockModal.qty}
              onChange={(e) =>
                setStockModal({ ...stockModal, qty: +e.target.value })
              }
            />
            <p className="mu" style={{ margin: "10px 0 0" }}>
              New stock will be{" "}
              {Math.max(
                0,
                stockModal.mode === "add"
                  ? stockModal.product.stock + (Number(stockModal.qty) || 0)
                  : stockModal.mode === "rem"
                    ? stockModal.product.stock - (Number(stockModal.qty) || 0)
                    : Number(stockModal.qty) || 0,
              )}{" "}
              {stockModal.product.unit}.
            </p>
            <p className="er2">{modalErr}</p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={() => setStockModal(null)}>
                Cancel
              </button>
              <button
                className="btn p"
                onClick={async () => {
                  try {
                    const { data } = await api.patch(
                      `/products/${stockModal.product._id}/stock`,
                      {
                        mode: stockModal.mode,
                        qty: stockModal.qty,
                      },
                    );
                    setStockModal(null);
                    await refreshData();
                    notify(`Stock updated to ${data.stock} ${data.unit}`);
                  } catch (err) {
                    setModalErr(
                      err.response?.data?.message || "Invalid stock quantity",
                    );
                  }
                }}
              >
                Save stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {custModal && (
        <div
          className="md"
          onClick={(e) =>
            e.target.classList.contains("md") && setCustModal(false)
          }
        >
          <div className="bx" style={{ maxWidth: 400 }}>
            <h2>Add customer</h2>
            <label>Name</label>
            <input
              className="in"
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
            />
            <label>Mobile number</label>
            <input
              className="in"
              inputMode="tel"
              maxLength={10}
              value={newCust.phone}
              onChange={(e) =>
                setNewCust({
                  ...newCust,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            <label>Address</label>
            <input
              className="in"
              value={newCust.address}
              onChange={(e) =>
                setNewCust({ ...newCust, address: e.target.value })
              }
            />
            <p className="er2">{modalErr}</p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={() => setCustModal(false)}>
                Cancel
              </button>
              <button
                className="btn p"
                onClick={async () => {
                  try {
                    await api.post("/customers", newCust);
                    setCustModal(false);
                    await refreshData();
                    notify("Customer added");
                  } catch (err) {
                    setModalErr(
                      err.response?.data?.message || "Failed to add customer",
                    );
                  }
                }}
              >
                Save customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER HISTORY MODAL */}
      {custHistoryModal && (
        <div
          className="md"
          onClick={(e) =>
            e.target.classList.contains("md") && setCustHistoryModal(null)
          }
        >
          <div className="bx" style={{ maxWidth: 420 }}>
            <h2>{custHistoryModal.name}</h2>
            <p className="mu" style={{ margin: "2px 0 8px" }}>
              {custHistoryModal.phone}
              {custHistoryModal.address ? `, ${custHistoryModal.address}` : ""}
            </p>
            {bills.filter((b) => b.customerId === custHistoryModal._id)
              .length ? (
              bills
                .filter((b) => b.customerId === custHistoryModal._id)
                .map((x) => (
                  <div className="row" key={x._id}>
                    <div className="f1">
                      <b>{x.billNo}</b>
                      <small>
                        {dt(x.createdAt)}, {x.items.length} items,{" "}
                        {x.paymentMode}
                      </small>
                    </div>
                    <b>{fm(x.total)}</b>
                  </div>
                ))
            ) : (
              <p className="mu">No purchases yet.</p>
            )}
            <div style={{ textAlign: "right", marginTop: 14 }}>
              <button className="btn" onClick={() => setCustHistoryModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {userModal && (
        <div
          className="md"
          onClick={(e) =>
            e.target.classList.contains("md") && setUserModal(false)
          }
        >
          <div className="bx" style={{ maxWidth: 400 }}>
            <h2>Add user</h2>
            <label>Full name</label>
            <input
              className="in"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <label>Email</label>
            <input
              className="in"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <label>Role</label>
            <select
              className="in"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
            <p className="er2">{modalErr}</p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={() => setUserModal(false)}>
                Cancel
              </button>
              <button
                className="btn p"
                onClick={async () => {
                  try {
                    await api.post("/auth/users", newUser);
                    setUserModal(false);
                    await refreshData();
                    notify("User added (Default password: demo123)");
                  } catch (err) {
                    setModalErr(
                      err.response?.data?.message || "Failed to add user",
                    );
                  }
                }}
              >
                Save user
              </button>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal bill={selectedBill} onClose={() => setSelectedBill(null)} />

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

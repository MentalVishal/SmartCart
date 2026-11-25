import React, { useState } from "react";
import { Search, X } from "lucide-react";
import api from "../api";
import ReceiptModal from "../components/ReceiptModal";
import { fm, hue, stockStatus, offPct } from "../utils/helpers";

export default function Billing({
  products,
  customers,
  bills,
  refreshData,
  notify,
}) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState("");
  const [custName, setCustName] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [generatedBill, setGeneratedBill] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const existingCust = customers.find((c) => c.phone === phone);
  const prevBillsCount = existingCust
    ? bills.filter((b) => b.customerId === existingCust._id).length
    : 0;

  const handlePhoneChange = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);
    const found = customers.find((c) => c.phone === clean);
    if (found) setCustName(found.name);
  };

  const addToCart = (prod) => {
    const existing = cart.find((i) => i.productId === prod._id);
    const nextQty = (existing ? existing.qty : 0) + 1;
    if (nextQty > prod.stock)
      return notify(`Only ${prod.stock} ${prod.unit} in stock`);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.productId === prod._id ? { ...i, qty: nextQty } : i,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          productId: prod._id,
          name: prod.name,
          mrp: prod.mrp || prod.price,
          price: prod.price,
          qty: 1,
        },
      ]);
    }
  };

  const updateQty = (id, delta) => {
    const prod = products.find((p) => p._id === id);
    setCart(
      cart
        .map((i) => {
          if (i.productId !== id) return i;
          const nq = i.qty + delta;
          if (prod && nq > prod.stock) {
            notify(`Only ${prod.stock} ${prod.unit} in stock`);
            return i;
          }
          return { ...i, qty: nq };
        })
        .filter((i) => i.qty > 0),
    );
  };

  const mrpTotal = cart.reduce((a, b) => a + (b.mrp || b.price) * b.qty, 0);
  const totalAmount = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const totalSavings = Math.max(0, mrpTotal - totalAmount);
  const totalItems = cart.reduce((a, b) => a + b.qty, 0);

  const handleCheckout = async () => {
    if (!cart.length || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/bills", {
        customerPhone: phone,
        customerName: custName.trim(),
        items: cart,
        paymentMode: payMode,
      });
      setGeneratedBill(data);
      setCart([]);
      setPhone("");
      setCustName("");
      setPayMode("Cash");
      await refreshData();
      notify(`Bill ${data.billNo} generated`);
    } catch (err) {
      notify(err.response?.data?.message || "Billing failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="pos">
      <section>
        <div className="scan">
          <Search size={18} />
          <input
            className="in"
            placeholder="Search items, e.g. atta, dal, tel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cats">
          {categories.map((c) => (
            <button
              key={c}
              className={`cat ${cat === c ? "on" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="pgrid">
          {filtered.length ? (
            filtered.map((p) => {
              const inCart = cart.find((x) => x.productId === p._id);
              const pct = offPct(p.mrp, p.price);
              return (
                <button
                  key={p._id}
                  className="pt"
                  disabled={p.stock === 0}
                  onClick={() => addToCart(p)}
                >
                  {pct > 0 && <span className="offb">{pct}% OFF</span>}
                  {inCart && <span className="qb">{inCart.qty}</span>}
                  {p.img ? (
                    <img className="im" src={p.img} alt={p.name} />
                  ) : (
                    <div className="im ph" style={{ "--h": hue(p.category) }}>
                      {p.emoji || "🛒"}
                    </div>
                  )}
                  <b>{p.name}</b>
                  <div className="m">
                    <span>
                      {p.mrp > p.price && (
                        <span className="mrp">{fm(p.mrp)}</span>
                      )}
                      <span className="sell-pr">{fm(p.price)}</span>
                    </span>
                    <span className={`ch2 ${stockStatus(p)[1]}`}>
                      {p.stock ? `${p.stock} left` : "Out"}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="mu">No products match.</p>
          )}
        </div>
      </section>

      <section className="card cp">
        <div className="ch1">
          <h2>
            Current bill{" "}
            <small>
              {totalItems
                ? `· ${totalItems} ${totalItems > 1 ? "items" : "item"}`
                : ""}
            </small>
          </h2>
          <button className="btn sm" onClick={() => setCart([])}>
            Clear
          </button>
        </div>
        <div className="cb">
          <input
            className="in"
            placeholder="Customer mobile"
            inputMode="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          <input
            className="in"
            placeholder="Customer name"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
          />
          <div className="cu">
            {existingCust ? (
              <div className="lc">
                <span>
                  <b>{existingCust.name}</b>
                </span>
                <span className="mu">
                  {prevBillsCount} previous{" "}
                  {prevBillsCount === 1 ? "bill" : "bills"}
                </span>
              </div>
            ) : phone.length === 10 ? (
              <small className="mu">
                New customer. Add a name to save them.
              </small>
            ) : null}
          </div>
        </div>

        <div className="lines">
          {cart.length ? (
            cart.map((item) => (
              <div className="ln" key={item.productId}>
                <div className="f1">
                  <b>{item.name}</b>
                  <small>
                    {item.mrp > item.price && (
                      <span className="mrp">{fm(item.mrp)}</span>
                    )}
                    {fm(item.price)} each
                  </small>
                </div>
                <div className="q">
                  <button onClick={() => updateQty(item.productId, -1)}>
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, 1)}>
                    +
                  </button>
                </div>
                <b className="amt">{fm(item.price * item.qty)}</b>
                <button
                  className="btn sm ib d"
                  style={{ width: 26, height: 26 }}
                  onClick={() => updateQty(item.productId, -999)}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="em">
              The bill is empty.
              <br />
              Tap an item to add it.
            </div>
          )}
        </div>

        <div className="ft">
          <small>Payment mode</small>
          <div className="seg">
            {["Cash", "UPI", "Card"].map((m) => (
              <button
                key={m}
                className={payMode === m ? "on" : ""}
                onClick={() => setPayMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="sl">
            <span className="mu">Items</span>
            <span>{totalItems}</span>
          </div>
          {totalSavings > 0 && (
            <div className="sl">
              <span className="mu">Total MRP</span>
              <span className="mrp" style={{ fontSize: 13.5 }}>
                {fm(mrpTotal)}
              </span>
            </div>
          )}
          <div className="sl gt">
            <span>Total</span>
            <span>{fm(totalAmount)}</span>
          </div>
          {totalSavings > 0 && (
            <div className="sav-box">
              <span>🎉 Customer Savings</span>
              <span>{fm(totalSavings)} saved!</span>
            </div>
          )}
          <button
            className="btn p go"
            disabled={!cart.length || submitting}
            onClick={handleCheckout}
          >
            {submitting ? "Generating..." : "Generate bill"}
          </button>
        </div>
      </section>

      <ReceiptModal
        bill={generatedBill}
        onClose={() => setGeneratedBill(null)}
      />
    </div>
  );
}

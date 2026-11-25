import React from "react";
import { IndianRupee, CreditCard, Package, AlertTriangle } from "lucide-react";
import { fm, dt, hue, stockStatus, payChip } from "../utils/helpers";

export default function Dashboard({ products, bills, onSelectBill, onOpenStock }) {
  const dayKey = (offset) => new Date(Date.now() - offset * 864e5).toDateString();
  const sumDay = (offset) =>
    bills
      .filter((b) => new Date(b.createdAt).toDateString() === dayKey(offset))
      .reduce((a, b) => a + b.total, 0);

  const todaySales = sumDay(0);
  const yesterdaySales = sumDay(1);
  const pctChange = yesterdaySales ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0;
  const todayBillsCount = bills.filter((b) => new Date(b.createdAt).toDateString() === dayKey(0)).length;

  const lowStock = products.filter((p) => p.stock <= 10);
  const categoryCount = new Set(products.map((p) => p.category)).size;

  // 7-day sales array
  const d7 = [6, 5, 4, 3, 2, 1, 0].map(sumDay);
  const W = 560,
    H = 200,
    l = 34;
  const mx = Math.max(...d7, 1) * 1.15;
  const X = (i) => l + (i * (W - l - 12)) / 6;
  const Y = (y) => H - 28 - (y / mx) * (H - 48);
  const pts = d7.map((y, i) => [X(i), Y(y)]);
  const linePath = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");

  // Payment modes
  const pm = {};
  bills.forEach((b) => {
    pm[b.paymentMode] = (pm[b.paymentMode] || 0) + b.total;
  });
  const pmTotal = Object.values(pm).reduce((a, b) => a + b, 0) || 1;
  const pmColors = { Cash: "#d97706", UPI: "#15803d", Card: "#1d4ed8" };

  // Best selling items
  const tp = {};
  bills.forEach((b) =>
    b.items.forEach((i) => {
      const key = i.productId || i.name;
      if (!tp[key]) tp[key] = { name: i.name, price: i.price, qty: 0, productId: i.productId };
      tp[key].qty += i.qty;
    })
  );
  const topItems = Object.values(tp)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <>
      <div className="kp">
        <div className="card">
          <span className="kc" style={{ background: "linear-gradient(135deg,#f59e0b25,#d9480f25)", color: "#d9480f" }}>
            <IndianRupee size={22} />
          </span>
          <div>
            <small>Sales today</small>
            <b>{fm(todaySales)}</b>
            <span className={`dl ${pctChange >= 0 ? "up" : "dn"}`}>
              {pctChange >= 0 ? "▲" : "▼"} {Math.abs(pctChange)}% vs yesterday
            </span>
          </div>
        </div>

        <div className="card">
          <span className="kc" style={{ background: "#1d4ed81f", color: "#1d4ed8" }}>
            <CreditCard size={22} />
          </span>
          <div>
            <small>Bills today</small>
            <b>{todayBillsCount}</b>
            <span className="dl mu">{bills.length} in the last 7 days</span>
          </div>
        </div>

        <div className="card">
          <span className="kc" style={{ background: "#15803d1f", color: "#15803d" }}>
            <Package size={22} />
          </span>
          <div>
            <small>Total products</small>
            <b>{products.length}</b>
            <span className="dl mu">{categoryCount} categories</span>
          </div>
        </div>

        <div className="card">
          <span className="kc" style={{ background: "#b453091f", color: "#b45309" }}>
            <AlertTriangle size={22} />
          </span>
          <div>
            <small>Low or out of stock</small>
            <b>{lowStock.length}</b>
            <span className={`dl ${lowStock.length ? "dn" : "up"}`}>
              {lowStock.length ? "Needs restocking" : "All stocked"}
            </span>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <h2>Sales, last 7 days</h2>
          <svg className="ch" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart of daily sales">
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9480f" stopOpacity=".28" />
                <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((k) => (
              <g key={k}>
                <line className="gl" x1={l} x2={W - 6} y1={Y((mx * k) / 3)} y2={Y((mx * k) / 3)} />
                <text className="tl" x={l - 6} y={Y((mx * k) / 3) + 4} textAnchor="end">
                  {Math.round((mx * k) / 3 / 1000)}k
                </text>
              </g>
            ))}
            <path d={`${linePath} L${X(6)} ${Y(0)} L${X(0)} ${Y(0)}Z`} fill="url(#ga)" />
            <path d={linePath} fill="none" stroke="var(--br)" strokeWidth="2.5" strokeLinejoin="round" />
            {pts.map((p, idx) => (
              <circle key={idx} cx={p[0]} cy={p[1]} r="3.8" fill="var(--sf)" stroke="var(--br)" strokeWidth="2.2" />
            ))}
            {d7.map((_, i) => (
              <text key={i} className="tl" x={X(i)} y={H - 8} textAnchor="middle">
                {new Date(Date.now() - (6 - i) * 864e5).toLocaleDateString("en-IN", { weekday: "short" })}
              </text>
            ))}
          </svg>
        </div>

        <div className="card">
          <h2>Payment modes</h2>
          <div className="mx">
            {Object.keys(pm).map((k) => (
              <i key={k} style={{ width: `${(pm[k] / pmTotal) * 100}%`, background: pmColors[k] || "#666" }} />
            ))}
          </div>
          {Object.keys(pm).map((k) => (
            <div className="lr" key={k} style={{ "--c": pmColors[k] || "#666" }}>
              <span>{k}</span>
              <b>{fm(pm[k])}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="g3">
        <div className="card">
          <h2>Best selling items</h2>
          {topItems.map((item, idx) => {
            const p = products.find((x) => x._id === item.productId || x.name === item.name);
            return (
              <div className="row" key={idx}>
                {p?.img ? (
                  <img className="th" src={p.img} alt={item.name} />
                ) : (
                  <div className="th ph" style={{ "--h": hue(p?.category || "General") }}>
                    {p?.emoji || "🛒"}
                  </div>
                )}
                <div className="f1">
                  <b>{item.name}</b>
                  <small>{fm(item.price)} each</small>
                </div>
                <b>{item.qty} sold</b>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h2>Stock alerts</h2>
          {lowStock.length ? (
            lowStock.map((p) => (
              <div className="row" key={p._id}>
                {p.img ? (
                  <img className="th" src={p.img} alt={p.name} />
                ) : (
                  <div className="th ph" style={{ "--h": hue(p.category) }}>
                    {p.emoji || "🛒"}
                  </div>
                )}
                <div className="f1">
                  <b>{p.name}</b>
                  <span className={`ch2 ${stockStatus(p)[1]}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} ${p.unit} left`}
                  </span>
                </div>
                <button className="btn sm" onClick={() => onOpenStock(p)}>
                  Update stock
                </button>
              </div>
            ))
          ) : (
            <p className="mu">Every product has enough stock.</p>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px 6px" }}>
          <h2>Recent bills</h2>
        </div>
        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Bill no</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th className="r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bills.slice(0, 6).map((b) => (
                <tr key={b._id} className="k" onClick={() => onSelectBill(b)}>
                  <td>
                    <b>{b.billNo}</b>
                  </td>
                  <td>{dt(b.createdAt)}</td>
                  <td>{b.customerName}</td>
                  <td>{b.items.reduce((a, i) => a + i.qty, 0)}</td>
                  <td>
                    <span className={`ch2 ${payChip(b.paymentMode)}`}>{b.paymentMode}</span>
                  </td>
                  <td className="r">
                    <b>{fm(b.total)}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

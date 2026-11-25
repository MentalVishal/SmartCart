import React, { useRef } from "react";
import { Printer } from "lucide-react";
import { SHOP, SADDR, SGSTIN, SFSSAI, SPHONE, fm } from "../utils/helpers";

export default function ReceiptModal({ bill, onClose }) {
  const receiptRef = useRef(null);

  if (!bill) return null;

  const mrpTotal =
    bill.mrpTotal ??
    bill.items.reduce((a, i) => a + (i.mrp || i.price) * i.qty, 0);
  const savings = bill.savings ?? Math.max(0, mrpTotal - bill.total);
  const totalQty = bill.items.reduce((a, i) => a + i.qty, 0);

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;

    const printWin = window.open("", "_blank", "width=520,height=780");
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${bill.billNo} – ${SHOP}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@600;700&display=swap" />
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 16px; background: #fff; font: 12.5px/1.45 "IBM Plex Sans", sans-serif; color: #1c1108; }
          .rc {
            position: relative; overflow: hidden; max-width: 440px; margin: 0 auto;
            background: linear-gradient(180deg,#fffdf7 0%,#ffffff 18%,#fffdf9 100%);
            border: 2px solid #9a3412; outline: 1px solid #f59e0b; outline-offset: -5px;
            border-radius: 8px; padding: 18px 18px 16px;
          }
          .rc-wm { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; z-index: 0; opacity: 0.065; }
          .rc-body { position: relative; z-index: 1; }
          .rc-ausp { display: flex; justify-content: space-between; font-family: "Noto Serif Devanagari", serif; font-size: 11.5px; font-weight: 700; color: #b91c1c; border-bottom: 1px dashed #d97706; padding-bottom: 5px; margin-bottom: 8px; }
          .rc-head { text-align: center; margin-bottom: 8px; }
          .rc-badge { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; font-size: 10px; font-weight: 700; letter-spacing: .08em; padding: 1px 8px; border-radius: 4px; margin-bottom: 4px; }
          .rc-head h2 { font-size: 20px; font-weight: 700; color: #7c2d12; margin: 0; text-transform: uppercase; }
          .rc-sub { color: #574332; font-size: 11.5px; line-height: 1.4; margin-top: 2px; }
          .rc-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; background: #fff8eb; border: 1px solid #ead5b0; border-radius: 6px; padding: 7px 10px; margin: 8px 0; font-size: 11.5px; }
          .rc-meta div:nth-child(even) { text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          th { background: #7c2d12; color: #fff8eb; font-size: 11px; font-weight: 600; padding: 6px 5px; text-align: left; }
          td { padding: 5px; border-bottom: 1px dashed #e5d5b7; font-size: 11.5px; }
          tr:last-child td { border-bottom: 1.5px solid #9a3412; }
          .r { text-align: right; }
          .sl { display: flex; justify-content: space-between; padding: 2px 0; }
          .rc-sum { margin-top: 8px; }
          .rc-net { display: flex; justify-content: space-between; align-items: center; background: #fef3c7; border: 1.5px solid #d97706; border-radius: 6px; padding: 8px 10px; margin-top: 6px; font-size: 16px; font-weight: 700; color: #7c2d12; }
          .rc-sav { margin-top: 8px; padding: 8px 10px; background: #ecfdf5; border: 1.5px dashed #15803d; border-radius: 6px; color: #14532d; text-align: center; font-weight: 700; font-size: 12.5px; }
          .rc-foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbb592; font-size: 10.5px; color: #574332; }
          .rc-sign { text-align: right; }
          .rc-sign b { display: block; color: #7c2d12; font-size: 11.5px; margin-top: 14px; }
          @page { margin: 8mm; }
        </style>
      </head>
      <body>
        <div class="rc">${content}</div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div
      className="md"
      onClick={(e) => e.target.classList.contains("md") && onClose()}
    >
      <div className="bx" style={{ maxWidth: 600 }}>
        <div className="rc" ref={receiptRef}>
          {/* Sacred Swastik & Lotus Watermark */}
          <div className="rc-wm" aria-hidden="true">
            <svg width="260" height="260" viewBox="0 0 200 200" fill="none">
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="#b91c1c"
                strokeWidth="4"
                strokeDasharray="8 6"
              />
              <circle
                cx="100"
                cy="100"
                r="74"
                stroke="#d97706"
                strokeWidth="2.5"
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="100"
                  cy="24"
                  rx="10"
                  ry="20"
                  fill="#d97706"
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}
              <path
                d="M100 54 V146 M54 100 H146 M100 54 H134 M146 100 V134 M100 146 H66 M54 100 V66"
                stroke="#b91c1c"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="80" cy="80" r="4.5" fill="#b91c1c" />
              <circle cx="120" cy="80" r="4.5" fill="#b91c1c" />
              <circle cx="80" cy="120" r="4.5" fill="#b91c1c" />
              <circle cx="120" cy="120" r="4.5" fill="#b91c1c" />
            </svg>
          </div>

          <div className="rc-body">
            <div className="rc-ausp">
              <span>卐 शुभ</span>
              <span>॥ श्री गणेशाय नमः ॥</span>
              <span>लाभ 卐</span>
            </div>

            <div className="rc-head">
              <span className="rc-badge">TAX INVOICE / CASH MEMO</span>
              <h2>{SHOP}</h2>
              <div className="rc-sub">
                {SADDR} · Ph: {SPHONE}
                <br />
                <b>GSTIN:</b> {SGSTIN} &nbsp;|&nbsp; <b>FSSAI:</b> {SFSSAI}
              </div>
            </div>

            <div className="rc-meta">
              <div>
                <b>Invoice No:</b> {bill.billNo}
              </div>
              <div>
                <b>Date:</b>{" "}
                {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div>
                <b>Customer:</b> {bill.customerName}
              </div>
              <div>
                <b>Time:</b>{" "}
                {new Date(bill.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <b>Mobile:</b> {bill.customerPhone || "Walk-in"}
              </div>
              <div>
                <b>Payment:</b>{" "}
                <span style={{ color: "#15803d", fontWeight: 700 }}>
                  {bill.paymentMode}
                </span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: 24 }}>#</th>
                  <th>Item Description</th>
                  <th className="r">Qty</th>
                  <th className="r">MRP</th>
                  <th className="r">Rate</th>
                  <th className="r">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((i, idx) => {
                  const itemMrp = i.mrp || i.price;
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{i.name}</td>
                      <td className="r">{i.qty}</td>
                      <td
                        className="r"
                        style={{
                          textDecoration:
                            itemMrp > i.price ? "line-through" : "none",
                          color: "#6b7280",
                        }}
                      >
                        {fm(itemMrp)}
                      </td>
                      <td className="r">{fm(i.price)}</td>
                      <td className="r">
                        <b>{fm(i.price * i.qty)}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="rc-sum">
              <div className="sl" style={{ color: "#574332", fontSize: 12 }}>
                <span>
                  Total Items / Qty: {bill.items.length} ({totalQty} pcs)
                </span>
                {savings > 0 && (
                  <span>
                    Total MRP:{" "}
                    <s style={{ color: "#6b7280" }}>{fm(mrpTotal)}</s>
                  </span>
                )}
              </div>

              {savings > 0 && (
                <div
                  className="sl"
                  style={{
                    color: "#15803d",
                    fontWeight: 600,
                    fontSize: 12.5,
                    marginTop: 2,
                  }}
                >
                  <span>Kirana Store Discount</span>
                  <span>− {fm(savings)}</span>
                </div>
              )}

              <div className="rc-net">
                <span>GRAND TOTAL</span>
                <span>{fm(bill.total)}</span>
              </div>

              {savings > 0 && (
                <div className="rc-sav">
                  🎉 Aapki Kul Bachat: {fm(savings)}!
                  <div style={{ fontSize: 11, fontWeight: 500, marginTop: 1 }}>
                    (MRP {fm(mrpTotal)} ka samaan aapko sirf {fm(bill.total)}{" "}
                    mein mila)
                  </div>
                </div>
              )}
            </div>

            <div className="rc-foot">
              <div>
                <div style={{ fontWeight: 600, color: "#7c2d12" }}>
                  धन्यवाद! पुनः पधारें।
                </div>
                <div>
                  Goods once sold will be exchanged within 7 days with bill.
                </div>
                <div style={{ fontSize: 10, marginTop: 2 }}>
                  E. & O.E. · Subject to Patna Jurisdiction
                </div>
              </div>
              <div className="rc-sign">
                <span>For {SHOP}</span>
                <b>Authorised Signatory</b>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            justifyContent: "flex-end",
          }}
        >
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button className="btn p" onClick={handlePrint}>
            <Printer size={16} />
            Print Original Bill
          </button>
        </div>
      </div>
    </div>
  );
}

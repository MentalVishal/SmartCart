import React, { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { SHOP } from "../utils/helpers";

export default function Login() {
  const { loginUser } = useAuth();
  const [mode, setMode] = useState("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const endpoint = mode === "in" ? "/auth/login" : "/auth/register";
      const payload = mode === "in" ? { email, password } : { name, email, password };
      const { data } = await api.post(endpoint, payload);
      loginUser(data);
    } catch (error) {
      setErr(error.response?.data?.message || "Server connection error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="au">
      <section className="al">
        <div>
          <div
            style={{
              display: "inline-block",
              fontFamily: '"Noto Serif Devanagari", serif',
              color: "#fde047",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
              letterSpacing: ".04em"
            }}
          >
            卐 शुभ लाभ &nbsp;·&nbsp; ॥ श्री गणेशाय नमः ॥
          </div>
          <div className="logo" style={{ paddingLeft: 0 }}>
            <span className="lgo">
              <ShoppingCart size={18} />
            </span>
            <span>
              SmartCart
              <small style={{ display: "block", fontSize: 11.5, fontWeight: 500, color: "#fde68a" }}>{SHOP}</small>
            </span>
          </div>
        </div>
        <div>
          <h1>Aapki kirana dukaan ka stock aur billing, ek hi jagah.</h1>
          <span style={{ color: "#fde68a", fontWeight: 500 }}>Smart Inventory and Billing System for kirana stores</span>
          <ul>
            <li>
              <Check size={18} />
              Make bills in seconds with automatic MRP discount & savings
            </li>
            <li>
              <Check size={18} />
              Know when atta, dal or tel is running low
            </li>
            <li>
              <Check size={18} />
              Keep every sale and customer record in one place
            </li>
          </ul>
        </div>
        <small style={{ color: "#f3d5b5" }}>IGNOU BCA project, BCSP-064 · MERN Stack</small>
      </section>

      <section className="ar">
        <form className="fl" onSubmit={handleSubmit}>
          <h2>{mode === "in" ? "Sign in" : "Create account"}</h2>
          <p className="mu" style={{ margin: "0 0 14px" }}>
            {mode === "in" ? "Welcome back. Enter your details to continue." : "Register to start using SmartCart."}
          </p>
          {mode === "up" && (
            <>
              <label htmlFor="rn">Full name</label>
              <input id="rn" className="in" value={name} onChange={(e) => setName(e.target.value)} required />
            </>
          )}
          <label htmlFor="le">Email</label>
          <input id="le" className="in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="lp">Password</label>
          <input id="lp" className="in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="er2" role="alert">
            {err}
          </p>
          <button className="btn p" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "in" ? "Sign in" : "Create account"}
          </button>

          {mode === "in" && (
            <div className="ds">
              <small className="mu">Try a demo:</small>
              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  setEmail("admin@smartcart.in");
                  setPassword("demo123");
                }}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  setEmail("rohit@smartcart.in");
                  setPassword("demo123");
                }}
              >
                Staff
              </button>
            </div>
          )}

          <p className="sw">
            {mode === "in" ? "New to SmartCart?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setErr("");
              }}
            >
              {mode === "in" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}

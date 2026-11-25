export const SHOP = "Vishal Kirana Store";
export const SADDR = "Khairah Marhaura Road, Chhapra, Bihar";
export const SGSTIN = "10AABFV8492K1Z5";
export const SFSSAI = "10426000001928";
export const SPHONE = "+91 98350 41290";

export const fm = (n) =>
  "₹" + (+n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const offPct = (mrp, price) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const dt = (t) =>
  new Date(t).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const ini = (n) =>
  String(n || "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const H = {
  "Atta-Chawal": 40,
  Dal: 48,
  "Tel-Ghee": 45,
  Masala: 10,
  "Chai-Cheeni": 25,
  "Namkeen-Biscuit": 30,
  Dairy: 200,
  "Sabun-Safai": 190,
  "Cold Drink": 350,
};

export const hue = (c) =>
  H[c] ??
  ([...String(c || "")].reduce((a, x) => a + x.charCodeAt(0), 0) * 7) % 360;

export const stockStatus = (p) =>
  p.stock === 0
    ? ["Out of stock", "er"]
    : p.stock <= 10
      ? ["Low stock", "wn"]
      : ["In stock", "ok"];

export const payChip = (mode) =>
  mode === "Cash" ? "wn" : mode === "UPI" ? "ok" : "in2";

export const resizeImage = (file, cb) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 480 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * k;
      canvas.height = img.height * k;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

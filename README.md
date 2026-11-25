# SmartCart – Vishal Kirana Store Inventory and Billing System (MERN Stack)

Classic MERN Stack application (MongoDB, Express.js, React via Create React App, Node.js) featuring:
- **Shubh Ganesh–Laxmi Auspicious Kirana Theme**: Warm Haldi-Gold, Kumkum Vermilion, Deep Sandalwood, and Temple Marigold gradients with Swastik/Shubh-Labh traditional accents.
- **Original Indian Kirana Tax Invoice / Cash Memo Receipt**:
  - Top **॥ श्री गणेशाय नमः ॥** & **शुभ — लाभ** auspicious header with Swastik emblem.
  - Subtle center **Swastik & Lotus Watermark** (`opacity: 0.055`) that prints cleanly.
  - Store GSTIN, FSSAI License No., Bill No., Date/Time, Customer Details, and Payment Badge.
  - Clean itemized table (`#`, `Item`, `Qty`, `MRP`, `Rate`, `Amt`), Total MRP strikethrough, Store Discount, Net Payable, **You Saved Banner**, QR/Barcode-style footer, and Authorised Signatory stamp.
- **MRP vs Selling Price Discounts**: Real-time `% OFF` tags and customer savings calculation.

## Quick Start

### 1. Start MongoDB
Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` (or update `backend/.env`).

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed   # Populates demo users, 20 kirana products with photos & MRP, customers & bills
npm start      # Starts Express server on http://localhost:5000
```

### 3. Frontend Setup (Classic Create React App - No Vite)
Open a new terminal:
```bash
cd frontend
npm install
npm start      # Starts React app on http://localhost:3000
```

## Demo Credentials
- **Admin**: `admin@smartcart.in` / `demo123`
- **Staff**: `rohit@smartcart.in` / `demo123`

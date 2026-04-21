// ============================================================
// EXPERIMENT 2.1.3 — E-commerce Catalog
// CONT_24CSP-293 :: FULL STACK-I
// ============================================================
// HOW TO RUN:
//   1. mongod
//   2. npm install
//   3. npm start  → http://localhost:3002
// ============================================================

const express      = require("express");
const mongoose     = require("mongoose");
const catalogRoutes = require("./routes/catalogRoutes");

const app  = express();
const PORT = 3002;

app.use(express.json());
app.use("/api/catalog", catalogRoutes);

app.get("/", (req, res) => {
  res.json({
    experiment: "2.1.3 - E-commerce Catalog",
    endpoints: {
      "POST   /api/catalog":                    "Create product (with variants & reviews)",
      "GET    /api/catalog":                    "Get all products (?category=Electronics)",
      "GET    /api/catalog/:id":                "Get one product",
      "POST   /api/catalog/:id/reviews":        "Add a review",
      "PATCH  /api/catalog/:id/stock":          "Update variant stock",
      "GET    /api/catalog/agg/low-stock":      "Find low stock (?threshold=5)",
      "GET    /api/catalog/agg/category-ratings": "Avg rating per category"
    }
  });
});

const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ecommerceDB");
    console.log("✅ MongoDB connected → ecommerceDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();

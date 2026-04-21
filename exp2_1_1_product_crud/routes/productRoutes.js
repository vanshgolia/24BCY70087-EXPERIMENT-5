// ============================================================
// routes/productRoutes.js  —  All CRUD endpoints for Product
// ============================================================
// Mounted at /api/products in server.js
//
// ENDPOINT MAP:
//   POST   /api/products        → CREATE new product
//   GET    /api/products        → READ all products
//   GET    /api/products/:id    → READ single product
//   PUT    /api/products/:id    → UPDATE product
//   DELETE /api/products/:id    → DELETE product
// ============================================================

const express = require("express");
const router  = express.Router();
const Product = require("../models/Product");

// ── CREATE ───────────────────────────────────────────────────
// POST /api/products
// Body (JSON): { "name":"...", "price":99, "category":"..." }
router.post("/", async (req, res) => {
  try {
    // Product.create() validates against schema then inserts
    const product = await Product.create(req.body);
    res.status(201).json(product); // 201 = Created
  } catch (err) {
    // Mongoose ValidationError when required fields missing or type wrong
    res.status(400).json({ message: err.message });
  }
});

// ── READ ALL ─────────────────────────────────────────────────
// GET /api/products
// Optional query filters: ?category=Electronics  ?inStock=true
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.inStock !== undefined)
      filter.inStock = req.query.inStock === "true";

    // .sort({ createdAt: -1 }) → newest first
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── READ ONE ─────────────────────────────────────────────────
// GET /api/products/:id
// :id = MongoDB ObjectId (e.g. 65f4a8b7c1e6a8c1f4b8c7d1)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    // CastError = invalid ObjectId format
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid product ID" });
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE ───────────────────────────────────────────────────
// PUT /api/products/:id
// Body (JSON): only send fields you want to change
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // return the updated doc, not old
        runValidators: true  // run schema validation on update too
      }
    );
    if (!updated)
      return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE ───────────────────────────────────────────────────
// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

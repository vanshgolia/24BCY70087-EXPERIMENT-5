// ============================================================
// routes/catalogRoutes.js
// EXPERIMENT 2.1.3 — Nested schemas, Aggregation, Stock mgmt
// ============================================================

const express = require("express");
const router  = express.Router();
const Catalog = require("../models/Catalog");

// ── CREATE product ───────────────────────────────────────────
// POST /api/catalog
// Body: { name, category, description, variants: [...], reviews: [...] }
router.post("/", async (req, res) => {
  try {
    const product = await Catalog.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── GET all products ─────────────────────────────────────────
// GET /api/catalog
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const products = await Catalog.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET one product ──────────────────────────────────────────
// GET /api/catalog/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Catalog.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADD a review to a product ────────────────────────────────
// POST /api/catalog/:id/reviews
// Body: { "rating": 5, "comment": "Great product!" }
router.post("/:id/reviews", async (req, res) => {
  try {
    const product = await Catalog.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    // Push a new review object into the nested reviews array
    product.reviews.push(req.body);
    await product.save(); // save entire document including updated reviews
    res.status(201).json({
      message: "Review added",
      avgRating: product.avgRating,
      reviews: product.reviews
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── UPDATE stock for a specific variant ─────────────────────
// PATCH /api/catalog/:id/stock
// Body: { "sku": "HP-BL-001", "delta": -1 }  (delta = change amount)
router.patch("/:id/stock", async (req, res) => {
  try {
    const { sku, delta } = req.body;
    const product = await Catalog.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    // Calls our custom instance method defined in the schema
    await product.updateVariantStock(sku, Number(delta));
    res.json({ message: "Stock updated", variants: product.variants });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── AGGREGATION 1: Find low-stock products ──────────────────
// GET /api/catalog/agg/low-stock?threshold=5
// ─────────────────────────────────────────────────────────────
// AGGREGATION PIPELINE EXPLAINED:
// Think of it as an assembly line: data passes through stages,
// each stage transforms or filters it.
//
// $unwind   → "explodes" the variants array:
//             1 product with 3 variants → 3 separate documents
//             (needed so we can filter by individual variant stock)
// $match    → filter: keep only docs where variant.stock <= threshold
// $group    → re-group by original product _id, collect matching variants
// $project  → choose which fields to include in the output
router.get("/agg/low-stock", async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;

    const lowStockProducts = await Catalog.aggregate([
      // Stage 1: unwind the variants array
      { $unwind: "$variants" },

      // Stage 2: keep only variants with stock <= threshold
      { $match: { "variants.stock": { $lte: threshold } } },

      // Stage 3: group back by product
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          // $push collects all matching variants into an array
          lowStockVariants: { $push: "$variants" }
        }
      },

      // Stage 4: choose output fields (1 = include, 0 = exclude)
      {
        $project: {
          _id: 1,
          name: 1,
          lowStockVariants: 1
        }
      }
    ]);

    res.json({ count: lowStockProducts.length, lowStockProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── AGGREGATION 2: Average rating per category ───────────────
// GET /api/catalog/agg/category-ratings
router.get("/agg/category-ratings", async (req, res) => {
  try {
    const categoryRatings = await Catalog.aggregate([
      // Stage 1: unwind reviews (each review becomes a document)
      { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } },

      // Stage 2: group by category, compute average rating
      {
        $group: {
          _id: "$category",
          // $avg calculates average of reviews.rating per group
          avgCategoryRating: { $avg: "$reviews.rating" }
        }
      },

      // Stage 3: sort by avgCategoryRating descending
      { $sort: { avgCategoryRating: -1 } }
    ]);

    res.json(categoryRatings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

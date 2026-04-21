// ============================================================
// models/Catalog.js  —  Nested Schemas + Aggregation
// EXPERIMENT 2.1.3 — E-commerce Catalog
// ============================================================
//
// KEY CONCEPT: NESTED (EMBEDDED) SCHEMAS
// Instead of storing variants/reviews in separate collections,
// we embed them directly inside the product document.
//
// WHEN TO EMBED (nest)?
//   ✅ Data is always accessed with the parent (reviews with product)
//   ✅ Data doesn't need to be queried independently
//   ✅ Data set is small and bounded (not thousands of reviews)
//
// WHEN TO REFERENCE (separate collection)?
//   ✅ Data is large or shared across many documents
//   ✅ Data needs to be queried independently
//   ✅ Many-to-many relationships
// ============================================================

const mongoose = require("mongoose");

// ── SUB-SCHEMA 1: Variant ────────────────────────────────────
// Each product can have multiple variants (size, color, etc.)
// This is a nested schema — it's defined separately but
// embedded inside the main productSchema as an array.
const variantSchema = new mongoose.Schema({
  sku:   { type: String, required: true, uppercase: true }, // Stock Keeping Unit
  color: { type: String, required: true },
  size:  { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }
});

// ── SUB-SCHEMA 2: Review ─────────────────────────────────────
// Each product can have multiple reviews from users
const reviewSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId }, // reference to a User doc
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

// ── MAIN SCHEMA: Product/Catalog ─────────────────────────────
const catalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // Index speeds up search queries on this field
      // Without index: MongoDB scans EVERY document (slow on large data)
      // With index:    MongoDB uses a B-tree lookup (fast)
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Appliances", "Food", "Books"],
      index: true    // indexed because we frequently filter by category
    },
    description: { type: String },

    // ARRAY of variantSchema documents — NESTED/EMBEDDED
    // MongoDB stores them inside the same document
    variants: [variantSchema],

    // ARRAY of reviewSchema documents — NESTED/EMBEDDED
    reviews: [reviewSchema],

    // Virtual field — computed, not stored in DB
    // See virtual definition below
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true } makes virtual fields appear
    // when you call .toJSON() or res.json(product)
    toJSON: { virtuals: true }
  }
);

// ── VIRTUAL FIELD: avgRating ─────────────────────────────────
// A virtual is computed on-the-fly from other fields.
// It is NOT stored in MongoDB — calculated when accessed.
// Usage: product.avgRating → average of all review ratings
catalogSchema.virtual("avgRating").get(function () {
  if (this.reviews.length === 0) return null;
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  return +(total / this.reviews.length).toFixed(1);
});

// ── VIRTUAL FIELD: totalStock ────────────────────────────────
// Total stock across all variants
catalogSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

// ── INSTANCE METHOD: updateVariantStock ──────────────────────
// Updates stock for a specific SKU. Called on a document.
// Usage: await product.updateVariantStock("HP-BL-001", -1)
catalogSchema.methods.updateVariantStock = async function (sku, delta) {
  const variant = this.variants.find(v => v.sku === sku);
  if (!variant) throw new Error(`SKU ${sku} not found`);
  if (variant.stock + delta < 0) throw new Error("Insufficient stock");
  variant.stock += delta;
  // .save() commits the change back to MongoDB atomically
  return await this.save();
};

module.exports = mongoose.model("Catalog", catalogSchema);

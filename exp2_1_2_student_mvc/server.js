// ============================================================
// EXPERIMENT 2.1.2 — Student Management System (MVC Pattern)
// CONT_24CSP-293 :: FULL STACK-I
// ============================================================
// MVC = Model  → data layer (models/Student.js)
//       View   → UI templates (views/*.ejs)
//       Controller → business logic (controllers/studentController.js)
//       Routes → URL mapping (routes/studentRoutes.js)
//
// HOW TO RUN:
//   1. mongod
//   2. npm install
//   3. npm start  → http://localhost:3001
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/studentRoutes");
const path = require("path");

const app  = express();
const PORT = 3001;

// ── VIEW ENGINE SETUP ────────────────────────────────────────
// EJS = Embedded JavaScript Templates
// Allows HTML files with <%= variable %> placeholders
// Express will look for .ejs files inside the /views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(express.json());
// urlencoded parses HTML form submissions (Content-Type: application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ───────────────────────────────────────────────────
app.use("/students", studentRoutes);

// Redirect root to /students
app.get("/", (req, res) => res.redirect("/students"));

// ── DB + SERVER START ────────────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/studentDB");
    console.log("✅ MongoDB connected → studentDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
      console.log("   Open browser at http://localhost:3001/students");
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();

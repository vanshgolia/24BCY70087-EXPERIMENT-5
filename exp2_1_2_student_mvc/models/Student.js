// ============================================================
// models/Student.js  —  M in MVC
// ============================================================
// The Model is responsible ONLY for:
//   - Defining the data structure (schema)
//   - Validation rules
//   - Talking to MongoDB
// It has NO knowledge of routes, views, or HTTP.
// ============================================================

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"]
    },
    roll: {
      type: Number,
      required: [true, "Roll number is required"],
      unique: true,    // no two students can have same roll number
      min: [1, "Roll must be a positive number"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true, // store emails in lowercase always
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      default: "B.Tech CSE"
    },
    marks: {
      type: Number,
      min: [0, "Marks cannot be below 0"],
      max: [100, "Marks cannot exceed 100"],
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);

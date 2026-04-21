// ============================================================
// controllers/studentController.js  —  C in MVC
// ============================================================
// The Controller sits between Routes and Model.
// It receives the request from the Route, calls the Model
// to get/save data, then sends a response (JSON or renders View).
//
// WHY SEPARATE FROM ROUTES?
//   Routes just define URLs. Controllers hold the actual logic.
//   This makes code easier to test, read, and maintain.
// ============================================================

const Student = require("../models/Student");

// ── LIST all students ────────────────────────────────────────
// GET /students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ roll: 1 }); // sort by roll
    // res.render() finds views/index.ejs and injects the data
    res.render("index", { students, title: "Student Management System" });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// ── SHOW form to add new student ─────────────────────────────
// GET /students/new
const showNewForm = (req, res) => {
  res.render("new", { title: "Add New Student" });
};

// ── CREATE student ───────────────────────────────────────────
// POST /students
const createStudent = async (req, res) => {
  try {
    await Student.create(req.body);
    res.redirect("/students"); // after create, go back to list
  } catch (err) {
    res.status(400).render("error", { message: err.message });
  }
};

// ── SHOW form to edit a student ──────────────────────────────
// GET /students/:id/edit
const showEditForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).render("error", { message: "Student not found" });
    res.render("edit", { student, title: "Edit Student" });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// ── UPDATE student ───────────────────────────────────────────
// POST /students/:id/update   (browsers can't send PUT from forms)
const updateStudent = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.redirect("/students");
  } catch (err) {
    res.status(400).render("error", { message: err.message });
  }
};

// ── DELETE student ───────────────────────────────────────────
// POST /students/:id/delete
const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/students");
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// Export all controller functions
module.exports = {
  getAllStudents,
  showNewForm,
  createStudent,
  showEditForm,
  updateStudent,
  deleteStudent
};

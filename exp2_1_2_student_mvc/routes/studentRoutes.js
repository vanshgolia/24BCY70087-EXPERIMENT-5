// ============================================================
// routes/studentRoutes.js  —  URL to Controller mapping
// ============================================================
// Routes ONLY define: which URL + method → which controller fn
// No business logic lives here. That belongs in controller.
//
// RESTFUL ROUTE MAPPING:
//   GET    /students            → list all      → getAllStudents
//   GET    /students/new        → show add form → showNewForm
//   POST   /students            → save new      → createStudent
//   GET    /students/:id/edit   → show edit form→ showEditForm
//   POST   /students/:id/update → save update   → updateStudent
//   POST   /students/:id/delete → delete        → deleteStudent
// ============================================================

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/studentController");

router.get("/",                 controller.getAllStudents);
router.get("/new",              controller.showNewForm);
router.post("/",                controller.createStudent);
router.get("/:id/edit",         controller.showEditForm);
router.post("/:id/update",      controller.updateStudent);
router.post("/:id/delete",      controller.deleteStudent);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getTimetable,
  addTimetable,
  updateTimetable,
  deleteTimetable,
  getConfig,
  saveConfig,
  getDayOrderForDate,
  getWeekPreview
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');

// Static routes must come before /:id dynamic route

// Semester configuration — set once, auto-calculates forever
router.get('/config',    protect, getConfig);
router.post('/config',   protect, saveConfig);

// Day order calculation for any date
router.get('/dayorder',  protect, getDayOrderForDate);

// 7-day week preview
router.get('/week',      protect, getWeekPreview);

// Timetable CRUD
router.get('/',          protect, getTimetable);
router.post('/',         protect, addTimetable);
router.put('/:id',       protect, updateTimetable);
router.delete('/:id',    protect, deleteTimetable);

module.exports = router;
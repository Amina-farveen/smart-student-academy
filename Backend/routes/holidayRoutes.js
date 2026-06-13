const express = require('express');
const router = express.Router();
const { getHolidays, addHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHolidays);
router.post('/', protect, addHoliday);
router.delete('/:id', protect, deleteHoliday);

module.exports = router;

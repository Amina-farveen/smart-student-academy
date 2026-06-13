const express = require('express');
const router = express.Router();
const { getExams, addExam, updateExam, deleteExam } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getExams);
router.post('/', protect, addExam);
router.put('/:id', protect, updateExam);
router.delete('/:id', protect, deleteExam);

module.exports = router;

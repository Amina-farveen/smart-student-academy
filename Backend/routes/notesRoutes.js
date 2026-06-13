const express = require('express');
const router = express.Router();
const { getNotes, uploadNote, deleteNote, getSubjects } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const { notesUpload } = require('../middleware/uploadMiddleware');

router.get('/', protect, getNotes);
router.get('/subjects', protect, getSubjects);
router.post('/', protect, notesUpload.single('noteFile'), uploadNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;

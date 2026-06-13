const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const { subject, search } = req.query;
    const filter = { userId: req.user._id };

    if (subject) filter.subject = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(filter).sort({ uploadedAt: -1 });
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notes' });
  }
};

// @desc    Upload note
// @route   POST /api/notes
// @access  Private
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const { title, subject } = req.body;
    if (!title || !subject) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Title and subject are required' });
    }

    const note = await Note.create({
      userId: req.user._id,
      title,
      subject,
      filePath: `/uploads/notes/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    res.status(201).json({ success: true, message: 'Note uploaded successfully', data: note });
  } catch (error) {
    console.error('Upload note error:', error);
    res.status(500).json({ success: false, message: 'Error uploading note' });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', note.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting note' });
  }
};

// @desc    Get unique subjects
// @route   GET /api/notes/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Note.distinct('subject', { userId: req.user._id });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
};

module.exports = { getNotes, uploadNote, deleteNote, getSubjects };

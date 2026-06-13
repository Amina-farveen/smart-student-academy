const Exam = require('../models/Exam');
const Notification = require('../models/Notification');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { upcoming } = req.query;
    const filter = { userId: req.user._id };
    if (upcoming === 'true') filter.examDate = { $gte: today };

    const exams = await Exam.find(filter).sort({ examDate: 1 });

    // Add countdown days
    const examsWithCountdown = exams.map(exam => {
      const examDate = new Date(exam.examDate);
      examDate.setHours(0, 0, 0, 0);
      const diffTime = examDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...exam.toObject(),
        daysRemaining: diffDays,
        status: diffDays < 0 ? 'past' : diffDays === 0 ? 'today' : 'upcoming'
      };
    });

    res.json({ success: true, data: examsWithCountdown });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching exams' });
  }
};

// @desc    Add exam
// @route   POST /api/exams
// @access  Private
const addExam = async (req, res) => {
  try {
    const { subject, examType, examDate, description } = req.body;

    if (!subject || !examType || !examDate) {
      return res.status(400).json({ success: false, message: 'Subject, exam type, and date are required' });
    }

    const exam = await Exam.create({
      userId: req.user._id,
      subject,
      examType,
      examDate: new Date(examDate),
      description
    });

    // Calculate days remaining for notification
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDay = new Date(examDate);
    examDay.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((examDay - today) / (1000 * 60 * 60 * 24));

    await Notification.create({
      userId: req.user._id,
      title: 'Exam Scheduled',
      message: `${examType} for ${subject} is on ${new Date(examDate).toDateString()} (${daysRemaining > 0 ? daysRemaining + ' days remaining' : 'Today!'})`,
      type: 'exam'
    });

    res.status(201).json({ success: true, message: 'Exam added successfully', data: exam });
  } catch (error) {
    console.error('Add exam error:', error);
    res.status(500).json({ success: false, message: 'Error adding exam' });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const { subject, examType, examDate, description } = req.body;
    if (subject !== undefined) exam.subject = subject;
    if (examType !== undefined) exam.examType = examType;
    if (examDate !== undefined) exam.examDate = new Date(examDate);
    if (description !== undefined) exam.description = description;

    await exam.save();
    res.json({ success: true, message: 'Exam updated successfully', data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating exam' });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting exam' });
  }
};

module.exports = { getExams, addExam, updateExam, deleteExam };

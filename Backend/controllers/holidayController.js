const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({ userId: req.user._id }).sort({ holidayDate: 1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching holidays' });
  }
};

// @desc    Add holiday
// @route   POST /api/holidays
// @access  Private
const addHoliday = async (req, res) => {
  try {
    const { holidayDate, reason } = req.body;

    if (!holidayDate || !reason) {
      return res.status(400).json({ success: false, message: 'Date and reason are required' });
    }

    const existing = await Holiday.findOne({
      userId: req.user._id,
      holidayDate: new Date(holidayDate)
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Holiday already exists for this date' });
    }

    const holiday = await Holiday.create({
      userId: req.user._id,
      holidayDate: new Date(holidayDate),
      reason
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Holiday Added',
      message: `Holiday on ${new Date(holidayDate).toDateString()}: ${reason}`,
      type: 'holiday'
    });

    res.status(201).json({ success: true, message: 'Holiday added', data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding holiday' });
  }
};

// @desc    Delete holiday
// @route   DELETE /api/holidays/:id
// @access  Private
const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    res.json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting holiday' });
  }
};

module.exports = { getHolidays, addHoliday, deleteHoliday };

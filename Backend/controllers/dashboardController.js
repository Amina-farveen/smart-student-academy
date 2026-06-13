const Todo = require('../models/Todo');
const Exam = require('../models/Exam');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const Timetable = require('../models/Timetable');
const Holiday = require('../models/Holiday');
const { getTodayDayOrder } = require('./timetableController');

// Helper: Get today's day order for a user


// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Pending todos
    const pendingTodos = await Todo.countDocuments({ userId, completed: false });

    // Upcoming exams (next 30 days)
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingExams = await Exam.countDocuments({
      userId,
      examDate: { $gte: today, $lte: thirtyDaysLater }
    });

    // Total notes
    const totalNotes = await Note.countDocuments({ userId });

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({ userId, readStatus: false });

    // Latest 5 notifications
    const latestNotifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Today's day order and timetable
    const { dayOrder, isHoliday, holidayReason } = await getTodayDayOrder(userId);

    let todayClasses = 0;
    let todayTimetable = [];
    if (dayOrder) {
      todayTimetable = await Timetable.find({ userId, dayOrder }).sort({ period: 1 });
      todayClasses = todayTimetable.length;
    }

    // Upcoming exams details (next 5)
    const upcomingExamsList = await Exam.find({
      userId,
      examDate: { $gte: today }
    }).sort({ examDate: 1 }).limit(5);

    // Overdue todos
    const overdueTodos = await Todo.countDocuments({
      userId,
      completed: false,
      dueDate: { $lt: today }
    });

    res.json({
      success: true,
      data: {
        pendingTodos,
        upcomingExams,
        totalNotes,
        unreadNotifications,
        latestNotifications,
        todayDayOrder: dayOrder,
        isHoliday,
        holidayReason: holidayReason || null,
        todayClasses,
        todayTimetable,
        upcomingExamsList,
        overdueTodos
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
};

module.exports = { getDashboard };

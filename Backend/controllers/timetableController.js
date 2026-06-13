const Timetable = require('../models/Timetable');
const DayOrderConfig = require('../models/DayOrderTracking');
const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────
// CORE CALCULATION FUNCTION
// Given a target date, calculates the day order automatically
// by counting working days from the semester start date,
// skipping holidays and configured weekend days.
// ─────────────────────────────────────────────────────────
const calculateDayOrder = async (userId, targetDate) => {
  // Load semester configuration for this user
  const config = await DayOrderConfig.findOne({ userId });
  if (!config) {
    return { dayOrder: null, isHoliday: false, reason: 'no_config' };
  }

  // Load all holidays for this user
  const holidays = await Holiday.find({ userId });

  // Normalise all holiday dates to midnight for comparison
  const holidaySet = new Set(
    holidays.map(h => {
      const d = new Date(h.holidayDate);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    })
  );

  // Normalise target date to midnight
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const targetStr = target.toISOString().split('T')[0];

  // Check if target itself is a holiday
  if (holidaySet.has(targetStr)) {
    const holiday = holidays.find(h => {
      const d = new Date(h.holidayDate);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0] === targetStr;
    });
    return {
      dayOrder: null,
      isHoliday: true,
      holidayReason: holiday ? holiday.reason : 'Holiday'
    };
  }

  // Check if target is a weekend
  const dayOfWeek = target.getDay(); // 0=Sunday, 6=Saturday
  if (config.skipSunday && dayOfWeek === 0) {
    return { dayOrder: null, isHoliday: false, reason: 'sunday' };
  }
  if (config.skipSaturday && dayOfWeek === 6) {
    return { dayOrder: null, isHoliday: false, reason: 'saturday' };
  }

  // Normalise semester start date to midnight
  const start = new Date(config.semesterStartDate);
  start.setHours(0, 0, 0, 0);

  // Target must be on or after semester start
  if (target < start) {
    return { dayOrder: null, isHoliday: false, reason: 'before_semester' };
  }

  // Count working days from start date up to (but not including) target date
  // Each working day advances the day order by 1
  let workingDayCount = 0;
  const cursor = new Date(start);

  while (cursor < target) {
    const cursorStr = cursor.toISOString().split('T')[0];
    const cursorDay = cursor.getDay();

    const isWeekend =
      (config.skipSaturday && cursorDay === 6) ||
      (config.skipSunday && cursorDay === 0);

    const isHoliday = holidaySet.has(cursorStr);

    if (!isWeekend && !isHoliday) {
      workingDayCount++;
    }

    // Advance cursor by one calendar day
    cursor.setDate(cursor.getDate() + 1);
  }

  // Calculate day order using modular arithmetic
  // startingDayOrder is 1-indexed, convert to 0-indexed for modulo then back
  const totalOrders = config.totalDayOrders || 6;
  const startIndex = config.startingDayOrder - 1; // 0-indexed
  const dayOrderIndex = (startIndex + workingDayCount) % totalOrders;
  const dayOrder = dayOrderIndex + 1; // back to 1-indexed

  return { dayOrder, isHoliday: false };
};

// ─────────────────────────────────────────────────────────
// EXPORTED HELPER — used by dashboardController
// ─────────────────────────────────────────────────────────
const getTodayDayOrder = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return await calculateDayOrder(userId, today);
};

// ─────────────────────────────────────────────────────────
// GET TIMETABLE
// GET /api/timetable?dayOrder=N
// ─────────────────────────────────────────────────────────
const getTimetable = async (req, res) => {
  try {
    const { dayOrder } = req.query;
    const filter = { userId: req.user._id };
    if (dayOrder) filter.dayOrder = Number(dayOrder);

    const timetable = await Timetable.find(filter).sort({ dayOrder: 1, period: 1 });
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching timetable' });
  }
};

// ─────────────────────────────────────────────────────────
// ADD TIMETABLE ENTRY
// POST /api/timetable
// ─────────────────────────────────────────────────────────
const addTimetable = async (req, res) => {
  try {
    const { dayOrder, period, subject, faculty, roomNo, startTime, endTime } = req.body;

    if (!dayOrder || !period || !subject || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    const entry = await Timetable.create({
      userId: req.user._id,
      dayOrder,
      period,
      subject,
      faculty,
      roomNo,
      startTime,
      endTime
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Timetable Updated',
      message: `New class added: ${subject} on Day Order ${dayOrder}, Period ${period}`,
      type: 'timetable'
    });

    res.status(201).json({
      success: true,
      message: 'Timetable entry added',
      data: entry
    });
  } catch (error) {
    console.error('Add timetable error:', error);
    res.status(500).json({ success: false, message: 'Error adding timetable entry' });
  }
};

// ─────────────────────────────────────────────────────────
// UPDATE TIMETABLE ENTRY
// PUT /api/timetable/:id
// ─────────────────────────────────────────────────────────
const updateTimetable = async (req, res) => {
  try {
    const entry = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    const { dayOrder, period, subject, faculty, roomNo, startTime, endTime } = req.body;
    if (dayOrder !== undefined)   entry.dayOrder   = dayOrder;
    if (period !== undefined)     entry.period     = period;
    if (subject !== undefined)    entry.subject    = subject;
    if (faculty !== undefined)    entry.faculty    = faculty;
    if (roomNo !== undefined)     entry.roomNo     = roomNo;
    if (startTime !== undefined)  entry.startTime  = startTime;
    if (endTime !== undefined)    entry.endTime    = endTime;

    await entry.save();
    res.json({ success: true, message: 'Timetable entry updated', data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating timetable entry' });
  }
};

// ─────────────────────────────────────────────────────────
// DELETE TIMETABLE ENTRY
// DELETE /api/timetable/:id
// ─────────────────────────────────────────────────────────
const deleteTimetable = async (req, res) => {
  try {
    const entry = await Timetable.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting timetable entry' });
  }
};

// ─────────────────────────────────────────────────────────
// GET SEMESTER CONFIGURATION
// GET /api/timetable/config
// ─────────────────────────────────────────────────────────
const getConfig = async (req, res) => {
  try {
    const config = await DayOrderConfig.findOne({ userId: req.user._id });
    res.json({ success: true, data: config || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching configuration' });
  }
};

// ─────────────────────────────────────────────────────────
// SAVE SEMESTER CONFIGURATION
// POST /api/timetable/config
// Body: { semesterStartDate, startingDayOrder, skipSaturday, skipSunday }
// ─────────────────────────────────────────────────────────
const saveConfig = async (req, res) => {
  try {
    const {
      semesterStartDate,
      startingDayOrder,
      skipSaturday,
      skipSunday,
      totalDayOrders
    } = req.body;

    if (!semesterStartDate || !startingDayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Semester start date and starting day order are required'
      });
    }

    if (startingDayOrder < 1 || startingDayOrder > 6) {
      return res.status(400).json({
        success: false,
        message: 'Starting day order must be between 1 and 6'
      });
    }

    const config = await DayOrderConfig.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        semesterStartDate: new Date(semesterStartDate),
        startingDayOrder: Number(startingDayOrder),
        skipSaturday: skipSaturday !== false,
        skipSunday: skipSunday !== false,
        totalDayOrders: Number(totalDayOrders) || 6
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Semester configuration saved. Day orders will now be calculated automatically.',
      data: config
    });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ success: false, message: 'Error saving configuration' });
  }
};

// ─────────────────────────────────────────────────────────
// GET DAY ORDER FOR ANY SPECIFIC DATE
// GET /api/timetable/dayorder?date=YYYY-MM-DD
// ─────────────────────────────────────────────────────────
const getDayOrderForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const result = await calculateDayOrder(req.user._id, targetDate);

    // If day order found, also fetch the timetable for that day
    let timetable = [];
    if (result.dayOrder) {
      timetable = await Timetable.find({
        userId: req.user._id,
        dayOrder: result.dayOrder
      }).sort({ period: 1 });
    }

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        ...result,
        timetable
      }
    });
  } catch (error) {
    console.error('Get day order error:', error);
    res.status(500).json({ success: false, message: 'Error calculating day order' });
  }
};

// ─────────────────────────────────────────────────────────
// GET UPCOMING WEEK PREVIEW
// GET /api/timetable/week
// Returns day orders for the next 7 days
// ─────────────────────────────────────────────────────────
const getWeekPreview = async (req, res) => {
  try {
    const week = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const result = await calculateDayOrder(req.user._id, date);

      let timetable = [];
      if (result.dayOrder) {
        timetable = await Timetable.find({
          userId: req.user._id,
          dayOrder: result.dayOrder
        }).sort({ period: 1 });
      }

      week.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        ...result,
        classCount: timetable.length,
        timetable
      });
    }

    res.json({ success: true, data: week });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error calculating week preview' });
  }
};

module.exports = {
  getTimetable,
  addTimetable,
  updateTimetable,
  deleteTimetable,
  getConfig,
  saveConfig,
  getDayOrderForDate,
  getWeekPreview,
  getTodayDayOrder,
  calculateDayOrder
};
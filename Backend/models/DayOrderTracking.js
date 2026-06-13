const mongoose = require('mongoose');

const dayOrderConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // The calendar date when the semester started
  semesterStartDate: {
    type: Date,
    required: true
  },
  // The day order number that was active on semesterStartDate (1 to 6)
  startingDayOrder: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    default: 1
  },
  // Whether to skip Saturdays automatically
  skipSaturday: {
    type: Boolean,
    default: true
  },
  // Whether to skip Sundays automatically
  skipSunday: {
    type: Boolean,
    default: true
  },
  totalDayOrders: {
    type: Number,
    default: 6,
    min: 1,
    max: 6
  }
}, { timestamps: true });

module.exports = mongoose.model('DayOrderConfig', dayOrderConfigSchema);
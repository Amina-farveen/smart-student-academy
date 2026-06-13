const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOrder: {
    type: Number,
    required: [true, 'Day order is required'],
    min: [1, 'Day order must be between 1 and 6'],
    max: [6, 'Day order must be between 1 and 6']
  },
  period: {
    type: Number,
    required: [true, 'Period number is required'],
    min: [1, 'Period must be at least 1']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  faculty: {
    type: String,
    trim: true,
    default: ''
  },
  roomNo: {
    type: String,
    trim: true,
    default: ''
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);

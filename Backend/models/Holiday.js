const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  holidayDate: {
    type: Date,
    required: [true, 'Holiday date is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);

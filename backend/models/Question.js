const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    options: { type: [optionSchema], validate: v => Array.isArray(v) && v.length >= 2 && v.length <= 10 },
    correctOptionIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true, maxlength: 4000, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);

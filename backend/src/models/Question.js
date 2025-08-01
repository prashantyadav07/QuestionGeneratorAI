// backend/src/models/Question.js

import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    // ENUM KO UPDATE KAR DIYA HAI
    enum: ['mcq'], // Ab database mein 'short' ya 'long' save hi nahi ho sakta
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: [String], // MCQ ke liye hamesha rahega
  answer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: false,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
}, {
  timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
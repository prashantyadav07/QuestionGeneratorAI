import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'short', 'long'],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  // NAYA CHANGE: 'options' ko required mat rakho, hum isko controller mein handle kar lenge
  options: [String],
  answer: {
    type: String,
    required: true,
  },
  // NAYA CHANGE: 'explanation' ko required mat rakho
  explanation: {
    type: String,
    required: false, // <-- YEH SABSE IMPORTANT CHANGE HAI
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
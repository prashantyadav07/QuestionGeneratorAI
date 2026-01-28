import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import mongoose from 'mongoose';

/**
 * Retrieves all questions for a specific topic without answers
 * @param {Object} req - Express request with topicId in params
 * @param {Object} res - Express response object
 */
export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    // Validate topic ID format
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic ID format.'
      });
    }

    // Find the topic
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.'
      });
    }

    // Fetch questions without answers and explanations
    const questions = await Question.find({ topic: topicId })
      .select('-answer -explanation')
      .lean();

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this topic.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        topic: {
          id: topic._id,
          title: topic.title,
          description: topic.description,
          createdAt: topic.createdAt
        },
        questions: questions,
        questionCount: questions.length
      }
    });

  } catch (error) {
    console.error("Get Questions Error:", error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Submits test answers and returns score with explanations
 * @param {Object} req - Express request with topicId in params and answers in body
 * @param {Object} res - Express response object
 */
export const submitTest = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { answers } = req.body;

    // Validate topic ID
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic ID format.'
      });
    }

    // Validate answers array
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is missing or empty.'
      });
    }

    // Validate answer format
    const validAnswers = answers.every(a =>
      a && typeof a === 'object' &&
      a.questionId &&
      typeof a.userAnswer === 'string'
    );

    if (!validAnswers) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answer format. Each answer must have questionId and userAnswer.'
      });
    }

    // Fetch all questions for this topic
    const questions = await Question.find({ topic: topicId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this topic.'
      });
    }

    // Create a map for O(1) lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    let score = 0;
    const results = [];

    // Compare answers with correct answers
    for (const userAnswer of answers) {
      const question = questionMap.get(userAnswer.questionId);

      if (!question) {
        console.warn(`Question ${userAnswer.questionId} not found in topic`);
        continue;
      }

      // Compare answers (case-insensitive and trimmed)
      const userAnswerTrimmed = String(userAnswer.userAnswer).trim().toLowerCase();
      const correctAnswerTrimmed = String(question.answer).trim().toLowerCase();
      const isCorrect = userAnswerTrimmed === correctAnswerTrimmed;

      if (isCorrect) {
        score++;
      }

      results.push({
        questionId: question._id,
        questionText: question.questionText,
        userAnswer: userAnswer.userAnswer,
        correctAnswer: question.answer,
        explanation: question.explanation || 'No explanation provided.',
        isCorrect: isCorrect,
        options: question.options
      });
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully!',
      data: {
        score,
        totalQuestions,
        questionsAnswered: results.length,
        percentage: parseFloat(percentage.toFixed(2)),
        results,
        performance: getPerformanceLevel(percentage)
      }
    });

  } catch (error) {
    console.error("Submit Test Error:", error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting test.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to determine performance level based on percentage
 * @param {number} percentage - Score percentage
 * @returns {string} - Performance level
 */
const getPerformanceLevel = (percentage) => {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Fair';
  return 'Needs Improvement';
};
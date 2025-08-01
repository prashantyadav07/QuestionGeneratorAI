import Question from '../models/Question.js';
import Topic from '../models/Topic.js';

// Controller to get all questions for a specific topic
// DEKHO: 'export' keyword yahan laga hai
export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    // Check karo ki topic hai ya nahi
    const topic = await Topic.findById(topicId);
    if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    // Is topic ke saare questions fetch karo, lekin answer aur explanation mat bhejo
    const questions = await Question.find({ topic: topicId }).select('-answer -explanation');

    res.status(200).json({
      success: true,
      data: {
        topic,
        questions,
      },
    });
  } catch (error) {
    console.error("Get Questions Error:", error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Controller to submit test and get score
// DEKHO: 'export' keyword yahan bhi laga hai
export const submitTest = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userAnswers = req.body.answers; // Expected format: [{ questionId: '...', userAnswer: '...' }]

    if (!userAnswers || !Array.isArray(userAnswers)) {
        return res.status(400).json({ success: false, message: 'Answers array is missing or invalid.' });
    }

    // DB se sahi answers fetch karo
    const correctQuestions = await Question.find({ topic: topicId });

    if (correctQuestions.length === 0) {
        return res.status(404).json({ success: false, message: 'No questions found for this topic to score.'});
    }

    let score = 0;
    const results = [];

    // Har question ko check karo
    correctQuestions.forEach(correctQ => {
      const userAnswerObj = userAnswers.find(ua => ua.questionId === correctQ._id.toString());
      const isCorrect = userAnswerObj && correctQ.answer === userAnswerObj.userAnswer;
      
      if (isCorrect) {
        score++;
      }

      results.push({
        questionId: correctQ._id,
        questionText: correctQ.questionText,
        userAnswer: userAnswerObj ? userAnswerObj.userAnswer : 'Not Answered',
        correctAnswer: correctQ.answer,
        explanation: correctQ.explanation,
        isCorrect: isCorrect,
      });
    });

    const totalQuestions = correctQuestions.length;
    const percentage = (score / totalQuestions) * 100;

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully!',
      data: {
        score,
        totalQuestions,
        percentage: parseFloat(percentage.toFixed(2)),
        results,
      },
    });

  } catch (error)
   {
    console.error("Submit Test Error:", error.message);
    res.status(500).json({ success: false, message: 'Server error while submitting test.' });
  }
};
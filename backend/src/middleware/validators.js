/**
 * Input validation middleware
 */

/**
 * Validates question count parameter
 */
export const validateQuestionCount = (req, res, next) => {
  const { questionCount } = req.body;

  if (questionCount !== undefined) {
    const count = parseInt(questionCount);
    
    if (isNaN(count)) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be a valid number.'
      });
    }

    if (count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be between 1 and 100.'
      });
    }
  }

  next();
};

/**
 * Validates text content in request body
 */
export const validateTextContent = (req, res, next) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Text content is required and cannot be empty.'
    });
  }

  if (text.length > 100000) {
    return res.status(413).json({
      success: false,
      message: 'Text content is too long. Maximum 100,000 characters allowed.'
    });
  }

  next();
};

/**
 * Validates answers array format
 */
export const validateAnswersArray = (req, res, next) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: 'Answers must be an array.'
    });
  }

  if (answers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Answers array cannot be empty.'
    });
  }

  // Validate each answer object
  for (const answer of answers) {
    if (!answer || typeof answer !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Each answer must be an object.'
      });
    }

    if (!answer.questionId || !answer.userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Each answer must have questionId and userAnswer fields.'
      });
    }
  }

  next();
};

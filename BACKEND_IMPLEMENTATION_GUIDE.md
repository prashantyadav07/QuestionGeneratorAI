# Backend Implementation Guidelines

## Quick Start After Rewrite

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Create `.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000`

---

## API Reference

### 1. Upload PDF and Generate Questions

**Endpoint:** `POST /api/pdf/upload`

**Request:**
```bash
curl -X POST http://localhost:5000/api/pdf/upload \
  -F "pdf=@document.pdf" \
  -F "questionCount=10"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quiz created successfully with 10 questions.",
  "data": {
    "topicId": "66f4a5c2b8d3e2c1a9f7e1c0",
    "topicTitle": "Document Title",
    "questionCount": 10,
    "totalQuestions": 10
  }
}
```

**Errors:**
- `400`: No file uploaded or invalid file type
- `400`: Question count out of range (1-100)
- `413`: File too large (>50MB)
- `500`: PDF parsing failed
- `503`: AI service temporarily unavailable

---

### 2. Generate Questions from Text

**Endpoint:** `POST /api/pdf/generate-from-text`

**Request:**
```bash
curl -X POST http://localhost:5000/api/pdf/generate-from-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text content here...",
    "questionCount": 5
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quiz created successfully with 5 questions.",
  "data": {
    "topicId": "66f4a5c2b8d3e2c1a9f7e1c0",
    "topicTitle": "Generated Quiz",
    "questionCount": 5,
    "totalQuestions": 5
  }
}
```

**Validation:**
- Text: Required, 1-100,000 characters
- QuestionCount: Optional, default 10, range 1-100

---

### 3. Get Questions for a Topic

**Endpoint:** `GET /api/questions/topic/:topicId`

**Request:**
```bash
curl http://localhost:5000/api/questions/topic/66f4a5c2b8d3e2c1a9f7e1c0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "topic": {
      "id": "66f4a5c2b8d3e2c1a9f7e1c0",
      "title": "My Quiz",
      "description": "Quiz description",
      "createdAt": "2024-01-28T10:30:00Z"
    },
    "questions": [
      {
        "_id": "66f4a5c2b8d3e2c1a9f7e1c1",
        "type": "mcq",
        "questionText": "What is...?",
        "options": ["A", "B", "C", "D"],
        "topic": "66f4a5c2b8d3e2c1a9f7e1c0",
        "createdAt": "2024-01-28T10:30:00Z"
      }
      // ... more questions
    ],
    "questionCount": 5
  }
}
```

**Note:** Answers and explanations are NOT included to prevent cheating!

**Errors:**
- `400`: Invalid topic ID format
- `404`: Topic not found
- `404`: No questions for topic

---

### 4. Submit Test and Get Score

**Endpoint:** `POST /api/questions/submit/:topicId`

**Request:**
```bash
curl -X POST http://localhost:5000/api/questions/submit/66f4a5c2b8d3e2c1a9f7e1c0 \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "66f4a5c2b8d3e2c1a9f7e1c1",
        "userAnswer": "Option A"
      },
      {
        "questionId": "66f4a5c2b8d3e2c1a9f7e1c2",
        "userAnswer": "Option C"
      }
      // ... more answers
    ]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test submitted successfully!",
  "data": {
    "score": 3,
    "totalQuestions": 5,
    "questionsAnswered": 2,
    "percentage": 60.0,
    "performance": "Good",
    "results": [
      {
        "questionId": "66f4a5c2b8d3e2c1a9f7e1c1",
        "questionText": "What is...?",
        "userAnswer": "Option A",
        "correctAnswer": "Option A",
        "explanation": "Because...",
        "isCorrect": true,
        "options": ["A", "B", "C", "D"]
      }
      // ... more results
    ]
  }
}
```

**Performance Levels:**
- `Excellent` (80-100%)
- `Good` (60-79%)
- `Fair` (40-59%)
- `Needs Improvement` (<40%)

**Validation:**
- Answers array required
- Each answer needs `questionId` and `userAnswer`
- Comparison is case-insensitive and trimmed

**Errors:**
- `400`: Invalid answer format
- `400`: Empty answers array
- `404`: Topic not found
- `404`: No questions for topic

---

### 5. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-28T10:30:00Z"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Question count must be between 1 and 100."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Topic not found."
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 50MB."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An internal server error occurred.",
  "error": "Connection timeout" // Dev only
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "message": "AI service failed. Please try again later."
}
```

---

## Middleware Validation

### Input Validation Rules

**Question Count Validation:**
- Must be integer
- Range: 1-100
- Default: 10

**Text Content Validation:**
- Must be non-empty string
- Minimum: 1 character
- Maximum: 100,000 characters

**Answers Array Validation:**
- Must be array
- Cannot be empty
- Each answer must have:
  - `questionId` (string)
  - `userAnswer` (string)

**File Upload Validation:**
- Must be PDF file
- Maximum size: 50MB
- Stored in memory for processing

---

## Development Tips

### 1. Enable Detailed Logging
Add to code:
```javascript
console.log('Debug info:', variable);
```

Check terminal output for detailed flow.

### 2. Test with Postman

1. Import the endpoints
2. Set `{{baseUrl}}` variable
3. Test each endpoint
4. Check response times

### 3. Monitor Database

```bash
# Check MongoDB connection
mongosh "mongodb+srv://..."

# View collections
db.topics.find()
db.questions.find()
```

### 4. Test Error Handling

```bash
# Invalid ObjectId
curl http://localhost:5000/api/questions/topic/invalid

# Wrong file type
curl -F "pdf=@file.txt" http://localhost:5000/api/pdf/upload

# Missing parameters
curl -X POST http://localhost:5000/api/pdf/generate-from-text -d '{}'
```

---

## Performance Optimization

### Current Optimizations Implemented

1. **Text Chunking**: Smart word-boundary aware chunks
2. **Answer Lookup**: O(1) Map-based comparison
3. **Database**: Connection pooling, lean queries
4. **Batch Processing**: Parallel Promise.allSettled
5. **File Handling**: Memory storage for fast processing

### Recommended Future Optimizations

1. Add caching layer (Redis)
2. Database indexing on frequently queried fields
3. Rate limiting to prevent abuse
4. Request compression (gzip)
5. Database query optimization

---

## Troubleshooting

### Issue: "MongoDB Error: connect ECONNREFUSED"
**Solution:** Ensure MongoDB URI is correct and database is running

### Issue: "GROQ_API_KEY is missing"
**Solution:** Add GROQ_API_KEY to .env file

### Issue: AI generates incomplete questions
**Solution:** Increase max_tokens in aiService.js (max 4096)

### Issue: PDF upload fails with no error
**Solution:** Check file size and ensure it's valid PDF

### Issue: CORS errors in frontend
**Solution:** Add frontend URL to allowedOrigins in server.js

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables set
- [ ] NODE_ENV=production
- [ ] API keys stored securely
- [ ] Database is backed up
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] CORS origins updated

### Vercel Deployment

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

The app will start automatically!

### Local Testing Before Deployment

```bash
# Test all endpoints locally
npm run dev

# Simulate production
NODE_ENV=production npm start

# Check for errors
npm run build (if build script exists)
```

---

## Support & Debugging

### Enable Debug Mode
Set in server.js:
```javascript
const DEBUG = true;
if (DEBUG) console.log('Details:', data);
```

### Check Logs
- Terminal output: Real-time logs
- MongoDB logs: Database issues
- Error responses: Check error message

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Slow response | Check network, database latency |
| Failed generation | Verify API key, text content |
| CORS errors | Update allowedOrigins |
| File too large | Compress PDF or increase limit |
| Database timeout | Check connection, restart MongoDB |

---

**Backend is now production-ready! 🚀**

# Backend Quick Reference Card

## 🚀 Quick Start

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:5000`

---

## 📡 API Endpoints

### Generate Questions

**Upload PDF:**
```bash
POST /api/pdf/upload
Form-data: pdf (file), questionCount (number, 1-100)
Response: 201 { topicId, questionCount }
```

**From Text:**
```bash
POST /api/pdf/generate-from-text
JSON: { text (string), questionCount (number) }
Response: 201 { topicId, questionCount }
```

### Take Test

**Get Questions:**
```bash
GET /api/questions/topic/:topicId
Response: 200 { topic, questions[], count }
```

**Submit Answers:**
```bash
POST /api/questions/submit/:topicId
JSON: { answers: [{ questionId, userAnswer }] }
Response: 200 { score, percentage, results[] }
```

### Health

```bash
GET /health
GET /
```

---

## 🔑 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_connection_string
GROQ_API_KEY=your_api_key
```

---

## 📝 Response Format

### Success
```json
{
  "success": true,
  "message": "Description",
  "data": { /* response data */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "error": "Details (dev only)",
  "timestamp": "ISO date"
}
```

---

## 🛡️ HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Questions fetched |
| 201 | Created | Quiz created |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Topic not found |
| 413 | Too Large | File >50MB |
| 500 | Server Error | DB error |
| 503 | Unavailable | AI service down |

---

## ✅ Validation Rules

### Question Count
- **Range:** 1-100
- **Default:** 10
- **Type:** Integer

### Text Content
- **Min:** 1 character
- **Max:** 100,000 characters
- **Required:** Yes

### Answers
- **Type:** Array
- **Each element:**
  - `questionId` (string)
  - `userAnswer` (string)

### File Upload
- **Type:** PDF only
- **Max Size:** 50MB
- **Required:** Yes

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot GET /` | Server not running |
| GROQ API error | Check API key |
| MongoDB error | Check connection string |
| CORS error | URL not in allowlist |
| File too large | Max 50MB |
| Invalid JSON | Check JSON format |
| Topic not found | Check topic ID |
| No questions | Generate quiz first |

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── server.js              ← Main server
│   ├── config/
│   │   └── db.js             ← Database connection
│   ├── controllers/
│   │   ├── pdfController.js  ← PDF & text processing
│   │   └── questionController.js ← Quiz logic
│   ├── models/
│   │   ├── Topic.js
│   │   └── Question.js
│   ├── routes/
│   │   ├── pdfRoutes.js
│   │   └── questionRoutes.js
│   ├── services/
│   │   ├── aiService.js      ← AI generation
│   │   └── pdfParser.js      ← PDF extraction
│   ├── utils/
│   │   ├── multer.js         ← File upload
│   │   └── textChunker.js    ← Smart chunking
│   └── middleware/
│       ├── errorHandler.js   ← Global errors
│       └── validators.js     ← Input validation
├── .env
├── package.json
└── vercel.json
```

---

## 🔄 Request Lifecycle

```
1. Request arrives
   ↓
2. CORS check
   ↓
3. Body parser
   ↓
4. Logging middleware
   ↓
5. Validation middleware
   ↓
6. Route handler
   ↓
7. Service layer
   ↓
8. Database operations
   ↓
9. Response sent
   ↓
10. Error handler (if needed)
```

---

## 🎯 Common Workflows

### Upload PDF & Create Quiz
```javascript
// 1. Upload file
POST /api/pdf/upload
{
  file: "document.pdf",
  questionCount: 10
}
// Returns: { topicId: "..." }

// 2. Get questions
GET /api/questions/topic/topicId
// Returns: { topic, questions }

// 3. Student takes test
POST /api/questions/submit/topicId
{
  answers: [
    { questionId: "q1", userAnswer: "A" },
    { questionId: "q2", userAnswer: "B" }
  ]
}
// Returns: { score, results }
```

### Generate from Text
```javascript
POST /api/pdf/generate-from-text
{
  text: "Chapter content...",
  questionCount: 5
}
// Same flow as PDF after this point
```

---

## 🧪 Testing with cURL

```bash
# Upload PDF
curl -F "pdf=@file.pdf" -F "questionCount=10" \
  http://localhost:5000/api/pdf/upload

# Generate from text
curl -X POST http://localhost:5000/api/pdf/generate-from-text \
  -H "Content-Type: application/json" \
  -d '{"text":"Your text","questionCount":5}'

# Get questions
curl http://localhost:5000/api/questions/topic/[ID]

# Submit test
curl -X POST http://localhost:5000/api/questions/submit/[ID] \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q1","userAnswer":"A"}]}'

# Health check
curl http://localhost:5000/health
```

---

## 📊 Performance Tips

1. **Use appropriate questionCount** - Don't ask for 100 questions
2. **Keep text under 50KB** - Chunks process faster
3. **Cache topic IDs** - Reduces lookups
4. **Batch requests** - Reduce overhead
5. **Use indexes** - MongoDB for frequently queried fields

---

## 🔒 Security Checklist

- [ ] Update GROQ_API_KEY
- [ ] Update MongoDB URI
- [ ] Check CORS allowlist
- [ ] Set NODE_ENV=production
- [ ] Backup database regularly
- [ ] Monitor error logs
- [ ] Rate limit endpoints
- [ ] Add authentication if needed

---

## 📚 Documentation Files

- `BACKEND_IMPROVEMENTS.md` - What was fixed
- `BACKEND_CODE_REVIEW.md` - Issue details
- `BACKEND_ARCHITECTURE.md` - System design
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Full API docs
- `BACKEND_COMPLETE_SUMMARY.md` - Executive summary

---

## 🚨 Critical Fixes Applied

1. ✅ Answer comparison case-insensitive
2. ✅ Text chunking word-aware
3. ✅ Answer lookup O(1)
4. ✅ Global error handler
5. ✅ CORS security
6. ✅ Input validation
7. ✅ File size limits
8. ✅ Serverless support

---

## 💬 Get Help

1. Check documentation files
2. Review error message details
3. Check console logs
4. Verify environment variables
5. Test with cURL first

---

**Backend is production-ready! 🎉**

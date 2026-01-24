# Backend API Health Check

## Quick Test Commands

### 1. Test if server is running
```bash
curl http://localhost:5000/
```
Expected response: "Notes-to-Test API is running..."

### 2. Test PDF Upload (using PowerShell)
```powershell
$file = Get-Item "path_to_your_pdf.pdf"
$filePath = $file.FullName

$form = @{
    pdf = @{
        fileName = $file.Name
        filePath = $filePath
    }
    questionCount = 10
}

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/pdf/upload" `
    -Method Post `
    -Form $form `
    -ContentType "multipart/form-data"

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 3. Test Text Generation
```bash
curl -X POST http://localhost:5000/api/pdf/generate-from-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Machine learning is a subset of artificial intelligence. It enables computers to learn from data without being explicitly programmed. Deep learning is a subfield of machine learning.",
    "questionCount": 5
  }'
```

## Expected Responses

### Success (PDF Upload)
```json
{
  "success": true,
  "message": "Quiz created successfully! Generated 10 questions.",
  "data": {
    "topic": {
      "_id": "...",
      "title": "...",
      "description": "...",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "questions": [
      {
        "_id": "...",
        "type": "mcq",
        "questionText": "...",
        "options": ["...", "...", "...", "..."],
        "answer": "...",
        "explanation": "...",
        "topic": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

## Backend Architecture

```
backend/
├── src/
│   ├── server.js                 (Express app + CORS config)
│   ├── config/
│   │   └── db.js                 (MongoDB connection)
│   ├── controllers/
│   │   ├── pdfController.js       (PDF upload + text generation)
│   │   └── questionController.js  (Question retrieval + test submission)
│   ├── models/
│   │   ├── Topic.js              (Quiz topic schema)
│   │   └── Question.js           (Question schema)
│   ├── routes/
│   │   ├── pdfRoutes.js          (POST /api/pdf/upload, /api/pdf/generate-from-text)
│   │   └── questionRoutes.js     (GET /api/questions/topic/:id, POST /api/questions/submit/:id)
│   ├── services/
│   │   ├── pdfParser.js          (PDF text extraction)
│   │   └── aiService.js          (Gemini API integration)
│   └── utils/
│       ├── multer.js             (File upload handling)
│       └── textChunker.js        (Text splitting)
├── .env                          (API keys & DB URI)
└── package.json
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check |
| POST | `/api/pdf/upload` | Upload PDF → Generate questions |
| POST | `/api/pdf/generate-from-text` | Generate questions from text |
| GET | `/api/questions/topic/:topicId` | Get all questions for a topic |
| POST | `/api/questions/submit/:topicId` | Submit test & get score |

## Troubleshooting

### Error: "No text could be extracted from the PDF"
- **Cause**: PDF is image-based (scanned document) or corrupted
- **Solution**: Use a text-based PDF or implement OCR

### Error: "models/gemini-1.5-flash-latest: 404 Not Found"
- **Status**: ✅ FIXED (changed to `gemini-1.5-flash`)
- **Location**: `src/services/aiService.js`

### Error: "Cannot connect to MongoDB"
- **Check**: MongoDB URI in `.env` is correct
- **Check**: MongoDB cluster is running and accessible
- **Check**: Network allows connection to MongoDB Atlas

### CORS Error in Frontend
- **Status**: ✅ CONFIGURED
- **Setting**: `origin: 'http://localhost:5173'`
- **Location**: `src/server.js`

## Steps to Start Development

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   # Should show: 🚀 Server running at http://localhost:5000
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   # Should show: VITE v... ready in ... ms
   ```

3. **Test Connection**:
   - Open `http://localhost:5173` in browser
   - Click "Sign in with Google"
   - Upload a PDF
   - Should see questions generated

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
GOOGLE_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:5000
```

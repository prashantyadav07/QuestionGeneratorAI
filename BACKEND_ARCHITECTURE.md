# Backend Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│                    (React/Vue/Angular)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   HTTP Requests (REST API)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Server                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CORS Middleware (Validated)                 │   │
│  │  ✓ Whitelist origins: localhost:5173, netlify.app        │   │
│  │  ✓ Credentials enabled                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Body Parser Middleware (Limited)                │   │
│  │  ✓ JSON: 10MB limit                                      │   │
│  │  ✓ URL-encoded: 10MB limit                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Request Logging Middleware                  │   │
│  │  ✓ Timestamps, method, path                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────┬──────────────────────┬──────────────────────┬──────────┘
         │                      │                      │
         ▼                      ▼                      ▼
    ┌─────────────┐      ┌──────────────┐      ┌──────────────┐
    │ PDF Routes  │      │  Question    │      │  Health Check│
    │             │      │  Routes      │      │              │
    │ POST upload │      │              │      │ GET /health  │
    │ POST        │      │ GET topic    │      │ GET /        │
    │ generate    │      │ POST submit  │      │              │
    └──────┬──────┘      └──────┬───────┘      └──────────────┘
           │                    │
           ▼                    ▼
    ┌──────────────┐      ┌──────────────┐
    │ Validation   │      │ Validation   │
    │ Middleware   │      │ Middleware   │
    │              │      │              │
    │ • File type  │      │ • Topic ID   │
    │ • File size  │      │ • Answers    │
    │ • Q count    │      │   format     │
    │ • Text len   │      │              │
    └──────┬───────┘      └──────┬───────┘
           │                    │
           ▼                    ▼
    ┌──────────────────────────────────────────┐
    │           PDF Controllers                │
    │  ┌────────────────────────────────────┐  │
    │  │ handlePDFUpload                    │  │
    │  │  1. Validate file type/size        │  │
    │  │  2. Extract text via PDFParser     │  │
    │  │  3. Call handleTextGeneration      │  │
    │  └────────────────────────────────────┘  │
    │  ┌────────────────────────────────────┐  │
    │  │ handleTextGeneration               │  │
    │  │  1. Validate text length           │  │
    │  │  2. Split into chunks              │  │
    │  │  3. Generate questions via AI      │  │
    │  │  4. Save to database               │  │
    │  │  5. Return topic + metadata        │  │
    │  └────────────────────────────────────┘  │
    └──────┬────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │         Question Controllers             │
    │  ┌────────────────────────────────────┐  │
    │  │ getQuestionsByTopic                │  │
    │  │  1. Validate topic ID              │  │
    │  │  2. Fetch questions (no answers)   │  │
    │  │  3. Return with metadata           │  │
    │  └────────────────────────────────────┘  │
    │  ┌────────────────────────────────────┐  │
    │  │ submitTest                         │  │
    │  │  1. Validate answers format        │  │
    │  │  2. Fetch questions from DB        │  │
    │  │  3. Compare answers (case-insens.) │  │
    │  │  4. Calculate score & performance  │  │
    │  │  5. Return results with details    │  │
    │  └────────────────────────────────────┘  │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │            Services Layer                │
    │  ┌────────────────────────────────────┐  │
    │  │ aiService.js                       │  │
    │  │  • generateFromContent()           │  │
    │  │  • generateFromTopic()             │  │
    │  │  • generateQuestionsInBatches()    │  │
    │  │  • JSON extraction & validation    │  │
    │  │  • Response sanitization           │  │
    │  └────────────────────────────────────┘  │
    │  ┌────────────────────────────────────┐  │
    │  │ pdfParser.js                       │  │
    │  │  • extractTextFromPDF()            │  │
    │  │  • Page processing                 │  │
    │  │  • Error handling                  │  │
    │  └────────────────────────────────────┘  │
    └──────┬───────────────────────────────────┘
           │
           ├──────────────┬──────────────┐
           ▼              ▼              ▼
      ┌─────────┐    ┌──────────┐   ┌────────┐
      │   Groq  │    │ PDF.js   │   │ Text   │
      │  API    │    │ Extract  │   │Chunker │
      │         │    │          │   │        │
      │ Mixtral │    │ Engine   │   │ Smart  │
      │ 8x7b    │    │          │   │ Split  │
      └─────────┘    └──────────┘   └────────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │     MongoDB Database         │
           │  ┌──────────────────────┐   │
           │  │ Topics Collection    │   │
           │  │ - _id                │   │
           │  │ - title              │   │
           │  │ - description        │   │
           │  │ - timestamps         │   │
           │  └──────────────────────┘   │
           │  ┌──────────────────────┐   │
           │  │ Questions Collection │   │
           │  │ - _id                │   │
           │  │ - type               │   │
           │  │ - questionText       │   │
           │  │ - options            │   │
           │  │ - answer             │   │
           │  │ - explanation        │   │
           │  │ - topic (ref)        │   │
           │  │ - timestamps         │   │
           │  └──────────────────────┘   │
           └──────────────────────────────┘
```

---

## Request Flow Diagrams

### 1. PDF Upload Flow

```
Client Request (PDF File)
        │
        ▼
   Upload Middleware (Multer)
   ├─ Validate file type → PDF ✓
   ├─ Check file size → <50MB ✓
   └─ Store in memory
        │
        ▼
   PDF Controller
   ├─ 1. Validate MIME type
   │  └─ Is it application/pdf? ✓
   │
   ├─ 2. Extract text
   │  └─ PDFExtract.extractBuffer()
   │     └─ Parse pages → Get text
   │
   ├─ 3. Validate extracted text
   │  └─ Length > 0? ✓
   │
   ├─ 4. Generate questions
   │  └─ handleTextGeneration() ──┐
   │
   └─ 5. Return response
      └─ { topicId, questionCount }

Response: 201 Created ✓
```

### 2. Text Generation Flow

```
Client Request (Text + Count)
        │
        ▼
   Validation Middleware
   ├─ Text length check (1-100K) ✓
   └─ Question count (1-100) ✓
        │
        ▼
   PDF Controller
   ├─ 1. Split text into chunks
   │  └─ splitTextIntoChunks()
   │     ├─ Smart word boundaries
   │     ├─ Context overlap
   │     └─ Filter empty chunks
   │
   ├─ 2. Generate questions per chunk
   │  └─ generateQuestionsInBatches()
   │     ├─ Parallel processing
   │     ├─ Promise.allSettled()
   │     └─ Error handling
   │        └─ AI Service (Groq)
   │           ├─ Create prompt
   │           ├─ Call Mixtral-8x7b
   │           └─ Extract JSON
   │              └─ Sanitize response
   │
   ├─ 3. Save to database
   │  ├─ Create Topic
   │  │  └─ Save to MongoDB
   │  │
   │  └─ Create Questions
   │     └─ insertMany() to MongoDB
   │
   └─ 4. Return response
      └─ { topicId, questionCount }

Response: 201 Created ✓
```

### 3. Question Retrieval Flow

```
Client Request (Topic ID)
        │
        ▼
   Validation Middleware
   ├─ Topic ID valid ObjectId? ✓
        │
        ▼
   Question Controller
   ├─ 1. Fetch topic by ID
   │  └─ Topic.findById()
   │     └─ Exists? ✓
   │
   ├─ 2. Fetch questions
   │  └─ Question.find({ topic })
   │     ├─ .select('-answer -explanation')
   │     └─ .lean() (memory efficient)
   │
   └─ 3. Return questions
      └─ { topic, questions[], count }

Response: 200 OK ✓
Questions have:
  ✓ questionText
  ✓ options
  ✗ answer (hidden)
  ✗ explanation (hidden)
```

### 4. Test Submission Flow

```
Client Request (Answers Array)
        │
        ▼
   Validation Middleware
   ├─ Is array? ✓
   ├─ Not empty? ✓
   └─ Each has questionId & userAnswer? ✓
        │
        ▼
   Question Controller
   ├─ 1. Fetch all questions
   │  └─ Question.find({ topic })
   │
   ├─ 2. Build lookup map
   │  └─ Map(questionId → question)
   │
   ├─ 3. Compare answers
   │  └─ For each user answer:
   │     ├─ Look up question (O(1))
   │     ├─ Trim & lowercase both
   │     └─ Compare: match? ✓
   │
   ├─ 4. Calculate score
   │  ├─ Count correct answers
   │  ├─ Calculate percentage
   │  └─ Determine performance level
   │
   └─ 5. Return detailed results
      └─ { score, results[], performance }

Response: 200 OK ✓
Each result includes:
  ✓ Question text
  ✓ User answer
  ✓ Correct answer
  ✓ Explanation
  ✓ Is correct? (true/false)
```

---

## Error Handling Flow

```
Any Request
    │
    ├─ Middleware Processing
    │  ├─ CORS check ──────→ ❌ → 403 Forbidden
    │  ├─ Body parse ───────→ ❌ → 400 Bad Request
    │  ├─ File upload ──────→ ❌ → 413 Payload Too Large
    │  └─ Validation ───────→ ❌ → 400 Bad Request
    │
    └─ Route Handler
       ├─ Database query ──→ ❌ → Global Error Handler
       │                      │
       │                      ├─ CastError → 400
       │                      ├─ ValidationError → 400
       │                      ├─ MongoError → 500
       │                      └─ Default → 500
       │
       ├─ AI Service ──────→ ❌ → 503 Service Unavailable
       │
       └─ Success ─────────→ ✓ → 200/201 OK

   All errors logged with:
   ├─ Timestamp
   ├─ Error message
   ├─ Stack trace (dev only)
   └─ Request context
```

---

## Data Models

### Topic Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Question Schema
```javascript
{
  _id: ObjectId,
  type: 'mcq',
  questionText: String,
  options: [String],  // Usually 4 options
  answer: String,     // One of the options
  explanation: String,
  topic: ObjectId,    // Reference to Topic
  createdAt: Date,
  updatedAt: Date
}
```

---

## Performance Characteristics

| Operation | Time | Space | Notes |
|-----------|------|-------|-------|
| PDF Upload | O(n) | O(n) | n = file size |
| Text Split | O(n) | O(n) | Smart chunking |
| AI Generation | O(m) | O(m) | m = token count |
| Get Questions | O(k) | O(k) | k = num questions |
| Submit Test | O(q) | O(q) | q = num questions |
| Answer Compare | O(1) | O(1) | Map-based lookup |

---

## Security Layers

```
1. Input Layer
   ├─ CORS validation
   ├─ File type checking
   ├─ Size limiting
   ├─ Content validation
   └─ Sanitization

2. Processing Layer
   ├─ Try-catch boundaries
   ├─ Error isolation
   ├─ Request validation
   └─ Safe data handling

3. Database Layer
   ├─ Connection pooling
   ├─ Query timeouts
   ├─ Error logging
   └─ Access control

4. Response Layer
   ├─ Safe error messages
   ├─ No system details
   ├─ Consistent format
   └─ Proper status codes
```

---

## Deployment Architecture

### Development
```
Local Machine
  ↓
npm run dev
  ↓
Express Server (port 5000)
  ↓
Local MongoDB
```

### Production (Vercel)
```
Git Push
  ↓
Vercel Webhook
  ↓
Build & Deploy
  ↓
Serverless Function
  ↓
Cloud MongoDB Atlas
```

---

**Architecture is now properly designed and implemented! 🎯**

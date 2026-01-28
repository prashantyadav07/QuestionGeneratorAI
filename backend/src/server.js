// ==========================================================
// 🔹 ENV CONFIG (ES Modules compatible)
// ==========================================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ==========================================================
// 🔹 IMPORTS
// ==========================================================
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import connectDB from './config/db.js';
import pdfRoutes from './routes/pdfRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// ==========================================================
// 🔹 APP INIT
// ==========================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================================
// 🔹 DATABASE CONNECTION
// ==========================================================
connectDB().catch((err) => {
  console.error('Failed to connect to database:', err.message);
  // Don't exit on DB error in serverless, allow graceful degradation
});

// ==========================================================
// 🔹 ENVIRONMENT VALIDATION
// ==========================================================
const validateEnvironment = () => {
  const requiredEnvVars = [
    'GROQ_API_KEY',
    'MONGODB_URI'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('⚠️  Please check your .env file');
    // Don't exit, let the app try to run (might work in certain scenarios)
  } else {
    console.log('✅ Environment variables validated');
  }

  // Log configured models
  console.log(`📋 AI Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
  console.log(`📋 Fallback Model: ${process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant'}`);
};

validateEnvironment();

// ==========================================================
// 🔹 CORS CONFIG
// ==========================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://notes2testai.netlify.app',
  'https://question-generator-ai-ten.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ==========================================================
// 🔹 MIDDLEWARES (ORDERED CORRECTLY)
// ==========================================================
// Body parser with reasonable limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==========================================================
// 🔹 ROUTES
// ==========================================================
app.use('/api/pdf', pdfRoutes);
app.use('/api/questions', questionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: '✅ Notes-to-Test API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ==========================================================
// 🔹 ERROR HANDLING MIDDLEWARE (MUST BE LAST)
// ==========================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================================
// 🔹 SERVER START (SUPPORTS BOTH LOCAL & SERVERLESS)
// ==========================================================
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

export default app;

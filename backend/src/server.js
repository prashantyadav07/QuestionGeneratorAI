// ==========================================================
// 🔹 ENV CONFIG (ES Modules compatible)
// ==========================================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env file backend ke root me hai
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// ==========================================================
// 🔹 IMPORTS
// ==========================================================
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import connectDB from './config/db.js';
import pdfRoutes from './routes/pdfRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

// ==========================================================
// 🔹 APP INIT
// ==========================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================================
// 🔹 DATABASE
// ==========================================================
connectDB();

// ==========================================================
// 🔹 CORS CONFIG (Local + Netlify)
// ==========================================================
const allowedOrigins = [
  'http://localhost:5173',
  'https://notes2testai.netlify.app',
  'https://notes2testai.netlify.app/',
  'https://notes2testai.netlify.app/login'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Postman / server-side calls
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed ❌'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ==========================================================
// 🔹 MIDDLEWARES
// ==========================================================
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================================
// 🔹 ROUTES
// ==========================================================
app.use('/api/pdf', pdfRoutes);
app.use('/api/questions', questionRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Notes-to-Test API is running...');
});

// ==========================================================
// 🔹 SERVER START (IMPORTANT FOR VERCEL)
// ==========================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}

export default app;

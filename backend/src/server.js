// ==========================================================
// ##                                                      ##
// ##     THE ULTIMATE FIX: .env FILE KA EXACT PATH DO     ##
// ##                                                      ##
// ==========================================================

import dotenv from 'dotenv';
import path from 'path'; // Node.js ka built-in path module import karo
import { fileURLToPath } from 'url'; // Yeh bhi zaroori hai

// Step A: Humari current file (server.js) ka exact location pata karo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Step B: Ab .env file ka poora path banao.
// Kyunki server.js 'src' folder ke andar hai, .env file ek level upar ('../') hai.
const envPath = path.resolve(__dirname, '../.env');

// Step C: dotenv ko bolo ki woh isi path se file load kare
dotenv.config({ path: envPath });

// Step D: Ab check karo ki key load hui ya nahi
// console.log('Trying to load .env file from this exact path:', envPath);
// console.log('GROQ_API_KEY found in process.env is:', process.env.GROQ_API_KEY);
// ==========================================================


// Ab baaki saara code waise ka waisa rahega
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import pdfRoutes from './routes/pdfRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// ==========================================================
// ##                  CORS CONFIGURATION                  ##
// ==========================================================

// Sirf is URL se aane waali requests ko allow karo
const corsOptions = {
    origin: 'https://notes2testai.netlify.app',
    optionsSuccessStatus: 200
};

// YEH HAI IMPORTANT CHANGE: app.use(cors()) ki jagah yeh use karein
app.use(cors(corsOptions));

// ==========================================================

app.use(bodyParser.json());

app.use('/api/pdf', pdfRoutes);
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => {
  res.send('Notes-to-Test API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
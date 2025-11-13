// --- konfigurisanje aplikacije i povezivanje na bazu podataka ---

// --- Core modules ---
import path from 'node:path';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Routes (Route handler for posts) ---
import postsRoutes from './routes/posts.js';
import userRoutes from './routes/user.js';

// Odredi fajl na osnovu NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`✅ Environment: ${process.env.NODE_ENV}`);
console.log(`📁 Loaded config from: ${envFile}`);

// --- Init dotenv (for .env config) ---
// dotenv.config();

const requiredVars = ['MONGO_URL', 'JWT_SECRET', 'PORT'];
for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

// --- Create Express app ---
const app = express();

// --- Connect to MongoDB ---
// try {
//   await mongoose.connect(process.env.MONGO_URL);
//   console.log('Connected to database!');
// } catch (error) {
//   console.log('Connection failed!', error);
// }
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to database!');
  } catch (error) {
    console.error('❌ Connection failed!', error.message);
    process.exit(1); // prekini aplikaciju ako nema konekcije
  }
};

await connectDB();

// --- Middleware (Middleware for parsing JSON and URL-encoded form data) ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// --- Serve static images (Serve static image files from backend/images directory) ---
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use('/', express.static(path.join(__dirname, 'angular-dist/browser'))); // ONLY FOR FRONTEND INTEGRATED WITH BACKEND

// --- CORS setup ---
// app.use(
//   cors({
//     origin: 'http://localhost:4200', // or '*' for any origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//     allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
//   })
// );
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:4200',
  'https://angular-node-projekat.onrender.com',
  'https://angular-node-projekat-478018.web.app',
  'https://angular-node-projekat-478018.firebaseapp.com'
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// --- Routes ---
app.use('/api/posts', postsRoutes); // Use posts routes for /api/posts endpoint
app.use('/api/user', userRoutes);
 // ONLY FOR FRONTEND INTEGRATED WITH BACKEND
/* app.use('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'backend/angular-dist/browser/index.html'));
}); */

// --- Export app (Export the Express app) ---
export default app;
// --- End of file ---

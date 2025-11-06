// --- Core modules ---
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Routes (Route handler for posts) ---
import postsRoutes from './routes/posts.js';
import userRoutes from './routes/user.js';

// --- Init dotenv (for .env config) ---
dotenv.config();

// --- Create Express app ---
const app = express();

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to database!'))
  .catch(() => console.log('Connection failed!'));

// --- Middleware (Middleware for parsing JSON and URL-encoded form data) ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// --- Serve static images (Serve static image files from backend/images directory) ---
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/images', express.static(path.join(__dirname, 'images')));

// --- CORS setup ---
app.use(
  cors({
    origin: 'http://localhost:4200', // or '*' for any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// --- Routes ---
app.use('/api/posts', postsRoutes); // Use posts routes for /api/posts endpoint
app.use('/api/user', userRoutes);

// --- Export app (Export the Express app) ---
export default app;
// --- End of file ---

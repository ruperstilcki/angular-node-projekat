// Core modules
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Route handler for posts
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

// import Credentials and setup for MongoDB
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

// Middleware for parsing JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static image files from backend/images directory
app.use('/images', express.static(path.join('backend/images')));

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:4200', // or '*' for any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// Mount posts route handler under /api/posts path
app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

// Export the Express app
module.exports = app;

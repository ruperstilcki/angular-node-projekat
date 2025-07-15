// Core modules
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Route handler for posts
const postsRoutes = require('./routes/posts');

// import Credentials and setup for MongoDB
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URL)
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
app.use("/images", express.static(path.join("backend/images")));

// CORS headers to allow frontend requests from any origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, PUT, OPTIONS'
  );
  next();
});

// Mount posts route handler under /api/posts path
app.use("/api/posts", postsRoutes);

// Export the Express app
module.exports = app;

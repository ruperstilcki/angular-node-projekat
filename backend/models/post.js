const mongoose = require('mongoose');

// Define schema for Post documents
const postSchema = mongoose.Schema({
  title: { type: String, required: true },     // Title is required
  content: { type: String, required: true },   // Content is required
  imagePath: { type: String, required: true }  // Path to uploaded image
});

// Export Mongoose model, which will manage the "posts" collection
module.exports = mongoose.model('Post', postSchema);

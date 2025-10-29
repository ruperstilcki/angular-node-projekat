const mongoose = require('mongoose');

// Define schema for Post documents
const postSchema = mongoose.Schema({
  title: { type: String, required: true },     // Title is required
  content: { type: String, required: true },   // Content is required
  imagePath: { type: String, required: true },  // Path to uploaded image
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Export Mongoose model, which will manage the "posts" collection
module.exports = mongoose.model('Post', postSchema);

import mongoose from 'mongoose';

// Define schema for Post documents
const postSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title is required
  content: { type: String, required: true }, // Content is required
  imagePath: { type: String, required: true }, // Path to uploaded image
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Post = mongoose.model('Post', postSchema);
export default Post; // Export Mongoose model, which will manage the "posts" collection

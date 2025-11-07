import express from 'express';
import multer from 'multer';

import checkAuth from '../middleware/check-auth.js';
import { createPost, updatePost, getPosts, getPostById, deletePost } from '../controllers/posts.js';

// Define allowed image MIME types and corresponding file extensions
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// Configure multer to use memory storage for image processing
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize router
const router = express.Router();

// ----------- CREATE POST -------------
router.post('/', checkAuth, upload.single('image'), createPost);

// ----------- UPDATE POST -------------
router.put('/:id', checkAuth, upload.single('image'), updatePost);

// ----------- FETCH POSTS WITH PAGINATION -------------
router.get('/', getPosts);

// ----------- GET SINGLE POST BY ID -------------
router.get('/:id', getPostById);

// ----------- DELETE POST -------------
router.delete('/:id', checkAuth, deletePost);

export default router;

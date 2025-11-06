import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs/promises';

import Post from '../models/post.js'; // Mongoose model for Post collection
import checkAuth from '../middleware/check-auth.js';

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
router.post('/', checkAuth, upload.single('image'), async (req, res) => { // Expect a single uploaded file under "image" field
  try {
    const url = `${req.protocol}://${req.get('host')}`;

    // Resize image
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({
        height: 288, // Resize image to max height 288px with proportional width
        fit: 'inside', // Width will be automatically proportional
        withoutEnlargement: true // Don't enlarge image if smaller than 288px
      })
      .toBuffer();

    // Generate filename
    const name = req.file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[req.file.mimetype];
    const filename = `${name}-${Date.now()}.${ext}`;

    // Save resized image to file system
    await fs.writeFile(`backend/images/${filename}`, resizedImageBuffer);

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${filename}`, // Save image URL path
      creator: req.userData.userId
    });

    const createdPost = await post.save();
    const plainPost = createdPost.toObject(); // Convert mongoose document to plain object

    res.status(201).json({
      message: 'Post added successfully',
      post: { ...plainPost, id: plainPost._id } // Rename _id to id for frontend compatibility
    });
  } catch (error) {
    console.error('Image resize failed:', error);
    res.status(500).json({ message: 'Image processing failed' });
  }
});

// ----------- UPDATE POST -------------
router.put('/:id', checkAuth, upload.single('image'), async (req, res) => { // Handle optional image upload
  try {
    let imagePath = req.body.imagePath; // Keep existing image if none uploaded

    if (req.file) {
      const url = `${req.protocol}://${req.get('host')}`;
      // Resize new image to max height 288px with proportional width
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize({
          height: 288,
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();

      const name = req.file.originalname.toLowerCase().split(' ').join('-');
      const ext = MIME_TYPE_MAP[req.file.mimetype];
      const filename = `${name}-${Date.now()}.${ext}`;

      await fs.writeFile(`backend/images/${filename}`, resizedImageBuffer);
      imagePath = `${url}/images/${filename}`;
    }

    const post = {
      title: req.body.title,
      content: req.body.content,
      imagePath,
      creator: req.userData.userId
    };

    const result = await Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post);

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Update successful!', post });
    } else {
      res.status(401).json({ message: 'Not authorized!' });
    }
  } catch (error) {
    console.error('Image resize failed on update:', error);
    res.status(500).json({ message: 'Image processing failed' });
  }
});

// ----------- FETCH POSTS WITH PAGINATION -------------
router.get('/', async (req, res) => {
  try {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;

    const postQuery = Post.find();

    if (pageSize && currentPage) {
      postQuery.skip(pageSize * (currentPage - 1)) // Skip documents for previous pages
      .limit(pageSize); // Limit results to current page size
    }

    const [fetchedPosts, count] = await Promise.all([postQuery, Post.countDocuments()]); // Get total number of posts

    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: fetchedPosts,
      maxPosts: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Fetching posts failed!' });
  }
});

// ----------- GET SINGLE POST BY ID -------------
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post ? res.status(200).json(post) : res.status(404).json({ message: 'Post not found!' });
  } catch (error) {
    res.status(500).json({ message: 'Fetching post failed!' });
  }
});

// ----------- DELETE POST -------------
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const result = await Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Deletion successful!' });
    } else {
      res.status(401).json({ message: 'Not authorized!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed!' });
  }
});

export default router;
// --- End of file ---

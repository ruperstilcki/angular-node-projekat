import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Post from '../models/post.js'; // Mongoose model for Post collection
import { getIO } from '../socket.js';

// Define allowed image MIME types and corresponding file extensions
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// compute images directory reliably under backend/images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '..', 'images');

export async function createPost(req, res) {
  // Expect a single uploaded file under "image" field
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

    // ensure images dir exists and save resized image to file system
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    // Save resized image to file system
    await fs.writeFile(path.join(IMAGES_DIR, filename), resizedImageBuffer);

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${filename}`, // Save image URL path
      creator: req.userData.userId
    });

    const createdPost = await post.save();
    const plainPost = createdPost.toObject(); // Convert mongoose document to plain object

    // Socket //
    // Emit event to all other clients except the one that created it
    const io = getIO();
    io.emit('postCreated', post); // or socket.broadcast.emit if you have the socket ref

    res.status(201).json({
      message: 'Post added successfully',
      post: { ...plainPost, id: plainPost._id } // Rename _id to id for frontend compatibility
    });
  } catch (error) {
    console.error('Image resize failed:', error);
    res.status(500).json({ message: 'Image processing failed' });
  }
}

export async function updatePost(req, res) {
  // Handle optional image upload
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

      await fs.mkdir(IMAGES_DIR, { recursive: true });
      await fs.writeFile(path.join(IMAGES_DIR, filename), resizedImageBuffer);
      imagePath = `${url}/images/${filename}`;
    }

    const post = {
      title: req.body.title,
      content: req.body.content,
      imagePath,
      creator: req.userData.userId
    };

    const result = await Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post);

    // Socket //
    // Emit event to all other clients except the one that created it
    const io = getIO();
    io.emit('postEdited', post); // or socket.broadcast.emit if you have the socket ref

    if (result.matchedCount > 0) {
      res.status(200).json({ message: 'Update successful!', post });
    } else {
      res.status(401).json({ message: 'Not authorized!' });
    }
  } catch (error) {
    console.error('Image resize failed on update:', error);
    res.status(500).json({ message: 'Image processing failed' });
  }
}

export async function getPosts(req, res) {
  try {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;

    const postQuery = Post.find();

    if (pageSize && currentPage) {
      postQuery
        .skip(pageSize * (currentPage - 1)) // Skip documents for previous pages
        .limit(pageSize); // Limit results to current page size
    }

    const [fetchedPosts, count] = await Promise.all([postQuery, Post.countDocuments()]); // Get total number of posts

    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: fetchedPosts,
      maxPosts: count
    });
  } catch (error) {
    console.error('Fetching posts failed:', error);
    res.status(500).json({ message: 'Fetching posts failed!' });
  }
}

export async function getPostById(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    post ? res.status(200).json(post) : res.status(404).json({ message: 'Post not found!' });
  } catch (error) {
    console.error('Fetching post failed:', error);
    res.status(500).json({ message: 'Fetching post failed!' });
  }
}

export async function deletePost(req, res) {
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
    console.error('Deletion failed:', error);
    res.status(500).json({ message: 'Deletion failed!' });
  }
}

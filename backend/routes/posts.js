const express = require('express');
const multer = require('multer');
const Post = require('../models/post'); // Mongoose model for Post collection
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Define allowed image MIME types and corresponding file extensions
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// Configure multer for file upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) error = null;
    cb(error, "backend/images"); // Path where images will be stored
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext); // Unique filename
  }
});

// ----------- CREATE POST -------------
router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"), // Expect a single uploaded file under "image" field
  (req, res, next) => {
    const url = req.protocol + '://' + req.get("host"); // Generate server URL for image
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename // Save relative image path
    });
    post.save().then(createdPost => {
      const plainPost = createdPost.toObject(); // Convert mongoose document to plain object
      res.status(201).json({
        message: 'Post added successfully',
        post: { ...plainPost, id: plainPost._id } // Rename _id to id for frontend compatibility
      });
    });
  }
);

// ----------- UPDATE POST -------------
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"), // Handle optional image upload
  (req, res, next) => {
    let imagePath = req.body.imagePath; // Keep existing image if none uploaded
    if (req.file) {
      const url = req.protocol + '://' + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath
    });
    Post.updateOne({ _id: req.params.id }, post).then(result => {
      const plainPost = post.toObject();
      const { _id: string, ...newPost } = { ...plainPost, id: plainPost._id };
      res.status(200).json({ message: "Update successful!", post: newPost });
    });
  }
);

// ----------- FETCH POSTS WITH PAGINATION -------------
router.get("", (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1)) // Skip documents for previous pages
      .limit(pageSize); // Limit results for current page
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments(); // Get total number of posts
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

// ----------- GET SINGLE POST BY ID -------------
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

// ----------- DELETE POST -------------
router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: 'Post deleted!' });
  });
});

module.exports = router;

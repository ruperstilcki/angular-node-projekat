import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Import User model

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });

    const result = await user.save();
    res.status(201).json({
      message: 'User created!',
      result
    });
  } catch (err) {
    res.status(500).json({
      message: 'Invalid authentication credentials! ' + err.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const fetchedUser = await User.findOne({ email: req.body.email });
    if (!fetchedUser) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, fetchedUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    const token = jwt.sign(
      { email: fetchedUser.email, userId: fetchedUser._id },
      process.env.JWT_SECRET || 'secret_this_should_be_longer',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      expiresIn: 3600,
      userId: fetchedUser._id
    });
  } catch (err) {
    res.status(401).json({
      message: 'Invalid authentication credentials! ' + err.message
    });
  }
});

export default router;
// --- End of file ---

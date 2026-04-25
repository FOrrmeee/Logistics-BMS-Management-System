const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// @desc    Login user & get token
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user (initial setup)
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Firebase Login/Register
// @route   POST /api/auth/firebase
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'ID Token is required' });
    }

    // Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid Firebase token', error: error.message });
    }

    const { email, uid, name } = decodedToken;
    
    // Find or create user in MongoDB
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (!user) {
      // Create new user if not exists
      const username = name || email.split('@')[0] || `user_${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Ensure username is unique
      let finalUsername = username;
      let count = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${username}${count}`;
        count++;
      }

      user = await User.create({
        username: finalUsername,
        email,
        firebaseUid: uid,
        role: 'admin'
      });
    } else {
      let updated = false;
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        updated = true;
      }
      if (!user.email) {
        user.email = email;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, firebaseLogin };

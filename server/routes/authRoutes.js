const express = require('express');
const router = express.Router();
const { login, register, firebaseLogin } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.post('/firebase', firebaseLogin);

module.exports = router;

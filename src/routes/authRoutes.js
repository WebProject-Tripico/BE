const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', (req, res) => {
  res.json({ message: '회원가입' });
});

router.post('/login', (req, res) => {
  res.json({ message: '로그인' });
});

router.get('/profile', auth, authController.getProfile);

module.exports = router; 
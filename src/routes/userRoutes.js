const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/', (req, res) => {
  res.json({ message: '사용자 목록 조회' });
});

router.get('/:id', (req, res) => {
  res.json({ message: '사용자 상세 정보 조회' });
});

module.exports = router; 
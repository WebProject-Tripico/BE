const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: '투어 목록 조회' });
});

router.get('/:id', (req, res) => {
  res.json({ message: '투어 상세 정보 조회' });
});

module.exports = router; 
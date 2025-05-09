const express = require('express');
const router = express.Router();
const touristSpotController = require('../controllers/touristSpotController');

router.get('/', (req, res) => {
  res.json({ message: '관광지 목록 조회' });
});

router.get('/:id', (req, res) => {
  res.json({ message: '관광지 상세 정보 조회' });
});

router.get('/location', touristSpotController.getSpotsByLocation);

module.exports = router; 